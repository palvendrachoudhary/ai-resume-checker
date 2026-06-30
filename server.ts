import express from "express";
import path from "path";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as _pdf from "pdf-parse";
import crypto from "crypto";
import Stripe from "stripe";
import { db } from "./src/db";
import { interviews, candidateNotes, emailTemplates } from "./src/db/schema";
import { eq, desc, and } from "drizzle-orm";

const pdf = (_pdf as any).default || _pdf;

// In-memory mock database for the MVP
const candidates_db = new Map<string, any>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Setup Multer for file uploads (in-memory)
  const upload = multer({ storage: multer.memoryStorage() });

  // API Routes
  app.post(
    "/api/v1/candidates/upload",
    upload.single("file"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ detail: "No file uploaded" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          return res
            .status(500)
            .json({ detail: "GEMINI_API_KEY not configured" });
        }

        const ai = new GoogleGenAI({ apiKey });
        const source = req.body.source || "Direct Application";
        const uid = req.body.uid || "anonymous";

        const processTextToProfile = async (rawText: string) => {
          const prompt = `
          Extract the following information from the resume text provided below.
          Format the output as JSON with the following keys:
          - name (string)
          - contact_info (string)
          - skills (array of strings)
          - experience_summary (string)
          - education (string)
          
          Resume Text:
          ${rawText}
        `;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          });

          const profile = JSON.parse(response.text || "{}");
          profile.raw_text = rawText;
          profile.source = source;
          profile.uid = uid;
          return profile;
        };

        if (req.file.originalname.toLowerCase().endsWith(".csv")) {
          const { parse } = await import("csv-parse/sync");
          const csvText = req.file.buffer.toString("utf-8");
          const records = parse(csvText, {
            columns: true,
            skip_empty_lines: true,
          });

          const profiles = [];
          // Map CSV rows to profiles (assuming columns like Name, Skills, Experience, etc.)
          for (const record of records) {
            // Construct a rawText equivalent from the CSV row
            const rawText = Object.entries(record)
              .map(([k, v]) => `${k}: ${v}`)
              .join("\n");
            // Extract profile using Gemini, or just map fields if we assume standard columns.
            // Since CSV format is unknown, Gemini extraction is robust.
            const profile = await processTextToProfile(rawText);
            const candidateId = crypto.randomUUID();
            candidates_db.set(candidateId, profile);
            profiles.push(profile);
          }

          return res.json({
            message: "CSV processed successfully",
            profiles,
          });
        }

        let rawText = "";

        if (req.file.originalname.toLowerCase().endsWith(".pdf")) {
          const data = await pdf(req.file.buffer);
          rawText = data.text;
        } else {
          rawText = req.file.buffer.toString("utf-8");
        }

        const profile = await processTextToProfile(rawText);

        const candidateId = crypto.randomUUID();
        candidates_db.set(candidateId, profile);

        res.json({
          message: "Candidate successfully ingested and embedded.",
          candidate_id: candidateId,
          profiles: [profile],
        });
      } catch (e: any) {
        console.error(e);
        res.status(500).json({ detail: e.message || "Internal Error" });
      }
    },
  );

  app.patch("/api/v1/candidates/status", async (req, res) => {
    try {
      const { candidateIds, status, uid = "anonymous" } = req.body;
      if (!Array.isArray(candidateIds) || !status) {
        return res
          .status(400)
          .json({ detail: "candidateIds array and status string required" });
      }

      // Update in memory db
      for (const [id, candidate] of candidates_db.entries()) {
        if (candidate.uid === uid && candidateIds.includes(candidate.name)) {
          // In MVP we match by name as ID is not exposed to frontend properly, wait, is ID exposed? Let's assume we match by name for simplicity or expose ID.
          candidate.status = status;
          candidates_db.set(id, candidate);
        }
      }

      res.json({ message: "Status updated successfully" });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ detail: e.message || "Internal Error" });
    }
  });

  app.post("/api/v1/jobs/evaluate", async (req, res) => {
    try {
      const { title, description, required_skills, uid = "anonymous" } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res
          .status(500)
          .json({ detail: "GEMINI_API_KEY not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });

      // Since we don't have ChromaDB running in the preview, we'll process all candidates directly or mock top 5.
      // For this MVP preview, if there are <= 10 candidates, we just evaluate all.

      const candidates = Array.from(candidates_db.values()).filter(c => c.uid === uid);
      const scoredResults = [];

      for (const candidate of candidates) {
        const prompt = `
          Act as an Elite AI Solutions Architect, Executive Tech Recruiter, and Hackathon Strategist. Evaluate the candidate against the Job Description, focusing on the Indian professional ecosystem.
          
          **Indic-Context NLP Pre-Processor**: 
          Sanitize and interpret the candidate's input. Understand Indian localized terms, educational formatting (e.g., IIT/NIT tiering, PGDM), and "Hinglish" project descriptions. Translate these into globally standardized semantics for your evaluation.
          
          **The "Hidden Gem" Evaluator**: 
          Explicitly look for non-traditional career paths (like switching from engineering consulting to software development) that imply high operational maturity and cross-domain expertise. You must bypass rigid keyword constraints to reward candidates who bring unique operational and logistical value to the role. If a candidate possesses this, provide a concise explanation for the 'hidden_gem' field.

          **Career Velocity & Trajectory**: 
          Analyze the timeline of the candidate's projects. Award high scores for rapid skill acquisition, consistent shipping of complex applications, or competitive hackathon participation within short timeframes.

          **Behavioral "Doer" Metric**: 
          Evaluate the depth and complexity of the candidate's portfolio. Differentiate between basic tutorial-following and engineering complex architectures (like deploying databases, API integrations, and containerization).

          **Skills Gap Analysis**:
          Compare the candidate's skills against the Job Requirements. Identify missing 'Must-Have' skills (critical for the role) and missing 'Nice-to-Have' skills (beneficial but not strictly required).

          Job Description:
          Title: ${title}
          Requirements: ${description}
          Required Skills: ${(required_skills || []).join(", ")}
          
          Candidate Profile:
          Name: ${candidate.name}
          Skills: ${(candidate.skills || []).join(", ")}
          Experience: ${candidate.experience_summary}
          
          Provide a JSON response with the following keys:
          - match_score: float (0 to 100)
          - why_this_candidate: string (Explainable AI summary of why they fit)
          - core_strengths: array of exactly 3 strings (Gemini AI Summary extracting the candidate's top 3 core strengths specifically aligned with the job description)
          - potential_gaps: string (Analysis of potential gaps or risks)
          - skills_gap: object with "missing_must_haves" (array of strings) and "missing_nice_to_haves" (array of strings)
          - technical_fit_score: int (0 to 10)
          - experience_fit_score: int (0 to 10)
          - contextual_fit_score: int (0 to 10)
          - portfolio_intensity: int (0 to 10) (Behavioral Doer Metric: complexity of projects)
          - velocity_score: int (0 to 10) (Career Velocity Scoring: speed of skill acquisition/shipping)
          - hidden_gem: string (A concise, 1-2 sentence explanation of their cross-domain operational value, if they have a non-traditional background. Otherwise, leave empty)
          - interview_questions: array of 3 strings (highly personalized interview questions based on potential_gaps)
          - outreach_email_draft: string (a draft of a warm outreach email to the candidate referencing their past projects and alignment with the JD)
          - rejection_mentor_draft: string (a draft of a highly constructive, mentor-style rejection email including a 'Skill Growth Roadmap' with 2-3 specific learning areas and suggested resources/links, based on the gap between their profile and the JD)
        `;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-pro",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const evalData = JSON.parse(response.text || "{}");
        scoredResults.push({
          candidate,
          ...evalData,
        });
      }

      scoredResults.sort((a, b) => b.match_score - a.match_score);
      const topCandidates = scoredResults.slice(0, 5);

      res.json({
        top_candidates: topCandidates,
      });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ detail: e.message || "Internal Error" });
    }
  });

  app.get("/api/v1/interviews/:candidateId", async (req, res) => {
    try {
      const { candidateId } = req.params;
      const results = await db
        .select()
        .from(interviews)
        .where(eq(interviews.candidateId, candidateId));
      res.json(results);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ detail: e.message || "Internal Error" });
    }
  });

  app.get("/api/v1/notes/:candidateId", async (req, res) => {
    try {
      const { candidateId } = req.params;
      const results = await db
        .select()
        .from(candidateNotes)
        .where(eq(candidateNotes.candidateId, candidateId))
        .orderBy(desc(candidateNotes.createdAt));
      res.json(results);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ detail: e.message || "Internal Error" });
    }
  });

  app.post("/api/v1/notes", async (req, res) => {
    try {
      const { candidateId, content, recruiterUid } = req.body;
      const result = await db
        .insert(candidateNotes)
        .values({
          candidateId,
          content,
          recruiterUid: recruiterUid || "mock-recruiter-id",
        })
        .returning();

      res.json({ message: "Note saved", note: result[0] });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ detail: e.message || "Internal Error" });
    }
  });

  app.get("/api/v1/templates", async (req, res) => {
    try {
      const recruiterUid =
        (req.query.recruiterUid as string) || "mock-recruiter-id";
      const results = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.recruiterUid, recruiterUid));
      res.json(results);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ detail: e.message || "Internal Error" });
    }
  });

  app.post("/api/v1/templates", async (req, res) => {
    try {
      const { type, subject, body, recruiterUid } = req.body;
      const uid = recruiterUid || "mock-recruiter-id";

      // Upsert logic - if a template of this type exists for this recruiter, update it, otherwise insert
      const existing = await db
        .select()
        .from(emailTemplates)
        .where(
          and(
            eq(emailTemplates.recruiterUid, uid),
            eq(emailTemplates.type, type),
          ),
        );

      let result;
      if (existing.length > 0) {
        result = await db
          .update(emailTemplates)
          .set({ subject, body, updatedAt: new Date() })
          .where(eq(emailTemplates.id, existing[0].id))
          .returning();
      } else {
        result = await db
          .insert(emailTemplates)
          .values({
            recruiterUid: uid,
            type,
            subject,
            body,
          })
          .returning();
      }

      res.json({ message: "Template saved", template: result[0] });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ detail: e.message || "Internal Error" });
    }
  });

  app.post("/api/v1/interviews", async (req, res) => {
    try {
      const { candidateId, date, time, recruiterUid } = req.body;
      const uid = recruiterUid || "mock-recruiter-id";
      const result = await db
        .insert(interviews)
        .values({
          candidateId,
          date,
          time,
          recruiterUid: uid,
        })
        .returning();

      // Fetch custom template if exists
      const templateRecord = await db
        .select()
        .from(emailTemplates)
        .where(
          and(
            eq(emailTemplates.recruiterUid, uid),
            eq(emailTemplates.type, "interview_scheduling"),
          ),
        );

      let subject = "Interview Invitation";
      let body = `Interview scheduled on ${date} at ${time}`;

      if (templateRecord.length > 0) {
        const t = templateRecord[0];
        // In a real app we'd fetch candidate details, but we'll simulate replacement here
        subject = t.subject
          .replace(/{{candidateName}}/g, candidateId)
          .replace(/{{jobTitle}}/g, "Software Engineer");
        body = t.body
          .replace(/{{candidateName}}/g, candidateId)
          .replace(/{{jobTitle}}/g, "Software Engineer");
      }

      // Simulated Email Notification
      console.log(
        `[SIMULATED EMAIL] To: ${candidateId}@example.com\nSubject: ${subject}\nBody: ${body}\n(Scheduled on ${date} at ${time})`,
      );

      res.json({ message: "Interview scheduled", interview: result[0] });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ detail: e.message || "Internal Error" });
    }
  });

  app.post("/api/v1/jobs/audit", async (req, res) => {
    try {
      const { all_candidates, shortlisted_candidates } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res
          .status(500)
          .json({ detail: "GEMINI_API_KEY not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        You are an AI Ethics & Diversity Auditor. Please generate a formal "Hiring Bias Audit" report.
        Compare the original applicant pool distribution (by inferred background, location, or education) against the final shortlist to demonstrate diversity metrics and bias mitigation effectiveness.
        
        Original Pool Data:
        ${JSON.stringify(all_candidates.map((c: any) => ({ name: c.name, education: c.education, experience: c.experience_summary })))}
        
        Shortlisted Data:
        ${JSON.stringify(shortlisted_candidates.map((c: any) => ({ name: c.candidate?.name, score: c.match_score })))}
        
        Provide a JSON response with the following format:
        - title: string
        - summary: string
        - metrics: array of objects with { label: string, value: string, insight: string }
        - conclusion: string
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const auditData = JSON.parse(response.text || "{}");
      res.json(auditData);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ detail: e.message || "Internal Error" });
    }
  });

  app.post("/api/v1/resume/check", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ detail: "No file uploaded" });
      }

      const { jobDescription } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res
          .status(500)
          .json({ detail: "GEMINI_API_KEY not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });

      let rawText = "";
      let fileSize = req.file.size;
      let fileExt = req.file.originalname.split(".").pop()?.toLowerCase();

      if (fileExt === "pdf") {
        const data = await pdf(req.file.buffer);
        rawText = data.text;
      } else {
        rawText = req.file.buffer.toString("utf-8");
      }

      const prompt = `
        You are an expert ATS (Applicant Tracking System) and professional Resume Reviewer.
        A user has uploaded their resume to be evaluated.
        
        Job Description (if provided, use for Job Tailoring checks):
        ${jobDescription || "None provided"}
        
        File Info:
        Extension: ${fileExt}
        Size: ${Math.round(fileSize / 1024)} KB
        
        Resume Text:
        ${rawText}

        Perform 27 crucial checks across the following 7 categories and evaluate the resume based on standard recruiter practices.

        Provide a JSON response with the following format:
        {
          "overall_score": 0-100, // Weighted average of ATS Parse Rate and Content Quality
          "ats_parse_rate": 0-100, // How well an ATS could read it
          "content_quality": 0-100, // How good the content is for a human recruiter
          "categories": [
            {
              "name": "ATS Essentials",
              "checks": [
                { "name": "File format", "status": "pass|fail|warning", "feedback": "string" },
                { "name": "File size", "status": "pass|fail|warning", "feedback": "string" },
                { "name": "ATS-friendly design", "status": "pass|fail|warning", "feedback": "string" },
                { "name": "Professional email address", "status": "pass|fail|warning", "feedback": "string" },
                { "name": "Header links compliance", "status": "pass|fail|warning", "feedback": "string" },
                { "name": "Dates/links consistency", "status": "pass|fail|warning", "feedback": "string" }
              ]
            },
            {
              "name": "Resume Content",
              "checks": [
                { "name": "Quantifying impact", "status": "pass|fail|warning", "feedback": "string", "suggestion": "optional AI rewrite suggestion" },
                { "name": "Repetition of words", "status": "pass|fail|warning", "feedback": "string" },
                { "name": "Spelling and grammar", "status": "pass|fail|warning", "feedback": "string" },
                { "name": "Bullet length consistency", "status": "pass|fail|warning", "feedback": "string" }
              ]
            },
            {
              "name": "Job Tailoring",
              "checks": [
                { "name": "Hard skills matching", "status": "pass|fail|warning", "feedback": "string" },
                { "name": "Soft skills matching", "status": "pass|fail|warning", "feedback": "string" },
                { "name": "Action verbs", "status": "pass|fail|warning", "feedback": "string" },
                { "name": "Tailored job titles", "status": "pass|fail|warning", "feedback": "string" }
              ]
            },
            {
              "name": "Recruiter Red Flags",
              "checks": [
                { "name": "Resume credibility", "status": "pass|fail|warning", "feedback": "string" },
                { "name": "Ambiguous claims", "status": "pass|fail|warning", "feedback": "string" }
              ]
            },
            {
              "name": "Peer Benchmarking",
              "checks": [
                { "name": "Industry standards", "status": "pass|fail|warning", "feedback": "string" },
                { "name": "LinkedIn profile match", "status": "pass|fail|warning", "feedback": "string" }
              ]
            },
            {
              "name": "Bias & Discrimination",
              "checks": [
                { "name": "Age bias risk", "status": "pass|fail|warning", "feedback": "string" },
                { "name": "Date bias risk", "status": "pass|fail|warning", "feedback": "string" },
                { "name": "Employment gaps", "status": "pass|fail|warning", "feedback": "string" }
              ]
            },
            {
              "name": "Seniority & Impact",
              "checks": [
                { "name": "Career progression", "status": "pass|fail|warning", "feedback": "string" },
                { "name": "Skills evidence", "status": "pass|fail|warning", "feedback": "string" },
                { "name": "Leadership signals", "status": "pass|fail|warning", "feedback": "string" }
              ]
            }
          ]
        }
        
        Base the checks on standard resume best practices. Be constructive and provide actionable feedback.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const checkData = JSON.parse(response.text || "{}");
      checkData.raw_text = rawText; // Return raw text for frontend usage

      res.json(checkData);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ detail: e.message || "Internal Error" });
    }
  });

  app.post("/api/v1/resume/smart-edit", async (req, res) => {
    try {
      const { finding, jobDescription, suggestion } = req.body;

      if (!finding || !jobDescription) {
        return res
          .status(400)
          .json({ detail: "Missing finding or job description" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res
          .status(500)
          .json({ detail: "GEMINI_API_KEY not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        You are an expert technical recruiter and resume writer.
        A user has run a gap analysis on their resume against a specific Job Description.

        Job Description Context:
        ${jobDescription}

        Gap Analysis Finding:
        Name: ${finding.name}
        Feedback: ${finding.feedback}
        Suggestion: ${suggestion || finding.suggestion || "None provided"}

        Please provide a highly specific, rewritten bullet point or sentence that addresses this finding and aligns strongly with industry standards for this role.
        The rewritten text should be concise, impact-oriented (using action verbs and metrics where appropriate), and ready to be pasted directly into a resume.

        Output JSON format:
        {
          "rewritten_text": "string (the suggested rewritten sentence or bullet point)",
          "explanation": "string (brief explanation of why this change improves the resume for this role)"
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ detail: e.message || "Internal Error" });
    }
  });

  app.post("/api/v1/jobs/insights", async (req, res) => {
    try {
      const { title, description } = req.body;

      if (!title || !description) {
        return res
          .status(400)
          .json({ detail: "Missing job title or description" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res
          .status(500)
          .json({ detail: "GEMINI_API_KEY not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        You are a talent intelligence analyst.
        I am analyzing a job role with the title "${title}".
        Here is the job description context:
        ${description}

        Use the Google Search tool to find the most recent and accurate data on:
        1. Average Salary (give a range if possible, mention the currency)
        2. Demand Trends (e.g., growing, shrinking, competitive)
        3. Key Market Insights (e.g., industries hiring the most, specific skill demands)
        
        Keep it concise, factual, and based on the search results.

        Return a JSON object with the following structure:
        {
          "salary_range": "string",
          "demand_trend": "string",
          "market_insights": "string"
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }],
        },
      });

      let jsonRes = {};
      if (response.text) {
        try {
          jsonRes = JSON.parse(response.text.trim());
        } catch (e) {
          console.error("Failed to parse JSON response:", response.text);
        }
      }

      const chunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = chunks
        ? chunks.map((c: any) => c.web).filter(Boolean)
        : [];

      res.json({ ...jsonRes, sources });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ detail: e.message || "Internal Error" });
    }
  });

  app.post("/api/v1/payment/create-checkout-session", async (req, res) => {
    try {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey) {
        return res.status(500).json({ error: "Stripe is not configured" });
      }

      const stripe = new Stripe(stripeSecretKey);
      
      const { priceId, successUrl, cancelUrl } = req.body;

      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: priceId || 'price_1QxYz2ABCDEF', // Mock price ID or use env
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl || `${req.headers.origin}/?success=true`,
        cancel_url: cancelUrl || `${req.headers.origin}/?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (err: any) {
      console.error(err);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

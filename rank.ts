import fs from 'fs';
import readline from 'readline';

const CANDIDATES_FILE = "hackathon_materials/[PUB] India_runs_data_and_ai_challenge/India_runs_data_and_ai_challenge/candidates.jsonl";
const SAMPLE_FILE = "hackathon_materials/[PUB] India_runs_data_and_ai_challenge/India_runs_data_and_ai_challenge/sample_candidates.json";
const OUTPUT_FILE = "team_antigravity.csv";

const MUST_HAVE_KEYWORDS = [
  "sentence-transformers", "openai embeddings", "bge", "e5", "embedding", "retrieval", "rag",
  "pinecone", "weaviate", "qdrant", "milvus", "opensearch", "elasticsearch", "faiss", "vector",
  "python", "ndcg", "mrr", "map", "eval", "a/b test"
];

const NICE_TO_HAVE_KEYWORDS = [
  "lora", "qlora", "peft", "fine-tuning", "xgboost", "learning-to-rank", "ltr", 
  "distributed systems", "open-source", "hr-tech", "recruiting"
];

const CONSULTING_FIRMS = [
  "tcs", "infosys", "wipro", "accenture", "cognizant", "capgemini", "mindtree"
];

function scoreCandidate(c: any) {
  let score = 0.5; // Base score
  let reasons: string[] = [];
  
  // 1. HONEYPOT / TRAP FILTERS (Auto-reject or tank score)
  let isHoneypot = false;
  
  // Trap A: Impossible skills
  let advancedSkillsNoExp = 0;
  for (const s of (c.skills || [])) {
    if ((s.proficiency === 'advanced' || s.endorsements > 20) && s.duration_months === 0) {
      advancedSkillsNoExp++;
    }
  }
  if (advancedSkillsNoExp > 2) {
    isHoneypot = true;
  }
  
  // Trap B: Timeline mismatch
  let totalCareerMonths = 0;
  for (const job of (c.career_history || [])) {
    totalCareerMonths += (job.duration_months || 0);
    if (job.duration_months > 600) isHoneypot = true; // 50 years at one job? Probably honeypot
  }
  const calcYears = totalCareerMonths / 12;
  const claimedYears = c.profile?.years_of_experience || 0;
  if (Math.abs(calcYears - claimedYears) > 5) {
    isHoneypot = true;
  }
  
  if (isHoneypot) return { score: 0.0, reasoning: "Identified as honeypot." };

  // 2. EXPLICIT REJECTIONS (from JD)
  // Title-chasers
  let avgJobDuration = 0;
  if (c.career_history && c.career_history.length > 2) {
    avgJobDuration = totalCareerMonths / c.career_history.length;
    if (avgJobDuration < 18) {
      return { score: 0.1, reasoning: "Job hopping / Title-chasing history." };
    }
  }
  
  // Consulting-only
  let productCompanyExp = false;
  for (const job of (c.career_history || [])) {
    const company = (job.company || "").toLowerCase();
    if (!CONSULTING_FIRMS.some(f => company.includes(f))) {
      productCompanyExp = true;
    }
  }
  if (!productCompanyExp && c.career_history?.length > 0) {
    return { score: 0.15, reasoning: "Pure services/consulting background without product experience." };
  }
  
  // 3. KEYWORD / SKILL SCORING
  let textToSearch = [
    c.profile?.summary || "",
    c.profile?.headline || "",
    ...(c.career_history || []).map((j: any) => (j.description || "") + " " + (j.title || "")),
    ...(c.skills || []).map((s: any) => s.name)
  ].join(" ").toLowerCase();
  
  let matches = 0;
  for (const kw of MUST_HAVE_KEYWORDS) {
    if (textToSearch.includes(kw)) {
      score += 0.05;
      matches++;
    }
  }
  
  for (const kw of NICE_TO_HAVE_KEYWORDS) {
    if (textToSearch.includes(kw)) {
      score += 0.02;
    }
  }
  
  // 4. BEHAVIORAL SCORING
  const signals = c.redrob_signals || {};
  
  // Availability
  if (signals.open_to_work_flag) score += 0.05;
  if (signals.recruiter_response_rate < 0.2) score -= 0.1;
  if (signals.recruiter_response_rate > 0.8) score += 0.05;
  
  // Notice period
  if (signals.notice_period_days <= 30) score += 0.05;
  if (signals.notice_period_days > 60) score -= 0.05;
  if (signals.notice_period_days >= 120) score -= 0.1;
  
  // Github activity
  if (signals.github_activity_score > 5) score += 0.05;
  
  // Seniority Sweet Spot (JD asks for 6-8 years)
  if (claimedYears >= 6 && claimedYears <= 10) {
    score += 0.05;
    reasons.push("Perfect seniority fit (6-8 years)");
  }
  
  // Generate Reasoning
  let reasoning = "";
  if (matches >= 4) {
    reasoning = `Strong technical fit with ${matches} matching critical keywords (Vector DBs, Python, Eval). `;
  } else if (matches > 0) {
    reasoning = `Moderate technical fit. `;
  } else {
    reasoning = `Lacks core required infrastructure experience. `;
  }
  
  if (signals.notice_period_days <= 30) reasoning += "Excellent availability (<30 days).";
  
  // Add micro-score for tie breaking
  score += (matches * 0.001) + ((signals.github_activity_score || 0) * 0.0001);
  
  if (score < 0.0) score = 0.0;
  if (score > 1.0) score = 0.99 + (score % 0.01); // Keep it strictly below 1 but preserve differences
  
  return { score: parseFloat(score.toFixed(3)), reasoning: reasoning.trim() || "Matches general profile." };
}

async function run() {
  const isSample = !fs.existsSync(CANDIDATES_FILE);
  const targetFile = isSample ? SAMPLE_FILE : CANDIDATES_FILE;
  console.log("Processing:", targetFile);
  
  let candidates = [];
  
  if (isSample) {
    const raw = fs.readFileSync(targetFile, 'utf-8');
    candidates = JSON.parse(raw);
  } else {
    const rl = readline.createInterface({
      input: fs.createReadStream(targetFile),
      crlfDelay: Infinity
    });
    
    for await (const line of rl) {
      if (!line.trim()) continue;
      try {
        candidates.push(JSON.parse(line));
      } catch(e) {}
    }
  }
  
  console.log("Total candidates read:", candidates.length);
  
  const results = [];
  for (const c of candidates) {
    const evalRes = scoreCandidate(c);
    results.push({
      candidate_id: c.candidate_id,
      score: evalRes.score,
      reasoning: evalRes.reasoning
    });
  }
  
  results.sort((a, b) => b.score - a.score);
  
  // The output must be EXACTLY 100 rows, ranks 1-100, monotonically decreasing score
  const top100 = results.slice(0, 100);
  
  // Ensure strict monotonically non-increasing (fix any sorting artifacts)
  let currentScore = top100[0].score;
  for (let i = 0; i < top100.length; i++) {
    if (top100[i].score > currentScore) {
      top100[i].score = currentScore;
    }
    currentScore = top100[i].score;
  }
  
  // Write CSV
  let csv = "candidate_id,rank,score,reasoning\n";
  for (let i = 0; i < 100; i++) {
    const c = top100[i];
    csv += `${c.candidate_id},${i+1},${c.score.toFixed(3)},"${c.reasoning.replace(/"/g, '""')}"\n`;
  }
  
  fs.writeFileSync(OUTPUT_FILE, csv);
  console.log(`Wrote top 100 candidates to ${OUTPUT_FILE}`);
}

run().catch(console.error);

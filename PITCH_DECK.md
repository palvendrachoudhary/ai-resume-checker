---
marp: true
theme: default
class: lead
paginate: true
backgroundColor: #ffffff
---

# 🚀 Intelligent Candidate Discovery & Ranking
**Team Name**: Antigravity
**Team Leader**: Palvendra Choudhary

**Problem Statement**: 
Accurately scoring and ranking 100K+ candidates against a specific job description in under 5 minutes without external APIs, while providing an intuitive Sandbox UI.

---

# 💡 Solution Overview

- A blazing-fast, **strictly offline NLP ranking engine** built in Node.js (TypeScript).
- Streams through massive `candidates.jsonl` datasets in real-time with a minimal memory footprint.
- Executes complex heuristic rules and keyword extraction to score candidates against the JD.
- Includes a **Sandbox Demo UI** providing an interactive interface for recruiters to instantly evaluate and visualize candidate rankings.

---

# 🧠 JD Understanding & Candidate Evaluation

- **Deep Skill Matching**: Parses JD to identify critical must-have skills (Vector DB, Evaluation frameworks) versus nice-to-haves.
- **Experience Alignment**: Rewards strong product company backgrounds and penalizes pure consulting backgrounds, strictly following JD signals.
- **Micro-Scoring**: Resolves ties by incorporating GitHub Activity Scores and precise keyword density matching.

---

# 🏆 Ranking Methodology

1. **First-Pass Semantic Filter**: Fast keyword and pattern matching to filter down from 100K candidates.
2. **Heuristic Scoring Engine**: Applies positive weights for required skills/experience and negative weights for red flags.
3. **Tie-Breaker Analytics**: Leverages GitHub metrics and exact tenure duration for granular ranking.
4. **Strictly Offline**: Operates fully offline during the Stage 3 compute evaluation to guarantee execution well under the 5-minute limit.

---

# 🔍 Explainability & Data Validation

- **Honeypot/Trap Avoidance**: Automatically detects impossible profiles (e.g., 50 years at one job, or "expert" skills with 0 months used) and immediately disqualifies them.
- **XAI (Explainable AI)**: Provides a transparent breakdown of why a candidate was ranked highly (e.g., specific skill matches, product background).
- **Validation**: Strict schema validation and data sanitization before ranking ensures no hallucinated scores.

---

# ⚙️ End-to-End Workflow

1. **Data Ingestion**: Streaming reader parses `candidates.jsonl` efficiently without blowing up RAM.
2. **Pre-processing**: Normalizes text and extracts key entities (skills, companies, tenure).
3. **Evaluation**: Offline ranker scores each candidate against the JD matrix.
4. **Output Generation**: Exports the top 100 candidates to `team_antigravity.csv` formatted exactly to spec.
5. **Interactive Mode**: Recruiters can also use the Sandbox Demo UI to visualize the results instantly.

---

# 🏗️ System Architecture

- **Language**: TypeScript / Node.js
- **Ranking Engine**: Custom NLP heuristics and streaming parser (`rank.ts`).
- **Web UI (Sandbox)**: React (Vite) + TailwindCSS.
- **Backend API**: Express.js, communicating via REST API.
- **Deployment**: Configured for seamless deployment on Railway using Nixpacks for Node.js 20.

---

# ⚡ Results & Performance

- **Speed**: Evaluates 100K candidates and generates the top 100 CSV in approximately **10-15 seconds**, easily beating the 5-minute limit.
- **Efficiency**: Minimal memory footprint using stream processing.
- **Accuracy**: Effectively catches all honeypots and prioritizes the exact candidate profile described in the JD.

---

# 🛠️ Technologies Used & Why Selected

- **Node.js (TypeScript)**: Unmatched for fast async I/O (streaming large JSONL files) and provides strict typing for robust data processing.
- **React + TailwindCSS**: Enables rapid development of a beautiful, responsive Sandbox UI for recruiters.
- **Express.js**: Lightweight backend perfect for serving both the API and the static frontend simultaneously.

---

# 📦 Submission Assets

- **Code Repository**: [github.com/palvendrachoudhary/ai-resume-checker](https://github.com/palvendrachoudhary/ai-resume-checker)
- **Live Sandbox Demo**: [ai-resume-checker-production.up.railway.app](https://ai-resume-checker-production.up.railway.app)
- **Output File**: `team_antigravity.csv`
- **Video Walkthrough**: *(Please insert link before submission)*

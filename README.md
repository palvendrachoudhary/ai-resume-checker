# Redrob Hackathon: Team Antigravity

This is the official submission for the Intelligent Candidate Discovery & Ranking Challenge.

## Architecture

Our submission utilizes a blazing-fast, strictly offline NLP ranking engine built in Node.js (TypeScript). 
It streams through `candidates.jsonl`, executing heuristic rules and keyword extraction to score candidates against the provided `job_description.docx` without relying on any external APIs during the evaluation phase, perfectly complying with Stage 3 constraints (no network, 5-minute compute).

### Key Features
1. **Honeypot/Trap Avoidance**: Automatically detects impossible profiles (e.g. 50 years at one job, or "expert" skills with 0 months used) and filters them.
2. **Strict JD Compliance**: Penalizes pure consulting backgrounds (per the JD's explicitly stated negative signals) and rewards strong product company backgrounds with Vector DB / Evaluation framework experience.
3. **Micro-Scoring**: Resolves ties by incorporating Github Activity Scores and exact keyword densities.

## Reproducing the Submission CSV

To generate the exact `team_antigravity.csv` from the 100K candidate pool within the compute limits:

### Setup Requirements
- Node.js (v18+ recommended)
- `candidates.jsonl` file placed at `hackathon_materials/[PUB] India_runs_data_and_ai_challenge/India_runs_data_and_ai_challenge/candidates.jsonl` (or modify the path in `rank.ts`)

### Exact Command
```bash
# Install dependencies
npm install

# Run the ranking script
npx tsx rank.ts
```
The script will output `team_antigravity.csv` containing the top 100 candidates formatted exactly to spec in around ~10-15 seconds.

## Sandbox Demo UI

We have provided a React/Express web application that acts as our Sandbox Demo. 
It uses the exact same fast, offline ranking logic under the hood to instantly evaluate a smaller sample of candidates.

```bash
# Start the Sandbox UI
npm run dev
```
Then navigate to `http://localhost:3000`. You can upload the `sample_candidates.json` file provided in the hackathon bundle, and watch the offline ranker evaluate them instantly!

"""
FastAPI Application Entrypoint
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uuid

from app.ingestion import process_file
from app.llm_extractor import extract_profile_from_text
from app.vector_store import store_candidate, search_candidates
from app.scoring_engine import evaluate_candidate
from app.visuals import generate_comparison_chart
from app.models import JobDescription, CandidateProfile

app = FastAPI(
    title="Smart AI Recruiter API", 
    description="Context-aware AI recruitment system powered by Gemini and ChromaDB",
    version="1.0.0"
)

# In-memory storage for MVP (replaces MongoDB for simplicity in this demo)
# Note: For production, wire this to pymongo with settings.mongo_uri
candidates_db = {}

@app.get("/")
def read_root():
    return {"status": "Active", "message": "Smart AI Recruiter API is running. Access /docs for swagger UI."}

@app.post("/api/v1/candidates/upload")
async def upload_resume(file: UploadFile = File(...)):
    """Stage 1: Ingests a resume (PDF/DOCX) and extracts a structured Candidate Profile."""
    try:
        content = await file.read()
        raw_text = process_file(content, file.filename)
        
        profile = extract_profile_from_text(raw_text)
        candidate_id = str(uuid.uuid4())
        
        # Store structured profile
        candidates_db[candidate_id] = profile
        
        # Create dense vector embedding in ChromaDB
        store_candidate(candidate_id, profile)
        
        return {
            "message": "Candidate successfully ingested and embedded.",
            "candidate_id": candidate_id, 
            "profile": profile.model_dump()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class EvaluateResponse(BaseModel):
    top_candidates: list
    comparison_chart_base64: str

@app.post("/api/v1/jobs/evaluate", response_model=EvaluateResponse)
async def evaluate_candidates(jd: JobDescription):
    """Stage 2 & 3: Vector Search followed by Deep LLM Recruiter Reasoning."""
    try:
        # 1. First-Pass Semantic Vector Filter
        jd_text = f"{jd.title} {jd.description} {' '.join(jd.required_skills)}"
        search_results = search_candidates(jd_text, top_k=5)
        
        scored_results = []
        
        # 2. Deep Recruiter Reasoning
        if search_results and search_results['ids'] and search_results['ids'][0]:
            top_ids = search_results['ids'][0]
            for c_id in top_ids:
                candidate = candidates_db.get(c_id)
                if candidate:
                    # Act as AI Recruiter to get XAI scores and reasons
                    scored = evaluate_candidate(jd, candidate)
                    scored_results.append(scored)
        
        # Sort final shortlist by match score
        scored_results.sort(key=lambda x: x.match_score, reverse=True)
        
        # 3. Generate Visual Analytics
        chart_base64 = generate_comparison_chart(scored_results)
        
        return EvaluateResponse(
            top_candidates=[sc.model_dump() for sc in scored_results],
            comparison_chart_base64=chart_base64
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

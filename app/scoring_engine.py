"""
Deep Recruiter Reasoning Engine
Utilizes Gemini 2.5 Pro to evaluate vector-filtered candidates.
"""
import json
from google import genai
from google.genai import types
from app.config import settings
from app.models import CandidateProfile, ScoredCandidate, JobDescription, EvaluationResult

client = genai.Client(api_key=settings.gemini_api_key)

def evaluate_candidate(jd: JobDescription, candidate: CandidateProfile) -> ScoredCandidate:
    """Performs a deep evaluation of a candidate against a Job Description."""
    prompt = f"""
    Act as an Executive Tech Recruiter. Evaluate the candidate against the Job Description.
    
    Job Description:
    Title: {jd.title}
    Requirements: {jd.description}
    Required Skills: {', '.join(jd.required_skills)}
    
    Candidate Profile:
    Name: {candidate.name}
    Skills: {', '.join(candidate.skills)}
    Experience: {candidate.experience_summary}
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-pro',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=EvaluationResult,
            temperature=0.2,
        )
    )
    
    try:
        eval_data = json.loads(response.text)
        eval_result = EvaluationResult(**eval_data)
        
        return ScoredCandidate(
            candidate=candidate,
            **eval_result.model_dump()
        )
    except Exception as e:
        print(f"Evaluation error: {e}")
        raise ValueError("Failed to evaluate candidate")

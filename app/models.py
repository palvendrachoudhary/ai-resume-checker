from pydantic import BaseModel, Field
from typing import List, Optional

class JobDescription(BaseModel):
    title: str = Field(..., description="Job title")
    description: str = Field(..., description="Full text of the job description")
    required_skills: List[str] = Field(default_factory=list, description="List of required skills")
    experience_level: str = Field(..., description="Required experience level")

class CandidateProfile(BaseModel):
    name: str = Field(..., description="Candidate's full name")
    contact_info: Optional[str] = Field(None, description="Contact information")
    skills: List[str] = Field(default_factory=list, description="List of skills extracted from the resume")
    experience_summary: str = Field("", description="Summary of work experience")
    education: str = Field("", description="Educational background")
    raw_text: str = Field("", description="Original raw text extracted from the document")

class ScoredCandidate(BaseModel):
    candidate: CandidateProfile
    match_score: float = Field(..., ge=0, le=100, description="Overall match score percentage")
    why_this_candidate: str = Field(..., description="Explainable AI summary of why they fit")
    potential_gaps: str = Field(..., description="Analysis of potential gaps or risks")
    technical_fit_score: int = Field(..., ge=0, le=10, description="Technical competency score out of 10")
    experience_fit_score: int = Field(..., ge=0, le=10, description="Experience depth score out of 10")
    contextual_fit_score: int = Field(..., ge=0, le=10, description="Contextual/role alignment score out of 10")

class EvaluationResult(BaseModel):
    match_score: float = Field(..., ge=0, le=100, description="Overall match score percentage")
    why_this_candidate: str = Field(..., description="Explainable AI summary of why they fit")
    potential_gaps: str = Field(..., description="Analysis of potential gaps or risks")
    technical_fit_score: int = Field(..., ge=0, le=10, description="Technical competency score out of 10")
    experience_fit_score: int = Field(..., ge=0, le=10, description="Experience depth score out of 10")
    contextual_fit_score: int = Field(..., ge=0, le=10, description="Contextual/role alignment score out of 10")

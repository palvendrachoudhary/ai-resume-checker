"""
LLM Structured Extractor
Converts raw text into clean JSON CandidateProfiles using Gemini 2.5 Flash.
"""
import json
from google import genai
from google.genai import types
from app.config import settings
from app.models import CandidateProfile

# Initialize SDK
client = genai.Client(api_key=settings.gemini_api_key)

def extract_profile_from_text(raw_text: str) -> CandidateProfile:
    """Parses raw text into a structured Pydantic CandidateProfile."""
    prompt = f"""
    Extract the following information from the resume text provided below.
    Format the output strictly according to the requested JSON schema.
    
    Resume Text:
    {raw_text}
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=CandidateProfile,
            temperature=0.1,
        )
    )
    
    try:
        profile_data = json.loads(response.text)
        profile = CandidateProfile(**profile_data)
        profile.raw_text = raw_text
        return profile
    except Exception as e:
        print(f"Error validating extracted profile: {e}")
        raise ValueError("Failed to extract valid profile from text")

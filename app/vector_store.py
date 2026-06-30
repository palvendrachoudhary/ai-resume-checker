"""
Vector Storage using ChromaDB
"""
import chromadb
from app.config import settings
from app.models import CandidateProfile

# If running outside docker compose without the chromadb container, use persistent local path.
# Otherwise, connect to the chroma container.
if settings.chroma_host == "localhost":
    chroma_client = chromadb.PersistentClient(path="./chroma_data")
else:
    chroma_client = chromadb.HttpClient(host=settings.chroma_host, port=settings.chroma_port)

# We use a single collection for candidates
collection = chroma_client.get_or_create_collection(name="candidates_collection")

def store_candidate(candidate_id: str, profile: CandidateProfile):
    """Generates embeddings and stores candidate profile in ChromaDB."""
    # The document text is what ChromaDB will embed and search against.
    document_text = f"Skills: {', '.join(profile.skills)}\nExperience: {profile.experience_summary}"
    
    collection.upsert(
        documents=[document_text],
        metadatas=[{"name": profile.name}],
        ids=[candidate_id]
    )

def search_candidates(jd_text: str, top_k: int = 5):
    """Searches for top candidates matching the Job Description context."""
    results = collection.query(
        query_texts=[jd_text],
        n_results=top_k
    )
    return results

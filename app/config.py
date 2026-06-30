from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # Google Gemini AI Studio
    gemini_api_key: str = Field(..., description="API Key for Google Gemini")

    # Supabase configuration
    supabase_url: str = Field(..., description="Supabase project URL")
    supabase_key: str = Field(..., description="Supabase anonymous or service role key")

    # Optional local databases (MongoDB & ChromaDB)
    mongo_uri: str | None = None
    chroma_host: str = "localhost"
    chroma_port: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

try:
    # Instantiating the settings will automatically validate the presence of required variables.
    # It throws a ValidationError if a required key (like gemini_api_key) is missing.
    settings = Settings()
except Exception as e:
    import sys
    print(f"❌ Configuration Error: Missing or invalid environment variables.\nDetails: {e}")
    sys.exit(1)

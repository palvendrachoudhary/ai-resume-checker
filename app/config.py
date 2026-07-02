from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # Google Gemini AI Studio
    gemini_api_key: str = Field(default="", description="API Key for Google Gemini")

    # Supabase configuration
    supabase_url: str = Field(default="", description="Supabase project URL")
    supabase_key: str = Field(default="", description="Supabase anonymous or service role key")

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
    settings = Settings()
    if not settings.gemini_api_key:
        print("⚠️  Warning: GEMINI_API_KEY is not set. AI features will not work.")
    if not settings.supabase_url:
        print("⚠️  Warning: SUPABASE_URL is not set. Database features will not work.")
except Exception as e:
    import sys
    print(f"❌ Configuration Error: Missing or invalid environment variables.\nDetails: {e}")
    sys.exit(1)


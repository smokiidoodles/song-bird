from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    frontend_origin: str = "http://localhost:5173"
    backend_origin: str = "http://127.0.0.1:8000"

    supabase_url: str
    supabase_secret_key: str

    spotify_client_id: str
    spotify_client_secret: str
    spotify_redirect_uri: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
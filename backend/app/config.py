import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union

class Settings(BaseSettings):
    HF_TOKEN: str | None = None
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/studio.db"
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3005",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3005",
        "*"
    ]
    
    TEXT_MODEL: str = "Qwen/Qwen2.5-7B-Instruct"
    IMAGE_MODEL: str = "black-forest-labs/FLUX.1-schnell"
    VIDEO_MODEL: str = "Lightricks/LTX-Video"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    def get_cors_origins(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, str):
            if self.CORS_ORIGINS.strip() == "*":
                return ["*"]
            return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]
        return self.CORS_ORIGINS

settings = Settings()

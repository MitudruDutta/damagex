from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache
from typing import List

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "DamageX Inference Engine"
    
    MODEL_PATH: str = str(Path(__file__).resolve().parents[2] / "model" / "saved_model.pth")
    NUM_CLASSES: int = 6
    CLASS_NAMES: List[str] = [
        'Front Breakage', 
        'Front Crushed', 
        'Front Normal', 
        'Rear Breakage', 
        'Rear Crushed', 
        'Rear Normal'
    ]
    
    ALLOWED_ORIGINS: List[str] = ["*"]
    GATEKEEPER_FAIL_CLOSED: bool = False

    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def parse_origins(cls, v):
        if isinstance(v, list):
            return v
        return [origin.strip() for origin in v.split(",") if origin.strip()]

    class Config:
        case_sensitive = True
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

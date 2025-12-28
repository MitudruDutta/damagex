import os
from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "DamageX Inference Engine"
    
    # Model Configuration
    # Prioritize ENV var, default to relative path resolved via pathlib
    MODEL_PATH: str = os.getenv(
        "MODEL_PATH", 
        str(Path(__file__).resolve().parents[2] / "model" / "saved_model.pth")
    )
    NUM_CLASSES: int = 6
    CLASS_NAMES: list[str] = [
        'Front Breakage', 
        'Front Crushed', 
        'Front Normal', 
        'Rear Breakage', 
        'Rear Crushed', 
        'Rear Normal'
    ]
    
    # CORS Configuration
    # In production, this should be a comma-separated string of allowed origins
    ALLOWED_ORIGINS: list[str] = [
        origin.strip() 
        for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",") 
        if origin.strip()
    ]
    
    # Gatekeeper Security Posture
    # False = Fail Open (Allow on error/timeout) - Default for availability
    # True = Fail Closed (Block on error/timeout) - Safer for high-security
    GATEKEEPER_FAIL_CLOSED: bool = False

    class Config:
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()
from pydantic import BaseModel
from typing import Optional

class PredictionResponse(BaseModel):
    category: str
    confidence: float
    details: dict[str, float]
    is_valid: bool = True
    warning: Optional[str] = None


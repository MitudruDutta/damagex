import asyncio
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.services.model import DamageClassifier
from app.schemas.prediction import PredictionResponse

logger = logging.getLogger(__name__)
router = APIRouter()

VALID_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}

@router.post("/", response_model=PredictionResponse)
async def predict_damage(file: UploadFile = File(...)):
    # 1. Validation: Check File Type (Set Lookup)
    if file.content_type not in VALID_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid file type. Only JPEG, PNG, and WebP are supported."
        )

    # 2. Validation: Strict File Size Limit (10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    
    try:
        contents = bytearray()
        size = 0
        
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="File too large. Maximum size is 10MB."
                )
            contents.extend(chunk)
        
        classifier = DamageClassifier.get_instance()
        loop = asyncio.get_event_loop()
        
        result = await loop.run_in_executor(None, classifier.predict, bytes(contents))
        
        return PredictionResponse(
            category=result["class"],
            confidence=result["confidence"],
            details=result["all_scores"]
        )
        
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected error during image processing")
        raise HTTPException(status_code=500, detail="Internal Processing Error")
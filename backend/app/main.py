from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.v1.endpoints import predict
from app.core.config import get_settings
from app.services.model import DamageClassifier
from app.services.gatekeeper import VehicleGatekeeper
import logging

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Startup: Initializing ML Models...")
    try:
        DamageClassifier.get_instance()
        VehicleGatekeeper.get_instance()
    except Exception as e:
        logger.critical(f"Startup Failed: {e}")
        raise RuntimeError("Model initialization failed") from e
    yield
    logger.info("Shutdown: Cleaning up...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Configuration
# Safe default: If "*" is used, allow_credentials must be False.
# If explicit origins are provided, allow_credentials can be True.
allow_credentials = True
if "*" in settings.ALLOWED_ORIGINS:
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, prefix=f"{settings.API_V1_STR}/predict", tags=["prediction"])

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": DamageClassifier.is_loaded(),
        "gatekeeper_loaded": VehicleGatekeeper.get_instance().model is not None
    }
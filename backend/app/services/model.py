import torch
import io
import threading
import logging
from packaging import version
from PIL import Image, UnidentifiedImageError
from torchvision import models, transforms
from torch import nn
from app.core.config import get_settings
from app.services.gatekeeper import VehicleGatekeeper

settings = get_settings()
logger = logging.getLogger(__name__)

class DamageClassifier:
    _instance = None
    _lock = threading.Lock()

    def __init__(self):
        self.model = None
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    instance = cls()
                    instance.load_model()
                    cls._instance = instance
        return cls._instance

    @classmethod
    def is_loaded(cls) -> bool:
        return cls._instance is not None and cls._instance.model is not None

    def load_model(self):
        logger.info(f"Loading model from {settings.MODEL_PATH}...")
        try:
            # Reconstruct the architecture
            self.model = models.resnet50(weights=None)
            
            self.model.fc = nn.Sequential(
                nn.Dropout(0.5),
                nn.Linear(self.model.fc.in_features, settings.NUM_CLASSES)
            )
            
            # Secure Load Logic
            if version.parse(torch.__version__) >= version.parse("2.6.0"):
                 state_dict = torch.load(settings.MODEL_PATH, map_location=torch.device('cpu'), weights_only=True)
            else:
                 # Fallback for older torch versions (user accepts risk or upgrades)
                 # In a strict env, we might raise error here.
                 logger.warning("Loading model without weights_only=True (PyTorch < 2.6.0). Upgrade recommended.")
                 state_dict = torch.load(settings.MODEL_PATH, map_location=torch.device('cpu'))

            # Handle key mismatch
            new_state_dict = {}
            for k, v in state_dict.items():
                if k.startswith("model."):
                    new_state_dict[k[6:]] = v 
                else:
                    new_state_dict[k] = v
            
            self.model.load_state_dict(new_state_dict)
            self.model.eval()
            logger.info("Model loaded successfully.")
        except Exception as e:
            logger.critical(f"Failed to load model: {e}", exc_info=True)
            raise e

    def predict(self, image_bytes: bytes):
        if not self.model:
            self.load_model()

        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            
            # Gatekeeper Check
            if not VehicleGatekeeper.get_instance().is_vehicle(image):
                raise ValueError("No vehicle detected. Please upload a clear photo of a car.")

            image_tensor = self.transform(image).unsqueeze(0)

            with torch.no_grad():
                output = self.model(image_tensor)
                probabilities = torch.nn.functional.softmax(output[0], dim=0)
                confidence, predicted_idx = torch.max(probabilities, 0)
                
                return {
                    "class": settings.CLASS_NAMES[predicted_idx.item()],
                    "confidence": float(confidence.item()),
                    "all_scores": {
                        settings.CLASS_NAMES[i]: float(probabilities[i].item()) 
                        for i in range(len(settings.CLASS_NAMES))
                    }
                }
        except UnidentifiedImageError:
            raise ValueError("Invalid image format or corrupt file.")
        except Exception as e:
            logger.error(f"Prediction Error: {e}", exc_info=True)
            raise e

import torch
import logging
from torchvision import models
from PIL import Image
import threading

from app.core.config import get_settings

# Configure logging
logger = logging.getLogger(__name__)
settings = get_settings()

# Expanded ImageNet class indices for vehicles and vehicle parts
# This includes cars, trucks, vans, car parts, wheels, mirrors, etc.
VEHICLE_INDICES = {
    # Cars and vehicles
    407,  # ambulance
    436,  # beach wagon
    468,  # cab/taxi
    511,  # convertible
    581,  # grille/radiator grille
    609,  # jeep
    627,  # limousine
    656,  # minivan
    661,  # Model T
    705,  # passenger car
    717,  # pickup truck
    734,  # police van
    751,  # racer/race car
    757,  # recreational vehicle
    779,  # school bus
    817,  # sports car
    829,  # streetcar/tram
    864,  # tow truck
    867,  # trailer truck
    907,  # wrecker/tow car
    # Additional vehicle-related classes
    408,  # amphibian
    479,  # car wheel
    555,  # fire engine
    569,  # freight car
    573,  # garbage truck
    586,  # half track
    594,  # harvester
    603,  # horse cart
    612,  # jinrikisha
    654,  # minibus
    671,  # motor scooter
    675,  # moving van
    734,  # police van
    740,  # projectile
    744,  # prowler
    751,  # race car
    757,  # recreational vehicle
    779,  # school bus
    803,  # snowplow
    817,  # sports car
    820,  # steam locomotive
    829,  # streetcar
    847,  # tank
    864,  # tow truck
    867,  # trailer truck
    870,  # trolleybus
    874,  # truck
    880,  # unicycle
    895,  # warplane
    # Car parts that might be visible in close-up damage photos
    479,  # car wheel
    581,  # grille
    656,  # minivan
    705,  # passenger car
    717,  # pickup
    751,  # racer
    817,  # sports car
    874,  # truck
}

class VehicleGatekeeper:
    _instance = None
    _lock = threading.Lock()

    def __init__(self):
        self.model = None
        self.preprocess = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    instance = cls()
                    instance.load_model()
                    cls._instance = instance
        return cls._instance

    def load_model(self):
        logger.info("Loading Vehicle Gatekeeper (ResNet18)...")
        try:
            # Use the standard pretrained weights
            weights = models.ResNet18_Weights.DEFAULT
            self.model = models.resnet18(weights=weights)
            self.model.eval()
            self.preprocess = weights.transforms()
            logger.info("Gatekeeper loaded.")
        except Exception as e:
            logger.error(f"Failed to load Gatekeeper model: {e}")
            raise e

    def is_vehicle(self, image: Image.Image) -> bool:
        """
        Returns True if the image is likely a vehicle.
        Uses top-k predictions to be more permissive with close-up/partial vehicle images.
        Handles failures based on GATEKEEPER_FAIL_CLOSED configuration.
        """
        if self.model is None:
            if settings.GATEKEEPER_FAIL_CLOSED:
                logger.error("Gatekeeper model not loaded. Rejecting request (Fail Closed).")
                return False
            else:
                # FAIL OPEN: Allow request to proceed if security check fails/crashes.
                logger.warning("Gatekeeper model not loaded. Allowing request (Fail Open).")
                return True

        try:
            batch = self.preprocess(image).unsqueeze(0)
            
            with torch.no_grad():
                prediction = self.model(batch).squeeze(0).softmax(0)
                
                # Check top-10 predictions for any vehicle class
                top_k = 10
                top_scores, top_indices = prediction.topk(top_k)
                
                for idx, score in zip(top_indices.tolist(), top_scores.tolist()):
                    logger.debug(f"Gatekeeper check: Class {idx}, Score: {score:.4f}")
                    if idx in VEHICLE_INDICES and score > 0.01:  # Lower threshold for top-k
                        logger.info(f"Vehicle detected: Class {idx}, Score: {score:.4f}")
                        return True
                
                # Log top prediction for debugging
                class_id = prediction.argmax().item()
                score = prediction[class_id].item()
                logger.info(f"Gatekeeper: No vehicle in top-{top_k}. Top class: {class_id}, Score: {score:.2f}")
            
            return False

        except Exception as e:
            if settings.GATEKEEPER_FAIL_CLOSED:
                logger.error(f"Gatekeeper Error: {e}. Rejecting request (Fail Closed).", exc_info=True)
                return False
            else:
                # FAIL OPEN
                logger.warning(f"Gatekeeper Error: {e}. Allowing request (Fail Open).", exc_info=True)
                return True
"""Serialize large-model inference across upload and camera sessions."""
from threading import RLock
INFERENCE_LOCK = RLock()

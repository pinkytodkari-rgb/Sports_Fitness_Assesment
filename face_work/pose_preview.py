"""Pretrained pose visualization only: no angle calculations or scoring."""
from pathlib import Path
import urllib.request
import cv2
import mediapipe as mp
import numpy as np
from threading import Lock

MODEL_PATH = Path(__file__).resolve().parent/'models'/'pose_landmarker_lite.task'
DOWNLOAD_LOCK = Lock()
EDGES = [(11,12),(11,13),(13,15),(12,14),(14,16),(11,23),(12,24),
         (23,24),(23,25),(25,27),(24,26),(26,28)]

def ensure_pose_model():
    with DOWNLOAD_LOCK:
        if not MODEL_PATH.exists():
            MODEL_PATH.parent.mkdir(exist_ok=True)
            temporary = MODEL_PATH.with_suffix('.download')
            urllib.request.urlretrieve('https://storage.googleapis.com/mediapipe-models/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',temporary)
            temporary.replace(MODEL_PATH)
    return MODEL_PATH

class PosePreview:
    def __init__(self):
        self.model = None
        self.timestamp = -1
        self.landmarks = []

    def draw(self, rgb, seconds):
        if self.model is None:
            self.model = mp.tasks.vision.PoseLandmarker.create_from_options(
                mp.tasks.vision.PoseLandmarkerOptions(
                    base_options=mp.tasks.BaseOptions(model_asset_path=str(ensure_pose_model())),
                    running_mode=mp.tasks.vision.RunningMode.VIDEO,num_poses=1))
        timestamp = max(self.timestamp+1,round(seconds*1000))
        self.timestamp = timestamp
        result = self.model.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB,
                                                     data=np.ascontiguousarray(rgb)),timestamp)
        self.landmarks = result.pose_landmarks
        return self.draw_cached(rgb), bool(self.landmarks)

    def draw_cached(self,rgb):
        frame = rgb.copy()
        h,w = frame.shape[:2]
        for landmarks in self.landmarks:
            for a,b in EDGES:
                if min(landmarks[a].visibility,landmarks[b].visibility) >= .5:
                    points = [(round(landmarks[i].x*w),round(landmarks[i].y*h)) for i in (a,b)]
                    cv2.line(frame,*points,(60,230,100),2)
            for p in landmarks:
                if p.visibility >= .5:
                    cv2.circle(frame,(round(p.x*w),round(p.y*h)),3,(255,200,60),-1)
        return frame

    def close(self):
        if self.model:
            self.model.close()
            self.model = None

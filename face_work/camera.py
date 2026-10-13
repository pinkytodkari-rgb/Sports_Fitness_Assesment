"""Browser-camera processor with bounded pretrained-model inference."""
import time
from threading import Lock
import av
import cv2
from streamlit_webrtc import VideoProcessorBase
from live_pipeline import LivePipeline
from pose_preview import PosePreview

class CameraProcessor(VideoProcessorBase):
    def __init__(self,backend='TimeSformer'):
        self.engine = LivePipeline(backend)
        self.pose = PosePreview()
        self.lock = Lock()
        self.started = time.monotonic()
        self.last_pose = -1.0
        self.preview_error = None

    def recv(self,frame):
        rgb = frame.to_ndarray(format='rgb24')
        h,w = rgb.shape[:2]
        if w>640: rgb = cv2.resize(rgb,(640,round(h*640/w)))
        seconds = time.monotonic()-self.started
        self.engine.submit(rgb,seconds)
        with self.lock:
            if seconds-self.last_pose >= .125:
                try:
                    rgb,_ = self.pose.draw(rgb,seconds)
                    self.preview_error = None
                except Exception as error: self.preview_error = str(error)
                self.last_pose = seconds
            else:
                rgb = self.pose.draw_cached(rgb)
        return av.VideoFrame.from_ndarray(rgb,format='rgb24')

    def snapshot(self):
        result = self.engine.snapshot(time.monotonic()-self.started)
        with self.lock: result['pose_error'] = self.preview_error
        return result

    def on_ended(self):
        self.engine.close()
        with self.lock: self.pose.close()

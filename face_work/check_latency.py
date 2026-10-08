import time
from recognition import classify_video, load_model
from streamlit.testing.v1 import AppTest
from pathlib import Path

at=AppTest.from_file('app.py').run(timeout=30)
assert not at.exception
assert not any('Model score' in element.value for element in at.markdown)
from app import ensure_model
import mediapipe as mp
lite=ensure_model('Jumping jacks')
with mp.tasks.vision.PoseLandmarker.create_from_options(mp.tasks.vision.PoseLandmarkerOptions(
    base_options=mp.tasks.BaseOptions(model_asset_path=str(lite)))):
    print('PASS: exercise-specific Lite model loads',flush=True)
load_model()
start=time.perf_counter()
r=classify_video('sample_videos/squat.mp4')
print(f"Warm classification: {time.perf_counter()-start:.2f}s; {r['exercise']}; {r['clips_analyzed']} clips",flush=True)
assert r['exercise']=='Squats'
print('PASS: warm inference and interface checks',flush=True)

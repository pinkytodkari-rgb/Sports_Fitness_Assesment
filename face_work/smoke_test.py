"""Runtime smoke check with a blank clip, not an exercise accuracy test."""
from pathlib import Path
import tempfile
import cv2
import numpy as np
from streamlit.testing.v1 import AppTest

at = AppTest.from_file('app.py').run(timeout=30)
assert not at.exception, str(at.exception)
from app import run_video

class Sink:
    def image(self,*args,**kwargs): pass
    def progress(self,*args,**kwargs): pass

with tempfile.TemporaryDirectory() as folder:
    path=Path(folder)/'blank.mp4'
    writer=cv2.VideoWriter(str(path),cv2.VideoWriter_fourcc(*'mp4v'),15,(320,240))
    assert writer.isOpened()
    for _ in range(20): writer.write(np.zeros((240,320,3),dtype=np.uint8))
    writer.release()
    report,_=run_video(path,'Squats',Sink(),Sink())
    assert report['completed_reps']==0
    assert report['assessable_frame_percent']==0
print('PASS: UI starts, model loads, video decodes, missing pose gives zero reps.')

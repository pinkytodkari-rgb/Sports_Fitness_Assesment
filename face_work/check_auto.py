"""Exercise sample integration check: classifier -> pose -> repetition report."""
import json
from pathlib import Path
from streamlit.testing.v1 import AppTest

at=AppTest.from_file('app.py').run(timeout=30)
assert not at.exception, str(at.exception)
assert at.selectbox[0].value=='Auto detect (TimeSformer)'
from app import run_video

class Sink:
    def info(self,message): print(message,flush=True)
    def image(self,*args,**kwargs): pass
    def progress(self,*args,**kwargs): pass

report,_=run_video('sample_videos/squat.mp4','Auto detect (TimeSformer)',Sink(),Sink())
Path('sample_videos/auto-test-report.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2),flush=True)
assert report['exercise']=='Squats', 'Sample squat was not recognized'
assert report['recognition_method']=='pretrained TimeSformer Kinetics-600 classifier'
print('PASS: automatic UI default and full squat classification-to-counting pipeline',flush=True)

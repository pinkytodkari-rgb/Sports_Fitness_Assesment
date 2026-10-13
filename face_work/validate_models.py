"""Internet-clip model integration and live-path replay validation.

Runtime-generated results are evidence, not accuracy claims. Run from project root.
"""
from pathlib import Path
import json
import time
import cv2
import av
from video_analysis import analyse_video
from live_pipeline import LivePipeline
from camera import CameraProcessor

ROOT = Path(__file__).resolve().parent
RESULTS = ROOT/'references'/'model-validation.json'

def main():
    results = {'tests':{},'sources':{'pushups':'https://videos.pexels.com/video-files/4804794/4804794-hd_1920_1080_25fps.mp4',
                                  'squat':'Existing local sample; original URL not recorded'},
               'manual_labels':{'pushups':3,'squat':2}}
    def save(): RESULTS.write_text(json.dumps(results,indent=2),encoding='utf-8')
    for name,filename in [('pushups','pushups-repnet.mp4'),('squat','squat.mp4')]:
        preview_frames = []
        def preview(rgb,t):
            preview_frames.append(t)
            cv2.imwrite(str(ROOT/'screenshots'/f'model-{name}-preview.jpg'),cv2.cvtColor(rgb,cv2.COLOR_RGB2BGR))
        result = analyse_video(ROOT/'sample_videos'/filename,'Both (agreement)',
                               lambda s: print(s,flush=True),preview)
        assert result['recognition']['exercise']==('Push-ups' if name=='pushups' else 'Squats')
        assert preview_frames,'No preview frames rendered'
        assert result['valid_reps'] is None and result['invalid_reps'] is None
        if result['counting']: result['counting'].pop('timeline')
        result['preview_updates'] = len(preview_frames)
        results['tests'][name] = result
        save(); print(json.dumps(result,indent=2),flush=True)
    # Inject internet footage into the live input path with its video timestamps.
    cap = cv2.VideoCapture(str(ROOT/'sample_videos'/'pushups-repnet.mp4'))
    fps = cap.get(cv2.CAP_PROP_FPS)
    engine = LivePipeline('TimeSformer')
    i = 0
    try:
        while True:
            ok,frame = cap.read()
            if not ok: break
            engine.submit(cv2.cvtColor(cv2.resize(frame,(320,180)),cv2.COLOR_BGR2RGB),i/fps)
            i += 1
        engine.wait()
        results['tests']['live_replay'] = engine.snapshot(i/fps)
        results['tests']['live_replay']['test_type'] = 'Accelerated file replay through live scheduler; not a physical webcam test'
        save()
    finally: cap.release(); engine.close()
    # Real callback with an internet frame; video must not wait for recognition.
    cap = cv2.VideoCapture(str(ROOT/'sample_videos'/'pushups-repnet.mp4'))
    ok,frame = cap.read(); cap.release()
    assert ok
    processor = CameraProcessor()
    try:
        started = time.perf_counter()
        output = processor.recv(av.VideoFrame.from_ndarray(frame,format='bgr24'))
        assert output.width<=640
        result = processor.snapshot()
        assert result['pose_error'] is None,result['pose_error']
        results['tests']['camera_callback'] = {'passed':True,'seconds':round(time.perf_counter()-started,3)}
        save()
    finally: processor.on_ended()
    print('Model validation results saved',flush=True)

if __name__ == '__main__': main()

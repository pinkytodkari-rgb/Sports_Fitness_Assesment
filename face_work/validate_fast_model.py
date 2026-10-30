"""Compare a smaller pretrained recognizer using the existing labelled clips."""
import json
from pathlib import Path
import cv2
from recognition import classify_frames
from model_counter import count_window,load_counter

def main():
    results = {}
    for name in ('pushups-repnet','squat'):
        cap = cv2.VideoCapture(f'sample_videos/{name}.mp4')
        fps,total = cap.get(5),int(cap.get(7))
        import numpy as np
        start = max(0,(total-round(fps*4))//2)
        targets = set(np.linspace(start,min(total-1,start+round(fps*4)-1),32,dtype=int))
        frames = []
        for i in range(total):
            ok,frame = cap.read()
            if not ok: break
            if i in targets:
                frames.append(cv2.cvtColor(cv2.resize(frame,(320,180)),cv2.COLOR_BGR2RGB))
        cap.release()
        result = classify_frames(frames,'S3D')
        results[name] = result
        print(json.dumps(result,indent=2),flush=True)
    # Same full 8s live window, including recognizer and counting timing.
    from live_pipeline import LivePipeline
    cap = cv2.VideoCapture('sample_videos/pushups-repnet.mp4')
    fps = cap.get(5)
    engine = LivePipeline('S3D')
    i = 0
    try:
        load_counter()
        while True:
            ok,frame = cap.read()
            if not ok: break
            engine.submit(cv2.cvtColor(cv2.resize(frame,(320,180)),cv2.COLOR_BGR2RGB),i/fps)
            i += 1
        engine.wait()
        results['live_replay'] = engine.snapshot(i/fps)
    finally: cap.release(); engine.close()
    Path('references/fast-model-validation.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    print(json.dumps(results['live_replay'],indent=2),flush=True)

if __name__=='__main__': main()

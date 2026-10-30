"""Real form checkpoint through upload and live-window integration."""
from pathlib import Path
import json
import tempfile
import zipfile
import cv2
from video_analysis import analyse_video
from live_pipeline import LivePipeline

def main():
    results = {}
    with zipfile.ZipFile('sample_videos/pushup-labelled.zip') as archive, tempfile.TemporaryDirectory() as directory:
        for prefix,expected in [('Correct sequence/','Correct'),('Wrong sequence/','Incorrect')]:
            name = sorted(n for n in archive.namelist() if n.startswith(prefix) and n.endswith('.mp4'))[0]
            path = Path(directory)/f'{expected}.mp4'
            path.write_bytes(archive.read(name))
            report = analyse_video(path,'S3D')
            assert report['recognition']['exercise']=='Push-ups',report['recognition']
            assert report['form_assessment']['label']==expected,report['form_assessment']
            if report['counting']: report['counting'].pop('timeline')
            results[expected] = report
            print(expected,report['form_assessment']['label'],flush=True)
            Path('references/posture-integration.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
        # Public long-form clip through actual live scheduler, with all three models.
        cap = cv2.VideoCapture('sample_videos/pushups-repnet.mp4')
        fps = cap.get(5)
        engine = LivePipeline('S3D')
        i = 0
        try:
            while True:
                ok,frame = cap.read()
                if not ok: break
                engine.submit(cv2.cvtColor(cv2.resize(frame,(320,180)),cv2.COLOR_BGR2RGB),i/fps)
                i += 1
            engine.wait()
            results['live_replay'] = engine.snapshot(i/fps)
            assert results['live_replay']['form_assessment']['model'] is not None
            assert results['live_replay']['form_assessment']['status'] != 'error'
        finally: cap.release(); engine.close()
    Path('references/posture-integration.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    print('PASS: real upload and live posture integration',flush=True)

if __name__=='__main__': main()

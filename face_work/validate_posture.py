"""Actual inference against public labelled videos; never presented as held-out accuracy.

Source: https://www.kaggle.com/datasets/mohamadashrafsalama/pushup
Dataset license: CC BY-NC-SA 4.0; clips stay local and are not redistributed.
Training overlap with the downloaded model is unknown.
"""
from pathlib import Path
import json
import tempfile
import zipfile
import cv2
import numpy as np
from form_assessment import assess_form

def main():
    results = {'source':'https://www.kaggle.com/datasets/mohamadashrafsalama/pushup',
               'training_overlap':'Unknown; this is a labelled smoke test, not held-out validation',
               'samples':[]}
    with zipfile.ZipFile('sample_videos/pushup-labelled.zip') as archive, tempfile.TemporaryDirectory() as folder:
        for prefix,expected in [('Correct sequence/','Correct'),('Wrong sequence/','Incorrect')]:
            names = sorted(n for n in archive.namelist() if n.startswith(prefix) and n.lower().endswith('.mp4'))
            assert names,f'No samples for {prefix}'
            chosen = [names[i] for i in np.linspace(0,len(names)-1,4,dtype=int)]
            for j,name in enumerate(chosen):
                path = Path(folder)/f'{expected}-{j}.mp4'
                path.write_bytes(archive.read(name))
                cap = cv2.VideoCapture(str(path))
                fps,total = cap.get(5),int(cap.get(7))
                targets = set(np.linspace(0,total-1,8,dtype=int))
                frames,times = [],[]
                i = 0
                while True:
                    ok,frame = cap.read()
                    if not ok: break
                    if i in targets:
                        frames.append(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB))
                        times.append(i/fps)
                    i += 1
                cap.release()
                assert frames,f'No decoded frames: {name}'
                report = assess_form(frames,'Push-ups',times,max_frames=8)
                assert report['status'] not in ('unavailable','error'),report
                sample = {'file':name,'expected':expected,'prediction':report}
                results['samples'].append(sample)
                print(name,expected,'->',report['label'],report.get('probabilities'),flush=True)
                Path('references/posture-validation.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    classified = [s for s in results['samples'] if s['prediction']['label'] in ('Correct','Incorrect')]
    results['classified'] = len(classified)
    results['uncertain'] = len(results['samples'])-len(classified)
    results['matching_dataset_label'] = sum(s['prediction']['label']==s['expected'] for s in results['samples'])
    results['mismatches'] = sum(s['prediction']['label']!=s['expected'] for s in classified)
    results['both_labels_produced'] = {'Correct','Incorrect'}.issubset({s['prediction']['label'] for s in classified})
    Path('references/posture-validation.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    print(json.dumps({k:v for k,v in results.items() if k!='samples'},indent=2),flush=True)

if __name__=='__main__': main()

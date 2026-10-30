"""Download a small research-only subset with audited coach-feedback labels.

Labels below are manual interpretations of quoted instructor annotations, not
joint-angle rules. Timing/noise and unknown participant overlap limit validity.
Do not redistribute videos or claim official QEVD benchmark results.
"""
from pathlib import Path
import json
import cv2
from huggingface_hub import hf_hub_download

REPO = 'Voxel51/qualcomm-exercise-video-dataset-benchmark'
ROOT = Path(__file__).resolve().parent/'sample_videos'/'coach_form'
# exercise, source session, coach-annotation first frame, binary interpretation.
# All quotes are checked against samples.json before any clips are exported.
SELECTION = [
 ('Jumping jacks','0009',816,'correct','Wow! I love the range of motion you have here!'),
 ('Jumping jacks','0010',744,'correct','Looking good! Awesome range of motion.'),
 ('Jumping jacks','0015',484,'correct','Love your form and speed!'),
 ('Jumping jacks','0016',627,'correct','Love your form and pace!'),
 ('Jumping jacks','0012',1321,'incorrect',"You are only moving your arms! It's time to start jumping!"),
 ('Jumping jacks','0013',1296,'incorrect',"Okay, that's fine, but I want to see you moving your legs too."),
 ('Jumping jacks','0014',1337,'incorrect',"It's time to get jumping! You are only moving your arms."),
 ('Jumping jacks','0024',544,'incorrect','Move your arms and legs together!'),
 ('Squats','0009',1915,'correct','Love your form! Nice deep squats!'),
 ('Squats','0016',2139,'correct','I love your form here. Work it, work it.'),
 ('Squats','0154',2106,'correct','5 reps! I love your form Work it, work it.'),
 ('Squats','0165',1813,'correct','Perfect form here. Work it, work it.'),
 ('Squats','0006',1927,'incorrect','Your stance is too narrow and your squats are too shallow!'),
 ('Squats','0010',2092,'incorrect','Hmm your stance is still too narrow! Widen out champ!'),
 ('Squats','0011',2066,'incorrect','I like the depth of the squat! But your stance is still too narrow..'),
 ('Squats','0013',2067,'incorrect','Your stance is still too narrow! The squats are too shallow.'),
]

def main():
    ROOT.mkdir(parents=True,exist_ok=True)
    annotations = json.loads(Path(hf_hub_download(REPO,'samples.json',repo_type='dataset',
                             cache_dir=str(ROOT/'cache'))).read_text(encoding='utf-8'))['samples']
    by_id = {s['video_id']:s for s in annotations}
    rows = []
    for exercise,session,first,label,quote in SELECTION:
        sample = by_id[session]
        event = next(e for e in sample['feedback_events']['detections'] if e['support'][0]==first)
        assert event['label']==quote,'Source annotation changed; manual review required'
        print('Downloading',session,exercise,flush=True)
        source = hf_hub_download(REPO,sample['filepath'],repo_type='dataset',cache_dir=str(ROOT/'cache'))
        cap = cv2.VideoCapture(source)
        fps = cap.get(cv2.CAP_PROP_FPS)
        # Source support uses one-based frames; preserve exactly the annotated span.
        start,end = first-1,event['support'][1]-1
        cap.set(cv2.CAP_PROP_POS_FRAMES,start)
        output = ROOT/f'{exercise.replace(" ","_")}_{session}_{first}_{label}.mp4'
        writer = cv2.VideoWriter(str(output),cv2.VideoWriter_fourcc(*'mp4v'),fps,(320,180))
        assert writer.isOpened()
        try:
            for _ in range(end-start+1):
                ok,frame = cap.read()
                if not ok: raise ValueError('Incomplete source video')
                writer.write(cv2.resize(frame,(320,180)))
        finally: cap.release(); writer.release()
        rows.append({'exercise':exercise,'video':output.name,'label':label,
                     'label_source':'coach_feedback','session_id':session,
                     'source_url':f'https://huggingface.co/datasets/{REPO}/blob/main/{sample["filepath"]}',
                     'annotation_quote':quote,'annotation_frames':[first,event['support'][1]],
                     'limitations':'Coach-feedback-derived weak label; participant identity not published'})
        (ROOT/'manifest.jsonl').write_text('\n'.join(json.dumps(r) for r in rows)+'\n',encoding='utf-8')
    print('Prepared',len(rows),'labelled clips',flush=True)

if __name__=='__main__': main()

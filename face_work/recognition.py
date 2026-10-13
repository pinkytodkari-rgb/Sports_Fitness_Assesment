"""Pretrained RGB action classification before pose-based rep analysis."""
from functools import lru_cache
from pathlib import Path
import os
from runtime import INFERENCE_LOCK

VIDEOMAE_ID = 'MCG-NJU/videomae-base-finetuned-kinetics'

MODEL_ID = 'facebook/timesformer-base-finetuned-k600'
MODEL_DIR = Path(__file__).resolve().parent/'models'/'timesformer-kinetics600'
LABELS = {'squat':'Squats', 'push up':'Push-ups', 'situp':'Sit-ups',
          'jumping jacks':'Jumping jacks', 'lunge':'Lunges'}

def normalize(label):
    return ' '.join(label.lower().replace('_',' ').replace('-',' ').split())

def decide(probabilities, id2label, minimum=.35, margin=.10):
    """Use every model class, rather than forcing a supported exercise label."""
    ranked = sorted(enumerate(probabilities),key=lambda pair:pair[1],reverse=True)
    top = [{'label':id2label.get(i,id2label.get(str(i),str(i))),
            'score':round(float(score),4)} for i,score in ranked[:5]]
    first,second = ranked[:2]
    raw = top[0]['label']
    name = LABELS.get(normalize(raw))
    accepted = name is not None and first[1]>=minimum and first[1]-second[1]>=margin
    return {'exercise':name if accepted else 'Unknown', 'predicted_activity':raw,
            'model_score':round(float(first[1]),4), 'top_predictions':top,
            'reason':'Supported exercise detected' if accepted else
                ('Activity is outside the supported exercise list' if name is None else 'Prediction is uncertain'),
            'model':MODEL_ID,'method':'pretrained TimeSformer Kinetics-600 classifier'}

@lru_cache(maxsize=1)
def load_model():
    import torch
    from transformers import VideoMAEImageProcessor, TimesformerForVideoClassification
    os.environ.setdefault('HF_HUB_DISABLE_XET','1')
    source = str(MODEL_DIR) if (MODEL_DIR/'.ready').exists() else MODEL_ID
    cache = Path(__file__).resolve().parent/'models'/'hub-cache'
    processor = VideoMAEImageProcessor.from_pretrained(source,cache_dir=str(cache))
    model = TimesformerForVideoClassification.from_pretrained(source,cache_dir=str(cache))
    if source == MODEL_ID:
        MODEL_DIR.mkdir(parents=True,exist_ok=True)
        model.save_pretrained(MODEL_DIR)
        processor.save_pretrained(MODEL_DIR)
        (MODEL_DIR/'.ready').write_text(MODEL_ID,encoding='utf-8')
    model.eval()
    torch.set_num_threads(min(4,os.cpu_count() or 1))
    model.to('cuda' if torch.cuda.is_available() else 'cpu')
    return processor,model

@lru_cache(maxsize=1)
def load_videomae():
    import torch
    from transformers import VideoMAEImageProcessor, VideoMAEForVideoClassification
    cache = Path(__file__).resolve().parent/'models'/'hub-cache'
    processor = VideoMAEImageProcessor.from_pretrained(VIDEOMAE_ID,cache_dir=str(cache))
    model = VideoMAEForVideoClassification.from_pretrained(VIDEOMAE_ID,cache_dir=str(cache))
    return processor, model.eval().to('cuda' if torch.cuda.is_available() else 'cpu')

@lru_cache(maxsize=1)
def load_s3d():
    import torch
    from torchvision.models.video import s3d, S3D_Weights
    torch.set_num_threads(min(4,os.cpu_count() or 1))
    weights = S3D_Weights.KINETICS400_V1
    model = s3d(weights=weights).eval().to('cuda' if torch.cuda.is_available() else 'cpu')
    return weights.transforms(),model,dict(enumerate(weights.meta['categories']))

def classify_frames(frames, backend='TimeSformer'):
    """RGB frames from either upload or live camera, using trained classifiers."""
    import numpy as np
    import torch
    if len(frames) < 16: raise ValueError('Recognition requires at least 16 frames.')
    started = __import__('time').perf_counter()
    results = []
    names = ['TimeSformer','VideoMAE'] if backend == 'Both (agreement)' else [backend]
    with INFERENCE_LOCK, torch.inference_mode():
        for name in names:
            if name not in ('TimeSformer','VideoMAE','S3D'): raise ValueError('Unknown recognition model')
            if name=='S3D':
                import cv2
                transform,model,labels = load_s3d()
                targets = np.linspace(0,len(frames)-1,32,dtype=int)
                clip = torch.stack([torch.from_numpy(cv2.resize(frames[i],(256,256)).copy()).permute(2,0,1) for i in targets])
                inputs = transform(clip).unsqueeze(0).to(next(model.parameters()).device)
                scores = model(inputs).softmax(-1)[0].cpu().tolist()
                result = decide(scores,labels)
                result['model'] = 'torchvision/S3D_KINETICS400_V1'
            else:
                processor,model = load_model() if name == 'TimeSformer' else load_videomae()
                targets = np.linspace(0,len(frames)-1,model.config.num_frames,dtype=int)
                inputs = processor([frames[i] for i in targets],return_tensors='pt').to(next(model.parameters()).device)
                scores = model(**inputs).logits.softmax(-1)[0].cpu().tolist()
                result = decide(scores,model.config.id2label)
                result['model'] = MODEL_ID if name == 'TimeSformer' else VIDEOMAE_ID
            result['method'] = f'pretrained {name} classifier'
            results.append(result)
    accepted = {r['exercise'] for r in results}
    exercise = results[0]['exercise'] if len(accepted)==1 else 'Unknown'
    return {'exercise':exercise,'models':results,
            'reason':'Models disagree' if len(accepted)>1 else results[0]['reason'],
            'processing_seconds':round(__import__('time').perf_counter()-started,3)}

def classify_video(path, status=None):
    import cv2
    import numpy as np
    import torch
    if status: status('Loading the pretrained exercise recognition model…')
    processor,model = load_model()
    cap=cv2.VideoCapture(str(path))
    total=int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps=cap.get(cv2.CAP_PROP_FPS)
    if not np.isfinite(fps) or fps<=0: fps=30
    if total<16:
        cap.release()
        raise ValueError('Recognition needs at least 16 decoded video frames.')
    length=min(total,max(16,int(fps*4)))
    starts=np.linspace(0,max(0,total-length),min(3,max(1,int(total/length))),dtype=int)
    if len(starts)==3: starts=starts[[1,0,2]]
    distributions=[]
    try:
        for clip_index,start in enumerate(starts):
            if status: status(f'Recognizing movement: clip {clip_index+1}/{len(starts)}…')
            targets=np.linspace(start,start+length-1,model.config.num_frames,dtype=int)
            # Sequential reads avoid codec-dependent seeking at every frame.
            cap.set(cv2.CAP_PROP_POS_FRAMES,int(start))
            frames=[]
            target_index=0
            for position in range(int(start),int(targets[-1])+1):
                ok,frame=cap.read()
                if not ok: break
                if position==targets[target_index]:
                    # Resize before RGB conversion/processor to avoid large frame arrays.
                    h,w=frame.shape[:2]
                    scale=256/min(h,w)
                    frame=cv2.resize(frame,(round(w*scale),round(h*scale)))
                    frames.append(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB))
                    target_index+=1
                    if target_index==len(targets): break
            if len(frames)!=model.config.num_frames: continue
            inputs=processor(frames,return_tensors='pt').to(next(model.parameters()).device)
            with torch.inference_mode():
                scores=model(**inputs).logits.softmax(dim=-1)[0].cpu().numpy()
            distributions.append(scores)
            current=decide(scores.tolist(),model.config.id2label)
            if (len(distributions)==1 and current['exercise']!='Unknown'
                    and current['model_score']>=.85):
                break
            if len(distributions)>=2:
                recent=[decide(d.tolist(),model.config.id2label) for d in distributions]
                if (all(r['exercise']!='Unknown' and r['model_score']>=.60 for r in recent)
                        and len({r['exercise'] for r in recent})==1):
                    break
    finally: cap.release()
    if not distributions: raise ValueError('Unable to decode enough frames for exercise recognition.')
    result=decide(np.mean(distributions,axis=0).tolist(),model.config.id2label)
    result['clips_analyzed']=len(distributions)
    winners=[decide(d.tolist(),model.config.id2label)['exercise'] for d in distributions]
    supported={name for name in winners if name!='Unknown'}
    if len(supported)>1:
        result['exercise']='Unknown'
        result['reason']='Different exercises detected across clips. Upload one exercise per video.'
    return result

"""Exercise-specific learned form classification, without angle-based decisions.

Only the push-up checkpoint has verified binary label metadata. Other exercises
must stay unavailable until an appropriate trained model is configured/tested.
This image classifier is experimental, not a validated rep-level form assessor.
"""
from functools import lru_cache
from pathlib import Path
import time
import numpy as np
from runtime import INFERENCE_LOCK
from form_registry import registered_head, EXERCISES

MODEL_ID = 'sakkysakky/vit-pushup-form-classifier'
REVISION = 'b4eb658808312c7ab4843ecf86f5cc6daeee5740'
SUPPORTED = {'Push-ups':MODEL_ID}
PROCESSOR_SOURCE = 'google/vit-base-patch16-224'
LIMITATION = ('Experimental image-based form prediction, not validated completed-rep scoring. '
              'The publisher omits preprocessing details; the documented base ViT processor is used.')

def configured_models():
    result = dict(SUPPORTED)
    for exercise in EXERCISES:
        if registered_head(exercise): result[exercise] = f'local-trained-form-head/{exercise}'
    return result

def extract_embedding(frames):
    """Frozen pretrained image features, averaged over a labelled clip/window."""
    import torch
    with INFERENCE_LOCK, torch.inference_mode():
        processor,model,_ = load_form_model()
        embeddings = []
        for frame in frames:
            inputs = processor(images=frame,return_tensors='pt').to(next(model.parameters()).device)
            embeddings.append(model.vit(**inputs).last_hidden_state[0,0].cpu())
        return torch.stack(embeddings).mean(0)

def assess_local_head(frames,exercise,seconds,registration,max_frames):
    import torch
    from safetensors.torch import load_file
    path,metadata = registration
    if metadata.get('backbone_revision') != REVISION:
        raise ValueError('Trained form head uses an incompatible backbone revision')
    indices = np.linspace(0,len(frames)-1,min(max_frames,len(frames)),dtype=int)
    features = extract_embedding([frames[i] for i in indices])
    tensors = load_file(str(path/'head.safetensors'),device='cpu')
    if (tensors['weight'].shape != (2,768) or tensors['bias'].shape != (2,)
            or tensors['mean'].shape != (768,) or tensors['scale'].shape != (768,)):
        raise ValueError('Invalid form-head tensor shapes')
    if not all(torch.isfinite(t).all() for t in tensors.values()) or (tensors['scale']<=0).any():
        raise ValueError('Invalid form-head parameters')
    logits = ((features-tensors['mean'])/tensors['scale'])@tensors['weight'].T+tensors['bias']
    probs = logits.softmax(-1).tolist()
    timestamp = [float(seconds[indices[-1]])] if seconds is not None else None
    result = summarise([probs],{0:'correct',1:'incorrect'},timestamp)
    result.update({'exercise':exercise,'model':f'local-trained-form-head/{exercise}',
                   'experimental':True,'backbone_revision':REVISION,'valid_reps':None,'invalid_reps':None,
                   'reason':('Experimental clip/window classifier trained on annotated examples; not completed-repetition scoring. '
                             +('Validation holds out source sessions; participant overlap is unknown.' if not metadata['validation'].get('subject_disjoint')
                               else 'Validation holds out recorded subjects.')),
                   'training_validation':metadata['validation'],'observation_scope':'whole sampled window'})
    return result

def unavailable(exercise,reason=None):
    return {'status':'unavailable','label':'Unavailable','exercise':exercise,'model':None,
            'reason':reason or f'No verified trained form classifier configured for {exercise}.',
            'valid_reps':None,'invalid_reps':None,'observations':[]}

@lru_cache(maxsize=1)
def load_form_model():
    import torch
    from transformers import AutoModelForImageClassification, ViTImageProcessor
    cache = str(Path(__file__).resolve().parent/'models'/'hub-cache')
    processor = ViTImageProcessor.from_pretrained(PROCESSOR_SOURCE,cache_dir=cache)
    model = AutoModelForImageClassification.from_pretrained(
        MODEL_ID,revision=REVISION,cache_dir=cache,use_safetensors=True,trust_remote_code=False)
    labels = {int(k):v.lower() for k,v in model.config.id2label.items()}
    if set(labels.values()) != {'correct','incorrect'}:
        raise ValueError('Posture checkpoint does not have verified correct/incorrect labels')
    torch.set_num_threads(min(4,__import__('os').cpu_count() or 1))
    return processor,model.eval().to('cuda' if torch.cuda.is_available() else 'cpu'),labels

def summarise(probabilities,labels,seconds=None,minimum=.7):
    """Confidence rejection of learned probabilities; no biomechanical thresholds."""
    values = np.asarray(probabilities,dtype=float)
    if values.ndim!=2 or values.shape[1]!=len(labels) or not np.isfinite(values).all():
        raise ValueError('Invalid form-model probabilities')
    if len(values)==0: raise ValueError('No form-model observations')
    if not np.allclose(values.sum(axis=1),1,atol=1e-4) or (values<0).any():
        raise ValueError('Form probabilities must be normalized')
    mean = values.mean(axis=0)
    best = int(mean.argmax())
    observations = []
    for i,row in enumerate(values):
        index = int(row.argmax())
        observations.append({'seconds':float(seconds[i]) if seconds is not None else None,
                             'label':labels[index].capitalize() if row[index]>=minimum else 'Uncertain',
                             'probability_correct':round(float(row[next(k for k,v in labels.items() if v=='correct')]),4)})
    return {'status':'assessed' if mean[best]>=minimum else 'uncertain',
            'label':labels[best].capitalize() if mean[best]>=minimum else 'Uncertain',
            'probabilities':{label:round(float(mean[index]),4) for index,label in labels.items()},
            'observations':observations}

def assess_form(frames,exercise,seconds=None,max_frames=4):
    registration = registered_head(exercise)
    if exercise not in SUPPORTED and registration is None: return unavailable(exercise)
    if not frames: return unavailable(exercise,'No video frames available for form assessment.')
    started = time.perf_counter()
    try:
        if registration is not None:
            result = assess_local_head(frames,exercise,seconds,registration,max_frames)
            result['processing_seconds'] = round(time.perf_counter()-started,3)
            return result
        import torch
        indices = np.linspace(0,len(frames)-1,min(max_frames,len(frames)),dtype=int)
        with INFERENCE_LOCK, torch.inference_mode():
            processor,model,labels = load_form_model()
            rows = []
            for i in indices:
                inputs = processor(images=frames[i],return_tensors='pt').to(next(model.parameters()).device)
                rows.append(model(**inputs).logits.softmax(-1)[0].cpu().tolist())
        result = summarise(rows,labels,[seconds[i] for i in indices] if seconds is not None else None)
        result.update({'exercise':exercise,'model':MODEL_ID,'revision':REVISION,
                       'processor_source':PROCESSOR_SOURCE,'experimental':True,
                       'reason':LIMITATION,'valid_reps':None,'invalid_reps':None,
                       'processing_seconds':round(time.perf_counter()-started,3)})
        return result
    except Exception as error:
        result = unavailable(exercise,f'Posture model failed: {error}')
        result.update({'status':'error','model':f'local-trained-form-head/{exercise}' if registration is not None else MODEL_ID})
        return result

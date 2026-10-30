"""Safe local registry for separately trained exercise form heads."""
from pathlib import Path
import json

EXERCISES = ('Push-ups','Squats','Sit-ups','Jumping jacks','Lunges','Biceps curls')
SLUGS = dict(zip(EXERCISES,('pushups','squats','situps','jumping_jacks','lunges','biceps_curls')))
ROOT = Path(__file__).resolve().parent/'models'/'form_heads'

def directory(exercise):
    if exercise not in SLUGS: raise ValueError('Unsupported exercise name')
    return ROOT/SLUGS[exercise]

def registered_head(exercise):
    if exercise not in SLUGS: return None
    path = directory(exercise)
    if not (path/'head.safetensors').is_file() or not (path/'metadata.json').is_file(): return None
    try:
        metadata = json.loads((path/'metadata.json').read_text(encoding='utf-8'))
        if not isinstance(metadata,dict) or not isinstance(metadata.get('validation'),dict): return None
        if (metadata.get('deployment_status') != 'approved_experimental'
                or metadata.get('exercise') != exercise or metadata.get('format') != 'vit-linear-form-v1'
                or metadata.get('labels') != ['correct','incorrect']
                or metadata.get('label_source') not in ('human','coach_feedback')
                or not (metadata.get('validation',{}).get('subject_disjoint')
                        or metadata.get('validation',{}).get('session_disjoint'))):
            return None
        return path,metadata
    except (OSError,ValueError,TypeError): return None

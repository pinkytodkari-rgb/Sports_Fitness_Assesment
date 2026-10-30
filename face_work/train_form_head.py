"""Train exercise-specific form heads from human-labelled video, not angle rules.

Manifest is JSONL: video, exercise, label, subject_id or session_id, source_url,
label_source (human or coach_feedback). Hold out source groups for validation.
Training writes a disabled candidate; independent evaluation is required before
explicitly marking metadata deployment_status as approved_experimental.
"""
from pathlib import Path
import argparse
import hashlib
import json
import random
import cv2
import numpy as np
import torch
from safetensors.torch import save_file
from form_assessment import extract_embedding,REVISION,MODEL_ID
from form_registry import EXERCISES,directory

def load_manifest(path,exercise):
    path = Path(path)
    rows = [json.loads(line) for line in path.read_text(encoding='utf-8').splitlines() if line.strip()]
    rows = [r for r in rows if r.get('exercise')==exercise]
    if not rows: raise ValueError(f'No labelled videos for {exercise}')
    seen = set()
    for row in rows:
        if row.get('label') not in ('correct','incorrect') or row.get('label_source') not in ('human','coach_feedback'):
            raise ValueError('Labels must be human annotations: correct or incorrect')
        if not (row.get('subject_id') or row.get('session_id')) or not row.get('source_url'):
            raise ValueError('Each video needs a subject_id or session_id and source_url for auditing')
        row['_group'] = row.get('subject_id') or row['session_id']
        video = (path.parent/row['video']).resolve()
        if not video.is_file(): raise ValueError(f'Missing video: {video}')
        digest = hashlib.sha256(video.read_bytes()).hexdigest()
        if digest in seen: raise ValueError('Duplicate video content in training manifest')
        seen.add(digest)
        row['_path'] = str(video)
        row['_sha256'] = digest
    if min(sum(r['label']==label for r in rows) for label in ('correct','incorrect'))<4:
        raise ValueError('At least four labelled videos per class are required; more are recommended')
    return rows

def subject_split(rows,seed=42):
    subjects = sorted({r.get('_group',r.get('subject_id')) for r in rows})
    if len(subjects)<3: raise ValueError('At least three source groups are required for disjoint validation')
    generator = random.Random(seed)
    for _ in range(200):
        generator.shuffle(subjects)
        holdout = set(subjects[:max(1,round(len(subjects)*.25))])
        training = [r for r in rows if r.get('_group',r.get('subject_id')) not in holdout]
        validation = [r for r in rows if r.get('_group',r.get('subject_id')) in holdout]
        if all({r['label'] for r in group}=={'correct','incorrect'} for group in (training,validation)):
            return training,validation
    raise ValueError('Cannot create a group-disjoint split containing both labels in each partition')

def read_frames(path,count=4):
    cap = cv2.VideoCapture(str(path))
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total<1:
        cap.release(); raise ValueError('No decodable video frames')
    targets = set(np.linspace(0,total-1,count,dtype=int))
    frames = []
    try:
        for i in range(total):
            ok,frame = cap.read()
            if not ok: raise ValueError('Truncated training video')
            if i in targets: frames.append(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB))
    finally: cap.release()
    return frames

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest',required=True)
    parser.add_argument('--exercise',required=True,choices=EXERCISES)
    args = parser.parse_args()
    output = directory(args.exercise)
    if output.exists(): raise ValueError(f'Refusing to overwrite existing model directory: {output}')
    rows = load_manifest(args.manifest,args.exercise)
    train,valid = subject_split(rows)
    features,labels = [],[]
    for row in train+valid:
        print(f"Extracting pretrained features: {row['_path']}",flush=True)
        features.append(extract_embedding(read_frames(row['_path'])))
        labels.append(0 if row['label']=='correct' else 1)
    x = torch.stack(features)
    y = torch.tensor(labels,dtype=torch.long)
    n = len(train)
    mean = x[:n].mean(0)
    scale = x[:n].std(0).clamp_min(1e-5)
    x = (x-mean)/scale
    torch.manual_seed(42)
    head = torch.nn.Linear(768,2)
    optimizer = torch.optim.AdamW(head.parameters(),lr=.005,weight_decay=.1)
    for _ in range(250):
        optimizer.zero_grad()
        loss = torch.nn.functional.cross_entropy(head(x[:n]),y[:n])
        loss.backward(); optimizer.step()
    with torch.no_grad():
        probabilities = head(x[n:]).softmax(-1)
        confidence,predicted = probabilities.max(-1)
        covered = confidence>=.7
        correct = predicted==y[n:]
    subject_known = all(r.get('subject_id') for r in rows)
    validation = {'subject_disjoint':subject_known,'session_disjoint':True,
                  'split_scope':'subject' if subject_known else 'source session; participant overlap unknown',
                  'videos':len(valid),'training_videos':len(train),
                  'correct_predictions':int(correct.sum()),'classified_videos':int(covered.sum()),
                  'uncertain_videos':int((~covered).sum()),
                  'correct_classified_predictions':int((correct&covered).sum()),
                  'note':'Small custom dataset evaluation, not general application accuracy'}
    metadata = {'format':'vit-linear-form-v1','exercise':args.exercise,
                'deployment_status':'candidate_not_validated',
                'labels':['correct','incorrect'],'label_source':'coach_feedback' if any(r['label_source']=='coach_feedback' for r in rows) else 'human',
                'backbone_id':MODEL_ID,'backbone_revision':REVISION,'validation':validation,
                'training_groups':sorted({r['_group'] for r in train}),
                'validation_groups':sorted({r['_group'] for r in valid}),
                'samples':[{k:v for k,v in r.items() if k not in ('_path','_group')} for r in train+valid]}
    output.mkdir(parents=True)
    save_file({'weight':head.weight.detach().contiguous(),'bias':head.bias.detach().contiguous(),
               'mean':mean.contiguous(),'scale':scale.contiguous()},str(output/'head.safetensors'))
    (output/'metadata.json').write_text(json.dumps(metadata,indent=2),encoding='utf-8')
    print(json.dumps(validation,indent=2),flush=True)

if __name__=='__main__': main()

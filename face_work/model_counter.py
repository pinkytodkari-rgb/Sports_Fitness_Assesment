"""Stage 1: pretrained RepNet counting, without exercise-angle heuristics.

Upstream: https://github.com/materight/RepNet-pytorch
Weights: https://huggingface.co/materight/repnet
This counts periodic movement, not form-valid repetitions.
"""
from functools import lru_cache
from pathlib import Path
import sys
import time
import cv2
import numpy as np
import torch
from runtime import INFERENCE_LOCK

ROOT = Path(__file__).resolve().parent

@lru_cache(maxsize=1)
def load_counter():
    from huggingface_hub import hf_hub_download
    sys.path.insert(0, str(ROOT/'vendor'/'repnet-pytorch'))
    from repnet.model import RepNet
    weights = hf_hub_download('materight/repnet', 'pytorch_weights.pth',
                              cache_dir=str(ROOT/'models'/'hub-cache'))
    torch.set_num_threads(min(4, __import__('os').cpu_count() or 1))
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = RepNet()
    model.load_state_dict(torch.load(weights, map_location='cpu', weights_only=True))
    return model.eval().to(device), device

def count_video(path, status=None, strides=(1,2)):
    started = time.perf_counter()
    if status: status('Decoding video for RepNet…')
    cap = cv2.VideoCapture(str(path))
    fps = cap.get(cv2.CAP_PROP_FPS)
    expected_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if not np.isfinite(fps) or fps <= 0:
        cap.release()
        raise ValueError('Video has no usable frame rate.')
    # Keep only small RGB inputs; limit memory for long uploads.
    sampling = max(1, round(fps/15))
    frames = []
    index = 0
    try:
        while True:
            ok, frame = cap.read()
            if not ok: break
            if index % sampling == 0:
                rgb = cv2.cvtColor(cv2.resize(frame, (112,112)), cv2.COLOR_BGR2RGB)
                frames.append(torch.from_numpy(rgb.copy()).permute(2,0,1).float()/127.5-1)
            index += 1
            if len(frames) > 9000:
                raise ValueError('Stage 1 supports up to 10 minutes at 15 sampled FPS.')
    finally:
        cap.release()
    if expected_frames > 0 and index < expected_frames-2:
        raise ValueError('Video decoding ended early. Upload a complete, uncorrupted video.')
    if len(frames) < 64:
        raise ValueError('RepNet needs at least 64 sampled frames; use a longer clip.')
    if status: status('Loading pretrained RepNet…')
    with INFERENCE_LOCK:
        model, device = load_counter()
    best = None
    with INFERENCE_LOCK, torch.inference_mode():
        for stride in strides:
            inputs = frames[::stride]
            if len(inputs) < 64: continue
            lengths, periodicities = [], []
            for offset in range(0,len(inputs),64):
                chunk = inputs[offset:offset+64]
                actual = len(chunk)
                chunk = chunk + [chunk[-1]]*(64-actual)
                if status: status(f'RepNet: stride {stride}, frame window {offset//64+1}…')
                batch = torch.stack(chunk).transpose(0,1).unsqueeze(0).to(device)
                length, periodicity, _ = model(batch)
                lengths.append(length[0,:actual].cpu())
                periodicities.append(periodicity[0,:actual].cpu())
            confidence, _, cumulative, _ = model.get_counts(
                torch.cat(lengths), torch.cat(periodicities), stride)
            cumulative = cumulative[:len(frames)]
            result = {'estimated_reps':float(cumulative[-1]),
                      'periodicity_score':float(confidence),
                      'stride':stride,
                      'timeline':[{'seconds':round(i*sampling/fps,3),'count':float(c)}
                                  for i,c in enumerate(cumulative)],
                      'method':'pretrained RepNet', 'valid_reps':None,'invalid_reps':None,
                      'form_assessment':'Unavailable: RepNet does not assess form'}
            if best is None or result['periodicity_score'] > best['periodicity_score']:
                best = result
    best['processing_seconds'] = round(time.perf_counter()-started,3)
    best['video_seconds'] = round(index/fps,3)
    return best

def count_window(rgb_frames):
    """One 64-frame temporal window; no overlapping-window double counting."""
    if len(rgb_frames) != 64: raise ValueError('A live counting window needs 64 frames.')
    started = time.perf_counter()
    with INFERENCE_LOCK, torch.inference_mode():
        model,device = load_counter()
        tensors = [torch.from_numpy(cv2.resize(f,(112,112)).copy()).permute(2,0,1).float()/127.5-1
                   for f in rgb_frames]
        inputs = torch.stack(tensors).transpose(0,1).unsqueeze(0).to(device)
        length,periodicity,_ = model(inputs)
        confidence,_,cumulative,_ = model.get_counts(length[0].cpu(),periodicity[0].cpu(),1)
    return {'estimated_reps':float(cumulative[-1]),'periodicity_score':float(confidence),
            'processing_seconds':round(time.perf_counter()-started,3),'method':'pretrained RepNet'}

if __name__ == '__main__':
    import json
    result = count_video(sys.argv[1], lambda s: print(s,flush=True))
    result.pop('timeline')
    print(json.dumps(result,indent=2))

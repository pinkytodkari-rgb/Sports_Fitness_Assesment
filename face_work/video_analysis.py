"""Upload pipeline using the same pretrained models as camera inference."""
import time
import cv2
import numpy as np
from recognition import classify_frames
from model_counter import count_video
from pose_preview import PosePreview

def analyse_video(path, backend='TimeSformer', status=None, preview=None, thorough=False):
    started = time.perf_counter()
    cap = cv2.VideoCapture(str(path))
    fps = cap.get(cv2.CAP_PROP_FPS)
    expected = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if not np.isfinite(fps) or fps <= 0:
        cap.release()
        raise ValueError('Invalid video frame rate')
    stride = max(1,round(fps/8))
    length = min(expected,max(16,round(fps*4)))
    starts = [max(0,(expected-length)//2),0,max(0,expected-length)]
    targets = [set(np.linspace(start,start+length-1,32,dtype=int)) for start in starts]
    clips = [[] for _ in starts]
    decoded = 0
    pose_frames = visible = 0
    pose = PosePreview() if preview else None
    try:
        while True:
            ok,frame = cap.read()
            if not ok: break
            for target,clip in zip(targets,clips):
                if decoded in target:
                    clip.append(cv2.cvtColor(cv2.resize(frame,(320,round(frame.shape[0]*320/frame.shape[1]))),cv2.COLOR_BGR2RGB))
            if decoded%stride == 0:
                h,w = frame.shape[:2]
                scale = min(1,640/w)
                rgb = cv2.cvtColor(cv2.resize(frame,(round(w*scale),round(h*scale))),cv2.COLOR_BGR2RGB)
                if pose:
                    drawn,found = pose.draw(rgb,decoded/fps)
                    pose_frames += 1
                    visible += found
                    if pose_frames%8 == 0: preview(drawn,decoded/fps)
            decoded += 1
    finally:
        cap.release()
        if pose: pose.close()
    if expected>0 and decoded<expected-2: raise ValueError('Video is truncated or corrupted')
    if not any(len(clip)>=16 for clip in clips): raise ValueError('Video is too short for exercise recognition')
    if status: status('Recognizing exercise with pretrained models…')
    predictions = []
    for clip in clips:
        if len(clip)<16: continue
        prediction = classify_frames(clip,backend)
        predictions.append(prediction)
        # Centre-first recognition avoids assigning a setup movement to the whole video.
        if len(predictions)==1 and prediction['exercise']!='Unknown': break
    supported = {p['exercise'] for p in predictions if p['exercise']!='Unknown'}
    recognition = next((p for p in predictions if p['exercise']!='Unknown'),predictions[0]).copy()
    if len(supported)>1:
        recognition['exercise'] = 'Unknown'
        recognition['reason'] = 'Different exercises detected. Upload one exercise per video.'
    recognition['clips_analyzed'] = len(predictions)
    counting = None
    if recognition['exercise'] != 'Unknown':
        counting = count_video(path,status,strides=(1,2,3,4) if thorough else (1,2))
    return {'recognition':recognition,'counting':counting,
            'form_assessment':'Unavailable: no validated form-assessment checkpoint for these exercises',
            'valid_reps':None,'invalid_reps':None,'pose_visible_percent':
            round(100*visible/pose_frames,1) if pose_frames else None,
            'processing_seconds':round(time.perf_counter()-started,3),
            'video_seconds':round(decoded/fps,3),'input':'uploaded video',
            'models':[p['model'] for p in recognition['models']]+
                     (['RepNet'] if counting else [])+(['MediaPipe Pose Lite'] if preview else [])}

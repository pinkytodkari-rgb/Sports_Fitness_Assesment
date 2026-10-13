from pathlib import Path
from collections import Counter as Frequencies
import json
import tempfile
import time
import urllib.request
import cv2
import mediapipe as mp
import numpy as np
import streamlit as st
from fitness import Counter, EXERCISES, GUIDANCE, features
from recognition import classify_video

ROOT = Path(__file__).resolve().parent
MODEL = ROOT/'models'/'pose_landmarker_full.task'
MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task'
EDGES = [(11,12),(11,13),(13,15),(12,14),(14,16),(11,23),(12,24),(23,24),(23,25),(25,27),(24,26),(26,28)]

def ensure_model(exercise=None):
    variant = 'lite' if exercise == 'Jumping jacks' else 'full'
    model_path = ROOT/'models'/f'pose_landmarker_{variant}.task'
    if not model_path.exists():
        model_path.parent.mkdir(exist_ok=True)
        tmp = model_path.with_suffix('.download')
        url = f'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_{variant}/float16/latest/pose_landmarker_{variant}.task'
        urllib.request.urlretrieve(url,tmp)
        tmp.replace(model_path)
    return model_path

def run_video(path, selected, preview, progress):
    started = time.monotonic()
    recognition = None
    automatic = selected.startswith('Auto')
    if automatic:
        recognition = classify_video(path, lambda message: preview.info(message))
        if recognition['exercise'] == 'Unknown':
            return {'exercise':'Unknown','completed_reps':0,'valid_reps':0,'invalid_reps':0,
                    'prototype_pass_rate':None,'assessable_frame_percent':0,
                    'incomplete_final_cycle':False,'recognition':recognition,
                    'recognition_method':recognition['method'],'standard':'Prototype rules; no official SAI rating',
                    'repetitions':[]}, []
        selected = recognition['exercise']
    options = mp.tasks.vision.PoseLandmarkerOptions(
        base_options=mp.tasks.BaseOptions(model_asset_path=str(ensure_model(selected))),
        running_mode=mp.tasks.vision.RunningMode.VIDEO, num_poses=1,
        min_pose_detection_confidence=.6,min_pose_presence_confidence=.6,min_tracking_confidence=.6)
    cap = cv2.VideoCapture(str(path))
    fps = cap.get(cv2.CAP_PROP_FPS)
    if not np.isfinite(fps) or fps <= 0: fps = 30
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    target_fps = 15 if selected == 'Jumping jacks' else 10
    stride = max(1, int(round(fps/target_fps)))
    tracker = Counter(selected)
    seen = usable = index = 0
    snapshots = []
    last_frame = None
    last_caption = None
    try:
        with mp.tasks.vision.PoseLandmarker.create_from_options(options) as model:
            while True:
                ok, frame = cap.read()
                if not ok: break
                index += 1
                if (index-1)%stride: continue
                scale = min(1,640/frame.shape[1])
                frame = cv2.resize(frame,(int(frame.shape[1]*scale),int(frame.shape[0]*scale)))
                h,w = frame.shape[:2]
                t = (index-1)/fps
                result = model.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB,
                                                data=cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)),round(t*1000))
                seen += 1
                f = None
                if result.pose_landmarks:
                    landmarks = result.pose_landmarks[0]
                    if tracker: f = features(landmarks,w,h,tracker.exercise)
                    for a,b in EDGES:
                        if min(landmarks[a].visibility,landmarks[b].visibility) >= .6:
                            pa,pb = [(int(landmarks[i].x*w),int(landmarks[i].y*h)) for i in (a,b)]
                            cv2.line(frame,pa,pb,(90,230,100),2)
                    for p in landmarks:
                        if p.visibility >= .6: cv2.circle(frame,(int(p.x*w),int(p.y*h)),3,(80,210,255),-1)
                if f is not None: usable += 1
                if tracker: tracker.update(f,t)
                label = tracker.exercise if tracker else 'Recognizing: perform several complete movements'
                phase = tracker.phase if tracker else 'Automatic recognition is experimental'
                count = len(tracker.reps) if tracker else 0
                last_caption = f'{label} · Completed: {count} · {phase}'
                if seen%10 == 0:
                    preview.image(frame,channels='BGR',width='stretch',caption=last_caption)
                    if total > 0: progress.progress(min(index/total,1))
                if tracker and count > len(snapshots):
                    snapshots.append(cv2.imencode('.jpg',frame)[1].tobytes())
                last_frame = frame
    finally: cap.release()
    if seen == 0: raise ValueError('No video frames could be decoded. Try an MP4 video.')
    progress.progress(1.0)
    preview.image(last_frame,channels='BGR',width='stretch',caption=last_caption)
    reps = tracker.reps if tracker else []
    valid = sum(r['valid'] for r in reps)
    return {'exercise':tracker.exercise if tracker else 'Unknown', 'completed_reps':len(reps),
            'valid_reps':valid,'invalid_reps':len(reps)-valid,
            'prototype_pass_rate':round(valid/len(reps)*100,1) if reps else None,
            'assessable_frame_percent':round(usable/seen*100,1),
            'duration_seconds':round(index/fps,2),'processing_seconds':round(time.monotonic()-started,2),
            'incomplete_final_cycle':bool(tracker and tracker.active),
            'recognition':recognition,
            'pose_model':'MediaPipe Lite' if selected == 'Jumping jacks' else 'MediaPipe Full',
            'recognition_method':recognition['method'] if automatic else 'manual override',
            'standard':'Prototype rules; no official SAI rating', 'repetitions':reps}, snapshots

st.set_page_config(page_title='Athlete Fitness Assessment',page_icon='🏃',layout='wide')
st.markdown('''
<style>
[data-testid="stVideo"] video {
    max-height: 420px;
    object-fit: contain;
    background: #0e1117;
}
</style>
''', unsafe_allow_html=True)
st.title('Athlete Fitness Assessment')
st.write('Upload a fitness video to inspect movement, repetitions and visible form.')
with st.sidebar:
    st.header('Assessment setup')
    selected = st.selectbox('Exercise',['Auto detect (TimeSformer)']+EXERCISES,index=0,key='recognition_mode_v2')
    st.caption('Automatically identifies squats, push-ups, sit-ups, jumping jacks and lunges. Curls require manual selection. Upload one exercise per video.')
    if selected in GUIDANCE: st.info(GUIDANCE[selected])
    st.caption('Adaptive sampling: about 10 frames/second; 15 for jumping jacks.')
    st.caption('TimeSformer identifies the exercise. MediaPipe Lite tracks jumping jacks; Full tracks the other exercises.')
st.info('Prototype: “valid” means the observed movement passed configured rules. Ratings are not official SAI scores. Keep one person fully visible and use the suggested camera view.')
uploaded = st.file_uploader('Fitness video',type=['mp4','mov','avi','mkv','webm'])
if uploaded:
    analyze = st.button('Analyze video',type='primary')
    source_col, analysis_col = st.columns(2,gap='large')
    with source_col:
        st.caption('Uploaded video')
        st.video(uploaded,width='stretch')
    with analysis_col:
        st.caption('Pose-analysis preview')
        preview = st.empty()
        progress = st.progress(0)
        if not analyze:
            st.caption('The annotated preview will appear here during analysis.')
    if analyze:
        st.session_state.pop('report',None)
        st.session_state.pop('snapshots',None)
        try:
            with tempfile.TemporaryDirectory() as folder:
                path = Path(folder)/('input'+Path(uploaded.name).suffix)
                path.write_bytes(uploaded.getvalue())
                with st.spinner('Tracking pose and evaluating movement…'):
                    report,snapshots = run_video(path,selected,preview,progress)
            st.session_state.report = report
            st.session_state.snapshots = snapshots
        except Exception as e:
            st.error(f'Analysis could not finish: {e}')
            st.caption('Check video format and internet connection for the first model downloads. Automatic recognition requires the TimeSformer weights.')
if 'report' in st.session_state:
    r = st.session_state.report
    st.subheader(f"Results · {r['exercise']}")
    if r.get('recognition'):
        prediction = r['recognition']
        st.write(f"**Detected activity:** {prediction['predicted_activity']}")
        st.caption(prediction['reason'])
        with st.expander('Recognition details'):
            st.dataframe([{'Activity':p['label']} for p in prediction['top_predictions']],hide_index=True)
    cols = st.columns(5)
    for col,label,key in zip(cols,['Completed reps','Valid reps','Invalid reps','Assessable frames','Prototype pass rate'],
                             ['completed_reps','valid_reps','invalid_reps','assessable_frame_percent','prototype_pass_rate']):
        col.metric(label,'N/A' if r[key] is None else str(r[key])+('%' if key in ('assessable_frame_percent','prototype_pass_rate') else ''))
    if r['exercise'] == 'Unknown': st.warning('No supported exercise was identified confidently. Try a clearer clip or use the manual override.')
    if r['assessable_frame_percent'] < 60: st.warning('Low visibility: results may miss repetitions. Re-record with the whole body visible.')
    if r['incomplete_final_cycle']: st.warning('The final movement did not return to the starting position and was not counted.')
    if r['repetitions']:
        st.dataframe([{**rep,'feedback':' '.join(rep['feedback'])} for rep in r['repetitions']],hide_index=True,width='stretch')
        errors = Frequencies(e for rep in r['repetitions'] if not rep['valid'] for e in rep['feedback'])
        st.subheader('Corrective feedback')
        if errors:
            for error,count in errors.most_common(): st.write(f'• {error} Observed in {count} repetition(s).')
        else: st.success('All counted repetitions passed the available prototype checks.')
        with st.expander('Rep completion snapshots'):
            for i,picture in enumerate(st.session_state.snapshots): st.image(picture,caption=f'Repetition {i+1}',width=500)
    else: st.write('No complete cycles detected. Start in the recommended position, perform full movements, and return to start.')
    st.download_button('Download assessment JSON',json.dumps(r,indent=2),'fitness-assessment.json','application/json')
    st.caption('Only visible movement is assessed. This version does not evaluate every posture error or compare against official benchmark tables.')

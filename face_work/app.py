"""Unified pretrained-model fitness app. No legacy exercise-rule assessment."""
from pathlib import Path
import json
import tempfile
import streamlit as st
from streamlit_webrtc import webrtc_streamer, WebRtcMode
from camera import CameraProcessor
from video_analysis import analyse_video
from recognition import load_model, load_videomae, load_s3d
from model_counter import load_counter
from pose_preview import ensure_pose_model
from runtime import INFERENCE_LOCK

st.set_page_config(page_title='Athlete Fitness Assessment',page_icon='🏃',layout='wide')
st.markdown('''<style>
[data-testid="stVideo"] video {max-height:380px;object-fit:contain;background:#0e1117;}
[data-testid="stImage"] img {max-height:380px;object-fit:contain;}
</style>''',unsafe_allow_html=True)
st.title('Athlete Fitness Assessment')
st.caption('Pretrained exercise recognition, movement counting and pose preview')
with st.sidebar:
    st.header('Assessment setup')
    backend = st.selectbox('Exercise recognition',['S3D','TimeSformer','VideoMAE','Both (agreement)'],
                          on_change=lambda: st.session_state.pop('report',None))
    st.caption('S3D is the lighter option. Select TimeSformer for jumping jacks. Both compares TimeSformer and VideoMAE and rejects disagreement.')
    thorough = st.checkbox('More counting scales for uploaded videos',value=False)
    st.caption('RepNet estimates repetitive motion. MediaPipe draws body landmarks.')
    if st.button('Prepare pretrained models'):
        try:
            with st.spinner('Loading models; first use downloads weights…'), INFERENCE_LOCK:
                if backend in ('TimeSformer','Both (agreement)'): load_model()
                if backend in ('VideoMAE','Both (agreement)'): load_videomae()
                if backend=='S3D': load_s3d()
                load_counter()
                ensure_pose_model()
            st.success('Selected models loaded')
        except Exception as error: st.error(f'Model preparation failed: {error}')
st.info('Form assessment and valid/invalid rep scoring are unavailable. No exercise-angle rules or rule-based feedback are active.')
mode = st.radio('Input',['Video feed (upload)','Live camera'],horizontal=True,
                index=1 if st.query_params.get('input')=='camera' else 0)
if mode == 'Video feed (upload)':
    upload = st.file_uploader('Upload one exercise video',type=['mp4','mov','avi','mkv','webm'],
        on_change=lambda: st.session_state.pop('report',None))
    if upload:
        left,right = st.columns(2,gap='large')
        with left:
            st.caption('Uploaded video')
            st.video(upload,width='stretch')
        with right:
            st.caption('Pose preview · full frame')
            preview = st.empty()
            status = st.empty()
        if st.button('Analyze video',type='primary'):
            st.session_state.pop('report',None)
            try:
                with tempfile.TemporaryDirectory() as directory:
                    path = Path(directory)/('video'+Path(upload.name).suffix)
                    path.write_bytes(upload.getvalue())
                    result = analyse_video(path,backend,status.info,
                        lambda rgb,t: preview.image(rgb,width='stretch',caption=f'Video time: {t:.1f}s'),thorough)
                st.session_state.report = result
                status.success('Model analysis completed')
            except Exception as error: status.error(f'Analysis failed: {error}')
        if 'report' in st.session_state:
            report = st.session_state.report
            st.subheader('Model results')
            cols = st.columns(3)
            cols[0].metric('Detected exercise',report['recognition']['exercise'])
            count = report['counting']
            cols[1].metric('Estimated repetitions',f"{count['estimated_reps']:.2f}" if count else 'Unavailable')
            cols[2].metric('Processing time',f"{report['processing_seconds']:.1f}s")
            st.caption('A fractional estimate measures repetitive motion; it is not a count of form-valid completed repetitions.')
            if not count: st.warning(report['recognition']['reason'])
            else: st.line_chart(count['timeline'],x='seconds',y='count')
            with st.expander('Models used'):
                for prediction in report['recognition']['models']:
                    st.write(f"{prediction['model']}: {prediction['predicted_activity']}")
                st.write('Counting: pretrained RepNet' if count else 'Counting not run: unknown activity')
                st.write('Preview: MediaPipe Pose Lite')
            st.download_button('Download assessment JSON',json.dumps(report,indent=2),'fitness-assessment.json','application/json')
else:
    st.caption('Allow browser camera access, then press START. Audio is disabled. Prepare models first to avoid download delay.')
    st.warning('Camera video streams live. Model results arrive after 64 sampled frames plus inference time. CPU results may lag; skipped coverage is displayed.')
    context = webrtc_streamer(
        key=f'fitness-camera-{backend}',mode=WebRtcMode.SENDRECV,
        rtc_configuration={'iceServers':[{'urls':['stun:stun.l.google.com:19302']}]},
        media_stream_constraints={'video':{'width':{'ideal':640},'height':{'ideal':480},
                                         'frameRate':{'ideal':15}},'audio':False},
        video_processor_factory=lambda: CameraProcessor(backend),async_processing=True)
    @st.fragment(run_every=1)
    def live_results():
        processor = context.video_processor
        saved_processor_key = f'previous_camera_processor_{backend}'
        if processor is not None:
            st.session_state[saved_processor_key] = processor
        elif saved_processor_key in st.session_state:
            processor = st.session_state[saved_processor_key]
        if processor is None:
            st.caption('Start the camera to see live results.')
            return
        result = processor.snapshot()
        st.session_state.last_camera_report = result
        columns = st.columns(4)
        columns[0].metric('Detected exercise',result['exercise'])
        columns[1].metric('Estimated reps · analysed windows',f"{result['estimated_reps']:.2f}" if result['counted_windows'] else ('Unavailable' if result['windows'] else 'Collecting'))
        age = result['result_age_seconds']
        columns[2].metric('Result age',f'{age:.1f}s' if age is not None else 'Waiting')
        columns[3].metric('Analysed / skipped',f"{result['analysed_seconds']:.0f}s / {result['skipped_seconds']:.0f}s")
        st.caption(f"{result['status']} · {result['pending_frames']}/64 frames in next window")
        if result['capture_ended']:
            st.caption('Camera stopped. Remaining partial-window frames are not assessed; queued results may still finish.')
        if result['error']: st.error(result['error'])
        if result['pose_error']: st.error(f"Pose preview: {result['pose_error']}")
        if result['skipped_seconds']: st.warning('Some video was not assessed. The estimate covers analysed windows only.')
        if result['processing_seconds'] and result['processing_seconds']>8:
            st.warning('Model inference is slower than the 8-second window on this device.')
        if result['timeline']: st.line_chart(result['timeline'],x='seconds',y='count')
    live_results()
    if 'last_camera_report' in st.session_state:
        st.download_button('Download latest camera results',json.dumps(st.session_state.last_camera_report,indent=2),'camera-assessment.json','application/json')

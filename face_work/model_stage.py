"""Staged model-only assessment UI. Run: streamlit run model_stage.py."""
from pathlib import Path
import json
import tempfile
import streamlit as st
from model_counter import count_video
from recognition import classify_video

st.set_page_config(page_title='Model-based Fitness Assessment',layout='wide')
st.title('Model-based Fitness Assessment · Stage 1')
st.caption('TimeSformer exercise recognition + RepNet repetition estimation. Uploaded-video validation stage; live camera is the next stage.')
st.info('Form assessment is unavailable in this stage. RepNet estimates repeated movements and does not classify valid or invalid form.')
upload = st.file_uploader('Exercise video',type=['mp4','mov','avi','mkv','webm'],
                          on_change=lambda: st.session_state.pop('model_report',None))
if upload:
    left,right = st.columns(2)
    with left:
        st.video(upload,width='stretch')
    with right:
        if st.button('Analyze with pretrained models',type='primary'):
            st.session_state.pop('model_report',None)
            status = st.empty()
            try:
                with tempfile.TemporaryDirectory() as folder:
                    path = Path(folder)/('video'+Path(upload.name).suffix)
                    path.write_bytes(upload.getvalue())
                    recognition = classify_video(path,status.info)
                    if recognition['exercise'] == 'Unknown':
                        st.warning('Exercise recognition is uncertain. No exercise-specific result is claimed.')
                    count = count_video(path,status.info)
                st.session_state.model_report = {'recognition':recognition,'counting':count}
                status.success('Model inference completed')
            except Exception as error:
                status.error(f'Model analysis failed: {error}')
        if 'model_report' in st.session_state:
            report = st.session_state.model_report
            st.metric('Detected exercise',report['recognition']['exercise'])
            st.metric('Estimated repetitions',f"{report['counting']['estimated_reps']:.2f}")
            st.caption('Fractional count is retained because periodicity estimation can include partial movements.')
            st.write(f"Counting processing time: {report['counting']['processing_seconds']:.2f} seconds")
            st.line_chart(report['counting']['timeline'],x='seconds',y='count')
            st.download_button('Download model report',json.dumps(report,indent=2),'model-report.json','application/json')

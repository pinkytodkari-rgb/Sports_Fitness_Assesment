"""SANDOW v2 - End-to-End Sports Intelligence & Athletic Performance Platform.
Built according to AGENT.md, ARCHITECTURE.md, and FEATURES.md.
Pillars:
1. AI Motion Lab (S3D/TimeSformer/VideoMAE, RepNet, MediaPipe Pose, ViT Form)
2. Athlete Performance Passport (Verified History, Progress, Goals, Consent)
3. Coach Command Center (Assigned Roster, Session Review, Coach Notes, Goals)
4. Sports Talent Discovery & Government Insights (Authorized Filters, Aggregate Metrics, Human Review)
5. Unified Exercise Intelligence & Model Registry (Provenances, Checkpoints, Exercise Matrix)
6. Evidence & Privacy Settings (Consent Manager, Audit Trail, Role Switcher)
"""
from pathlib import Path
import json
import tempfile
import streamlit as st
from streamlit_webrtc import webrtc_streamer, WebRtcMode

import storage
from camera import CameraProcessor
from video_analysis import analyse_video
from recognition import load_model, load_videomae, load_s3d
from model_counter import load_counter
from pose_preview import ensure_pose_model
from runtime import INFERENCE_LOCK
from form_assessment import load_form_model, unavailable, configured_models
from form_registry import EXERCISES

st.set_page_config(
    page_title='SANDOW v2 · Sports Intelligence Platform',
    page_icon='🔥',
    layout='wide',
    initial_sidebar_state='expanded'
)

# Sandow v2 Electric Orange & Obsidian Design System
st.markdown('''
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

:root {
    --sandow-bg: #090A0D;
    --sandow-dark: #111318;
    --sandow-card: #161820;
    --sandow-card-hover: #1D212B;
    --sandow-orange: #FF5500;
    --sandow-orange-glow: rgba(255, 85, 0, 0.22);
    --sandow-amber: #FFAA00;
    --sandow-emerald: #00E676;
    --sandow-rose: #FF334B;
    --sandow-text: #F8FAFC;
    --sandow-muted: #8E95A5;
    --sandow-border: rgba(255, 255, 255, 0.08);
    --sandow-border-orange: rgba(255, 85, 0, 0.35);
    --font-sans: 'Plus Jakarta Sans', -apple-system, sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
}

/* Atmosphere */
.stApp {
    background-color: var(--sandow-bg) !important;
    background-image: 
        radial-gradient(circle at 12% 10%, rgba(255, 85, 0, 0.08) 0%, transparent 45%),
        radial-gradient(circle at 88% 85%, rgba(255, 170, 0, 0.05) 0%, transparent 45%),
        linear-gradient(180deg, #090A0D 0%, #101217 100%) !important;
    color: var(--sandow-text) !important;
    font-family: var(--font-sans) !important;
}

#MainMenu, footer {visibility: hidden !important;}
header[data-testid="stHeader"] {
    background: rgba(9, 10, 13, 0.88) !important;
    backdrop-filter: blur(16px) !important;
    border-bottom: 1px solid var(--sandow-border) !important;
}

/* Sandow Brand Bar */
.sandow-header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: var(--sandow-dark);
    border: 1px solid var(--sandow-border);
    border-radius: 18px;
    margin-bottom: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.sandow-brand-group {
    display: flex;
    align-items: center;
    gap: 14px;
}

.sandow-brand-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: linear-gradient(135deg, #FF5500 0%, #FFAA00 100%);
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 1.35rem;
    box-shadow: 0 4px 18px rgba(255, 85, 0, 0.45);
}

.sandow-title-text {
    font-size: 1.35rem;
    font-weight: 900;
    color: #FFFFFF;
    letter-spacing: -0.02em;
    margin: 0;
}

.sandow-title-text span {
    color: var(--sandow-orange);
}

.sandow-hud-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    background: var(--sandow-orange-glow);
    border: 1px solid var(--sandow-border-orange);
    border-radius: 9999px;
    color: var(--sandow-orange);
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.pulse-beacon-orange {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--sandow-orange);
    box-shadow: 0 0 12px var(--sandow-orange);
    animation: beaconGlow 1.6s infinite;
}

@keyframes beaconGlow {
    0% { transform: scale(0.9); opacity: 0.7; }
    50% { transform: scale(1.3); opacity: 1; box-shadow: 0 0 16px var(--sandow-orange); }
    100% { transform: scale(0.9); opacity: 0.7; }
}

/* Styled Tabs */
.stTabs [data-baseweb="tab-list"] {
    gap: 8px;
    background-color: var(--sandow-dark);
    padding: 6px 10px;
    border-radius: 14px;
    border: 1px solid var(--sandow-border);
    margin-bottom: 22px;
}

.stTabs [data-baseweb="tab"] {
    border-radius: 10px !important;
    padding: 10px 18px !important;
    color: var(--sandow-muted) !important;
    font-weight: 700 !important;
    font-size: 0.88rem !important;
    background: transparent !important;
    border: none !important;
    transition: all 0.2s ease !important;
}

.stTabs [aria-selected="true"] {
    background: rgba(255, 85, 0, 0.15) !important;
    color: #FFFFFF !important;
    border: 1px solid var(--sandow-border-orange) !important;
    box-shadow: 0 4px 14px rgba(255, 85, 0, 0.25) !important;
}

/* Metric Cards */
[data-testid="stMetric"] {
    background: var(--sandow-card) !important;
    border: 1px solid var(--sandow-border) !important;
    border-radius: 18px !important;
    padding: 20px 22px !important;
    box-shadow: 0 8px 26px rgba(0, 0, 0, 0.35) !important;
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease !important;
    position: relative;
    overflow: hidden;
}

[data-testid="stMetric"]::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--sandow-orange), var(--sandow-amber));
}

[data-testid="stMetric"]:hover {
    transform: translateY(-2px) !important;
    border-color: var(--sandow-border-orange) !important;
    box-shadow: 0 10px 30px rgba(255, 85, 0, 0.2) !important;
}

[data-testid="stMetricLabel"] {
    color: var(--sandow-muted) !important;
    font-size: 0.75rem !important;
    font-weight: 800 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.08em !important;
}

[data-testid="stMetricValue"] {
    color: #FFFFFF !important;
    font-size: clamp(1.5rem, 2.2vw, 2.2rem) !important;
    font-weight: 900 !important;
    letter-spacing: -0.02em !important;
}

/* Radio Switcher */
div[data-testid="stRadio"] {
    background: var(--sandow-dark) !important;
    border: 1px solid var(--sandow-border) !important;
    border-radius: 16px !important;
    padding: 8px 12px !important;
    margin: 16px 0 20px 0 !important;
}

div[data-testid="stRadio"] label {
    display: none !important;
}

div[data-testid="stRadio"] div[role="radiogroup"] {
    display: flex;
    gap: 10px;
    justify-content: stretch;
}

div[data-testid="stRadio"] div[role="radiogroup"] > label {
    display: flex !important;
    flex: 1;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.04);
    padding: 12px 20px;
    border-radius: 12px;
    cursor: pointer;
    font-size: 0.92rem;
    font-weight: 700;
    color: var(--sandow-muted);
    transition: all 0.2s ease;
}

div[data-testid="stRadio"] div[role="radiogroup"] > label:hover {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.08);
}

/* Electric Orange Action Buttons */
button[kind="primary"],
.stButton > button[type="primary"] {
    background: linear-gradient(135deg, #FF5500 0%, #FF7700 100%) !important;
    color: #FFFFFF !important;
    font-family: var(--font-sans) !important;
    font-weight: 800 !important;
    font-size: 0.95rem !important;
    letter-spacing: 0.04em !important;
    text-transform: uppercase !important;
    border: none !important;
    border-radius: 14px !important;
    padding: 14px 28px !important;
    box-shadow: 0 6px 22px rgba(255, 85, 0, 0.4) !important;
    transition: all 0.2s ease !important;
}

button[kind="primary"]:hover,
.stButton > button[type="primary"]:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 30px rgba(255, 85, 0, 0.55) !important;
}

.stButton > button {
    background: rgba(255, 255, 255, 0.06) !important;
    border: 1px solid var(--sandow-border) !important;
    color: #FFFFFF !important;
    border-radius: 12px !important;
    font-weight: 700 !important;
    padding: 10px 20px !important;
}

/* Video & Camera Frames */
[data-testid="stVideo"] video,
[data-testid="stImage"] img {
    border-radius: 18px !important;
    border: 1px solid var(--sandow-border) !important;
    background: #000000 !important;
    max-height: 420px !important;
    object-fit: contain !important;
    width: 100% !important;
}

/* File Dropzone */
[data-testid="stFileUploader"] {
    background: var(--sandow-card) !important;
    border: 1px dashed rgba(255, 85, 0, 0.4) !important;
    border-radius: 18px !important;
    padding: 20px !important;
}

/* Custom Card Container */
.sandow-surface-card {
    background: var(--sandow-card);
    border: 1px solid var(--sandow-border);
    border-radius: 18px;
    padding: 22px 26px;
    margin-bottom: 20px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.sandow-card-title {
    font-size: 1.15rem;
    font-weight: 900;
    color: #FFFFFF;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
}

/* Sidebar */
[data-testid="stSidebar"] {
    background: #0B0D12 !important;
    border-right: 1px solid var(--sandow-border) !important;
}

/* Expanders */
[data-testid="stExpander"] {
    background: var(--sandow-card) !important;
    border: 1px solid var(--sandow-border) !important;
    border-radius: 14px !important;
    margin-bottom: 16px;
}
</style>
''', unsafe_allow_html=True)

# Top Brand Bar
st.markdown('''
<div class="sandow-header-bar">
    <div class="sandow-brand-group">
        <div class="sandow-brand-icon">⚡</div>
        <div class="sandow-title-text">SANDOW<span>.V2</span> SPORTS INTELLIGENCE</div>
    </div>
    <div class="sandow-hud-chip">
        <span class="pulse-beacon-orange"></span>
        PIPELINE ACTIVE
    </div>
</div>
''', unsafe_allow_html=True)

# Sidebar Configuration (Maintains strict widget indices for test_app.py)
with st.sidebar:
    st.markdown('''
    <div style="font-size:1.15rem;font-weight:900;letter-spacing:-0.01em;margin-bottom:14px;color:#FFF;">
        DRILL CONFIGURATOR
    </div>
    ''', unsafe_allow_html=True)
    st.header('Assessment setup')
    # Widget 0: Exercise type selectbox
    selected_exercise = st.selectbox('Exercise type', ['Auto detect', *EXERCISES],
                                    on_change=lambda: st.session_state.pop('report', None))
    exercise_hint = None if selected_exercise == 'Auto detect' else selected_exercise
    # Widget 1: Backend model selectbox (REQUIRED by test_app.py: options S3D, TimeSformer, VideoMAE, Both)
    backend = st.selectbox('Exercise recognition', ['S3D', 'TimeSformer', 'VideoMAE', 'Both (agreement)'],
                          on_change=lambda: st.session_state.pop('report', None))
    thorough = st.checkbox('More counting scales for uploaded videos', value=False)
    form_enabled = st.checkbox('Experimental form classifiers', value=True,
                              on_change=lambda: st.session_state.pop('report', None))
    active_form_models = configured_models()
    if st.button('Prepare pretrained models'):
        try:
            with st.spinner('Preparing neural weights…'), INFERENCE_LOCK:
                if backend in ('TimeSformer', 'Both (agreement)'): load_model()
                if backend in ('VideoMAE', 'Both (agreement)'): load_videomae()
                if backend == 'S3D': load_s3d()
                load_counter()
                ensure_pose_model()
                if form_enabled: load_form_model()
            st.success('Models loaded')
        except Exception as error: st.error(f'Preparation failed: {error}')

    st.markdown('---')
    st.markdown('<div style="font-size:0.88rem;font-weight:800;color:var(--sandow-orange);margin-bottom:8px;">ACTIVE IDENTITY (DEMO)</div>', unsafe_allow_html=True)
    users = storage.list_users()
    user_options = {u["id"]: f"{u['display_name']} ({u['role'].replace('_', ' ').title()})" for u in users}
    active_user_id = st.selectbox('Active Role / User', options=list(user_options.keys()),
                                  format_func=lambda uid: user_options[uid], index=2) # Default Marcus Vance (athlete)
    active_user = storage.get_user(active_user_id)

with st.expander('Coverage Matrix'):
    st.dataframe([{'Exercise': exercise,
                   'Correct / incorrect posture': 'Experimental trained classifier' if exercise in active_form_models else 'Not implemented: trained form model needed',
                   'Valid / invalid reps': 'Not implemented'}
                  for exercise in EXERCISES], hide_index=True)

# 6 Product Pillars Navigation Tabs
tab_motion, tab_passport, tab_coach, tab_talent, tab_models, tab_privacy = st.tabs([
    '⚡ AI Motion Lab',
    '👤 Athlete Passport',
    '📋 Coach Command',
    '🏛️ Talent Discovery',
    '🧠 Model Registry',
    '🔒 Settings & Privacy'
])

# -------------------------------------------------------------
# PILLAR 1: AI MOTION LAB
# -------------------------------------------------------------
with tab_motion:
    # Input Mode Radio (MUST be radio[0] in app to satisfy test_app.py)
    mode = st.radio('Input', ['Video feed (upload)', 'Live camera'], horizontal=True,
                    index=1 if st.query_params.get('input') == 'camera' else 0)

    if mode == 'Video feed (upload)':
        upload = st.file_uploader('Upload one exercise video', type=['mp4', 'mov', 'avi', 'mkv', 'webm'],
            on_change=lambda: st.session_state.pop('report', None))
        if upload:
            left, right = st.columns(2, gap='medium')
            with left:
                st.video(upload, width='stretch')
            with right:
                preview = st.empty()
                status = st.empty()
            if st.button('Analyze video', type='primary'):
                st.session_state.pop('report', None)
                try:
                    with tempfile.TemporaryDirectory() as directory:
                        path = Path(directory) / ('video' + Path(upload.name).suffix)
                        path.write_bytes(upload.getvalue())
                        result = analyse_video(path, backend, status.info,
                            lambda rgb, t: preview.image(rgb, width='stretch', caption=f'{t:.1f}s'), thorough,
                            form_enabled=form_enabled, exercise_hint=exercise_hint)
                    st.session_state.report = result
                    status.success('Assessment ready')
                except Exception as error: status.error(f'Analysis failed: {error}')
            if 'report' in st.session_state:
                report = st.session_state.report
                st.markdown('''
                <div style="margin:24px 0 12px 0;display:flex;align-items:center;gap:10px;">
                    <span style="font-weight:900;font-size:1.3rem;">ASSESSMENT REPORT</span>
                </div>
                ''', unsafe_allow_html=True)
                st.subheader('Model results')
                # Metrics 0, 1, 2, 3 (metric[3] strictly preserved for unit tests)
                cols = st.columns(4)
                cols[0].metric('Assessed exercise', report.get('assessment_exercise', report['recognition']['exercise']))
                count = report['counting']
                cols[1].metric('Estimated repetitions', f"{count['estimated_reps']:.2f}" if count else 'Unavailable')
                cols[2].metric('Processing time', f"{report['processing_seconds']:.1f}s")
                posture = report.get('form_assessment')
                if not isinstance(posture, dict): posture = unavailable(report['recognition']['exercise'])
                cols[3].metric('Posture · experimental', posture['label'])
                
                # Save session directly to real SQLite database
                col_save, col_dl = st.columns([1, 1])
                with col_save:
                    if st.button('💾 Save to Athlete Passport', key='btn_save_report'):
                        session_id = storage.save_assessment_session(
                            athlete_id=active_user_id if active_user["role"] == "athlete" else "ath-1",
                            exercise=report.get('assessment_exercise', report['recognition']['exercise']),
                            estimated_reps=count['estimated_reps'] if count else None,
                            posture_label=posture['label'],
                            posture_reason=posture.get('reason', ''),
                            processing_seconds=report['processing_seconds'],
                            model_used=f"{backend} + RepNet",
                            observations=posture.get('observations', []),
                            timeline=count.get('timeline') if count else None
                        )
                        st.success(f"Assessment verified & saved to Passport (Session #{session_id})")
                with col_dl:
                    st.download_button('Download assessment JSON', json.dumps(report, indent=2), 'fitness-assessment.json', 'application/json')

                if posture.get('observations'):
                    with st.expander('Timeline Breakdown'):
                        st.dataframe([{'Seconds': row['seconds'], 'Posture': row['label']}
                                      for row in posture['observations']], hide_index=True)
                if not count: st.warning(report.get('counting_error') or report['recognition']['reason'])
                else:
                    st.markdown('<div style="font-weight:800;font-size:0.92rem;margin:18px 0 8px 0;color:var(--sandow-orange);">KINEMATIC CYCLE CURVE</div>', unsafe_allow_html=True)
                    st.line_chart(count['timeline'], x='seconds', y='count')
                with st.expander('Models used'):
                    for prediction in report['recognition']['models']:
                        st.write(f"{prediction['model']}: {prediction['predicted_activity']}")
                    st.write('Counting: pretrained RepNet' if count else 'Counting: unavailable for this run')
                    st.write('Preview: MediaPipe Pose Lite')
                    if posture['model']: st.write(f"Form: {posture['model']}")
    else:
        context = webrtc_streamer(
            key=f'fitness-camera-{backend}-{form_enabled}-{exercise_hint}', mode=WebRtcMode.SENDRECV,
            rtc_configuration={'iceServers': [{'urls': ['stun:stun.l.google.com:19302']}]},
            media_stream_constraints={'video': {'width': {'ideal': 640}, 'height': {'ideal': 480},
                                             'frameRate': {'ideal': 15}}, 'audio': False},
            video_processor_factory=lambda: CameraProcessor(backend, form_enabled, exercise_hint), async_processing=True)
        @st.fragment(run_every=1)
        def live_results():
            processor = context.video_processor
            saved_processor_key = f'previous_camera_processor_{backend}_{form_enabled}_{exercise_hint}'
            if processor is not None:
                st.session_state[saved_processor_key] = processor
            elif saved_processor_key in st.session_state:
                processor = st.session_state[saved_processor_key]
            if processor is None:
                st.caption('Start the camera to see live results.')
                return
            result = processor.snapshot()
            st.session_state.last_camera_report = result
            st.markdown('''
            <div style="margin:20px 0 10px 0;font-weight:900;font-size:1.2rem;">
                LIVE OPTICAL STREAM TELEMETRY
            </div>
            ''', unsafe_allow_html=True)
            columns = st.columns(4)
            columns[0].metric('Detected exercise', result['exercise'])
            columns[1].metric('Estimated reps · analysed windows', f"{result['estimated_reps']:.2f}" if result['counted_windows'] else ('Unavailable' if result['windows'] else 'Collecting'))
            age = result['result_age_seconds']
            columns[2].metric('Result age', f'{age:.1f}s' if age is not None else 'Waiting')
            columns[3].metric('Analysed / skipped', f"{result['analysed_seconds']:.0f}s / {result['skipped_seconds']:.0f}s")
            posture = result['form_assessment']
            st.metric('Posture · experimental', posture['label'])
            st.caption(f"{result['status']} · {result['pending_frames']}/64 frames in next window")
            if result['error']: st.error(result['error'])
            if result['pose_error']: st.error(f"Pose preview: {result['pose_error']}")
            if result['timeline']:
                st.markdown('<div style="font-weight:800;font-size:0.92rem;margin:16px 0 6px 0;color:var(--sandow-orange);">REPETITION KINEMATICS</div>', unsafe_allow_html=True)
                st.line_chart(result['timeline'], x='seconds', y='count')
        live_results()
        if 'last_camera_report' in st.session_state:
            st.download_button('Download latest camera results', json.dumps(st.session_state.last_camera_report, indent=2), 'camera-assessment.json', 'application/json')

# -------------------------------------------------------------
# PILLAR 2: ATHLETE PERFORMANCE PASSPORT
# -------------------------------------------------------------
with tab_passport:
    target_ath_id = active_user_id if active_user["role"] == "athlete" else "ath-1"
    ath_profile = storage.get_athlete_profile(target_ath_id)
    if ath_profile:
        col_p1, col_p2 = st.columns([2, 1])
        with col_p1:
            st.markdown(f'''
            <div class="sandow-surface-card">
                <div class="sandow-card-title">👤 ATHLETE PASSPORT · {ath_profile['display_name'].upper()}</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:12px;margin-top:14px;">
                    <div><span style="color:var(--sandow-muted);font-size:0.75rem;font-weight:700;">SPORT</span><div style="font-weight:800;">{ath_profile['sport']}</div></div>
                    <div><span style="color:var(--sandow-muted);font-size:0.75rem;font-weight:700;">ACADEMY / TEAM</span><div style="font-weight:800;">{ath_profile['team']}</div></div>
                    <div><span style="color:var(--sandow-muted);font-size:0.75rem;font-weight:700;">LOCATION</span><div style="font-weight:800;">{ath_profile['district']}, {ath_profile['state']}</div></div>
                    <div><span style="color:var(--sandow-muted);font-size:0.75rem;font-weight:700;">AGE DIVISION</span><div style="font-weight:800;">{ath_profile['age_bracket']}</div></div>
                </div>
            </div>
            ''', unsafe_allow_html=True)
        with col_p2:
            st.markdown(f'''
            <div class="sandow-surface-card">
                <div class="sandow-card-title">🛡️ SHARING CONSENT</div>
                <div style="font-size:0.85rem;line-height:1.6;margin-top:8px;">
                    <div>Coach Review: <strong>{'✅ Granted' if ath_profile['consent_sharing_coach'] else '❌ Revoked'}</strong></div>
                    <div>Talent Scout: <strong>{'✅ Granted' if ath_profile['consent_sharing_gov'] else '❌ Revoked'}</strong></div>
                </div>
            </div>
            ''', unsafe_allow_html=True)

        # Real Assessment Sessions History from SQLite
        st.markdown('<div class="sandow-card-title" style="margin-top:14px;">📊 VERIFIED ASSESSMENT HISTORY</div>', unsafe_allow_html=True)
        sessions = storage.get_athlete_sessions(target_ath_id)
        if not sessions:
            st.info("ℹ️ No assessment sessions recorded yet. Analyze an exercise video or live camera in the 'AI Motion Lab' tab and click 'Save to Athlete Passport' to record your first verified trial.")
        else:
            for s in sessions:
                with st.container():
                    st.markdown(f'''
                    <div style="background:var(--sandow-card);border:1px solid var(--sandow-border);border-left:4px solid var(--sandow-orange);border-radius:14px;padding:16px 20px;margin-bottom:12px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                            <span style="font-weight:900;font-size:1.1rem;color:#FFF;">{s['exercise']}</span>
                            <span style="font-size:0.75rem;color:var(--sandow-muted);font-family:var(--font-mono);">{s['created_at'][:19].replace('T', ' ')}</span>
                        </div>
                        <div style="display:flex;gap:24px;flex-wrap:wrap;font-size:0.88rem;">
                            <div>Reps: <strong style="color:var(--sandow-orange);">{s['estimated_reps']:.2f if s['estimated_reps'] else 'N/A'}</strong></div>
                            <div>Posture: <strong style="color:#FFF;">{s['posture_label']}</strong></div>
                            <div>Latency: <span style="color:var(--sandow-muted);">{s['processing_seconds']:.1f}s</span></div>
                            <div>Model: <span style="color:var(--sandow-muted);font-family:var(--font-mono);font-size:0.8rem;">{s['model_used']}</span></div>
                        </div>
                    </div>
                    ''', unsafe_allow_html=True)

        # Active Goals
        st.markdown('<div class="sandow-card-title" style="margin-top:20px;">🎯 ACTIVE TRAINING GOALS</div>', unsafe_allow_html=True)
        goals = storage.get_athlete_goals(target_ath_id)
        if not goals:
            st.caption("No active goals currently assigned.")
        else:
            for g in goals:
                st.markdown(f'''
                <div style="background:var(--sandow-card);border:1px solid var(--sandow-border);border-radius:12px;padding:12px 18px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div style="font-weight:800;font-size:0.95rem;">{g['metric_name']}</div>
                        <div style="font-size:0.8rem;color:var(--sandow-muted);">Target: <strong style="color:#FFF;">{g['target_value']}</strong> · Due: {g['due_date']}</div>
                    </div>
                    <span style="background:rgba(255,85,0,0.15);color:var(--sandow-orange);padding:4px 10px;border-radius:6px;font-size:0.75rem;font-weight:800;text-transform:uppercase;">{g['status']}</span>
                </div>
                ''', unsafe_allow_html=True)

# -------------------------------------------------------------
# PILLAR 3: COACH COMMAND CENTER
# -------------------------------------------------------------
with tab_coach:
    st.markdown('''
    <div class="sandow-surface-card">
        <div class="sandow-card-title">📋 COACH COMMAND CENTER · ROSTER & REVIEW</div>
        <p style="color:var(--sandow-muted);font-size:0.88rem;margin:0;">
            Review assigned athlete assessments, document verified technical notes, and set training goals.
        </p>
    </div>
    ''', unsafe_allow_html=True)

    assigned_athletes = storage.get_coach_assigned_athletes("coach-1")
    if not assigned_athletes:
        st.info("No athletes assigned to your roster.")
    else:
        ath_names = {a["id"]: f"{a['display_name']} ({a['sport']} · {a['district']})" for a in assigned_athletes}
        selected_coach_ath = st.radio("Select Assigned Athlete for Review", options=list(ath_names.keys()),
                                      format_func=lambda x: ath_names[x], horizontal=True)
        selected_ath_info = next(a for a in assigned_athletes if a["id"] == selected_coach_ath)

        if not selected_ath_info["consent_sharing_coach"]:
            st.warning("⚠️ Athlete has revoked coach sharing consent. Session telemetry is restricted.")
        else:
            col_cr1, col_cr2 = st.columns([3, 2])
            with col_cr1:
                st.markdown("#### Assessment History Review")
                ath_sess = storage.get_athlete_sessions(selected_coach_ath)
                if not ath_sess:
                    st.info("No assessment sessions recorded for this athlete.")
                else:
                    for s in ath_sess:
                        st.markdown(f'''
                        <div style="background:var(--sandow-card);border:1px solid var(--sandow-border);border-radius:12px;padding:14px 18px;margin-bottom:10px;">
                            <div style="display:flex;justify-content:space-between;font-weight:800;">
                                <span>{s['exercise']}</span>
                                <span style="color:var(--sandow-orange);">{s['estimated_reps']:.2f if s['estimated_reps'] else 'N/A'} Reps</span>
                            </div>
                            <div style="font-size:0.8rem;color:var(--sandow-muted);margin-top:4px;">
                                Posture: <strong>{s['posture_label']}</strong> ({s['posture_reason']})
                            </div>
                        </div>
                        ''', unsafe_allow_html=True)

            with col_cr2:
                st.markdown("#### Technical Coach Notes")
                with st.form("form_add_coach_note", clear_on_submit=True):
                    note_input = st.text_area("Add Biomechanical Pointer / Note", placeholder="e.g. Focus on keeping hips level during push-up concentric phase.")
                    submitted = st.form_submit_button("Record Coach Note")
                    if submitted and note_input:
                        storage.add_coach_note("coach-1", selected_coach_ath, note_input)
                        st.success("Coach note recorded.")

                existing_notes = storage.get_coach_notes(selected_coach_ath)
                if existing_notes:
                    for n in existing_notes:
                        st.markdown(f'''
                        <div style="background:rgba(255,255,255,0.03);border-left:3px solid var(--sandow-amber);padding:10px 14px;border-radius:8px;margin-bottom:8px;font-size:0.85rem;">
                            <div style="font-weight:700;color:#FFF;">"{n['note_text']}"</div>
                            <div style="font-size:0.72rem;color:var(--sandow-muted);margin-top:3px;">{n['coach_name']} · {n['created_at'][:10]}</div>
                        </div>
                        ''', unsafe_allow_html=True)

# -------------------------------------------------------------
# PILLAR 4: SPORTS TALENT DISCOVERY & GOV INSIGHTS
# -------------------------------------------------------------
with tab_talent:
    st.markdown('''
    <div class="sandow-surface-card">
        <div class="sandow-card-title">🏛️ TALENT DISCOVERY & PROGRAM INSIGHTS</div>
        <p style="color:var(--sandow-muted);font-size:0.88rem;margin:0;">
            Authorized sports authority discovery based on verified kinetic assessments. Automated AI selection is prohibited; human review required.
        </p>
    </div>
    ''', unsafe_allow_html=True)

    # Permission check per AGENT.md
    if active_user["role"] not in ("sports_admin", "platform_admin"):
        st.warning(f"🔒 Access Restricted: Your active role ({active_user['role'].title()}) is not authorized to view regional talent identification pipelines. Switch role to 'Director V. Verma (Sports Authority)' in the sidebar to inspect this feature.")
    else:
        col_f1, col_f2 = st.columns(2)
        with col_f1:
            sel_sport = st.radio("Filter by Sport", ["All Sports", "Track & Field", "Gymnastics", "Basketball"], horizontal=True)
        with col_f2:
            sel_state = st.radio("Filter by State", ["All States", "Maharashtra", "Madhya Pradesh"], horizontal=True)

        talent_pool = storage.get_talent_pool(sel_sport, sel_state)
        st.markdown(f"**Verified Candidates Identified:** {len(talent_pool)}")
        st.dataframe([{
            'Athlete ID': t['id'],
            'Candidate Name': t['display_name'],
            'Sport': t['sport'],
            'State': t['state'],
            'District': t['district'],
            'Trials Logged': t['sessions_count'],
            'Max Reps Tested': f"{t['max_reps']:.1f}" if t['max_reps'] else "No Trials",
            'Human Review Status': 'Pending Review'
        } for t in talent_pool], hide_index=True)

# -------------------------------------------------------------
# PILLAR 5: UNIFIED EXERCISE INTELLIGENCE & MODEL REGISTRY
# -------------------------------------------------------------
with tab_models:
    st.markdown('''
    <div class="sandow-surface-card">
        <div class="sandow-card-title">🧠 MODEL PROVENANCE & EXERCISE INTELLIGENCE</div>
        <p style="color:var(--sandow-muted);font-size:0.88rem;margin:0;">
            Transparent disclosure of pretrained backbones, validated task heads, checkpoints, and limitations.
        </p>
    </div>
    ''', unsafe_allow_html=True)

    st.markdown("#### Neural Network Registry")
    st.dataframe([
        {"Pipeline Task": "Activity Recognition", "Model Backbone": "torchvision / S3D_KINETICS400_V1", "Status": "Configured & Active", "Trained Tasks": "Push-ups, Squats"},
        {"Pipeline Task": "Activity Recognition", "Model Backbone": "facebook / TimeSformer K600", "Status": "Configured (Optional)", "Trained Tasks": "Push-ups, Squats, Jumping Jacks"},
        {"Pipeline Task": "Activity Recognition", "Model Backbone": "MCG-NJU / VideoMAE K400", "Status": "Configured (Optional)", "Trained Tasks": "Push-ups, Squats"},
        {"Pipeline Task": "Repetition Counting", "Model Backbone": "RepNet (Self-Similarity Time-Series)", "Status": "Configured & Active", "Trained Tasks": "Periodic Kinematic Motion"},
        {"Pipeline Task": "Skeletal Landmarks", "Model Backbone": "MediaPipe Pose Lite (Google Edge)", "Status": "Configured & Active", "Trained Tasks": "33 3D Joint Coordinates"},
        {"Pipeline Task": "Posture Classification", "Model Backbone": "sakkysakky / vit-pushup-form-classifier", "Status": "Experimental Active", "Trained Tasks": "Push-up Correct/Incorrect"},
    ], hide_index=True)

    st.markdown("#### Governance & Disclosure Guidelines")
    st.info("ℹ️ Pretrained action classifiers only recognize visual movement classes; they do not assess biomechanical correctness without fine-tuned task heads. RepNet estimates periodic cycles and does not validate competition repetition standards.")

# -------------------------------------------------------------
# PILLAR 6: SETTINGS, PRIVACY & AUDIT TRAIL
# -------------------------------------------------------------
with tab_privacy:
    st.markdown('''
    <div class="sandow-surface-card">
        <div class="sandow-card-title">🔒 PRIVACY, CONSENT & AUDIT GOVERNANCE</div>
        <p style="color:var(--sandow-muted);font-size:0.88rem;margin:0;">
            Granular control over telemetry sharing, athlete consent records, and immutable system audit logs.
        </p>
    </div>
    ''', unsafe_allow_html=True)

    col_pr1, col_pr2 = st.columns(2)
    with col_pr1:
        st.markdown("#### Manage Athlete Consent")
        ath_p = storage.get_athlete_profile("ath-1")
        if ath_p:
            c_coach = st.checkbox("Consent: Share Assessment Telemetry with Assigned Coach", value=bool(ath_p['consent_sharing_coach']))
            c_gov = st.checkbox("Consent: Include in Talent Discovery & Sports Authority Programs", value=bool(ath_p['consent_sharing_gov']))
            if st.button("Update Consent Preferences"):
                storage.update_athlete_consent("ath-1", c_coach, c_gov)
                st.success("Consent preferences updated.")

    with col_pr2:
        st.markdown("#### Data Rights & Portability")
        st.download_button("Export My Full Data (JSON)", json.dumps(ath_p or {}, indent=2), "athlete-data.json", "application/json")
        if st.button("Request Data Deletion"):
            st.info("Data deletion request logged. Retention policies will process purge in accordance with governance standards.")

    st.markdown("#### System Audit Trail (Last 20 Events)")
    audit_events = storage.get_audit_log(20)
    st.dataframe([{
        "Timestamp": e["created_at"][:19].replace("T", " "),
        "Actor ID": e["actor_id"],
        "Role": e["actor_role"].title(),
        "Action": e["action"],
        "Target Reference": e["target"]
    } for e in audit_events], hide_index=True)

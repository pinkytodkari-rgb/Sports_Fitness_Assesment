"""AppTest verifies screens; a session-info shim is needed for WebRTC markup.
This does not emulate camera hardware or a negotiated WebRTC connection.
"""
import unittest
from unittest.mock import patch
from pathlib import Path
from io import BytesIO
from streamlit.testing.v1 import AppTest

class AppTests(unittest.TestCase):
    def test_upload_screen(self):
        app = AppTest.from_file('app.py').run(timeout=45)
        self.assertFalse(app.exception,str(app.exception))
        self.assertEqual(app.radio[0].value,'Video feed (upload)')
        self.assertEqual(app.selectbox[1].options,['S3D','TimeSformer','VideoMAE','Both (agreement)'])
        self.assertEqual(app.selectbox[1].value,'S3D')

    def test_camera_screen_markup(self):
        with patch('streamlit_webrtc.component.get_this_session_info',return_value=None):
            app = AppTest.from_file('app.py').run(timeout=45)
            app.radio[0].set_value('Live camera').run(timeout=45)
            self.assertFalse(app.exception,str(app.exception))
            self.assertEqual(app.radio[0].value,'Live camera')

    def test_no_legacy_assessment_module(self):
        self.assertFalse(Path('fitness.py').exists())
        for name in ('app.py','camera.py','live_pipeline.py','video_analysis.py'):
            self.assertNotIn('from fitness',Path(name).read_text(encoding='utf-8'))

    def test_upload_displays_both_posture_labels_even_without_count(self):
        # UI contract only; real trained-model checks are in validate_posture.py.
        for label in ('Correct','Incorrect'):
            with self.subTest(label=label), patch('streamlit.file_uploader',return_value=BytesIO(b'video-fixture')):
                app = AppTest.from_file('app.py')
                app.session_state.report = {
                    'recognition':{'exercise':'Push-ups','models':[],'reason':'test fixture'},
                    'counting':None,'counting_error':'Clip too short for counting',
                    'processing_seconds':1.0,
                    'form_assessment':{'label':label,'reason':'Unit test fixture',
                                       'observations':[],'model':None}}
                app.run(timeout=45)
                self.assertFalse(app.exception,str(app.exception))
                self.assertEqual(app.metric[3].value,label)

if __name__=='__main__': unittest.main()

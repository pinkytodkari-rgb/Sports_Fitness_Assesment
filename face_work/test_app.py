"""AppTest verifies screens; a session-info shim is needed for WebRTC markup.
This does not emulate camera hardware or a negotiated WebRTC connection.
"""
import unittest
from unittest.mock import patch
from pathlib import Path
from streamlit.testing.v1 import AppTest

class AppTests(unittest.TestCase):
    def test_upload_screen(self):
        app = AppTest.from_file('app.py').run(timeout=45)
        self.assertFalse(app.exception,str(app.exception))
        self.assertEqual(app.radio[0].value,'Video feed (upload)')
        self.assertEqual(app.selectbox[0].options,['S3D','TimeSformer','VideoMAE','Both (agreement)'])
        self.assertEqual(app.selectbox[0].value,'S3D')

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

if __name__=='__main__': unittest.main()

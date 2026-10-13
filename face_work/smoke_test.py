"""Verify UI and scheduling; learned-model integration uses validate_models.py."""
import unittest
if __name__=='__main__':
    suite = unittest.defaultTestLoader.loadTestsFromNames(['test_recognition','test_live_pipeline','test_app'])
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)

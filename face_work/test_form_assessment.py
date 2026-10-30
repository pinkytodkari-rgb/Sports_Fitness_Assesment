import unittest
from unittest.mock import patch
import numpy as np
from form_assessment import assess_form,summarise

class FormTests(unittest.TestCase):
    def test_classifier_class_ids_are_not_assumed(self):
        result = summarise([[.9,.1],[.8,.2]],{0:'incorrect',1:'correct'},[1,2])
        self.assertEqual(result['label'],'Incorrect')
        self.assertEqual(result['observations'][0]['seconds'],1)

    def test_correct_and_uncertain(self):
        labels = {0:'correct',1:'incorrect'}
        self.assertEqual(summarise([[.95,.05]],labels)['label'],'Correct')
        self.assertEqual(summarise([[.51,.49]],labels)['label'],'Uncertain')

    def test_unsupported_never_uses_pushup_model(self):
        with patch('form_assessment.registered_head',return_value=None), \
                patch('form_assessment.load_form_model',side_effect=AssertionError('Must not load')):
            for exercise in ['Squats','Sit-ups','Jumping jacks','Lunges','Unknown']:
                result = assess_form([np.zeros((16,16,3),np.uint8)],exercise)
                self.assertEqual(result['status'],'unavailable')
                self.assertIsNone(result['model'])

    def test_failed_model_is_not_correct_posture(self):
        with patch('form_assessment.load_form_model',side_effect=RuntimeError('No weights')):
            result = assess_form([np.zeros((16,16,3),np.uint8)],'Push-ups')
        self.assertEqual(result['status'],'error')
        self.assertEqual(result['label'],'Unavailable')

    def test_invalid_probabilities_rejected(self):
        with self.assertRaises(ValueError): summarise([[float('nan'),.5]],{0:'correct',1:'incorrect'})
        with self.assertRaises(ValueError): summarise([[1.5,-.5]],{0:'correct',1:'incorrect'})

if __name__=='__main__': unittest.main()

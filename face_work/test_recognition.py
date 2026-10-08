import unittest
from recognition import decide

class RecognitionTests(unittest.TestCase):
    def test_supported_labels(self):
        for label,name in [('push up','Push-ups'),('situp','Sit-ups'),('squat','Squats'),
                           ('jumping jacks','Jumping jacks'),('lunge','Lunges')]:
            self.assertEqual(decide([.8,.1,.1],{0:label,1:'walking',2:'running'})['exercise'],name)
    def test_unsupported_not_forced(self):
        self.assertEqual(decide([.9,.1],{0:'swimming',1:'squat'})['exercise'],'Unknown')
    def test_uncertain_not_forced(self):
        self.assertEqual(decide([.45,.44,.11],{0:'squat',1:'lunge',2:'walking'})['exercise'],'Unknown')

if __name__=='__main__': unittest.main()

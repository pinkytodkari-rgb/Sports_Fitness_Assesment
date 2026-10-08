import unittest
from fitness import Counter, angle

def sample(value, errors=None):
    return {'value':value,'start':155,'end':105,'errors':errors or []}

def hold(counter, value, t, errors=None):
    for i in range(10): counter.update(sample(value,errors),t+i*.1)

class CycleTests(unittest.TestCase):
    def test_complete_rep(self):
        c=Counter('Squats'); hold(c,175,0); hold(c,85,1); hold(c,175,2)
        self.assertEqual(len(c.reps),1); self.assertTrue(c.reps[0]['valid'])
    def test_partial_rep(self):
        c=Counter('Squats'); hold(c,175,0); hold(c,125,1); hold(c,175,2)
        self.assertEqual(len(c.reps),1); self.assertFalse(c.reps[0]['valid'])
    def test_missing_pose_resets(self):
        c=Counter('Squats'); hold(c,175,0); hold(c,85,1); c.update(None,3); hold(c,175,4)
        self.assertEqual(len(c.reps),0)
    def test_static_pose_not_counted(self):
        c=Counter('Squats'); hold(c,175,0); hold(c,175,1)
        self.assertEqual(len(c.reps),0)
    def test_persistent_form_error(self):
        c=Counter('Push-ups'); hold(c,175,0); hold(c,85,1,['Alignment']); hold(c,175,2,['Alignment'])
        self.assertFalse(c.reps[0]['valid']); self.assertIn('Alignment',c.reps[0]['feedback'])
    def test_angle(self): self.assertAlmostEqual(angle((0,1),(0,0),(1,0)),90)

if __name__ == '__main__': unittest.main()

"""Live scheduling tests; not claims of learned-model accuracy."""
import unittest
from threading import Event
import numpy as np
from live_pipeline import LivePipeline

def recognised(frames,backend): return {'exercise':'Push-ups'}
def count(frames): return {'estimated_reps':1.25}

class LiveTests(unittest.TestCase):
    def feed(self,engine,start=0):
        for i in range(64): engine.submit(np.full((2,2,3),i,dtype=np.uint8),(start+i)/8)

    def test_disjoint_windows_accumulate_once(self):
        windows = []
        def counter(frames):
            windows.append([int(f[0,0,0]) for f in frames])
            return count(frames)
        engine = LivePipeline(counter=counter,recognizer=recognised)
        try:
            self.feed(engine); engine.wait()
            self.feed(engine,64); engine.wait()
            result = engine.snapshot(16)
            self.assertEqual(result['windows'],2)
            self.assertEqual(result['estimated_reps'],2.5)
            self.assertEqual(result['analysed_seconds'],16)
            self.assertEqual(windows,[list(range(64)),list(range(64))])
            self.assertEqual(result['skipped_seconds'],0)
        finally: engine.close()

    def test_unknown_does_not_count(self):
        def counter(frames): raise AssertionError('Unknown must not be counted')
        engine = LivePipeline(counter=counter,recognizer=lambda f,b:{'exercise':'Unknown'})
        try:
            self.feed(engine); engine.wait()
            self.assertEqual(engine.snapshot()['estimated_reps'],0)
            self.assertEqual(engine.snapshot()['exercise'],'Unknown')
        finally: engine.close()

    def test_overload_is_bounded_and_reported(self):
        entered,release = Event(),Event()
        def counter(frames):
            entered.set(); release.wait(5)
            return count(frames)
        engine = LivePipeline(counter=counter,recognizer=recognised)
        try:
            self.feed(engine)
            self.assertTrue(entered.wait(2))
            self.feed(engine,64)
            self.feed(engine,128)
            self.assertEqual(engine.jobs.qsize(),1)
            self.assertEqual(engine.snapshot()['skipped_seconds'],8)
            release.set(); engine.wait()
            self.assertEqual(engine.snapshot()['estimated_reps'],2.5)
        finally: release.set(); engine.close()

    def test_failure_is_not_a_fake_success(self):
        def counter(frames): raise RuntimeError('Unavailable model')
        engine = LivePipeline(counter=counter,recognizer=recognised)
        try:
            self.feed(engine); engine.wait()
            result = engine.snapshot()
            self.assertEqual(result['windows'],0)
            self.assertEqual(result['error'],'Unavailable model')
            self.assertEqual(result['skipped_seconds'],8)
        finally: engine.close()

    def test_gap_discards_partial_window_and_close_ignores_frames(self):
        engine = LivePipeline(counter=count,recognizer=recognised)
        for i in range(10): engine.submit(np.zeros((2,2,3),np.uint8),i/8)
        engine.submit(np.zeros((2,2,3),np.uint8),5)
        self.assertEqual(engine.snapshot()['pending_frames'],1)
        self.assertEqual(engine.snapshot()['skipped_seconds'],1.25)
        engine.close()
        engine.submit(np.zeros((2,2,3),np.uint8),6)
        self.assertEqual(engine.snapshot()['pending_frames'],1)

if __name__ == '__main__': unittest.main()

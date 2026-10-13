"""Bounded live inference, separate from video display; no exercise heuristics."""
import queue
from threading import Lock, Thread
import time
from model_counter import count_window
from recognition import classify_frames

class LivePipeline:
    def __init__(self, backend='TimeSformer', sample_fps=8,
                 counter=count_window, recognizer=classify_frames):
        self.backend = backend
        self.sample_fps = sample_fps
        self.counter, self.recognizer = counter, recognizer
        self.lock = Lock()
        self.jobs = queue.Queue(maxsize=1)
        self.frames = []
        self.last_sample = None
        self.next_sample = None
        self.closed = False
        self.state = {'exercise':'Waiting for movement','estimated_reps':0.0,
                      'analysed_seconds':0.0,'skipped_seconds':0.0,'pending_frames':0,
                      'windows':0,'counted_windows':0,'processing_seconds':None,'result_age_seconds':None,
                      'status':'Collecting 64 frames','error':None,'recognition':None,
                      'form_assessment':'Unavailable: no validated form model',
                      'last_window_end':None,'timeline':[]}
        self.worker = Thread(target=self._work,daemon=True,name='fitness-inference')
        self.worker.start()

    def submit(self,rgb,seconds):
        with self.lock:
            if self.closed: return
            if self.next_sample is not None and seconds < self.next_sample-1e-6:
                return
            if self.last_sample is not None and seconds-self.last_sample > 3/self.sample_fps:
                self.state['skipped_seconds'] += len(self.frames)/self.sample_fps
                self.frames = []
                self.next_sample = seconds
            self.last_sample = seconds
            self.next_sample = (self.next_sample if self.next_sample is not None else seconds)+1/self.sample_fps
            self.frames.append((rgb.copy(),seconds))
            self.state['pending_frames'] = len(self.frames)
            if len(self.frames) == 64:
                try:
                    self.jobs.put_nowait(self.frames)
                    self.state['status'] = 'Model analysis queued'
                except queue.Full:
                    self.state['skipped_seconds'] += 64/self.sample_fps
                    self.state['status'] = 'Analysis overloaded; one window skipped'
                self.frames = []
                self.state['pending_frames'] = 0

    def _work(self):
        while True:
            try: window = self.jobs.get(timeout=.2)
            except queue.Empty:
                if self.closed: return
                continue
            try:
                rgb = [f for f,_ in window]
                started = time.perf_counter()
                prediction = self.recognizer(rgb,self.backend)
                # Unknown activities never become exercise rep claims.
                count = self.counter(rgb) if prediction['exercise'] != 'Unknown' else None
                with self.lock:
                    self.state['exercise'] = prediction['exercise']
                    self.state['recognition'] = prediction
                    if count is not None:
                        self.state['estimated_reps'] += count['estimated_reps']
                        self.state['counted_windows'] += 1
                    self.state['analysed_seconds'] += window[-1][1]-window[0][1]+1/self.sample_fps
                    self.state['processing_seconds'] = round(time.perf_counter()-started,3)
                    self.state['windows'] += 1
                    self.state['last_window_end'] = window[-1][1]
                    self.state['timeline'].append({'seconds':window[-1][1],
                                                  'count':self.state['estimated_reps']})
                    self.state['status'] = ('Movement model result available' if count is not None
                                            else 'Unknown activity; count not assessed')
                    self.state['error'] = None
            except Exception as error:
                with self.lock:
                    self.state['error'] = str(error)
                    self.state['skipped_seconds'] += 64/self.sample_fps
                    self.state['status'] = 'Model analysis failed'
            finally:
                self.jobs.task_done()

    def snapshot(self,seconds=None):
        with self.lock:
            result = dict(self.state)
            result['timeline'] = list(self.state['timeline'])
            result['capture_ended'] = self.closed
            if seconds is not None and result['last_window_end'] is not None:
                result['result_age_seconds'] = max(0,seconds-result['last_window_end'])
            return result

    def close(self):
        with self.lock:
            self.closed = True

    def wait(self):
        """For replay tests only; never block the browser frame callback."""
        self.jobs.join()

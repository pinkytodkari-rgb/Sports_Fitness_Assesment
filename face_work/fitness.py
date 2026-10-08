"""Pose-based exercise assessment. Rules are prototype criteria, not SAI standards."""
from dataclasses import dataclass, field
import math

EXERCISES = ['Squats', 'Push-ups', 'Sit-ups', 'Jumping jacks', 'Lunges', 'Biceps curls']
GUIDANCE = {
    'Squats': 'Side view; show shoulders, hips, knees and feet.',
    'Push-ups': 'Side view; show the whole body including wrists and feet.',
    'Sit-ups': 'Side view; show shoulders, hips, knees and feet. Start lying back.',
    'Jumping jacks': 'Front view; keep both hands and feet inside the frame.',
    'Lunges': 'Side view; show both knees and feet. One return to standing is one rep.',
    'Biceps curls': 'Side view; keep the working shoulder, elbow and wrist visible.',
}

def angle(a, b, c):
    u = [a[i]-b[i] for i in range(2)]
    v = [c[i]-b[i] for i in range(2)]
    den = math.hypot(*u)*math.hypot(*v)
    return math.degrees(math.acos(max(-1, min(1, sum(x*y for x,y in zip(u,v))/den)))) if den > 1e-8 else 0

def features(landmarks, width, height, exercise):
    """Use pixel coordinates to preserve aspect ratio; select the visible body side."""
    p = [(v.x*width, v.y*height) for v in landmarks]
    sides = [(11,13,15,23,25,27),(12,14,16,24,26,28)]
    required = (0,1,2) if exercise == 'Biceps curls' else ((0,3,4) if exercise == 'Sit-ups' else ((0,1,2,3,5) if exercise == 'Push-ups' else (0,3,4,5)))
    side = max(sides, key=lambda s: min(landmarks[s[i]].visibility for i in required))
    ids = [side[i] for i in required]
    if exercise == 'Jumping jacks': ids = [11,12,15,16,23,24,27,28]
    if min(min(landmarks[i].visibility, landmarks[i].presence) for i in ids) < .6:
        return None
    if any(not (0 <= landmarks[i].x <= 1 and 0 <= landmarks[i].y <= 1) for i in ids): return None
    s,e,w,h,k,a = (p[i] for i in side)
    torso = max(math.dist(s,h), 1)
    knee = angle(h,k,a)
    elbow = angle(s,e,w)
    hip = angle(s,h,k)
    body = angle(s,h,a)
    vertical = abs(s[1]-h[1])/torso
    errors = []
    if exercise in ('Squats','Lunges'):
        value, start, end = knee, 155, 105
        if vertical < .55: errors.append('Keep your torso more upright.')
    elif exercise == 'Push-ups':
        value, start, end = elbow, 155, 95
        if body < 155: errors.append('Keep shoulders, hips and ankles in a straighter line.')
    elif exercise == 'Sit-ups':
        value, start, end = hip, 130, 75
    elif exercise == 'Biceps curls':
        value, start, end = elbow, 150, 60
        if abs(s[0]-e[0])/torso > .45: errors.append('Keep your upper arm closer to your torso.')
    else:
        shoulder_width = max(math.dist(p[11],p[12]), torso*.4)
        spread = abs(p[27][0]-p[28][0])/shoulder_width
        arms_up = p[15][1] < p[11][1] and p[16][1] < p[12][1]
        arms_down = p[15][1] > p[11][1] and p[16][1] > p[12][1]
        value = 0 if arms_up and spread > 1.5 else (180 if arms_down and spread < 1.2 else 90)
        start, end = 150, 30
    return {'value':value, 'start':start, 'end':end, 'errors':errors,
            'vertical':vertical, 'elbow':elbow, 'knee':knee, 'hip':hip}

@dataclass
class Counter:
    exercise: str
    phase: str = 'Find starting position'
    reps: list = field(default_factory=list)
    armed: bool = False
    active: bool = False
    reached: bool = False
    started: float = 0
    last_seen: float = -1
    smooth: float | None = None
    errors: dict = field(default_factory=dict)
    observed: int = 0
    candidate: str = ''
    candidate_since: float = 0

    def reset_cycle(self):
        self.armed = self.active = self.reached = False
        self.smooth = None
        self.errors = {}
        self.observed = 0
        self.candidate = ''

    def update(self, f, t):
        if f is None:
            self.phase = 'Unable to assess: body landmarks hidden'
            if self.last_seen >= 0 and t-self.last_seen > .5: self.reset_cycle()
            return
        if self.last_seen >= 0 and t-self.last_seen > .5: self.reset_cycle()
        self.last_seen = t
        self.smooth = f['value'] if self.smooth is None else .45*f['value']+.55*self.smooth
        value = self.smooth
        raw_phase = 'start' if value >= f['start'] else ('end' if value <= f['end'] else 'middle')
        if raw_phase != self.candidate:
            self.candidate, self.candidate_since = raw_phase, t
        stable = t-self.candidate_since >= .12
        if not self.armed:
            self.phase = 'Find starting position'
            if raw_phase == 'start' and stable: self.armed = True
            return
        if not self.active and value < f['start']-10:
            self.active, self.started = True, t
            self.errors, self.observed = {}, 0
        if self.active:
            self.observed += 1
            for error in f['errors']: self.errors[error] = self.errors.get(error,0)+1
            if raw_phase == 'end' and stable: self.reached = True
            self.phase = 'Return to start' if self.reached else 'Moving'
            if raw_phase == 'start' and stable:
                duration = t-self.started
                if duration >= .4:
                    reasons = [e for e,n in self.errors.items() if n/max(self.observed,1) >= .25]
                    if not self.reached: reasons.append('Complete the full movement range.')
                    self.reps.append({'rep':len(self.reps)+1,'start_seconds':round(self.started,2),
                                      'end_seconds':round(t,2),'duration_seconds':round(duration,2),
                                      'valid':not reasons,'feedback':reasons or ['Movement passed the prototype checks.']})
                self.active = self.reached = False
                self.phase = 'Ready'
            elif t-self.started > 15:
                self.reset_cycle()
                self.phase = 'Cycle timed out; return to start'
        else: self.phase = 'Ready'

def recognize(landmarks, width, height):
    """Conservative geometric candidate; temporal lock handled by caller."""
    f = features(landmarks,width,height,'Squats')
    if f is None: return None
    j = features(landmarks,width,height,'Jumping jacks')
    if j and j['value'] == 0: return 'Jumping jacks'
    if f['vertical'] < .45:
        return 'Sit-ups' if f['knee'] < 125 else 'Push-ups'
    if f['vertical'] > .65 and f['knee'] < 125: return 'Squats'
    return None

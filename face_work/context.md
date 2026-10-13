# Project context and preserved legacy assessment

User requirement: active outputs must come from pretrained models. Do not restore
hand-written exercise-angle rep counting or form feedback without explicit user
instruction. Live camera and uploaded video are both required. Model output
postprocessing, sampling and confidence rejection are necessary inference plumbing;
they are not learned form assessment. Never claim untested accuracy or live speed.

## Removed rule implementation — reference only

Exact old code is recoverable from GitHub branch `add-face-work`, commit `1b67d32`,
file `face_work/fitness.py` (and old `app.py`). This document does not execute it.

Legacy algorithm used MediaPipe 2D pixel coordinates and chose the more visible
body side. Required landmark visibility/presence >=0.6 and coordinates inside frame.
Joint angles used vector dot products/acos. Exercise thresholds (degrees):

| Exercise | Starting position | Movement extreme | Legacy feedback rule |
|---|---:|---:|---|
| Squats/lunges | knee >=155 | knee <=105 | torso vertical ratio <0.55: upright torso |
| Push-ups | elbow >=155 | elbow <=95 | shoulder/hip/ankle angle <155: body alignment |
| Sit-ups | hip >=130 | hip <=75 | no additional posture check |
| Curls | elbow >=150 | elbow <=60 | shoulder/elbow horizontal displacement / torso >0.45 |
| Jumping jacks | hands below shoulders and ankle spread <1.2 shoulder widths | hands above shoulders and spread >1.5 | full open/close cycle |

The legacy state machine used exponential smoothing (0.45 current +0.55 previous),
0.12-second phase stability, start->extreme->start cycles, minimum duration 0.4s,
15-second timeout and reset after a 0.5s visibility gap. Errors present in >=25%
of active frames invalidated a rep. Incomplete range invalidated returning cycles.
These were prototype heuristics, never official SAI standards or trained form models.

## Model stage evidence and constraints

- S3D K400 (lighter default), TimeSformer K600 and VideoMAE K400: exercise recognition.
- RepNet: learned periodic-motion estimate, not completed/valid rep determination.
- MediaPipe Pose Lite: learned landmarks for preview; never angle-based scoring.
- No verified all-exercise form checkpoint: show unavailable, not canned advice.
- CPU-only development laptop. Stage 1 multi-stride counting took 33s for 11.64s
  push-up footage (manual 3 cycles; estimate 2.7446), 70s for 20.487s squat footage.
- New live mode must use bounded asynchronous inference and show lag/coverage;
  uninterrupted video display is not proof of real-time model predictions.
- S3D tested correctly on the push-up and squat samples. Warm live replay took
  7.305s for an 8.005s counting window; TimeSformer replay took 13.204s. This is
  a single-window throughput test, not proof of stable real-camera latency.
- Both launchers now use the same model-only UI. No rule fallback is active.
- Internet source and tests must be documented; manually verify counts independently.

Previous branch URL: https://github.com/pinkytodkari-rgb/Sports_Fitness_Assesment/tree/add-face-work/face_work

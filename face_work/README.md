# Athlete Fitness Assessment

Local video assessment with pretrained TimeSformer Kinetics-600 for automatic exercise recognition, MediaPipe Pose Landmarker Full for pose, and temporal state machines for counting. No custom training is required. Model files are cached locally in `models/`.

## Start on Windows

Python 3.12 is recommended. Open PowerShell in this folder:

```powershell
powershell -ExecutionPolicy Bypass -File .\start.ps1
```

Open http://localhost:8501. Upload one exercise per video and click Analyze video. Auto detection is the default. It samples up to three clips, averages the trained classifier's predictions, then analyzes repetitions from the start of the video. Manual selection remains an optional override.

## Supported exercises

| Exercise | View | Completed-cycle measurement | Additional visible check |
|---|---|---|---|
| Squats | Side | Knee flexion then return to standing | Torso inclination |
| Push-ups | Side | Elbow flexion then extension | Shoulder–hip–ankle alignment |
| Sit-ups | Side | Hip flexion then return to lying position | Range only |
| Jumping jacks | Front | Arms up + legs apart, then arms down + legs together | Coordinated endpoints |
| Lunges | Side | Visible-side knee flexion then return | Torso inclination |
| Biceps curls | Side | Visible-side elbow flexion then extension | Upper arm displacement |

The more visible side is assessed for unilateral exercises; curls and lunges do not aggregate independent left/right reps. Auto detection uses facebook/timesformer-base-finetuned-k600 and covers squats, push-ups, sit-ups, jumping jacks and lunges. Biceps curls require manual selection because this checkpoint has no matching class. No counting frames are lost to recognition warmup. Mixed-exercise videos are not supported; conflicting supported predictions across sampled clips are rejected, but unsampled transitions may be missed.

The classifier evaluates all 600 classes. A supported top prediction must have score >= 0.35 and a margin >= 0.10 over second place. Otherwise the result is Unknown and counting is skipped. These are uncalibrated prototype thresholds. Top five activities and raw model scores are displayed and exported. Scores are not accuracy estimates. The first automatic run downloads roughly 0.5 GB of weights and CPU recognition can be slow. The checkpoint is listed under CC-BY-NC-4.0; assess licensing before commercial deployment.

## Outputs and limits

Annotated preview, completed/valid/invalid reps, frame coverage, per-rep timestamps and feedback, completion snapshots and downloadable JSON. No video is permanently stored; temporary input files are deleted after analysis. Model weights remain locally cached.

Rules are configurable in fitness.py and are prototype criteria, not clinical or official SAI criteria. Full-range thresholds differ by person, camera and test protocol. A cycle is invalid if it does not reach the configured endpoint or a monitored error appears in at least 25% of its assessable frames. Incomplete final cycles are not counted. Landmark gaps over half a second reset the cycle. Missing landmarks are not classified as bad form. The prototype does not measure every form error; sit-ups only have range checks. No official SAI scores, trained form/error classifier, mobile app, live camera interface, or validated universal exercise recognition is included.

For initial evaluation, manually count 3–5 clips per exercise: normal reps, partial reps, pauses, occlusion and incorrect form. Compare with JSON timestamps. These clips are necessary to tune and validate the rules before relying on scores.

## Sources

## Latency and display updates

Recognition scores remain internal for rejection thresholds and JSON diagnostics, but are hidden from the interface. TimeSformer is cached in memory, uses CUDA when available, and downsizes sampled frames before preprocessing. A supported central-clip prediction >= 0.85 can finish immediately. Two strong agreeing clips can skip the third; uncertain clips retain all three. This optimization assumes one exercise per video and can miss exercise changes elsewhere in a video. On the local squat sample, warm classification took 5.71 seconds using one clip versus 18.35 seconds using three. This is recognition time only; pose processing adds time and first-load latency differs.

Jumping jacks use the pretrained MediaPipe Lite pose bundle; other exercises retain Full for alignment checks. Pose sampling targets 15 FPS for jumping jacks and 10 FPS otherwise, with a 640-pixel preview width and less frequent UI refreshes. These are video sampling rates, not guaranteed wall-clock processing rates. Validate fast movements on your clips.

- https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/python
- https://huggingface.co/facebook/timesformer-base-finetuned-k600
- Reference diagram: references/athlete-fitness-assessment-flow.png

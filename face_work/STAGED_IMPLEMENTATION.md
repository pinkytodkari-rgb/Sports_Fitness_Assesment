# Implementation status — 2026-10-13

| Component | Implementation | Validation |
|---|---|---|
| Rule removal | `fitness.py`, legacy state machine and rule tests removed | Active modules have no fitness import; checks passed |
| Preserved context | `context.md` stores exact thresholds, state-machine behavior, previous Git commit | Reference only; not imported/executed |
| Recognition | S3D K400, TimeSformer K600, VideoMAE K400, agreement option | All three recognized public push-ups and existing squat clip |
| Counting | Pretrained RepNet, upload multiscale and single-window live inference | Actual inference tested; exact counting accuracy failed |
| Pose preview | MediaPipe Pose Lite, full image, no status text over athlete | Uploaded previews and camera callback tested |
| Video feed | Uploaded video and annotated preview | Actual model integration on two clips |
| Camera feed | Browser WebRTC SENDRECV, video only | Real-server component rendering and real callback/replay passed; physical camera unverified |
| Background inference | Bounded queue, disjoint windows, skipped coverage/error display | Scheduler tests passed |
| Form assessment | Explicitly unavailable | No verified model coverage; no fallback |

The original rule code can be recovered from Git commit `1b67d32`. This is not an
active fallback. Stage 1 historical results remain in `references/stage1-results.json`.
Current results are in `references/model-validation.json` and
`references/server-validation.json`.

## Acceptance gaps

1. Counting quality is not accepted: public push-up video has 3 visually reviewed
   cycles, estimate 2.7446; squat video has 2 visually reviewed cycles and default
   estimate about 1.0186. Do not round estimates and call them validated counts.
2. CPU upload analysis remains slower than playback. Live streaming shows delayed
   window results; its full-coverage timing acceptance has not been established.
   Lighter S3D + RepNet live replay took 7.305s for an 8.005s window, compared
   with 13.204s using TimeSformer. S3D is now the default; predictions still lag.
3. Real webcam start/permission/stop and negotiated browser connection need a
   physical-browser test. Automation helpers timed out; never describe replay as
   proof that a physical webcam was tested.
4. Sit-ups, jumping jacks, lunges, mixed movement, pauses and more subjects need
   labelled integration clips. Published model benchmarks are not app accuracy.
5. Form-error feedback needs appropriate trained checkpoints or new labelled
   training data. Restore rules only on explicit user instruction.

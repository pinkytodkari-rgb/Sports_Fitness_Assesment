# Model-only evaluation

## Current posture update — 2026-10-15

Correct/incorrect push-up image classification is now integrated into uploads and
live windows using a trained ViT checkpoint. It remains experimental; other
exercises still do not have form assessment. No angle rules were restored.

- 17 software tests passed, including label-ID handling, uncertainty, unsupported
  exercise rejection, failed weights and preserving posture results if counting fails.
- Both Correct and Incorrect labels were checked in the upload UI, including when
  counting is unavailable. Real-server upload and camera-component screens passed.
- Eight public labelled clips: 7 predictions matched labels and 1 abstained.
  Dataset/model training overlap is unknown: this is not held-out accuracy.
- Actual end-to-end upload tests produced Correct and Incorrect on the respective
  labelled clips. Actual live-scheduler replay also ran form inference.
- An unrelated Pexels push-up video returned Uncertain; this limitation is retained.
- Preprocessing is inferred from the documented base model because the publisher
  omits a processor file; predictions are explicitly experimental.

Details: [POSTURE_ASSESSMENT.md](POSTURE_ASSESSMENT.md),
`references/posture-validation.json`, `references/posture-integration.json`.
The older timing and availability statements below describe the October 13 build.

## Historical model-only evaluation — 2026-10-13

## Checks performed

- 11 automated recognition, live-scheduler and screen checks passed.
- AppTest's WebRTC markup check uses a session-info shim because the test harness
  has no real session manager. This test does not emulate camera hardware.
- `validate_server.py`: real Streamlit websocket sessions render both upload and
  camera screens; no exceptions; camera component present. No runtime mock.
- Actual S3D, TimeSformer, VideoMAE, RepNet and MediaPipe checkpoints loaded and ran.
- Internet-video replay through the same live scheduler and a real AV camera
  callback passed. A callback result does not prove browser-camera negotiation.
- Whole-body preview frames saved for visual review. No banner obscures the head.
- The original truncated push-up file was rejected; complete replacement used.
- `validate_inputs.py` confirmed corrupt/too-short rejection and the default S3D
  upload path with actual recognition and counting. Results: `references/input-validation.json`.

## Video tests

Public push-up source:
https://videos.pexels.com/video-files/4804794/4804794-hd_1920_1080_25fps.mp4

The squat clip already existed locally; its original URL was not preserved. Do not
present it as an independently sourced benchmark dataset.

| Video | Visually reviewed complete cycles | TimeSformer | VideoMAE | RepNet estimate | Total upload analysis |
|---|---:|---|---|---:|---:|
| Push-ups, 11.64s | 3 | Push-ups | Push-ups | 2.7446 | 43.76s |
| Squats, 20.487s | 2 | Squats | Squats | 1.0186 | 55.90s |

Manual labels were reviewed from timestamped contact sheets; they are provisional,
not independently double-annotated labels. Squat cycles return to standing at about
11.6s and 18.4s. Approximate absolute errors: push-ups 0.2554, squats 0.9814.
Two clips cannot establish overall accuracy. Counts are estimates and are not
validated form-correct reps. This sample does not justify a performance percentage.

The first implementation looked only at opening frames and misrecognized squat
setup. Centre-first clip sampling fixed recognition on this test. The sampling is
not a complete mixed-exercise detector; upload one exercise per video.

## Timing and live limits

Development laptop: CPU-only PyTorch, no CUDA. Full upload inference is slower
than playback. Live mode uses single 64-frame windows, about 8 sampled FPS,
recognition plus counting in the worker; video preview continues independently.
See the latest `live_replay` entry in `references/model-validation.json` for the
current window estimate, coverage, pending frames and inference duration.

S3D also recognized both test exercises. Its warm live-window test took 7.305s
for 8.005s of footage, versus TimeSformer's 13.204s. This supports selecting the
lighter model by default, but not a claim of instantaneous predictions or stable
long-session throughput. See `references/fast-model-validation.json`.

The default S3D upload run also produced 2.7446 on push-ups (57.164s including
decoding, cold recognizer/counter loading and multiscale counting). Timings vary
between runs; warm streaming-window timing must not be substituted for full-upload time.

Accelerated file replay is a functional test, not a real-time benchmark. A final
short window remains pending and is not counted. Counts across window boundaries
may lose or mis-estimate cycles. A bounded queue reports skipped windows instead
of quietly presenting a complete count. Stable real-time prediction latency and
exact rep accuracy are not accepted yet.

## Unverified

Physical browser-camera capture, permissions and STOP lifecycle could not be
visually verified because browser/native automation helpers timed out. No claim
of actual webcam validation is made. Form-quality models are not installed; form
feedback and valid/invalid scoring are unavailable. No static exercise-rule
fallback is enabled.

Model-source benchmark scores should be reported separately from application
accuracy; see each original model card. Future validation requires held-out labelled
videos for each exercise, non-exercise footage, poor visibility, different camera
angles, pauses, cadence changes, and long live sessions.
# 15 October: multi-exercise data experiment

Downloaded sixteen instructor-feedback-labelled QEVD clips and trained separate
ViT-feature linear candidates. Jacks: 1/2 held-out source-session clips correct;
squats: 2/2. Both remain disabled: weak labels, tiny evaluation, unknown participant
overlap and source orientation/scene bias. These are not application accuracy
figures. See ONLINE_FORM_DATA.md and references/multi-exercise-form-candidates.json.

Software validation: 25 tests passed with `python smoke_test.py`, including
upload/live UI, manual exercise routing and rejection of unapproved candidates.
Software tests do not establish posture correctness. Sit-up correctness remains
unimplemented; only the original experimental push-up classifier is enabled.


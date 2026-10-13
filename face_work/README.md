# Athlete Fitness Assessment — pretrained models

The active app has two inputs: **Video feed (upload)** and **Live camera**.
Both use trained video classifiers (S3D, TimeSformer or VideoMAE) and RepNet. MediaPipe Pose Lite supplies preview
landmarks. The legacy joint-angle counter and canned posture advice were removed;
their thresholds and recovery reference are preserved in [context.md](context.md).

## Run on Windows

Use Python 3.12, then run `./start.ps1` in PowerShell, or:

```powershell
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m streamlit run app.py
```

Open the displayed localhost URL. The first model preparation downloads pretrained
weights; subsequent runs use the local cache. CPU works; a CUDA-compatible PyTorch
installation and GPU can improve large-model inference. Weights are not in Git.
`model_stage.py` is a compatibility launcher for the same app.

## Use

- Select S3D (lighter default), TimeSformer, VideoMAE, or **Both (agreement)** in the sidebar. Both compares TimeSformer and VideoMAE, rejects
  disagreements and costs more computation. TimeSformer supports jumping jacks;
  the selected S3D and VideoMAE K400 checkpoints have no matching jumping-jacks class.
- Upload a video containing one person and one exercise. Press Analyze video.
  Preview text is below the image; the whole image fits a compact panel.
- For camera input, prepare models, choose Live camera, press START, and allow
  camera access in your browser. Microphone capture is disabled. STOP ends capture.
  Prefer Chrome/Edge. Localhost supports camera access; a remote deployment needs
  HTTPS and may need a TURN server where direct WebRTC connections are blocked.
- Live recognition/counting runs in a bounded background queue. Video display
  does not wait for these large models. Results need 64 frames at about 8 sampled
  FPS plus model inference time. The UI reports result age, skipped coverage and
  pending frames. Partial final windows are not assessed. Windows are disjoint,
  but repetition estimates can be inaccurate around window boundaries.

## What the outputs mean

RepNet estimates **periodic motion**, including fractional cycles. It does not
identify valid/invalid repetitions. Form assessment, posture-error feedback and
official SAI scoring are unavailable; no rule fallback is enabled.

Normal model preprocessing, confidence rejection, label mapping, queue limits and
the model author's postprocessing still contain configuration values. These are
not exercise-angle rules and are not trained form assessment.

Live camera transport is implemented. Accurate instantaneous model results on a
CPU laptop are **not guaranteed**. See [EVALUATION.md](EVALUATION.md) for actual
tests and failures. Automatic recognition coverage is checkpoint-dependent;
curls and arbitrary exercises must not be claimed as supported without tests.

## Verify

```powershell
.venv\Scripts\python.exe smoke_test.py
.venv\Scripts\python.exe validate_models.py
.venv\Scripts\python.exe validate_server.py
.venv\Scripts\python.exe validate_fast_model.py
.venv\Scripts\python.exe validate_inputs.py
```

`validate_models.py` needs test clips in `sample_videos`; its public push-up source
is recorded in the script. `validate_server.py` expects the app at port 8502.
For that check launch with `--server.port 8502`. Hardware camera permission and
actual webcam capture require a separate browser test.

Model sources: [TimeSformer](https://huggingface.co/facebook/timesformer-base-finetuned-k600),
[VideoMAE](https://huggingface.co/MCG-NJU/videomae-base-finetuned-kinetics),
[S3D](https://docs.pytorch.org/vision/stable/models/generated/torchvision.models.video.s3d.html),
[RepNet weights](https://huggingface.co/materight/repnet),
[RepNet implementation](https://github.com/materight/RepNet-pytorch),
[MediaPipe Pose](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker/python).
The vendor model changes its encoder loader to installed timm; attribution and
original source revision are recorded in context/history. Verify upstream licensing
before distributing third-party code commercially.

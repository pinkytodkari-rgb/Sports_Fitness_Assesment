# Model-based implementation and validation

## Stage 1 — repetition model experiment (2026-10-13)

Implemented `model_counter.py` and a separate `model_stage.py` UI. This path uses
TimeSformer for exercise recognition and pretrained RepNet for repetition estimation.
It does not call `fitness.Counter`, angle thresholds, or canned form feedback.
The original app remains the previous prototype; the new model-only app is on port 8502.

Run with `.venv\Scripts\python.exe -m streamlit run model_stage.py --server.port 8502`.

Upstream RepNet implementation: https://github.com/materight/RepNet-pytorch
Revision: c455c53a7e48724f73a2e65e336aee065c965418
Weights: https://huggingface.co/materight/repnet
Local change: use pinned installed timm instead of downloading executable torch.hub code.
Retain upstream attribution; upstream licensing needs verification before redistribution.

### Validation

- Streamlit AppTest startup: passed.
- HTTP health endpoint on port 8502: passed.
- Pretrained checkpoint loading and actual inference: passed.
- Truncated original push-up file: rejected; complete replacement downloaded.
- Public push-up source: https://videos.pexels.com/video-files/4804794/4804794-hd_1920_1080_25fps.mp4
- Push-ups: visually reviewed timestamped frames show 3 complete cycles. TimeSformer
  identified Push-ups; RepNet estimated 2.7446 (absolute error about 0.2554).
  Counting took 33.189 seconds for 11.64 seconds of footage.
- Existing squat sample: TimeSformer identified Squats; RepNet estimated 1.2149.
  Counting took 69.996 seconds for 20.487 seconds of footage. Ground-truth count
  was not independently established in this stage; the previous rule-counter result
  must not be used as ground truth.
- Results are in `references/stage1-results.json`. These timings include counter
  loading and count inference, but not the subsequent TimeSformer recognition.

**Acceptance: failed for live speed.** The model is integrated as an experiment,
not a production replacement. Count accuracy is unproven across exercises. Fractional
estimates are displayed without claiming that they measure complete or valid reps.
RepNet has learned outputs plus its published confidence/postprocessing thresholds;
it does not use hand-authored exercise-angle rules. No form fallback is active.

## Next stages, in order

1. Resolve counting speed and accuracy: profile GPU availability and the encoder,
   evaluate streaming frame windows and alternative pretrained counting models.
   Recheck push-ups, squats, jumping jacks and sit-ups against manually labelled clips,
   including pauses and non-exercise footage. Do not promote a failed model.
2. Implement browser camera streaming and asynchronous inference. Replay internet
   footage through the same stream path; measure processing lag, queue growth,
   frame loss, and duplicate counts. Then verify with an actual webcam.
3. Add rolling exercise recognition and verify transitions and uncertain predictions.
4. Evaluate form-assessment checkpoints against labelled correct/incorrect examples
   for each supported exercise. Missing coverage must remain unavailable. Request
   explicit approval before enabling a clearly labelled rule-based fallback.
5. Combine the accepted components, remove the legacy rule assessment from the
   active app, and run end-to-end regression and friend-laptop setup checks.

Each stage records source clips, manual labels, model outputs, failures, timings and
remaining work. A successful startup is not an accuracy or real-time acceptance test.

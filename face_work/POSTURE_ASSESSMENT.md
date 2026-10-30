# Posture classification status — 2026-10-15

The previous version had pose-landmark visualization but no form-correctness
classifier. Those are separate tasks. The user clarified that correct/incorrect
form classification is the missing feature.

## Implemented in this update

- Trained image classifier: https://huggingface.co/sakkysakky/vit-pushup-form-classifier
- Pinned model revision: b4eb658808312c7ab4843ecf86f5cc6daeee5740.
- Config explicitly maps classes to `correct` and `incorrect`.
- Actual safetensors weights downloaded and executed, without remote custom code.
- Upload reports include sampled-time predictions and a posture label.
- Live windows use the same model. Inference remains asynchronous and may lag.
- Uncertain probabilities abstain; unsupported exercises never use push-up weights.
- A counting failure no longer prevents posture assessment on otherwise valid clips.
- The UI explicitly lists feature coverage exercise by exercise.
- No legacy angle rules, hard-coded posture scores or canned error advice restored.

## Model assumptions and limits

The publisher does not supply a processor file or sufficient training/preprocessing
documentation. Its documented base checkpoint's ViT processor is used. This is an
explicit assumption, not verified training-pipeline parity. Predictions are marked
experimental. The model judges selected images, not the complete movement or each
segmented repetition. Mean image probabilities summarize only sampled moments.
No valid/invalid rep counts or specific error explanations are inferred from them.

## Labelled video smoke test

Source: https://www.kaggle.com/datasets/mohamadashrafsalama/pushup
Dataset license: CC BY-NC-SA 4.0. The dataset remains local and is not redistributed.
Four evenly indexed files per directory were tested without tuning to their outputs.

| Dataset labels | Samples | Matching predictions | Uncertain | Opposite predictions |
|---|---:|---:|---:|---:|
| Correct | 4 | 4 | 0 | 0 |
| Wrong | 4 | 3 | 1 | 0 |

This is 7 matching labels and 1 abstention, NOT a general accuracy result. The
publisher's training data is unspecified; overlap with this dataset is unknown.
An unrelated public Pexels push-up clip returned Uncertain. Do not change rejection
thresholds just to force a successful label. Complete per-frame outputs and source
filenames are in `references/posture-validation.json`.

Run `python validate_posture.py` after downloading the public dataset ZIP into
`sample_videos/pushup-labelled.zip`. Upload/live integration uses
`python validate_posture_integration.py`. Software tests use `python smoke_test.py`.
Tests with injected predictors validate control flow, not learned-model accuracy.
Final software checks: 17 passed. Real-server upload and camera-component screens
rendered without exceptions. The UI displays both Correct and Incorrect labels.

## Still missing

Update: see [ONLINE_FORM_DATA.md](ONLINE_FORM_DATA.md) for downloaded squat/jumping-
jack data and disabled experimental candidates. Training/routing software covers
six exercises, but only the original experimental push-up model is enabled.

| Exercise/task | Status |
|---|---|
| Push-up correct/incorrect images | Experimental classifier integrated and smoke-tested |
| Squat correct/incorrect form | Not implemented: no verified suitable checkpoint integrated |
| Sit-up correct/incorrect form | Not implemented |
| Jumping-jack correct/incorrect form | Not implemented |
| Lunge correct/incorrect form | Not implemented |
| Error-type localization and corrective advice | Not implemented |
| Valid/invalid completed repetitions | Not implemented |
| Stable physical-webcam accuracy/latency validation | Not established |

Rejected leads include empty squat-model repositories on Hugging Face. Fitness-AQA
research covers back squats, overhead presses and barbell rows, but its public
repository does not provide a ready-to-run checkpoint for our exercise set; dataset
access requires an author request. No such request was sent. Other projects must
be checked for synthetic threshold-generated labels and actual available weights.
Do not use a generic action classifier as a correct/incorrect form model.

Additional rejected sources: PostureAI generates synthetic training data from
angle thresholds, which does not meet this project's intended learned assessment
requirement. The inspected Exercise_Tracking_and_Analysis training script tests
`"correct" in filename` before considering incorrect labels; `incorrect` contains
`correct`, making that label mapping unsuitable without repair/retraining. These
models were not loaded or presented as functioning squat form classifiers.

## Integration timing

The correct upload produced Correct in 12.358s; its short duration was insufficient
for RepNet, but posture was still returned. The incorrect upload produced Incorrect
in 35.092s. Actual stock-video live replay returned Uncertain; the combined window
processing took 12.894s, including 4.604s for form inference. These CPU timings are
not instantaneous real-time predictions. Physical webcam testing remains unverified.

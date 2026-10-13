# Fitness Assessment Prototype — Evaluation Summary

## What is currently evaluated

The system contains three distinct parts and their metrics must be reported separately:

1. **Exercise recognition:** TimeSformer Base fine-tuned on Kinetics-600.
2. **Pose estimation:** MediaPipe BlazePose GHUM Lite/Full.
3. **Application logic:** custom temporal state machines for repetition counting and prototype form checks.

Published model benchmark numbers do **not** measure the accuracy of the complete application on athlete fitness-test videos.

## Published model evidence

### TimeSformer

The application uses `facebook/timesformer-base-finetuned-k600`, an 8-frame, 224×224 video classifier with 600 Kinetics activity labels. The TimeSformer paper reports the following Kinetics-600 video-level results:

| Variant | Top-1 accuracy | Top-5 accuracy |
|---|---:|---:|
| TimeSformer (base/default) | 79.1% | 94.4% |
| TimeSformer-HR | 81.8% | 95.8% |
| TimeSformer-L | 82.2% | 95.6% |

The project uses the base Kinetics-600 checkpoint. The 79.1% paper figure is useful background, but it must not be presented as this application's exercise-recognition accuracy. Our pipeline uses custom clip sampling, early exit, label mapping, and rejection thresholds, and it targets a narrower smartphone-video domain.

### MediaPipe BlazePose GHUM

Google's model card reports average PDJ/PCK@0.2 landmark performance of:

| Variant | Average PDJ |
|---|---:|
| Lite | 87.0 |
| Full | 91.8 |
| Heavy | 94.2 |

The application uses Lite for jumping jacks and Full for the other supported exercises. PDJ measures joint-location quality under Google's evaluation protocol; it is not repetition-counting or form-feedback accuracy.

## Current local verification

| Check | Result |
|---|---|
| Unit tests | 9/9 passed |
| Python compilation | Passed |
| Application health endpoint | Passed |
| Blank-video false-rep smoke check | 0 repetitions |
| Public squat sample | Recognized as Squats |
| Squat sample completed reps | 2 |
| Squat sample assessable frames | 100% |
| Warm recognition latency on the development laptop | 5.71 seconds with one-clip early exit |

These results prove that the pipeline executes and that its state-machine protections work for the tested cases. They are not a statistically valid accuracy result because the project does not yet have an independently labelled evaluation set.

## Evaluation required before final claims

Collect at least 20 independently labelled videos per exercise, with different people, cameras, backgrounds, clothing, speeds, body types and both correct and incorrect repetitions. Keep people used for evaluation separate from any future training or threshold-tuning data.

For every video, label:

- Ground-truth exercise
- Total completed repetitions
- Valid and invalid repetitions
- Error type for each invalid repetition
- Start and end timestamp for every repetition
- Camera view and visibility problems

Report:

| Task | Recommended metrics |
|---|---|
| Exercise recognition | Accuracy, macro precision, macro recall, macro F1 and confusion matrix |
| Repetition counting | Mean absolute error, exact-count accuracy and per-exercise error |
| Valid/invalid classification | Precision, recall and F1 |
| Form-error detection | Per-error precision, recall and F1 |
| Pose availability | Assessable-frame percentage |
| Performance | Cold-start, warm-start and end-to-end processing time |

## Safe presentation statement

> The prototype combines a pretrained TimeSformer action-recognition model with MediaPipe BlazePose and custom temporal rules. Published benchmarks report 79.1% top-1 accuracy for the default TimeSformer on the full Kinetics-600 benchmark and 91.8 average PDJ for BlazePose Full under Google's pose-evaluation protocol. Our local functional tests pass 9 out of 9 cases, and one public squat sample was recognized and counted successfully. A labelled, exercise-specific test set is still required to establish end-to-end system accuracy.

## Sources

- TimeSformer model: https://huggingface.co/facebook/timesformer-base-finetuned-k600
- TimeSformer paper: https://arxiv.org/html/2102.05095
- BlazePose GHUM model card: https://storage.googleapis.com/mediapipe-assets/Model%20Card%20BlazePose%20GHUM%203D.pdf

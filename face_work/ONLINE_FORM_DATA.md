# Online form data — 15 October 2026

Only the existing experimental push-up checkpoint is enabled. Missing form
models are never replaced with angle rules or another exercise's classifier.

`prepare_coach_data.py` downloaded sixteen clips from the public
[QEVD mirror](https://huggingface.co/datasets/Voxel51/qualcomm-exercise-video-dataset-benchmark).
The [official source](https://www.qualcomm.com/developer/software/qevd-dataset)
describes the research licence and coach-feedback annotations. Videos stay in
ignored `sample_videos/coach_form`; they are not redistributed with the code.

Eight jumping-jack and eight squat clips were selected using explicit instructor
comments. The local JSONL manifest preserves each URL, exact annotation, frame
span, session and manual binary interpretation. These are weak labels: feedback
timing does not guarantee correctness in every frame.

| Candidate | Training clips | Held-out clips | Correct predictions | Deployment |
|---|---:|---:|---:|---|
| Jumping jacks | 6 | 2 | 1 | Disabled |
| Squats | 6 | 2 | 2 | Disabled |

Frozen ViT embeddings and separate linear heads were trained. These are source-
session splits, not subject-disjoint splits. Several recordings show the same
participant/background; some sources are sideways. The tiny sample, orientation
and scene biases prevent general accuracy claims. Two successful squat predictions
do not establish reliability. See references/multi-exercise-form-candidates.json.

## Training framework

Run `python train_form_head.py --manifest <file.jsonl> --exercise "Jumping jacks"`.
Registry and upload/live routing support Push-ups, Squats, Sit-ups, Jumping jacks,
Lunges and Biceps curls. This is not six functioning form models.

Manifest fields: video (relative path), exercise, label (`correct`/`incorrect`),
label_source (`human`/`coach_feedback`), source_url and subject_id or session_id.
Use person identity whenever known; all clips of a person must share subject_id.
Duplicate video bytes are rejected; near-duplicates and identity need inspection.
Normalization fits training data only. Both splits must contain both labels.

New weights are candidate_not_validated and never automatically served.
Independent evaluation is needed before explicit approved_experimental metadata
approval. Changing the flag alone does not establish quality. Artificial weights
in isolated unit tests verify routing only, never posture accuracy.
Exercise overrides are clearly user input, not auto recognition.

## Remaining data

No suitable downloadable correct/incorrect sit-up video dataset has been verified.
Action-only sit-up examples and EMG/IMU labels cannot establish camera-based form
correctness. Fit3D requires an account; access restrictions are respected.

[Mendeley good/bad exercise videos](https://data.mendeley.com/datasets/kgbb3yn47p/3)
describes manually reviewed videos from 26 participants including squats and
alternating curls. Download-list access returned HTTP403/browser challenge.
No data from it were downloaded and no access controls were bypassed.

Sit-ups, jumping jacks, squats, lunges and curls still lack enabled verified form
models. Error localization, corrective advice, valid/invalid completed reps and
physical-webcam validation remain unfinished. Do not claim this work is complete.

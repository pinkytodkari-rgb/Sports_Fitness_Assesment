from collections import deque, Counter

from exercise_recognition.inference.config import (
    BUFFER_SIZE,
    MIN_VALID_PREDICTIONS,
    START_THRESHOLD,
    LOCK_RELEASE_FRAMES,
    SWITCH_FRAMES,
    PUSHUP_SWITCH_FRAMES,
)

class ExerciseLock:

    def __init__(self):

        # ----------------------------------------
        # Prediction Buffer
        # ----------------------------------------

        self.prediction_buffer = deque(
            maxlen=BUFFER_SIZE
        )

        # ----------------------------------------
        # Stable Prediction
        # ----------------------------------------

        self.stable_label = "No Exercise"

        self.stable_frames = 0

        self.candidate_label = None

        self.candidate_frames = 0

        # ----------------------------------------
        # Exercise Lock
        # ----------------------------------------

        self.locked_exercise = None

        self.exercise_started = False

        self.start_counter = 0

        self.frames_without_motion = 0

    # ------------------------------------------------
    # Update Prediction Buffer
    # ------------------------------------------------

    def update_prediction(self, validated_label):

        self.prediction_buffer.append(
            validated_label
        )

        valid_predictions = [

            p

            for p in self.prediction_buffer

            if p != "No Exercise"

        ]

        if len(valid_predictions) < MIN_VALID_PREDICTIONS:
            return

        majority = Counter(
            valid_predictions
        ).most_common(1)[0][0]

        # ----------------------------------------
        # Stable Exercise
        # ----------------------------------------

        if majority == self.stable_label:

            self.stable_frames += 1

            self.candidate_label = None

            self.candidate_frames = 0

        else:

            if self.candidate_label == majority:

                self.candidate_frames += 1

            else:

                self.candidate_label = majority

                self.candidate_frames = 1

            required_frames = SWITCH_FRAMES

            if majority.lower() == "pushup":

                required_frames = PUSHUP_SWITCH_FRAMES

            if self.candidate_frames >= required_frames:

                self.stable_label = self.candidate_label

                self.locked_exercise = self.stable_label

                self.prediction_buffer.clear()

                self.stable_frames = 1

                self.candidate_label = None

                self.candidate_frames = 0

    # ------------------------------------------------
    # Motion Detected
    # ------------------------------------------------

    def motion_detected(self):

        self.frames_without_motion = 0

    # ------------------------------------------------
    # No Motion
    # ------------------------------------------------

    def no_motion(self):

        self.frames_without_motion += 1

        if self.frames_without_motion >= LOCK_RELEASE_FRAMES:

            self.reset()

    # ------------------------------------------------
    # Display Label
    # ------------------------------------------------

    def get_label(self):

        if self.locked_exercise is None:

            return "Recognizing..."

        if not self.exercise_started:

            self.start_counter += 1

            if self.start_counter >= START_THRESHOLD:

                self.exercise_started = True

                return self.locked_exercise

            return "Starting..."

        return self.locked_exercise

    # ------------------------------------------------
    # Reset
    # ------------------------------------------------

    def reset(self):

        self.prediction_buffer.clear()

        self.stable_label = "No Exercise"

        self.stable_frames = 0

        self.candidate_label = None

        self.candidate_frames = 0

        self.locked_exercise = None

        self.exercise_started = False

        self.start_counter = 0

        self.frames_without_motion = 0

    # ------------------------------------------------
    # Properties
    # ------------------------------------------------

    @property
    def locked(self):

        return self.locked_exercise is not None

    @property
    def candidate(self):

        return self.candidate_label
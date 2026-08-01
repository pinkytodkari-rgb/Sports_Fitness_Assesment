import os
import cv2
import mediapipe as mp

from collections import deque
from exercise_recognition.inference.predictor import Predictor
from exercise_recognition.inference.exercise_lock import ExerciseLock
from exercise_recognition.inference.movement_detector import MovementDetector
from exercise_recognition.inference.feature_extractor import extract_features
from exercise_recognition.inference.exercise_validator import validate_prediction
from exercise_recognition.inference.pose_quality import pose_quality

from exercise_recognition.inference.display import (
    calculate_fps,
    draw_display,
    show,
    exit_requested,
)

from exercise_recognition.inference.config import (
    CONFIDENCE_THRESHOLD,
    PUSHUP_CONFIDENCE,
)
# ----------------------------------------------------
# Paths
# ----------------------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

# ----------------------------------------------------
# Predictor
# ----------------------------------------------------

predictor = Predictor(BASE_DIR)

# ----------------------------------------------------
# Exercise Lock
# ----------------------------------------------------

exercise_lock = ExerciseLock()

# ----------------------------------------------------
# Movement Detector
# ----------------------------------------------------

movement_detector = MovementDetector()

# ----------------------------------------------------
# Confidence Buffer
# (Same logic as original code)
# ----------------------------------------------------

confidence_buffer = deque(maxlen=10)

smoothed_confidence = 0.0

display_confidence = 0.0

# ----------------------------------------------------
# MediaPipe Pose
# ----------------------------------------------------

mp_pose = mp.solutions.pose

mp_draw = mp.solutions.drawing_utils

pose = mp_pose.Pose(

    static_image_mode=False,

    model_complexity=1,

    smooth_landmarks=True,

    min_detection_confidence=0.6,

    min_tracking_confidence=0.6

)

# ----------------------------------------------------
# Webcam
# ----------------------------------------------------
VIDEO_PATH="C:/Users/Nirja/OneDrive/Desktop/cseds/IPD/2026/exercise_recognition/output.mp4"
cap = cv2.VideoCapture(VIDEO_PATH)

prev_time = cv2.getTickCount()
cv2.namedWindow(
    "Exercise Recognition",
    cv2.WINDOW_NORMAL
)

cv2.resizeWindow(
    "Exercise Recognition",
    1200,
    800
)
# ----------------------------------------------------
# Main Loop
# ----------------------------------------------------

while cap.isOpened():

    success, frame = cap.read()

    if not success:
        break

    frame = cv2.flip(frame, 1)

    rgb = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2RGB
    )

    result = pose.process(rgb)

    label = "No Pose"

    display_confidence = smoothed_confidence * 100

    # ------------------------------------------------
    # Pose Detected
    # ------------------------------------------------

    if result.pose_landmarks:

        landmarks = result.pose_landmarks.landmark

        mp_draw.draw_landmarks(

            frame,

            result.pose_landmarks,

            mp_pose.POSE_CONNECTIONS

        )

        # --------------------------------------------
        # Pose Quality Check
        # --------------------------------------------

        quality = pose_quality(
            landmarks
        )

        if quality < 0.60:

            label = "Show Full Body"

            exercise_lock.reset()

            confidence_buffer.clear()

            smoothed_confidence = 0

        else:

            # ----------------------------------------
            # Feature Extraction
            # ----------------------------------------

            features = extract_features(
                landmarks
            )

            # ----------------------------------------
            # Movement Detection
            # ----------------------------------------

            moving = movement_detector.update(
                features
            )
                        # ----------------------------------------
            # PERSON MOVING
            # ----------------------------------------

            if moving:

                exercise_lock.motion_detected()

                predicted_label, confidence = predictor.predict(
                    features
                )

                # ------------------------------------
                # Confidence smoothing (same as original)
                # ------------------------------------

                confidence_buffer.append(confidence)

                smoothed_confidence = (

                    sum(confidence_buffer)

                    /

                    len(confidence_buffer)

                )

                print(
                    predicted_label,
                    f"{smoothed_confidence:.2f}"
                )

                # ------------------------------------
                # Confidence Threshold
                # ------------------------------------

                required_confidence = CONFIDENCE_THRESHOLD

                if predicted_label.lower() == "pushup":

                    required_confidence = PUSHUP_CONFIDENCE

                if smoothed_confidence >= required_confidence:

                    validated_label = validate_prediction(

                        predicted_label.lower(),

                        smoothed_confidence,

                        landmarks

                    )

                else:

                    validated_label = "No Exercise"

                print("---------------------------")
                print("Predicted :", predicted_label)
                print("Validated :", validated_label)
                print("---------------------------")

                # ------------------------------------
                # Exercise Lock
                # ------------------------------------

                exercise_lock.update_prediction(
                    validated_label
                )

                label = exercise_lock.get_label()

                display_confidence = (
                    smoothed_confidence * 100
                )

            # ----------------------------------------
            # PERSON NOT MOVING
            # ----------------------------------------

            else:

                exercise_lock.no_motion()

                if exercise_lock.locked:

                    label = exercise_lock.get_label()

                else:

                    label = "No Movement"

                if not exercise_lock.locked:

                    confidence_buffer.clear()

                    smoothed_confidence = 0

                    display_confidence = 0

       # ------------------------------------------------
    # FPS
    # ------------------------------------------------

    fps, prev_time = calculate_fps(
        prev_time
    )

    # ------------------------------------------------
    # Display
    # ------------------------------------------------

    draw_display(

        frame,

        label,

        display_confidence,

        fps,

        exercise_lock.locked,

        exercise_lock.candidate

    )

    show(frame)

    # ------------------------------------------------
    # Exit
    # ------------------------------------------------

    if exit_requested():

        break


# ----------------------------------------------------
# Cleanup
# ----------------------------------------------------

cap.release()

cv2.destroyAllWindows()
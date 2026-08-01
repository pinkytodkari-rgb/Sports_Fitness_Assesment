import cv2
import mediapipe as mp

# --------------------------------------------------
# Project Imports
# --------------------------------------------------

from posture_assessment.pushup_assessment.inference.pushup_inference import (
    PushupInference,
)

from posture_assessment.common.realtime_feature_extractor import (
    extract_features,
)

from posture_assessment.pushup_assessment.inference.rep_counter import (
    PushupCounter,
)

from posture_assessment.pushup_assessment.inference.rule_engine import (
    analyze_pose,
    is_valid_pushup_position,
)


# --------------------------------------------------
# Load Model
# --------------------------------------------------

model = PushupInference()

counter = PushupCounter()

# --------------------------------------------------
# MediaPipe
# --------------------------------------------------

mp_pose = mp.solutions.pose

pose = mp_pose.Pose(

    static_image_mode=False,

    model_complexity=1,

    smooth_landmarks=True,

    min_detection_confidence=0.5,

    min_tracking_confidence=0.5

)

# --------------------------------------------------
# Webcam
# --------------------------------------------------

cap = cv2.VideoCapture(0)

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

if not cap.isOpened():

    print("Cannot open webcam")

    exit()

# --------------------------------------------------
# Main Loop
# --------------------------------------------------

while True:

    ret, frame = cap.read()

    if not ret:

        break

    # Mirror webcam

    frame = cv2.flip(frame, 1)

    rgb = cv2.cvtColor(

        frame,

        cv2.COLOR_BGR2RGB

    )

    result = pose.process(rgb)

    if result.pose_landmarks:

        landmarks = result.pose_landmarks.landmark

        # ----------------------------------
        # Feature Extraction
        # ----------------------------------

        features = extract_features(

            landmarks

        )

        # ----------------------------------
        # Neural Network Prediction
        # ----------------------------------

        prediction = model.predict(

            features

        )

        # ----------------------------------
        # Rule Engine
        # ----------------------------------

        status = analyze_pose(

            landmarks

        )

        valid = is_valid_pushup_position(

            landmarks

        )

        form_correct = (

            prediction["correct"]

            and

            valid

        )

        # ----------------------------------
        # Rep Counter
        # ----------------------------------

        shoulder_y = landmarks[11].y

        hip_y = landmarks[23].y

        reps = counter.update(

            status["elbow_angle"],

            shoulder_y,

            hip_y,

            form_correct

        )

        # ----------------------------------
        # Display
        # ----------------------------------

        color = (

            (0,255,0)

            if form_correct

            else

            (0,0,255)

        )

        text = (

            "Correct"

            if form_correct

            else

            "Wrong"

        )

        cv2.putText(

            frame,

            f"Reps : {reps}",

            (20,40),

            cv2.FONT_HERSHEY_SIMPLEX,

            1,

            (255,255,255),

            2

        )

        cv2.putText(

            frame,

            f"Form : {text}",

            (20,80),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.8,

            color,

            2

        )

        cv2.putText(

            frame,

            f"Confidence : {prediction['confidence']:.2f}",

            (20,120),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.7,

            (255,255,0),

            2

        )

        cv2.putText(

            frame,

            f"Elbow : {int(status['elbow_angle'])}",

            (20,160),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.7,

            (255,255,255),

            2

        )

        cv2.putText(

            frame,

            f"Body : {int(status['body_angle'])}",

            (20,200),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.7,

            (255,255,255),

            2

        )

        cv2.putText(

            frame,

            f"State : {counter.state}",

            (20,240),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.7,

            (0,255,255),

            2

        )

        if status["feedback"]:

            cv2.putText(

                frame,

                status["feedback"][0],

                (20,280),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.7,

                (0,0,255),

                2

            )

        if not valid:

            cv2.putText(

                frame,

                "Invalid Position",

                (20,320),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.7,

                (0,0,255),

                2

            )

        mp.solutions.drawing_utils.draw_landmarks(

            frame,

            result.pose_landmarks,

            mp_pose.POSE_CONNECTIONS

        )

    else:

        cv2.putText(

            frame,

            "No Person",

            (20,40),

            cv2.FONT_HERSHEY_SIMPLEX,

            1,

            (0,0,255),

            2

        )

    cv2.imshow(

        "Pushup Webcam Test",

        frame

    )

    key = cv2.waitKey(1)

    if key == 27:      # ESC

        break

cap.release()

pose.close()

cv2.destroyAllWindows()
import os
import cv2
import mediapipe as mp
import pandas as pd
import sys

# -------------------------------------------------
# Project Root
# -------------------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

sys.path.append(BASE_DIR)

# -------------------------------------------------
# Imports
# -------------------------------------------------

from inference.feature_extractor import extract_features

# -------------------------------------------------
# Dataset
# -------------------------------------------------

DATASET_DIR = os.path.join(
    BASE_DIR,
    "dataset"
)

CLASSES = [

    "pushup",
    "squat",
    "situp",
    "jumpingjack"

]

# -------------------------------------------------
# MediaPipe
# -------------------------------------------------

mp_pose = mp.solutions.pose

pose = mp_pose.Pose(

    static_image_mode=False,

    model_complexity=1,

    smooth_landmarks=True,

    min_detection_confidence=0.5,

    min_tracking_confidence=0.5

)

# -------------------------------------------------
# Feature Names
# -------------------------------------------------

feature_names = [

    "left_elbow",
    "right_elbow",

    "left_shoulder",
    "right_shoulder",

    "left_hip",
    "right_hip",

    "left_knee",
    "right_knee",

    "shoulder_width",
    "hip_width",

    "left_upper_arm",
    "right_upper_arm",

    "left_forearm",
    "right_forearm",

    "left_thigh",
    "right_thigh",

    "left_leg",
    "right_leg",

    "shoulder_hip_left",
    "shoulder_hip_right",

    "hip_ankle_left",
    "hip_ankle_right",

    "nose_left",
    "nose_right",

    "nose_y",

    "left_shoulder_y",
    "right_shoulder_y",

    "left_elbow_y",
    "right_elbow_y",

    "left_hip_y",
    "right_hip_y",

    "left_knee_y",
    "right_knee_y",

    "left_ankle_y",
    "right_ankle_y"

]

rows = []

# -------------------------------------------------
# Read Videos
# -------------------------------------------------

for label in CLASSES:

    folder = os.path.join(
        DATASET_DIR,
        label
    )

    if not os.path.exists(folder):

        continue

    print(f"\nProcessing {label}")

    for video in os.listdir(folder):

        if not video.lower().endswith(

            (".mp4", ".avi", ".mov", ".mkv")

        ):

            continue

        path = os.path.join(

            folder,

            video

        )

        cap = cv2.VideoCapture(path)

        frame_count = 0

        while True:

            success, frame = cap.read()

            if not success:

                break

            frame_count += 1

            # -------------------------------------
            # Skip Frames
            # (Keeps dataset balanced)
            # -------------------------------------

            if frame_count % 3 != 0:

                continue

            rgb = cv2.cvtColor(

                frame,

                cv2.COLOR_BGR2RGB

            )

            result = pose.process(rgb)

            if not result.pose_landmarks:

                continue

            landmarks = result.pose_landmarks.landmark

            try:

                features = extract_features(

                    landmarks

                )

                rows.append(

                    features + [label]

                )

            except:

                continue

        cap.release()

# -------------------------------------------------
# Save CSV
# -------------------------------------------------

columns = feature_names + ["label"]

df = pd.DataFrame(

    rows,

    columns=columns

)

OUTPUT = os.path.join(

    BASE_DIR,

    "extracted_csv"

)

os.makedirs(

    OUTPUT,

    exist_ok=True

)

csv_path = os.path.join(

    OUTPUT,

    "features.csv"

)

df.to_csv(

    csv_path,

    index=False

)

print("\n===============================")
print("Dataset Created Successfully")
print("===============================")

print(df.head())

print("\nShape:", df.shape)

pose.close()
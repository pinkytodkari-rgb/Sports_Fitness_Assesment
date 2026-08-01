import math
from ml_model.posture_assessment.common.angles import calculate_angle

# -----------------------------
# MediaPipe Landmark Indices
# -----------------------------
LEFT_SHOULDER = 11
RIGHT_SHOULDER = 12

LEFT_ELBOW = 13
RIGHT_ELBOW = 14

LEFT_WRIST = 15
RIGHT_WRIST = 16

LEFT_HIP = 23
RIGHT_HIP = 24

LEFT_KNEE = 25
RIGHT_KNEE = 26

LEFT_ANKLE = 27
RIGHT_ANKLE = 28

NOSE = 0


# -----------------------------
# Utility Functions
# -----------------------------
def xy(landmarks, idx):
    return (
        landmarks[idx].x,
        landmarks[idx].y
    )


def distance(a, b):
    return math.sqrt(
        (a[0] - b[0]) ** 2 +
        (a[1] - b[1]) ** 2
    )


# -----------------------------
# Feature Extraction
# -----------------------------
def extract_features(landmarks, previous=None):

    # -----------------------------
    # Coordinates
    # -----------------------------
    ls = xy(landmarks, LEFT_SHOULDER)
    rs = xy(landmarks, RIGHT_SHOULDER)

    le = xy(landmarks, LEFT_ELBOW)
    re = xy(landmarks, RIGHT_ELBOW)

    lw = xy(landmarks, LEFT_WRIST)
    rw = xy(landmarks, RIGHT_WRIST)

    lh = xy(landmarks, LEFT_HIP)
    rh = xy(landmarks, RIGHT_HIP)

    lk = xy(landmarks, LEFT_KNEE)
    rk = xy(landmarks, RIGHT_KNEE)

    la = xy(landmarks, LEFT_ANKLE)
    ra = xy(landmarks, RIGHT_ANKLE)

    nose = xy(landmarks, NOSE)

    # -----------------------------
    # Joint Angles
    # -----------------------------
    left_elbow = calculate_angle(ls, le, lw)
    right_elbow = calculate_angle(rs, re, rw)

    left_back = calculate_angle(ls, lh, lk)
    right_back = calculate_angle(rs, rh, rk)

    left_knee = calculate_angle(lh, lk, la)
    right_knee = calculate_angle(rh, rk, ra)

    # -----------------------------
    # Distances
    # -----------------------------
    shoulder_width = distance(ls, rs)
    hip_width = distance(lh, rh)

    shoulder_hip_left = distance(ls, lh)
    shoulder_hip_right = distance(rs, rh)

    nose_left = distance(nose, ls)
    nose_right = distance(nose, rs)

    # -----------------------------
    # Symmetry
    # -----------------------------
    elbow_difference = abs(left_elbow - right_elbow)
    back_difference = abs(left_back - right_back)

    shoulder_height_diff = abs(ls[1] - rs[1])
    hip_height_diff = abs(lh[1] - rh[1])

    # -----------------------------
    # Positions
    # -----------------------------
    nose_y = nose[1]

    left_shoulder_y = ls[1]
    right_shoulder_y = rs[1]

    left_hip_y = lh[1]
    right_hip_y = rh[1]

    avg_shoulder_y = (left_shoulder_y + right_shoulder_y) / 2
    avg_hip_y = (left_hip_y + right_hip_y) / 2

    # -----------------------------
    # Motion Features
    # -----------------------------
    if previous is None:

        left_elbow_velocity = 0
        right_elbow_velocity = 0

        left_back_velocity = 0
        right_back_velocity = 0

        hip_velocity = 0

        shoulder_velocity = 0

        nose_velocity = 0

    else:

        left_elbow_velocity = (
            left_elbow - previous["left_elbow"]
        )

        right_elbow_velocity = (
            right_elbow - previous["right_elbow"]
        )

        left_back_velocity = (
            left_back - previous["left_back"]
        )

        right_back_velocity = (
            right_back - previous["right_back"]
        )

        hip_velocity = (
            avg_hip_y - previous["hip_y"]
        )

        shoulder_velocity = (
            avg_shoulder_y - previous["shoulder_y"]
        )

        nose_velocity = (
            nose_y - previous["nose_y"]
        )

    # -----------------------------
    # Feature Vector
    # -----------------------------
    features = [

        # Joint Angles
        left_elbow,
        right_elbow,

        left_back,
        right_back,

        left_knee,
        right_knee,

        # Distances
        shoulder_width,
        hip_width,

        shoulder_hip_left,
        shoulder_hip_right,

        nose_left,
        nose_right,

        # Symmetry
        elbow_difference,
        back_difference,

        shoulder_height_diff,
        hip_height_diff,

        # Position
        nose_y,

        left_shoulder_y,
        right_shoulder_y,

        left_hip_y,
        right_hip_y,

        # Motion
        left_elbow_velocity,
        right_elbow_velocity,

        left_back_velocity,
        right_back_velocity,

        hip_velocity,

        shoulder_velocity,

        nose_velocity

    ]

    # -----------------------------
    # Save current values
    # -----------------------------
    current = {

        "left_elbow": left_elbow,
        "right_elbow": right_elbow,

        "left_back": left_back,
        "right_back": right_back,

        "hip_y": avg_hip_y,

        "shoulder_y": avg_shoulder_y,

        "nose_y": nose_y

    }

    return features, current
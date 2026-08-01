import numpy as np
import mediapipe as mp

# -----------------------------
# Landmark indices
# -----------------------------

NOSE = 0

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


# -----------------------------
# Angle
# -----------------------------

def calculate_angle(a, b, c):

    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    radians = np.arctan2(
        c[1]-b[1],
        c[0]-b[0]
    ) - np.arctan2(
        a[1]-b[1],
        a[0]-b[0]
    )

    angle = np.abs(
        radians * 180.0 / np.pi
    )

    if angle > 180:
        angle = 360-angle

    return angle


# -----------------------------
# Distance
# -----------------------------

def distance(a, b):

    return np.linalg.norm(
        np.array(a)-np.array(b)
    )


# -----------------------------
# Feature Extraction
# -----------------------------

def extract_features(landmarks):

    lm = landmarks

    nose = [lm[NOSE].x, lm[NOSE].y]

    ls = [lm[LEFT_SHOULDER].x, lm[LEFT_SHOULDER].y]
    rs = [lm[RIGHT_SHOULDER].x, lm[RIGHT_SHOULDER].y]

    le = [lm[LEFT_ELBOW].x, lm[LEFT_ELBOW].y]
    re = [lm[RIGHT_ELBOW].x, lm[RIGHT_ELBOW].y]

    lw = [lm[LEFT_WRIST].x, lm[LEFT_WRIST].y]
    rw = [lm[RIGHT_WRIST].x, lm[RIGHT_WRIST].y]

    lh = [lm[LEFT_HIP].x, lm[LEFT_HIP].y]
    rh = [lm[RIGHT_HIP].x, lm[RIGHT_HIP].y]

    lk = [lm[LEFT_KNEE].x, lm[LEFT_KNEE].y]
    rk = [lm[RIGHT_KNEE].x, lm[RIGHT_KNEE].y]

    la = [lm[LEFT_ANKLE].x, lm[LEFT_ANKLE].y]
    ra = [lm[RIGHT_ANKLE].x, lm[RIGHT_ANKLE].y]

    features = [

        calculate_angle(ls, le, lw),
        calculate_angle(rs, re, rw),

        calculate_angle(le, ls, lh),
        calculate_angle(re, rs, rh),

        calculate_angle(ls, lh, lk),
        calculate_angle(rs, rh, rk),

        calculate_angle(lh, lk, la),
        calculate_angle(rh, rk, ra),

        distance(ls, rs),
        distance(lh, rh),

        distance(ls, le),
        distance(rs, re),

        distance(le, lw),
        distance(re, rw),

        distance(lh, lk),
        distance(rh, rk),

        distance(lk, la),
        distance(rk, ra),

        distance(ls, lh),
        distance(rs, rh),

        distance(lh, la),
        distance(rh, ra),

        abs(nose[0]-ls[0]),
        abs(nose[0]-rs[0]),

        nose[1],

        ls[1],
        rs[1],

        le[1],
        re[1],

        lh[1],
        rh[1],

        lk[1],
        rk[1],

        la[1],
        ra[1]
    ]

    return np.array(
        features,
        dtype=np.float32
    )
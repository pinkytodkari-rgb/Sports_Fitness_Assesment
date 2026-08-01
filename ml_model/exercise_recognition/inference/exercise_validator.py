import math

# ---------------------------------------------------
# Landmark indices
# ---------------------------------------------------

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


# ---------------------------------------------------
# Utility Functions
# ---------------------------------------------------

def point(landmarks, idx):
    return (
        landmarks[idx].x,
        landmarks[idx].y
    )


def distance(a, b):
    return math.sqrt(
        (a[0]-b[0])**2 +
        (a[1]-b[1])**2
    )


def angle(a, b, c):

    ba = (a[0]-b[0], a[1]-b[1])
    bc = (c[0]-b[0], c[1]-b[1])

    dot = ba[0]*bc[0] + ba[1]*bc[1]

    mag1 = math.sqrt(ba[0]**2 + ba[1]**2)
    mag2 = math.sqrt(bc[0]**2 + bc[1]**2)

    if mag1 == 0 or mag2 == 0:
        return 0

    cosine = dot/(mag1*mag2)
    cosine = max(-1, min(1, cosine))

    return math.degrees(math.acos(cosine))


# ---------------------------------------------------

def visible(landmarks, idx):
    return landmarks[idx].visibility > 0.5


# ---------------------------------------------------

def left_visible(landmarks):

    ids = [
        LEFT_SHOULDER,
        LEFT_ELBOW,
        LEFT_WRIST,
        LEFT_HIP,
        LEFT_KNEE,
        LEFT_ANKLE
    ]

    return all(visible(landmarks, i) for i in ids)


# ---------------------------------------------------

def right_visible(landmarks):

    ids = [
        RIGHT_SHOULDER,
        RIGHT_ELBOW,
        RIGHT_WRIST,
        RIGHT_HIP,
        RIGHT_KNEE,
        RIGHT_ANKLE
    ]

    return all(visible(landmarks, i) for i in ids)


# ---------------------------------------------------

def side(landmarks):

    if left_visible(landmarks):
        return "left"

    if right_visible(landmarks):
        return "right"

    return None


# ---------------------------------------------------

def get_points(landmarks):

    s = side(landmarks)

    if s == "left":

        shoulder = point(landmarks, LEFT_SHOULDER)
        elbow = point(landmarks, LEFT_ELBOW)
        wrist = point(landmarks, LEFT_WRIST)
        hip = point(landmarks, LEFT_HIP)
        knee = point(landmarks, LEFT_KNEE)
        ankle = point(landmarks, LEFT_ANKLE)

    elif s == "right":

        shoulder = point(landmarks, RIGHT_SHOULDER)
        elbow = point(landmarks, RIGHT_ELBOW)
        wrist = point(landmarks, RIGHT_WRIST)
        hip = point(landmarks, RIGHT_HIP)
        knee = point(landmarks, RIGHT_KNEE)
        ankle = point(landmarks, RIGHT_ANKLE)

    else:
        return None

    return shoulder, elbow, wrist, hip, knee, ankle


# ---------------------------------------------------
# Pushup
# ---------------------------------------------------

def valid_pushup(landmarks):

    pts = get_points(landmarks)

    if pts is None:
        return False

    shoulder, elbow, wrist, hip, knee, ankle = pts

    body_angle = angle(
        shoulder,
        hip,
        ankle
    )

    return (
        body_angle > 150 and
        abs(shoulder[1] - hip[1]) < 0.15
    )


# ---------------------------------------------------
# Squat
# ---------------------------------------------------

def valid_squat(landmarks):

    pts = get_points(landmarks)

    if pts is None:
        return False

    shoulder, elbow, wrist, hip, knee, ankle = pts

    knee_angle = angle(
        hip,
        knee,
        ankle
    )

    body_angle = angle(
        shoulder,
        hip,
        knee
    )

    return (
        knee_angle < 150 and
        body_angle > 130
    )


# ---------------------------------------------------
# Situp
# ---------------------------------------------------

def valid_situp(landmarks):

    pts = get_points(landmarks)

    if pts is None:
        return False

    shoulder, elbow, wrist, hip, knee, ankle = pts

    body_angle = angle(
        shoulder,
        hip,
        knee
    )

    knee_angle = angle(
        hip,
        knee,
        ankle
    )

    wrist_above_shoulder = wrist[1] < shoulder[1]

    ankle_to_hip = abs(ankle[1] - hip[1])

    return (
        body_angle < 125 and
        knee_angle < 150 and
        not wrist_above_shoulder and
        ankle_to_hip < 0.45
    )


# ---------------------------------------------------
# Jumping Jack
# ---------------------------------------------------

def valid_jumpingjack(landmarks):

    if not (left_visible(landmarks) and right_visible(landmarks)):
        return False

    ls = point(landmarks, LEFT_SHOULDER)
    rs = point(landmarks, RIGHT_SHOULDER)

    lw = point(landmarks, LEFT_WRIST)
    rw = point(landmarks, RIGHT_WRIST)

    la = point(landmarks, LEFT_ANKLE)
    ra = point(landmarks, RIGHT_ANKLE)

    shoulder_width = distance(ls, rs)
    ankle_width = distance(la, ra)

    left_up = lw[1] < ls[1]
    right_up = rw[1] < rs[1]

    return (
        ankle_width > shoulder_width * 1.4 and
        left_up and
        right_up
    )


# ---------------------------------------------------
# Master Validator
# ---------------------------------------------------

def validate_prediction(label, confidence, landmarks):

    if label == "pushup":

        required = 0.75

    else:

        required = 0.90

    if confidence < required:
        return "No Exercise"

    if label == "pushup":

        if valid_pushup(landmarks):
            return "pushup"

    elif label == "squat":

        if valid_squat(landmarks):
            return "squat"

    elif label == "situp":

        if valid_situp(landmarks):
            return "situp"

    elif label == "jumpingjack":

        if valid_jumpingjack(landmarks):
            return "jumpingjack"

    return "No Exercise"
import math

from posture_assessment.common.angles import calculate_angle



# ==================================================
# Distance
# ==================================================

def distance(a, b):

    return math.sqrt(
        (a[0] - b[0]) ** 2 +
        (a[1] - b[1]) ** 2
    )



# ==================================================
# Select visible body side
# ==================================================

def get_side_points(landmarks):


    left_score = (

        landmarks[11].visibility +
        landmarks[13].visibility +
        landmarks[15].visibility +

        landmarks[23].visibility +
        landmarks[25].visibility +
        landmarks[27].visibility

    )


    right_score = (

        landmarks[12].visibility +
        landmarks[14].visibility +
        landmarks[16].visibility +

        landmarks[24].visibility +
        landmarks[26].visibility +
        landmarks[28].visibility

    )



    # Left side is clearer

    if left_score >= right_score:


        return (

            (landmarks[11].x, landmarks[11].y), # shoulder
            (landmarks[13].x, landmarks[13].y), # elbow
            (landmarks[15].x, landmarks[15].y), # wrist

            (landmarks[23].x, landmarks[23].y), # hip
            (landmarks[25].x, landmarks[25].y), # knee
            (landmarks[27].x, landmarks[27].y)  # ankle

        )



    # Right side clearer

    else:


        return (

            (landmarks[12].x, landmarks[12].y),
            (landmarks[14].x, landmarks[14].y),
            (landmarks[16].x, landmarks[16].y),

            (landmarks[24].x, landmarks[24].y),
            (landmarks[26].x, landmarks[26].y),
            (landmarks[28].x, landmarks[28].y)

        )



# ==================================================
# Full body visibility
# ==================================================

def is_full_body_visible(landmarks):


    # Important core points

    core = [

        11,12,   # shoulders
        23,24    # hips

    ]



    for idx in core:


        if landmarks[idx].visibility < 0.35:

            return False




    left_points = [

        13,
        15,
        25,
        27

    ]


    right_points = [

        14,
        16,
        26,
        28

    ]



    left_visible = sum(

        landmarks[i].visibility > 0.35

        for i in left_points

    )



    right_visible = sum(

        landmarks[i].visibility > 0.35

        for i in right_points

    )



    # One side is enough

    if left_visible >= 2 or right_visible >= 2:

        return True



    return False



# ==================================================
# Body in camera frame
# ==================================================

def is_body_in_frame(landmarks):


    points = [

        11,
        12,
        23,
        24,
        27,
        28

    ]


    xs = [

        landmarks[i].x

        for i in points

    ]


    ys = [

        landmarks[i].y

        for i in points

    ]



    if min(xs) < 0.02:

        return False


    if max(xs) > 0.98:

        return False


    if min(ys) < 0.02:

        return False


    if max(ys) > 0.98:

        return False



    return True



# ==================================================
# Visibility wrapper
# ==================================================

def check_visibility(landmarks):


    return (

        is_full_body_visible(landmarks)

        and

        is_body_in_frame(landmarks)

    )



# ==================================================
# Pose Analysis
# ==================================================

def analyze_pose(landmarks):


    feedback = []

    score = 100



    (
        shoulder,
        elbow,
        wrist,
        hip,
        knee,
        ankle

    ) = get_side_points(landmarks)



    # -----------------------------
    # Angles
    # -----------------------------


    elbow_angle = calculate_angle(

        shoulder,
        elbow,
        wrist

    )


    body_angle = calculate_angle(

        shoulder,
        hip,
        ankle

    )


    hip_angle = calculate_angle(

        shoulder,
        hip,
        knee

    )



    # -----------------------------
    # Body straight check
    # -----------------------------


    if body_angle < 125:


        feedback.append(

            "Keep body straight"

        )


        score -= 30



    # -----------------------------
    # Hip position
    # -----------------------------


    if hip_angle < 120:


        feedback.append(

            "Do not raise hips"

        )


        score -= 20



    # -----------------------------
    # Elbow feedback
    # -----------------------------


    if elbow_angle > 170:


        feedback.append(

            "Lower your body"

        )



    elif elbow_angle < 45:


        feedback.append(

            "Too deep"

        )



    return {


        "score": max(score,0),


        "feedback": feedback,


        "elbow_angle": elbow_angle,


        "body_angle": body_angle,


        "hip_angle": hip_angle

    }



# ==================================================
# Pushup position validation
# ==================================================

def is_valid_pushup_position(landmarks):


    if not check_visibility(landmarks):

        return False



    result = analyze_pose(
        landmarks
    )



    # Reject standing/head movements

    if result["body_angle"] < 125:

        return False



    return True
import math
from posture_assessment.common.angles import calculate_angle


# MediaPipe indices

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



def xy(landmarks, index):

    return (
        landmarks[index].x,
        landmarks[index].y
    )



def distance(a,b):

    return math.sqrt(
        (a[0]-b[0])**2 +
        (a[1]-b[1])**2
    )



def extract_features(landmarks):


    # Coordinates

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



    # Angles

    left_elbow = calculate_angle(
        ls, le, lw
    )

    right_elbow = calculate_angle(
        rs, re, rw
    )


    left_back = calculate_angle(
        ls, lh, lk
    )


    right_back = calculate_angle(
        rs, rh, rk
    )


    left_knee = calculate_angle(
        lh, lk, la
    )


    right_knee = calculate_angle(
        rh, rk, ra
    )



    # Distances

    shoulder_width = distance(
        ls,rs
    )

    hip_width = distance(
        lh,rh
    )


    shoulder_hip_left = distance(
        ls,lh
    )


    shoulder_hip_right = distance(
        rs,rh
    )


    nose_left = distance(
        nose,ls
    )


    nose_right = distance(
        nose,rs
    )



    # FINAL 17 FEATURES
    # SAME ORDER AS TRAINING


    features = [

        lh[1],                 # left_hip_y

        nose_right,

        shoulder_hip_right,

        rh[1],                 # right_hip_y

        rs[1],                 # right_shoulder_y

        shoulder_hip_left,

        shoulder_width,

        right_knee,

        left_back,

        left_knee,

        right_elbow,

        nose_left,

        ls[1],                 # left_shoulder_y

        right_back,

        left_elbow,

        nose[1],               # nose_y

        hip_width

    ]


    return features
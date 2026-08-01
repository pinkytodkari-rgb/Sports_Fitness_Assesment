IMPORTANT = [

11,12,
13,14,
15,16,
23,24,
25,26,
27,28

]


def pose_quality(landmarks):

    score = 0

    for idx in IMPORTANT:

        score += landmarks[idx].visibility

    score /= len(IMPORTANT)

    return score
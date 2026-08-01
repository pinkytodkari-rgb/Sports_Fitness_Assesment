import mediapipe as mp


mp_pose = mp.solutions.pose

mp_draw = mp.solutions.drawing_utils


pose = mp_pose.Pose(

    static_image_mode=False,

    model_complexity=1,

    smooth_landmarks=True,

    min_detection_confidence=0.6,

    min_tracking_confidence=0.6

)
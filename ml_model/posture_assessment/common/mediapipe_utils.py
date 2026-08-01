import cv2
import mediapipe as mp

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose

pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=1,
    smooth_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Function to detect pose landmarks
def get_landmarks(frame):

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    result = pose.process(rgb)

    if result.pose_landmarks:
        return result.pose_landmarks.landmark

    return None
import cv2


# ----------------------------------------------------
# FPS Calculation
# ----------------------------------------------------

def calculate_fps(prev_time):

    current_time = cv2.getTickCount()

    fps = cv2.getTickFrequency() / (

        current_time - prev_time

    )

    return fps, current_time


# ----------------------------------------------------
# Display Color
# ----------------------------------------------------

def get_color(label):

    if label == "No Pose":

        return (255, 255, 0)

    elif label == "Show Full Body":

        return (0, 0, 255)

    elif label == "No Movement":

        return (0, 165, 255)

    elif label == "No Exercise":

        return (0, 255, 255)

    elif label == "Recognizing...":

        return (255, 255, 255)

    elif label == "Starting...":

        return (255, 200, 0)

    else:

        return (0, 255, 0)


# ----------------------------------------------------
# Draw Everything
# ----------------------------------------------------

def draw_display(

    frame,

    label,

    confidence,

    fps,

    locked=False,

    candidate=None

):

    color = get_color(label)

    # ------------------------------------------------
    # Exercise
    # ------------------------------------------------

    cv2.putText(

        frame,

        f"Exercise : {label}",

        (20, 40),

        cv2.FONT_HERSHEY_SIMPLEX,

        1,

        color,

        2

    )

    # ------------------------------------------------
    # Confidence
    # ------------------------------------------------

    cv2.putText(

        frame,

        f"Confidence : {confidence:.1f}%",

        (20, 80),

        cv2.FONT_HERSHEY_SIMPLEX,

        0.8,

        (255, 255, 255),

        2

    )

    # ------------------------------------------------
    # FPS
    # ------------------------------------------------

    cv2.putText(

        frame,

        f"FPS : {fps:.1f}",

        (20, 120),

        cv2.FONT_HERSHEY_SIMPLEX,

        0.8,

        (255, 0, 0),

        2

    )

    # ------------------------------------------------
    # Locked Exercise
    # ------------------------------------------------

    if locked:

        cv2.putText(

            frame,

            "LOCKED",

            (20, 160),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.8,

            (0, 255, 0),

            2

        )

    # ------------------------------------------------
    # Candidate Exercise
    # ------------------------------------------------

    if candidate is not None:

        cv2.putText(

            frame,

            f"Switching -> {candidate}",

            (20, 200),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.7,

            (0, 255, 255),

            2

        )


# ----------------------------------------------------
# Show Window
# ----------------------------------------------------

def show(frame):

    cv2.imshow(

        "Exercise Recognition",

        frame

    )


# ----------------------------------------------------
# Exit Key
# ----------------------------------------------------

def exit_requested():

    key = cv2.waitKey(1) & 0xFF

    return key == ord("q")
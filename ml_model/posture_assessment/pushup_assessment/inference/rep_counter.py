from collections import deque


class PushupCounter:

    def __init__(self):

        self.count = 0

        self.state = "UP"

        # smoothing

        self.elbow_history = deque(maxlen=5)
        self.shoulder_history = deque(maxlen=5)
        self.hip_history = deque(maxlen=5)

        # cooldown after counting

        self.cooldown = 0

    # --------------------------------------------------

    def update(

        self,

        elbow_angle,

        shoulder_y,

        hip_y,

        form_correct

    ):

        # -----------------------------------------
        # Cooldown
        # -----------------------------------------

        if self.cooldown > 0:

            self.cooldown -= 1

        # -----------------------------------------
        # Store history
        # -----------------------------------------

        self.elbow_history.append(elbow_angle)

        self.shoulder_history.append(shoulder_y)

        self.hip_history.append(hip_y)

        if len(self.elbow_history) < 5:

            return self.count

        # -----------------------------------------
        # Smoothed values
        # -----------------------------------------

        avg_elbow = sum(self.elbow_history) / len(self.elbow_history)

        shoulder_move = (

            max(self.shoulder_history)

            -

            min(self.shoulder_history)

        )

        hip_move = (

            max(self.hip_history)

            -

            min(self.hip_history)

        )

        body_moving = (

            shoulder_move > 0.015

            and

            hip_move > 0.010

        )

        # -----------------------------------------
        # If form becomes wrong,
        # don't count until corrected
        # -----------------------------------------

        if not form_correct:

            return self.count

        # -----------------------------------------
        # DOWN
        # -----------------------------------------

        if self.state == "UP":

            if (

                avg_elbow < 120

                and

                body_moving

                and

                self.cooldown == 0

            ):

                self.state = "DOWN"

        # -----------------------------------------
        # UP
        # -----------------------------------------

        elif self.state == "DOWN":

            if avg_elbow > 160:

                self.count += 1

                self.state = "UP"

                self.cooldown = 8

                self.elbow_history.clear()

                self.shoulder_history.clear()

                self.hip_history.clear()

        return self.count
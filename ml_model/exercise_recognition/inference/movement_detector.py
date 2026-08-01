from collections import deque
import numpy as np


class MovementDetector:

    def __init__(self):

        self.history = deque(maxlen=8)

        self.threshold = 0.004

    def update(self, features):

        y = np.array(features[-11:])

        self.history.append(y)

        if len(self.history) < 8:
            return False

        history = np.array(self.history)

        diff = np.diff(history, axis=0)

        movement = np.mean(np.abs(diff))

        # Debug
        print("Movement =", movement)

        return movement > self.threshold
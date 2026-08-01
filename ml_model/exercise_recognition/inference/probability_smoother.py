from collections import deque
import numpy as np


class ProbabilitySmoother:

    def __init__(self, size=15):

        self.buffer = deque(maxlen=size)

    def update(self, probs):

        self.buffer.append(probs)

        avg = np.mean(self.buffer, axis=0)

        return avg
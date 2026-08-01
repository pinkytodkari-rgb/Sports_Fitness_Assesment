import os
import json
import numpy as np
import tensorflow as tf
class PushupInference:

    def __init__(self):
        # Absolute path to the models folder

        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

        MODEL_DIR = os.path.join(BASE_DIR, "models")
        # -----------------------------
        # Load TFLite model
        # -----------------------------

        self.interpreter = tf.lite.Interpreter(
            model_path=os.path.join(
                MODEL_DIR,
                "pushup_model.tflite"
            )
        )

        self.interpreter.allocate_tensors()

        self.input_details = self.interpreter.get_input_details()

        self.output_details = self.interpreter.get_output_details()

        # -----------------------------
        # Load normalization values
        # -----------------------------

        with open(
            os.path.join(
                MODEL_DIR,
                "pushup_scaler.json"
            ),
            "r"
        ) as f:

            scaler = json.load(f)

        self.mean = np.array(
            scaler["mean"],
            dtype=np.float32
        )

        self.scale = np.array(
            scaler["scale"],
            dtype=np.float32
        )

    # --------------------------------------------------

    def normalize(self, features):

        features = np.array(
            features,
            dtype=np.float32
        )

        return (features - self.mean) / self.scale

    # --------------------------------------------------

    def predict(self, features):

        features = self.normalize(features)

        features = features.reshape(1, -1).astype(np.float32)

        self.interpreter.set_tensor(

            self.input_details[0]["index"],

            features

        )

        self.interpreter.invoke()

        probability = self.interpreter.get_tensor(

            self.output_details[0]["index"]

        )[0][0]

        prediction = probability >= 0.5

        return {

            "correct": bool(prediction),

            "confidence": float(probability)

        }
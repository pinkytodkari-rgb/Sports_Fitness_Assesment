import os
import joblib
import numpy as np
import tensorflow as tf


class Predictor:

    def __init__(self, base_dir):

        model_path = os.path.join(
            base_dir,
            "models",
            "exercise_model.tflite"
        )

        scaler_path = os.path.join(
            base_dir,
            "models",
            "scaler.pkl"
        )

        encoder_path = os.path.join(
            base_dir,
            "models",
            "label_encoder.pkl"
        )

        self.interpreter = tf.lite.Interpreter(
            model_path=model_path
        )

        self.interpreter.allocate_tensors()

        self.input_details = self.interpreter.get_input_details()

        self.output_details = self.interpreter.get_output_details()

        self.scaler = joblib.load(scaler_path)

        self.encoder = joblib.load(encoder_path)

    def predict(self, features):

        sample = np.array(
            features,
            dtype=np.float32
        ).reshape(1, -1)

        sample = self.scaler.transform(sample)

        self.interpreter.set_tensor(
            self.input_details[0]["index"],
            sample.astype(np.float32)
        )

        self.interpreter.invoke()

        prediction = self.interpreter.get_tensor(
            self.output_details[0]["index"]
        )[0]

        idx = np.argmax(prediction)

        confidence = float(prediction[idx])

        label = self.encoder.inverse_transform(
            [idx]
        )[0]

        return label, confidence
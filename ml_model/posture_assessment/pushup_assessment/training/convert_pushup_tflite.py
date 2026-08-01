import os
import tensorflow as tf

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models"
)

model = tf.keras.models.load_model(
    os.path.join(
        MODEL_DIR,
        "pushup_model.keras"
    )
)

converter = tf.lite.TFLiteConverter.from_keras_model(model)

converter.optimizations = [
    tf.lite.Optimize.DEFAULT
]

tflite_model = converter.convert()

with open(
    os.path.join(
        MODEL_DIR,
        "pushup_model.tflite"
    ),
    "wb"
) as f:
    f.write(tflite_model)

print("Optimized model saved.")
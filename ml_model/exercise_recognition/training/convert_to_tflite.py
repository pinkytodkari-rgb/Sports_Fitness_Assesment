import os
import tensorflow as tf

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "exercise_model.keras"
)

OUTPUT_PATH = os.path.join(
    BASE_DIR,
    "models",
    "exercise_model.tflite"
)

print("Loading model...")

model = tf.keras.models.load_model(MODEL_PATH)

print("Converting to TensorFlow Lite...")

converter = tf.lite.TFLiteConverter.from_keras_model(model)

# Optimization for mobile
converter.optimizations = [tf.lite.Optimize.DEFAULT]

tflite_model = converter.convert()

with open(OUTPUT_PATH, "wb") as f:
    f.write(tflite_model)

print("\nSaved:")
print(OUTPUT_PATH)
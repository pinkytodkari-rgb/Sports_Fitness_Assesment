import os
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf

# =====================================================
# Project Directory
# =====================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

print("=" * 60)
print("BASE_DIR :", BASE_DIR)
print("=" * 60)

# =====================================================
# Load TensorFlow Lite Model
# =====================================================

model_path = os.path.join(
    BASE_DIR,
    "models",
    "exercise_model.tflite"
)

print("Loading model:")
print(model_path)

interpreter = tf.lite.Interpreter(
    model_path=model_path
)

interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

print("\nInput Shape :", input_details[0]["shape"])
print("Output Shape:", output_details[0]["shape"])

# =====================================================
# Load Scaler
# =====================================================

scaler_path = os.path.join(
    BASE_DIR,
    "models",
    "scaler.pkl"
)

print("\nLoading scaler:")
print(scaler_path)

scaler = joblib.load(scaler_path)

print("Scaler Type:", type(scaler))

# =====================================================
# Load Label Encoder
# =====================================================

encoder_path = os.path.join(
    BASE_DIR,
    "models",
    "label_encoder.pkl"
)

print("\nLoading Label Encoder:")
print(encoder_path)

encoder = joblib.load(encoder_path)

print("Encoder Type:", type(encoder))

if hasattr(encoder, "classes_"):
    print("Classes:", encoder.classes_)
else:
    print("Loaded object:", encoder)
    raise TypeError(
        "label_encoder.pkl is NOT a sklearn LabelEncoder."
    )

# =====================================================
# Load Dataset
# =====================================================

csv_path = os.path.join(
    BASE_DIR,
    "extracted_csv",
    "features.csv"
)

print("\nLoading dataset:")
print(csv_path)

df = pd.read_csv(csv_path)

print("Dataset Shape:", df.shape)

# =====================================================
# Prepare Features
# =====================================================

X = df.drop("label", axis=1)

y = encoder.transform(df["label"])

X = scaler.transform(X)

# =====================================================
# Test Predictions
# =====================================================

correct = 0
predictions = []

for i in range(len(X)):

    sample = X[i].astype(np.float32).reshape(1, -1)

    interpreter.set_tensor(
        input_details[0]["index"],
        sample
    )

    interpreter.invoke()

    pred = interpreter.get_tensor(
        output_details[0]["index"]
    )

    predicted = np.argmax(pred)

    predictions.append(predicted)

    if predicted == y[i]:
        correct += 1

accuracy = correct / len(X)

print("\n======================")
print("Full Dataset Results")
print("======================")
print(f"Samples : {len(X)}")
print(f"Correct : {correct}")
print(f"Accuracy: {accuracy:.4%}")
import os
import pickle
import numpy as np
import pandas as pd
import tensorflow as tf

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)
# -------------------------
# Paths
# -------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

DATASET_DIR = os.path.join(
    BASE_DIR,
    "dataset",
    "extracted_csv"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models"
)
# -------------------------
# Load dataset
# -------------------------

df = pd.read_csv(
    os.path.join(
        DATASET_DIR,
        "features.csv"
    )
)

features = [

    "left_hip_y",
    "nose_right",
    "shoulder_hip_right",
    "right_hip_y",
    "right_shoulder_y",
    "shoulder_hip_left",
    "shoulder_width",
    "right_knee",
    "left_back",
    "left_knee",
    "right_elbow",
    "nose_left",
    "left_shoulder_y",
    "right_back",
    "left_elbow",
    "nose_y",
    "hip_width"

]

X = df[features]

y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,
    test_size=0.2,
    stratify=y,
    random_state=42

)

# -------------------------
# Load scaler
# -------------------------
with open(
    os.path.join(
        MODEL_DIR,
        "pushup_scaler.pkl"
    ),
    "rb"
) as f:
    scaler = pickle.load(f)

X_test = scaler.transform(X_test)

# -------------------------
# Load model
# -------------------------

model = tf.keras.models.load_model(
    os.path.join(
        MODEL_DIR,
        "pushup_model.keras"
    )
)

# -------------------------
# Prediction
# -------------------------

prob = model.predict(X_test)

pred = (prob > 0.5).astype(int).flatten()

# -------------------------
# Metrics
# -------------------------

print("Accuracy :", accuracy_score(y_test,pred))
print("Precision:", precision_score(y_test,pred))
print("Recall   :", recall_score(y_test,pred))
print("F1 Score :", f1_score(y_test,pred))

print()

print(classification_report(
    y_test,
    pred
))

print()

print(confusion_matrix(
    y_test,
    pred
))
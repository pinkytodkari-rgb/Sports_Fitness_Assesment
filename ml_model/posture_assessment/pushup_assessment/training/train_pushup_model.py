import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.layers import Dropout
from tensorflow.keras.callbacks import EarlyStopping

import pickle
# -----------------------------
# Paths
# -----------------------------

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
# -----------------------------
# Load dataset
# -----------------------------
df = pd.read_csv(
    os.path.join(
        DATASET_DIR,
        "features.csv"
    )
)
# -----------------------------
# Features
# -----------------------------

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

# -----------------------------
# Train Test Split
# -----------------------------

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,
    test_size=0.2,
    stratify=y,
    random_state=42

)

# -----------------------------
# Standardize
# -----------------------------

scaler = StandardScaler()

X_train = scaler.fit_transform(X_train)

X_test = scaler.transform(X_test)

# save scaler
with open(
    os.path.join(
        MODEL_DIR,
        "pushup_scaler.pkl"
    ),
    "wb"
) as f:
    pickle.dump(scaler, f)

# -----------------------------
# Neural Network
# -----------------------------

model = Sequential()

model.add(Dense(64,input_shape=(17,),activation="relu"))

model.add(Dropout(0.2))

model.add(Dense(32,activation="relu"))

model.add(Dense(16,activation="relu"))

model.add(Dense(1,activation="sigmoid"))

# -----------------------------

model.compile(

    optimizer="adam",

    loss="binary_crossentropy",

    metrics=["accuracy"]

)

# -----------------------------

early = EarlyStopping(

    monitor="val_loss",

    patience=5,

    restore_best_weights=True

)

# -----------------------------

history = model.fit(

    X_train,

    y_train,

    validation_data=(X_test,y_test),

    epochs=50,

    batch_size=32,

    callbacks=[early]

)

# -----------------------------

loss,acc=model.evaluate(X_test,y_test)

print()

print("Accuracy:",acc)

# -----------------------------
model.save(
    os.path.join(
        MODEL_DIR,
        "pushup_model.keras"
    )
)

print("Model Saved")
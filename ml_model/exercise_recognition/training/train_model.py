import os

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.utils import (
    resample,
    class_weight
)

from sklearn.preprocessing import (
    StandardScaler,
    LabelEncoder
)

from sklearn.model_selection import train_test_split

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

from tensorflow.keras.models import Sequential

from tensorflow.keras.layers import (
    Dense,
    BatchNormalization,
    Dropout,
    Input
)

from tensorflow.keras.callbacks import (
    EarlyStopping,
    ReduceLROnPlateau,
    ModelCheckpoint
)

from tensorflow.keras.optimizers import Adam


# ======================================================
# Configuration
# ======================================================

RANDOM_STATE = 42

TARGET_SAMPLES = 3300

MODEL_DIR = os.path.join(BASE_DIR, "models")

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)


# ======================================================
# Load Dataset
# ======================================================
df = pd.read_csv(
    os.path.join(
        BASE_DIR,
        "extracted_csv",
        "features.csv"
    )
)
print("\nOriginal Dataset")

print(df["label"].value_counts())


# ======================================================
# Balance Dataset
# ======================================================

balanced = []

for label in df["label"].unique():

    subset = df[df["label"] == label]

    if len(subset) > TARGET_SAMPLES:

        subset = resample(

            subset,

            replace=False,

            n_samples=TARGET_SAMPLES,

            random_state=RANDOM_STATE

        )

    balanced.append(subset)

df = pd.concat(
    balanced
)

df = df.sample(

    frac=1,

    random_state=RANDOM_STATE

).reset_index(drop=True)

print("\nBalanced Dataset")

print(df["label"].value_counts())


# ======================================================
# Features / Labels
# ======================================================

X = df.drop(
    "label",
    axis=1
)

y = df["label"]


# ======================================================
# Encode Labels
# ======================================================

encoder = LabelEncoder()

y = encoder.fit_transform(y)

print("\nClasses")

print(encoder.classes_)


# ======================================================
# Train Test Split
# ======================================================

X_train, X_test, y_train, y_test = train_test_split(

    X,

    y,

    test_size=0.20,

    stratify=y,

    random_state=RANDOM_STATE

)


# ======================================================
# Standard Scaler
# ======================================================

scaler = StandardScaler()

X_train = scaler.fit_transform(
    X_train
)

X_test = scaler.transform(
    X_test
)


joblib.dump(
    scaler,
    os.path.join(
        MODEL_DIR,
        "scaler.pkl"
    )
)

joblib.dump(
    encoder,
    os.path.join(
        MODEL_DIR,
        "label_encoder.pkl"
    )
)
loaded = joblib.load(
    os.path.join(
        MODEL_DIR,
        "label_encoder.pkl"
    )
)

print("\nSaved Encoder Type:")
print(type(loaded))

print("Classes:")
print(loaded.classes_)
# ======================================================
# Class Weights
# ======================================================

weights = class_weight.compute_class_weight(

    class_weight="balanced",

    classes=np.unique(y_train),

    y=y_train

)

class_weights = {

    i: weights[i]

    for i in range(len(weights))

}

print("\nClass Weights")

print(class_weights)


# ======================================================
# Build Neural Network
# ======================================================

model = Sequential([

    Input(shape=(X_train.shape[1],)),

    Dense(
        128,
        activation="relu"
    ),

    BatchNormalization(),

    Dropout(0.30),

    Dense(
        64,
        activation="relu"
    ),

    BatchNormalization(),

    Dropout(0.25),

    Dense(
        32,
        activation="relu"
    ),

    BatchNormalization(),

    Dense(
        16,
        activation="relu"
    ),

    Dense(

        len(encoder.classes_),

        activation="softmax"

    )

])


# ======================================================
# Compile
# ======================================================

model.compile(

    optimizer=Adam(

        learning_rate=0.001

    ),

    loss="sparse_categorical_crossentropy",

    metrics=["accuracy"]

)


# ======================================================
# Callbacks
# ======================================================

callbacks = [

    EarlyStopping(

        monitor="val_loss",

        patience=8,

        restore_best_weights=True

    ),

    ReduceLROnPlateau(

        monitor="val_loss",

        factor=0.5,

        patience=3,

        verbose=1

    ),

    ModelCheckpoint(

        os.path.join(

            MODEL_DIR,

            "exercise_model.keras"

        ),

        save_best_only=True,

        monitor="val_accuracy"

    )

]


# ======================================================
# Train
# ======================================================

history = model.fit(

    X_train,

    y_train,

    validation_data=(

        X_test,

        y_test

    ),

    epochs=60,

    batch_size=64,

    class_weight=class_weights,

    callbacks=callbacks,

    verbose=1

)


# ======================================================
# Evaluation
# ======================================================

prediction = model.predict(
    X_test
)

prediction = np.argmax(
    prediction,
    axis=1
)


accuracy = accuracy_score(
    y_test,
    prediction
)

precision = precision_score(

    y_test,

    prediction,

    average="weighted"

)

recall = recall_score(

    y_test,

    prediction,

    average="weighted"

)

f1 = f1_score(

    y_test,

    prediction,

    average="weighted"

)


print("\n===========================")
print("Results")
print("===========================")

print("Accuracy :", accuracy)

print("Precision:", precision)

print("Recall   :", recall)

print("F1 Score :", f1)


print("\nClassification Report\n")

print(

    classification_report(

        y_test,

        prediction,

        target_names=encoder.classes_

    )

)


print("\nConfusion Matrix\n")

print(

    confusion_matrix(

        y_test,

        prediction

    )

)


# ======================================================
# Save Final Model
# ======================================================

model.save(

    os.path.join(

        MODEL_DIR,

        "final_model.keras"

    )

)


# ======================================================
# Training Curves
# ======================================================

plt.figure(figsize=(10,5))

plt.plot(

    history.history["accuracy"],

    label="Train Accuracy"

)

plt.plot(

    history.history["val_accuracy"],

    label="Validation Accuracy"

)

plt.legend()

plt.grid(True)

plt.title("Accuracy")

plt.savefig(

    os.path.join(

        MODEL_DIR,

        "accuracy.png"

    )

)

plt.close()


plt.figure(figsize=(10,5))

plt.plot(

    history.history["loss"],

    label="Train Loss"

)

plt.plot(

    history.history["val_loss"],

    label="Validation Loss"

)

plt.legend()

plt.grid(True)

plt.title("Loss")

plt.savefig(

    os.path.join(

        MODEL_DIR,

        "loss.png"

    )

)

plt.close()


print("\n===========================")
print("Saved Files")
print("===========================")

print("exercise_model.keras")
print("final_model.keras")
print("scaler.pkl")
print("label_encoder.pkl")
print("accuracy.png")
print("loss.png")
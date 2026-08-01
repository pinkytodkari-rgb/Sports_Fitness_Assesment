import os
import pickle
import json

# -------------------------
# Paths
# -------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models"
)

with open(
    os.path.join(
        MODEL_DIR,
        "pushup_scaler.pkl"
    ),
    "rb"
) as f:
    scaler = pickle.load(f)

data = {
    "mean": scaler.mean_.tolist(),
    "scale": scaler.scale_.tolist()
}

with open(
    os.path.join(
        MODEL_DIR,
        "pushup_scaler.json"
    ),
    "w"
) as f:
    json.dump(data, f, indent=4)

print("pushup_scaler.json saved successfully!")
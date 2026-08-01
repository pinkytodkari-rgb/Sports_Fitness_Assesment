import os
import json
import joblib

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

scaler = joblib.load(
    os.path.join(
        BASE_DIR,
        "models",
        "scaler.pkl"
    )
)

data = {
    "mean": scaler.mean_.tolist(),
    "scale": scaler.scale_.tolist()
}

with open(
    os.path.join(
        BASE_DIR,
        "models",
        "scaler.json"
    ),
    "w"
) as f:
    json.dump(data, f, indent=4)

print("Saved scaler.json")
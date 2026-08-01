import os
import joblib
import pandas as pd
import matplotlib.pyplot as plt

model = joblib.load(

    "models/Random Forest.pkl"

)

df = pd.read_csv(

    "extracted_csv/features.csv"

)

features = df.drop(

    "label",

    axis=1

)

importance = model.feature_importances_

indices = importance.argsort()

plt.figure(figsize=(10,8))

plt.barh(

    features.columns[indices],

    importance[indices]

)

plt.xlabel("Importance")

plt.title("Random Forest Feature Importance")

plt.tight_layout()

plt.show()
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder
import joblib

# Load dataset
df = pd.read_csv("dataset/recovery_dataset.csv")

# Features
X = df[[
    "pain_level",
    "medication_taken",
    "energy_level",
    "symptoms"
]]

# Target
y = df["recovery_score"]

# Preprocessing
preprocessor = ColumnTransformer(
    transformers=[
        ("symptoms", TfidfVectorizer(), "symptoms"),
        ("energy", OneHotEncoder(), ["energy_level"])
    ],
    remainder="passthrough"
)

# Pipeline
pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("model", RandomForestRegressor())
])

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# Train
pipeline.fit(X_train, y_train)

# Save ONE file
joblib.dump(
    pipeline,
    "models/recovery_pipeline.pkl"
)

print("Single pipeline model saved & models initialized!")
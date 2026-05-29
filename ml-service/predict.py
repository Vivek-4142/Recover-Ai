import joblib
import pandas as pd

# Load pipeline model
pipeline = joblib.load(
    "models/recovery_pipeline.pkl"
)

# Example input
input_data = pd.DataFrame([{
    "pain_level": 5,
    "medication_taken": True,
    "energy_level": 2,
    "symptoms": "headache nausea fatigue"
}])

# Predict
prediction = pipeline.predict(input_data)

print("Recovery Score:", prediction[0])
import pandas as pd
import joblib
from pathlib import Path

MODEL_PATH = (
    Path(__file__).resolve().parents[2]
    / "ml-service"
    / "models"
    / "recovery_pipeline.pkl"
)

pipeline = joblib.load(MODEL_PATH)


def predict_recovery(
    pain_level: int,
    symptoms: str,
    medication_taken: bool,
    energy_level: str
):
    # Map energy level strings ("Low", "Medium", "High") or numeric strings to integers
    energy_map = {
        "low": 1,
        "medium": 2,
        "high": 3,
        "1": 1,
        "2": 2,
        "3": 3,
    }

    if isinstance(energy_level, str):
        mapped_energy = energy_map.get(energy_level.strip().lower(), 2)
    elif isinstance(energy_level, (int, float)):
        mapped_energy = int(energy_level)
    else:
        mapped_energy = 2

    input_df = pd.DataFrame([
        {
            "pain_level": pain_level,
            "medication_taken": int(medication_taken),
            "energy_level": mapped_energy,
            "symptoms": symptoms
        }
    ])

    score = pipeline.predict(input_df)[0]

    return round(float(score), 2)
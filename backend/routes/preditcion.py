from fastapi import APIRouter
from pydantic import BaseModel
from services.predict import predict_recovery

router = APIRouter()


class PredictionRequest(BaseModel):
    pain_level: int
    symptoms: str
    medication_taken: bool
    energy_level: str


@router.post("/predict-recovery")
def predict(data: PredictionRequest):

    score = predict_recovery(
        pain_level=data.pain_level,
        symptoms=data.symptoms,
        medication_taken=data.medication_taken,
        energy_level=data.energy_level
    )

    if score >= 70:
        risk = "LOW"
    elif score >= 40:
        risk = "MEDIUM"
    else:
        risk = "HIGH"

    return {
        "recovery_score": score,
        "risk": risk
    }
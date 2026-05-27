from datetime import date

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.database import SessionLocal
from database.models import CheckIn

router = APIRouter()
class CheckInCreate(BaseModel):
    patient_id: int
    pain_level: int
    symptoms: str
    medication_taken: bool
    energy_level: str

@router.post("/checkins")
def create_checkin(checkin: CheckInCreate):
    db: Session = SessionLocal()

    new_checkin = CheckIn(
        patient_id=checkin.patient_id,
        pain_level=checkin.pain_level,
        symptoms=checkin.symptoms,
        medication_taken=checkin.medication_taken,
        energy_level=checkin.energy_level
    )

    db.add(new_checkin)
    db.commit()
    db.refresh(new_checkin)

    return {
        "message": "Check-in created successfully",
        "checkin_id": new_checkin.id
    }

@router.get("/checkins/{patient_id}")
def get_checkins(patient_id: int):      
    db: Session = SessionLocal()
    checkins = db.query(CheckIn).filter(CheckIn.patient_id == patient_id).all()

    return checkins
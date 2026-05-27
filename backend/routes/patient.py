from datetime import date

from fastapi import APIRouter # type: ignore
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.database import SessionLocal
from database.models import Patient

router = APIRouter()

class PatientCreate(BaseModel):
    name: str
    age: int
    condition: str
    recovery_start_date: date
    assigned_doctor: str

@router.post("/patients")
def create_patient(patient: PatientCreate):

    db: Session = SessionLocal()

    new_patient = Patient(
        name=patient.name,
        age=patient.age,
        condition=patient.condition,
        recovery_start_date=patient.recovery_start_date,
        assigned_doctor=patient.assigned_doctor
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return {
        "message": "Patient created successfully",
        "patient_id": new_patient.id
    }
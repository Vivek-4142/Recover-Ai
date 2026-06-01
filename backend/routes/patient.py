from datetime import date
from typing import Optional
from fastapi import APIRouter, HTTPException
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
    doctor_id: Optional[int] = None

@router.post("/patients")
def create_patient(patient: PatientCreate):
    db: Session = SessionLocal()

    new_patient = Patient(
        name=patient.name,
        age=patient.age,
        condition=patient.condition,
        recovery_start_date=patient.recovery_start_date,
        assigned_doctor=patient.assigned_doctor,
        doctor_id=patient.doctor_id
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    db.close()

    return {
        "message": "Patient created successfully",
        "patient_id": new_patient.id
    }

@router.get("/patients")
def get_patients(doctor_id: Optional[int] = None):
    db: Session = SessionLocal()
    if doctor_id:
        patients = db.query(Patient).filter(Patient.doctor_id == doctor_id).all()
    else:
        patients = db.query(Patient).all()
    db.close()
    return patients

@router.get("/patients/{id}")
def get_patient(id: int):
    db: Session = SessionLocal()
    patient = db.query(Patient).filter(Patient.id == id).first()
    db.close()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient
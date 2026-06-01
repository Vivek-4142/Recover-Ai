from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from database.database import SessionLocal
from database.models import Doctor, Patient

router = APIRouter(prefix="/auth", tags=["Authentication"])

class DoctorRegister(BaseModel):
    name: str
    email: str
    password: str

class PatientRegister(BaseModel):
    name: str
    email: str
    password: str
    age: int
    condition: str
    recovery_start_date: str
    doctor_id: int

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register/doctor")
def register_doctor(req: DoctorRegister):
    db: Session = SessionLocal()
    existing = db.query(Doctor).filter(Doctor.email == req.email).first()
    if existing:
        db.close()
        raise HTTPException(status_code=400, detail="Email already registered as a doctor.")
    
    new_doc = Doctor(
        name=req.name,
        email=req.email,
        password=req.password
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    db.close()
    return {"message": "Doctor registered successfully", "id": new_doc.id}

@router.post("/register/patient")
def register_patient(req: PatientRegister):
    db: Session = SessionLocal()
    
   
    doc = db.query(Doctor).filter(Doctor.id == req.doctor_id).first()
    if not doc:
        db.close()
        raise HTTPException(status_code=404, detail="Assigned doctor not found.")
        
    existing_patient = db.query(Patient).filter(Patient.email == req.email).first()
    if existing_patient:
        db.close()
        raise HTTPException(status_code=400, detail="Email already registered as a patient.")
    
    new_pat = Patient(
        name=req.name,
        email=req.email,
        password=req.password,
        age=req.age,
        condition=req.condition,
        recovery_start_date=req.recovery_start_date,
        assigned_doctor=doc.name,
        doctor_id=req.doctor_id
    )
    db.add(new_pat)
    db.commit()
    db.refresh(new_pat)
    db.close()
    return {"message": "Patient registered successfully", "id": new_pat.id}

@router.post("/login")
def login(req: LoginRequest):
    db: Session = SessionLocal()
    

    doc = db.query(Doctor).filter(Doctor.email == req.email).first()
    if doc:
        if doc.password == req.password:  
            db.close()
            return {
                "role": "doctor",
                "id": doc.id,
                "name": doc.name,
                "email": doc.email
            }
        else:
            db.close()
            raise HTTPException(status_code=401, detail="Invalid credentials.")

    pat = db.query(Patient).filter(Patient.email == req.email).first()
    if pat:
        if pat.password == req.password:
            db.close()
            return {
                "role": "patient",
                "id": pat.id,
                "name": pat.name,
                "email": pat.email,
                "doctor_id": pat.doctor_id
            }
        else:
            db.close()
            raise HTTPException(status_code=401, detail="Invalid credentials.")
            
    db.close()
    raise HTTPException(status_code=404, detail="Account not found.")

@router.get("/doctors")
def get_doctors_list():
    db: Session = SessionLocal()
    doctors = db.query(Doctor).all()
    res = [{"id": d.id, "name": d.name} for d in doctors]
    db.close()
    return res

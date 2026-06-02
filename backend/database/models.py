from datetime import datetime

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Time, DateTime
from sqlalchemy.orm import relationship

from .database import Base

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="doctor")

    patients = relationship("Patient", back_populates="doctor")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    age = Column(Integer)
    condition = Column(String)
    recovery_start_date = Column(String)
    assigned_doctor = Column(String)
    role = Column(String, default="patient")
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)

    medication_time = Column(Time)

    checkin_deadline = Column(Time)

    medication_reminder_sent = Column(
        Boolean,
        default=False
    )

    checkin_reminder_sent = Column(
        Boolean,
        default=False
    )

    doctor = relationship("Doctor", back_populates="patients")
    checkins = relationship("CheckIn", back_populates="patient")


class CheckIn(Base):
    __tablename__ = "checkins"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(Integer, ForeignKey("patients.id"))

    pain_level = Column(Integer)
    symptoms = Column(String)
    medication_taken = Column(Boolean)
    energy_level = Column(String)
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    patient = relationship("Patient", back_populates="checkins")
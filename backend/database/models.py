from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from .database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    age = Column(Integer)
    condition = Column(String)
    recovery_start_date = Column(String)
    assigned_doctor = Column(String)

    checkins = relationship("CheckIn", back_populates="patient")


class CheckIn(Base):
    __tablename__ = "checkins"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(Integer, ForeignKey("patients.id"))

    pain_level = Column(Integer)
    symptoms = Column(String)
    medication_taken = Column(Boolean)
    energy_level = Column(String)

    patient = relationship("Patient", back_populates="checkins")
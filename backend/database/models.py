from sqlalchemy import Column, Integer, String, Date
from .database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    age = Column(Integer)
    condition = Column(String)
    recovery_start_date = Column(Date)
    assigned_doctor = Column(String)
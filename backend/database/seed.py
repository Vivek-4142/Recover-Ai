from datetime import time
from database.database import SessionLocal
from database.models import Doctor, Patient, CheckIn

def seed_db():
    db = SessionLocal()
    
    # Check if doctors already seeded
    if db.query(Doctor).count() > 0:
        db.close()
        return

    print("Seeding database...")

    # 1. Create Doctors
    dr_jenkins = Doctor(
        name="Dr. Sarah Jenkins",
        email="doctor.jenkins@recoverai.com",
        password="password123"  # Plaintext for hackathon demo simplicity
    )
    dr_brooks = Doctor(
        name="Dr. Brooks",
        email="doctor.brooks@recoverai.com",
        password="password123"
    )
    
    db.add(dr_jenkins)
    db.add(dr_brooks)
    db.commit()
    db.refresh(dr_jenkins)
    db.refresh(dr_brooks)

    # 2. Create Patients
    vivek = Patient(
        name="Vivek Kumar",
        email="vivek@patient.com",
        password="password123",
        age=28,
        condition="Post-op Knee Ligament Rehab",
        recovery_start_date="2026-05-12",
        assigned_doctor=dr_jenkins.name,
        doctor_id=dr_jenkins.id,
        medication_time=time(9, 0),
        checkin_deadline=time(21, 0)
    )

    samantha = Patient(
        name="Samantha Reed",
        email="samantha@patient.com",
        password="password123",
        age=42,
        condition="Spine Fusion Recovery",
        recovery_start_date="2026-04-25",
        assigned_doctor=dr_jenkins.name,
        doctor_id=dr_jenkins.id,
        medication_time=time(9, 0),
        checkin_deadline=time(21, 0)
    )

    aaron = Patient(
        name="Aaron Miller",
        email="aaron@patient.com",
        password="password123",
        age=65,
        condition="Hip Replacement Rehab",
        recovery_start_date="2026-05-01",
        assigned_doctor=dr_brooks.name,
        doctor_id=dr_brooks.id,
        medication_time=time(9, 0),
        checkin_deadline=time(21, 0)
    )

    elena = Patient(
        name="Elena Rostova",
        email="elena@patient.com",
        password="password123",
        age=34,
        condition="ACL Reconstruction",
        recovery_start_date="2026-05-18",
        assigned_doctor=dr_brooks.name,
        doctor_id=dr_brooks.id,
        medication_time=time(9, 0),
        checkin_deadline=time(21, 0)
    )

    db.add(vivek)
    db.add(samantha)
    db.add(aaron)
    db.add(elena)
    db.commit()
    db.refresh(vivek)
    db.refresh(samantha)
    db.refresh(aaron)
    db.refresh(elena)

    # 3. Create historical check-ins
    # Vivek checkins (5 logs)
    vivek_checkins = [
        CheckIn(patient_id=vivek.id, pain_level=5, symptoms="Joint ache", medication_taken=True, energy_level="Low"),
        CheckIn(patient_id=vivek.id, pain_level=4, symptoms="Stiffness", medication_taken=True, energy_level="Low"),
        CheckIn(patient_id=vivek.id, pain_level=3, symptoms="Slight ache after walking", medication_taken=True, energy_level="Medium"),
        CheckIn(patient_id=vivek.id, pain_level=3, symptoms="None", medication_taken=True, energy_level="Medium"),
        CheckIn(patient_id=vivek.id, pain_level=2, symptoms="Mild joint stiffness in morning", medication_taken=True, energy_level="High")
    ]

    # Samantha checkins (5 logs)
    samantha_checkins = [
        CheckIn(patient_id=samantha.id, pain_level=6, symptoms="Fatigue & ache", medication_taken=True, energy_level="Low"),
        CheckIn(patient_id=samantha.id, pain_level=4, symptoms="Mild soreness", medication_taken=True, energy_level="Medium"),
        CheckIn(patient_id=samantha.id, pain_level=7, symptoms="Acute spinal ache", medication_taken=False, energy_level="Low"),
        CheckIn(patient_id=samantha.id, pain_level=5, symptoms="Muscle spasms", medication_taken=True, energy_level="Low"),
        CheckIn(patient_id=samantha.id, pain_level=4, symptoms="Minor lower back numbness", medication_taken=True, energy_level="Medium")
    ]

    # Aaron checkins (5 logs)
    aaron_checkins = [
        CheckIn(patient_id=aaron.id, pain_level=6, symptoms="Soreness post-exercise", medication_taken=True, energy_level="Low"),
        CheckIn(patient_id=aaron.id, pain_level=5, symptoms="Stiffness", medication_taken=True, energy_level="Low"),
        CheckIn(patient_id=aaron.id, pain_level=4, symptoms="None", medication_taken=True, energy_level="Medium"),
        CheckIn(patient_id=aaron.id, pain_level=3, symptoms="Slight stiffness", medication_taken=True, energy_level="Medium"),
        CheckIn(patient_id=aaron.id, pain_level=3, symptoms="Slight groin discomfort", medication_taken=True, energy_level="Medium")
    ]

    # Elena checkins (3 logs)
    elena_checkins = [
        CheckIn(patient_id=elena.id, pain_level=8, symptoms="Knee swelling & warmth", medication_taken=False, energy_level="Low"),
        CheckIn(patient_id=elena.id, pain_level=7, symptoms="Intense burning pain", medication_taken=True, energy_level="Low"),
        CheckIn(patient_id=elena.id, pain_level=7, symptoms="Severe swelling & low knee extension", medication_taken=False, energy_level="Low")
    ]

    for c in (vivek_checkins + samantha_checkins + aaron_checkins + elena_checkins):
        db.add(c)

    db.commit()
    db.close()
    print("Database seeded successfully.")

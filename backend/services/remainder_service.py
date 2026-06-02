from datetime import datetime
from sqlalchemy import func

from database.database import SessionLocal
from database.models import Patient
from database.models import CheckIn

from services.email_service import send_email

async def process_medication_reminders():

    db = SessionLocal()

    patients = db.query(Patient).all()

    current_time = datetime.now().time()
    today = datetime.now().date()

    for patient in patients:

        if (
            patient.medication_time
            and current_time > patient.medication_time
            and not patient.medication_reminder_sent
        ):

            latest_checkin = (
                db.query(CheckIn)
                .filter(
                    CheckIn.patient_id == patient.id,
                    func.date(CheckIn.created_at) == today
                )
                .order_by(
                    CheckIn.created_at.desc()
                )
                .first()
            )

            if (
                latest_checkin
                and latest_checkin.medication_taken is False
            ):

                try:
                    await send_email(
                        patient.email,
                        "Recover AI Medication Reminder",
                        f"""
                        Hi {patient.name},

                        It looks like you may have missed
                        your medication today.

                        Please take your medication
                        as prescribed.

                        Recover AI
                        """
                    )
                    patient.medication_reminder_sent = True
                except Exception as e:
                    print(f"Error sending medication reminder email to {patient.email}: {e}")

    db.commit()
    db.close()


async def process_checkin_reminders():

    db = SessionLocal()

    patients = db.query(Patient).all()

    current_time = datetime.now().time()

    today = datetime.now().date()

    for patient in patients:

        if (
            patient.checkin_deadline
            and current_time > patient.checkin_deadline
            and not patient.checkin_reminder_sent
        ):

            submitted_today = (
                db.query(CheckIn)
                .filter(
                    CheckIn.patient_id == patient.id,
                    func.date(
                        CheckIn.created_at
                    ) == today
                )
                .first()
            )

            if not submitted_today:

                try:
                    await send_email(
                        patient.email,
                        "Recover AI Daily Check-in Reminder",
                        f"""
                        Hi {patient.name},

                        You have not submitted today's
                        recovery check-in.

                        Please complete your check-in.

                        Recover AI
                        """
                    )
                    patient.checkin_reminder_sent = True
                except Exception as e:
                    print(f"Error sending check-in reminder email to {patient.email}: {e}")

    db.commit()
    db.close()
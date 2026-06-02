from apscheduler.schedulers.asyncio import (
    AsyncIOScheduler
)

from services.remainder_service import (
    process_checkin_reminders,
    process_medication_reminders
)

from database.database import SessionLocal
from database.models import Patient

scheduler = AsyncIOScheduler()

scheduler.add_job(
    process_medication_reminders,
    "interval",
    minutes=5
)

scheduler.add_job(
    process_checkin_reminders,
    "interval",
    minutes=5
)




def reset_flags():

    db = SessionLocal()

    patients = db.query(Patient).all()

    for patient in patients:

        patient.medication_reminder_sent = False
        patient.checkin_reminder_sent = False

    db.commit()
    db.close()

scheduler.add_job(
    reset_flags,
    "cron",
    hour=0,
    minute=0
)
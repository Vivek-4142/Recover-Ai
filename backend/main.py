from fastapi import FastAPI

from database.init_db import init_db
from routes.patient import router as patient_router

app = FastAPI()

init_db()

app.include_router(patient_router)

@app.get("/")
def home():
    return {"message": "Recover AI Backend Running"}
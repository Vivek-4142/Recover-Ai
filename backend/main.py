from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.init_db import init_db
from database.seed import seed_db

from routes.patient import router as patient_router
from routes.checkin import router as checkin_router
from routes.preditcion import router as predict_router
from routes.auth import router as auth_router
from services.scheduler import (
    scheduler
)

app = FastAPI()

init_db()
seed_db()

@app.on_event("startup")
async def startup():

    scheduler.start()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(checkin_router)
app.include_router(predict_router)

@app.get("/")
def home():
    return {"message": "Recover AI Backend Running"}
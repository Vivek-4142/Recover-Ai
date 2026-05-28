from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.init_db import init_db

from routes.patient import router as patient_router
from routes.checkin import router as checkin_router

app = FastAPI()

init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patient_router)
app.include_router(checkin_router)

@app.get("/")
def home():
    return {"message": "Recover AI Backend Running"}
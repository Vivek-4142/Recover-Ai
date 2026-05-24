from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Recover AI Backend Running"}
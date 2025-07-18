from fastapi import FastAPI
from database import health_check
from sports_api import fetch_upcoming_matches

app = FastAPI()

@app.get("/health")
async def health():
    return await health_check()

@app.get("/matches")
async def matches():
    return await fetch_upcoming_matches()

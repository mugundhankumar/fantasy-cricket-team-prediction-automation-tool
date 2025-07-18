import os
import json
import time
import asyncio
import httpx
from typing import List, Dict
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
CACHE_FILE = "backend/exports/matches_cache.json"
CACHE_TTL = 300  # cache time-to-live in seconds (5 minutes)

class APIKeyMissingError(Exception):
    pass

class APIFetchError(Exception):
    pass

async def read_cache() -> List[Dict]:
    try:
        if os.path.exists(CACHE_FILE):
            mtime = os.path.getmtime(CACHE_FILE)
            if time.time() - mtime < CACHE_TTL:
                with open(CACHE_FILE, "r") as f:
                    cached_data = json.load(f)
                    return cached_data
    except Exception as e:
        print(f"❌ Cache read error: {e}")
    return []

async def write_cache(data: List[Dict]):
    try:
        os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
        with open(CACHE_FILE, "w") as f:
            json.dump(data, f)
    except Exception as e:
        print(f"❌ Cache write error: {e}")

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((httpx.RequestError, APIFetchError))
)
async def fetch_matches_from_api() -> List[Dict]:
    if not RAPIDAPI_KEY:
        raise APIKeyMissingError("RAPIDAPI_KEY environment variable is not set")

    url = "https://free-cricbuzz-cricket-api.p.rapidapi.com/matches"
    headers = {
        "x-rapidapi-host": "free-cricbuzz-cricket-api.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY
    }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()

        if "matches" not in data:
            raise APIFetchError("'matches' key not found in response")

        matches = [
            {
                "id": match.get("id"),
                "team1": match.get("team1"),
                "team2": match.get("team2"),
                "date": match.get("date")
            }
            for match in data["matches"]
        ]
        return matches

async def fetch_upcoming_matches() -> List[Dict]:
    cached_data = await read_cache()
    if cached_data:
        return cached_data

    matches = await fetch_matches_from_api()
    await write_cache(matches)
    return matches

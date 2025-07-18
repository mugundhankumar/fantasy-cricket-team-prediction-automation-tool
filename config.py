import os
from pathlib import Path
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Project root directory - adjusted for new structure
ROOT_DIR = Path(__file__).resolve().parent.parent.parent

# Database
DB_FILE = "gl_genie.db"
DB_PATH = ROOT_DIR / "app" / "database" / DB_FILE
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{DB_PATH}")

# API Keys
CRICKET_API_KEY = os.getenv("CRICKET_API_KEY", "8146b4df-00b4-4c17-a5b5-567658087a66")

# Migration Settings
RUN_MIGRATION = os.getenv("RUN_MIGRATION", "true").lower() == "true"

# API Settings
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

# CORS Settings
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

# ML Model Settings
MODEL_PATH = ROOT_DIR / "app" / "ml" / "gl_model.pkl"
MODEL_VERSION = "1.0.0"

# Cache Settings
CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))  # 1 hour default

# API Endpoints Configuration
API_V1_PREFIX = "/api/v1"
PROJECT_NAME = "GL Genie"
PROJECT_VERSION = "1.0.0"

# Logging Configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FILE = ROOT_DIR / "logs" / "gl_genie.log"

def get_config() -> Dict[str, Any]:
    """Returns all configuration as a dictionary"""
    return {
        "database_url": DATABASE_URL,
        "api_key": CRICKET_API_KEY,
        "host": HOST,
        "port": PORT,
        "debug": DEBUG,
        "cors_origins": CORS_ORIGINS,
        "model_path": str(MODEL_PATH),
        "model_version": MODEL_VERSION,
        "cache_ttl": CACHE_TTL,
        "api_prefix": API_V1_PREFIX,
        "project_name": PROJECT_NAME,
        "project_version": PROJECT_VERSION,
        "log_level": LOG_LEVEL,
        "log_file": str(LOG_FILE)
    }

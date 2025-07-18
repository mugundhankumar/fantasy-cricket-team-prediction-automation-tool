#!/usr/bin/env python3
"""
GL Genie Backend Diagnostic Script
This script helps diagnose common issues with the backend setup.
"""

import os
import sys
import asyncio
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ✅ 1. Check Environment
async def check_environment():
    """Check .env file and required environment variables"""
    logger.info("🔍 Checking environment variables...")

    env_file = Path(".env")
    if env_file.exists():
        logger.info("✅ .env file found")
        with open(env_file, 'r') as f:
            logger.info(f"📄 Preview:\n{f.read()[:200]}...")
    else:
        logger.error("❌ .env file not found!")
        return False

    from dotenv import load_dotenv
    load_dotenv()

    required_vars = ["CRICKET_API_KEY", "DATABASE_URL"]
    all_good = True

    for var in required_vars:
        value = os.getenv(var)
        if value:
            logger.info(f"✅ {var}: {value[:10]}...***" if "KEY" in var else f"✅ {var}: {value}")
        else:
            logger.error(f"❌ {var}: Not set!")
            all_good = False

    return all_good


# ✅ 2. File & Folder Check
def check_file_structure():
    logger.info("🗂️ Checking file structure...")

    required_files = ["main.py", "database.py", "sports_api.py", ".env"]
    required_dirs = ["ml", "utils"]
    required_module_files = [
        "ml/__init__.py", "ml/predict_model.py",
        "utils/__init__.py", "utils/team_generator.py", "utils/export_csv.py"
    ]

    all_good = True

    for file in required_files + required_module_files:
        if Path(file).exists():
            logger.info(f"✅ {file}")
        else:
            logger.error(f"❌ {file} - Missing!")
            all_good = False

    for dir in required_dirs:
        if Path(dir).is_dir():
            logger.info(f"✅ {dir}/")
        else:
            logger.error(f"❌ {dir}/ - Missing!")
            all_good = False

    return all_good


# ✅ 3. Database Check
async def check_database():
    logger.info("🗄️ Checking database...")

    try:
        from database import health_check, AsyncSessionLocal, Match
        from sqlalchemy import select

        health = await health_check()
        logger.info(f"🏥 Database health: {health}")

        async with AsyncSessionLocal() as session:
            result = await session.execute(select(Match))
            matches = result.scalars().all()
            logger.info(f"📊 Matches in DB: {len(matches)}")

            for match in matches[:3]:
                logger.info(f"  - {match.team1} vs {match.team2} ({match.date})")

        return True
    except Exception as e:
        logger.error(f"❌ Database check failed: {e}")
        return False


# ✅ 4. Sports API Check
async def check_sports_api():
    logger.info("🏏 Checking Sports API...")

    try:
        from sports_api import fetch_upcoming_matches

        matches = await asyncio.wait_for(fetch_upcoming_matches(), timeout=30.0)

        if matches:
            logger.info(f"✅ API returned {len(matches)} matches")
            for match in matches[:3]:
                logger.info(f"  - {match.get('team1', 'Unknown')} vs {match.get('team2', 'Unknown')}")
        else:
            logger.warning("⚠️ API returned empty results")

        return True

    except asyncio.TimeoutError:
        logger.error("❌ API request timed out")
        return False
    except Exception as e:
        logger.error(f"❌ Sports API check failed: {e}")
        return False


# ✅ 5. Check ML & Utility Modules
def check_ml_modules():
    logger.info("🤖 Checking ML and utility modules...")

    modules_to_check = [
        ("ml.predict_model", "predict_top_players"),
        ("utils.team_generator", "generate_team"),
        ("utils.export_csv", "export_team_csv")
    ]

    all_good = True

    for module_name, function_name in modules_to_check:
        try:
            module = __import__(module_name, fromlist=[function_name])
            func = getattr(module, function_name)
            logger.info(f"✅ {module_name}.{function_name} - Available")
        except ImportError as e:
            logger.error(f"❌ {module_name} - Import Error: {e}")
            all_good = False
        except AttributeError as e:
            logger.error(f"❌ {module_name}.{function_name} - Function not found: {e}")
            all_good = False
        except Exception as e:
            logger.error(f"❌ {module_name} - Unexpected error: {e}")
            all_good = False

    return all_good


# ✅ 6. Test Local API Endpoints
async def test_api_endpoints():
    logger.info("🌐 Testing API endpoints...")

    try:
        import requests
        base_url = "http://localhost:8000"

        endpoints = ["/health", "/", "/matches"]

        for endpoint in endpoints:
            try:
                response = requests.get(f"{base_url}{endpoint}", timeout=10)
                if response.status_code == 200:
                    logger.info(f"✅ {endpoint} - {response.status_code}")
                else:
                    logger.warning(f"⚠️ {endpoint} - {response.status_code}")
            except requests.exceptions.ConnectionError:
                logger.warning(f"⚠️ {endpoint} - Server not running")
            except Exception as e:
                logger.error(f"❌ {endpoint} - Error: {e}")

    except ImportError:
        logger.warning("⚠️ Install `requests` to test endpoints")


# ✅ 7. Create Sample .env
def create_sample_env():
    logger.info("📝 Creating sample .env file...")

    content = """# GL Genie Backend Environment Variables

# Cricket API Key
CRICKET_API_KEY=your_cricket_api_key_here

# Database URL
DATABASE_URL=sqlite+aiosqlite:///./gl_genie.db
# Or use:
# DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/db
# DATABASE_URL=mysql+aiomysql://user:pass@localhost:3306/db
"""

    with open(".env.sample", "w") as f:
        f.write(content)

    logger.info("✅ Created .env.sample. Copy to `.env` and edit as needed.")


# ✅ Main Diagnostics Runner
async def main():
    logger.info("🚀 Starting GL Genie Backend Diagnostics...")
    logger.info(f"📍 Current directory: {os.getcwd()}")
    logger.info(f"🐍 Python version: {sys.version}")

    checks = []

    env_ok = await check_environment()
    checks.append(("Environment Variables", env_ok))

    files_ok = check_file_structure()
    checks.append(("File Structure", files_ok))

    if env_ok:
        db_ok = await check_database()
        checks.append(("Database", db_ok))

        api_ok = await check_sports_api()
        checks.append(("Sports API", api_ok))

    ml_ok = check_ml_modules()
    checks.append(("ML Modules", ml_ok))

    await test_api_endpoints()

    logger.info("\n" + "=" * 50)
    logger.info("📊 DIAGNOSTIC SUMMARY")
    logger.info("=" * 50)

    for name, status in checks:
        icon = "✅" if status else "❌"
        logger.info(f"{icon} {name}")

    if all(status for _, status in checks):
        logger.info("\n🎉 All checks passed! Backend is ready.")
    else:
        logger.info("\n⚠️ Some checks failed. Fix above issues.")
        if not env_ok:
            create_sample_env()

    logger.info("\n💡 Next steps:")
    logger.info("1. Fix ❌ issues above")
    logger.info("2. Run backend: `python main.py`")
    logger.info("3. Visit: http://localhost:8000")


if __name__ == "__main__":
    asyncio.run(main())

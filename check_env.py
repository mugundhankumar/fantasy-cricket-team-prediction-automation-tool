import os
from dotenv import load_dotenv

load_dotenv()

required_vars = ["CRICKET_API_KEY", "DATABASE_URL", "RUN_MIGRATION"]
missing = [var for var in required_vars if not os.getenv(var)]

if missing:
    print(f"❌ Missing environment variables: {', '.join(missing)}. Check your .env file.")
else:
    print("✅ All required environment variables loaded.")

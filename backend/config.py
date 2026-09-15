import os

from dotenv import load_dotenv

load_dotenv()


def _csv_env(name: str, default: str) -> list[str]:
    return [item.strip() for item in os.getenv(name, default).split(",") if item.strip()]


APP_NAME = os.getenv("APP_NAME", "Personal AI Hub")
APP_ENV = os.getenv("APP_ENV", "development")
PORT = int(os.getenv("PORT", "8000"))

FRONTEND_ORIGINS = _csv_env(
    "FRONTEND_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)
FRONTEND_ORIGIN_REGEX = os.getenv(
    "FRONTEND_ORIGIN_REGEX",
    r"https://.*\.vercel\.app",
)

TASKS_API_URL = os.getenv("TASKS_API_URL", "http://127.0.0.1:8000/tasks")

"""Application configuration loaded from environment variables."""

from dataclasses import dataclass
import os
from pathlib import Path
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BACKEND_DIR / ".env"

# Load environment variables from backend/.env if present
load_dotenv(dotenv_path=ENV_FILE)


def _parse_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _parse_origins(value: str | None) -> list[str]:
    if not value:
        return ["http://localhost:5173", "http://127.0.0.1:5173"]
    return [origin.strip() for origin in value.split(",") if origin.strip()]


@dataclass(frozen=True)
class Settings:
    """Typed application settings derived from environment variables."""

    APP_NAME: str = os.getenv("APP_NAME", "School ERP - Student Management API")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    DB_ECHO: bool = _parse_bool(os.getenv("DB_ECHO"), default=False)
    CORS_ORIGINS: list[str] = None  # type: ignore[assignment]

    def __post_init__(self) -> None:
        object.__setattr__(
            self,
            "CORS_ORIGINS",
            _parse_origins(os.getenv("CORS_ORIGINS")),
        )


settings = Settings()

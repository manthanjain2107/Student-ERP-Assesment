"""FastAPI application entry point, middleware, error handlers, and router setup."""

from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import OperationalError, SQLAlchemyError

from app.config import settings
from app.database import SessionLocal, init_db
from app.routers import students_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Verify/create database tables on startup without deleting existing data."""
    try:
        init_db()
    except SQLAlchemyError as exc:
        logger.error("Database initialization failed during startup: %s", type(exc).__name__)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "REST API for the School ERP Student Management Module. "
        "Supports student registration, listing, detail lookup, updates, deletion, "
        "and database-backed search and filtering."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    _request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """Return consistent, human-readable validation errors with HTTP 422."""
    errors = []
    for err in exc.errors():
        field_loc = ".".join(str(part) for part in err.get("loc", []) if part != "body")
        errors.append(
            {
                "field": field_loc or "request",
                "message": err.get("msg", "Invalid input."),
            }
        )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={
            "detail": "Validation failed. Please review the submitted fields.",
            "errors": errors,
        },
    )


@app.exception_handler(OperationalError)
async def database_connection_exception_handler(
    _request: Request,
    exc: OperationalError,
) -> JSONResponse:
    """Handle database connectivity failures without exposing credentials or stack traces."""
    logger.error("Database connection error: %s", type(exc).__name__)
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "detail": "Database service is currently unavailable. Please try again later."
        },
    )


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(
    _request: Request,
    exc: SQLAlchemyError,
) -> JSONResponse:
    """Handle unexpected database errors safely without leaking internals."""
    logger.error("Database error occurred: %s", type(exc).__name__)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "A database error occurred while processing your request."
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    _request: Request,
    exc: Exception,
) -> JSONResponse:
    """Catch-all handler preventing internal stack traces from leaking to clients."""
    logger.exception("Unhandled server exception: %s", type(exc).__name__)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected internal server error occurred."},
    )


app.include_router(students_router)


@app.get(
    "/api/health",
    tags=["Health"],
    summary="Check API and database health",
    description="Verifies that the FastAPI server and configured database connection are operational.",
)
def health_check() -> JSONResponse:
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
    except OperationalError:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "unhealthy", "database": "disconnected"},
        )
    finally:
        db.close()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"status": "healthy", "database": "connected"},
    )

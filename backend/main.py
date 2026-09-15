from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import APP_NAME, FRONTEND_ORIGIN_REGEX, FRONTEND_ORIGINS
from database import check_connection, init_db
from routers.agent import router as agent_router
from routers.tasks import router as tasks_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(title=APP_NAME, version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_origin_regex=FRONTEND_ORIGIN_REGEX or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(tasks_router)
app.include_router(agent_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"status": "ok", "service": "Personal AI Hub"}


@app.get("/health")
def health() -> JSONResponse:
    try:
        check_connection()
    except Exception as exc:  # noqa: BLE001 — surface connection errors in health
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": f"error: {exc}"},
        )

    return JSONResponse(
        status_code=200,
        content={"status": "healthy", "database": "ok"},
    )


@app.get("/db/status")
def database_status() -> JSONResponse:
    """Verify the live PostgreSQL connection and return success status."""
    try:
        result = check_connection()
    except Exception as exc:  # noqa: BLE001 — surface connection errors
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "database": "disconnected",
                "detail": str(exc),
            },
        )

    return JSONResponse(status_code=200, content=result)

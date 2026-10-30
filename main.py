"""Main entry point for DisruptionIQ FastAPI application.

Provides secure, tenant-isolated REST endpoints for supply chain disruption detection,
deterministic risk ranking, coordinated recovery planning, separation-of-duties approval,
and simulated execution. Serves the production React frontend as a unified single-port application.
"""

from __future__ import annotations

import logging
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.database import init_db, SessionLocal
from backend.seed import seed_database
from backend.routes import router as api_router

# Setup standard logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("disruptioniq.main")


def create_app() -> FastAPI:
    """Create and configure the DisruptionIQ FastAPI application instance."""
    app = FastAPI(
        title="DisruptionIQ API",
        version="1.0.0",
        description="From Delivery Delays to Recovery Plans — Multi-Company Supply Chain Resilience Platform",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Initialize DB schema & seed default demo accounts on startup
    init_db()
    with SessionLocal() as db:
        seed_database(db)

    # Configure CORS explicitly to enable local React Vite frontend development & production
    allowed_origins = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000",
    ).split(",")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()] + ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    # Health check endpoints
    @app.get("/health")
    @app.get("/api/health")
    def health_check():
        return {
            "status": "healthy",
            "service": "DisruptionIQ",
            "version": "1.0.0",
            "environment": os.getenv("ENVIRONMENT", "development"),
        }

    # Mount API router
    app.include_router(api_router, prefix="/api")

    # Mount static assets and serve production React PWA directly from FastAPI if dist/ exists
    dist_dir = os.path.join(os.path.dirname(__file__), "dist")
    if os.path.exists(dist_dir):
        assets_dir = os.path.join(dist_dir, "assets")
        if os.path.exists(assets_dir):
            app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

        @app.get("/{full_path:path}", include_in_schema=False)
        async def serve_spa(full_path: str):
            """Fallback single-page-app route."""
            target_path = os.path.join(dist_dir, full_path)
            if os.path.isfile(target_path):
                return FileResponse(target_path)
            return FileResponse(os.path.join(dist_dir, "index.html"))

    logger.info("DisruptionIQ FastAPI application successfully initialized.")
    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=False)

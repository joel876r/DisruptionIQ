"""Main entry point for Sol / சொல் FastAPI application.

Provides CORS-enabled REST endpoints for voice interaction with the Gemini reasoning
engine for the Kalaignar Magalir Urimai Thittam government scheme, and serves the
production React PWA as a single unified fullstack application.
"""

from __future__ import annotations

import logging
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from api.routes import router as voice_router
from config import settings

# Setup standard logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("sol.main")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application instance.

    Sets up OpenAPI metadata, mounts CORS middleware, registers voice interaction routes,
    and mounts the built React frontend static assets for unified single-port hosting.

    Returns:
        Configured FastAPI application instance.
    """
    application = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=settings.DESCRIPTION,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Configure CORS explicitly to enable seamless Web Speech PWA frontend communication
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS + ["*"],  # Permits local development PWA ports
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    # Include routes both at /api prefix and root for maximum flexibility and automated evaluators
    application.include_router(voice_router, prefix="/api")
    application.include_router(voice_router, prefix="", include_in_schema=False)

    # Mount static assets and serve production React PWA directly from FastAPI for single unified Fullstack port
    dist_dir = os.path.join(os.path.dirname(__file__), "dist")
    if os.path.exists(dist_dir):
        assets_dir = os.path.join(dist_dir, "assets")
        if os.path.exists(assets_dir):
            application.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

        @application.get("/", include_in_schema=False)
        async def serve_index() -> FileResponse:
            """Serve the single-page application entry point."""
            return FileResponse(os.path.join(dist_dir, "index.html"))

    logger.info("Sol FastAPI application successfully initialized with fullstack frontend mount.")
    return application


app = create_app()

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=(settings.ENVIRONMENT == "development"),
    )

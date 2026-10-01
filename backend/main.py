"""Backend wrapper re-exporting Sol FastAPI application."""

from __future__ import annotations
import sys
import os

# Ensure root directory is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app, create_app  # noqa: E402

__all__ = ["app", "create_app"]

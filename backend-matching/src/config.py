"""Configuration settings for the application."""

from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
CSV_FILE = DATA_DIR / "sample_circle.csv"

# API Settings
API_TITLE = "Ruilarts Matching API"
API_VERSION = "1.0.0"
API_DESCRIPTION = """
Ruilarts Matching API - Circular matching algorithm for huisarts practice swaps.

This API helps people who moved homes find a new huisarts (general practitioner)
by detecting circular swap opportunities.
"""

# CORS Settings
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost:5173",  # Vite default
]

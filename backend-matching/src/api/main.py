"""
FastAPI application for Ruilarts matching system.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from ..config import API_TITLE, API_VERSION, API_DESCRIPTION, CORS_ORIGINS
from .routes import people, matches, statistics
from .dependencies import get_neo4j_conn
from ..infrastructure.neo4j_connection import close_neo4j_connection

# Create FastAPI app
app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description=API_DESCRIPTION
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(people.router, prefix="/api", tags=["people"])
app.include_router(matches.router, prefix="/api", tags=["matches"])
app.include_router(statistics.router, prefix="/api", tags=["statistics"])


@app.on_event("startup")
async def startup_event():
    """Verify Neo4j connection on startup."""
    try:
        conn = get_neo4j_conn()
        if not conn.verify_connectivity():
            raise Exception("Could not connect to Neo4j")
        print("✓ Successfully connected to Neo4j")
    except Exception as e:
        print(f"✗ Failed to connect to Neo4j: {e}")
        print("\nMake sure Neo4j is running:")
        print("  cd backend && docker-compose up -d")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Close Neo4j connection on shutdown."""
    close_neo4j_connection()
    print("✓ Neo4j connection closed")


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Ruilarts Matching API",
        "docs": "/docs",
        "version": API_VERSION
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    try:
        conn = get_neo4j_conn()
        neo4j_healthy = conn.verify_connectivity()
        return {
            "status": "healthy" if neo4j_healthy else "degraded",
            "neo4j": "connected" if neo4j_healthy else "disconnected"
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")

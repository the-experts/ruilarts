# Ruilarts

A circular matching system to help people who moved homes find a huisarts (general practitioner) in their new location.

## The Problem

When people move to a new home, they need to find a huisarts in their new area. This creates:
- A vacancy at their old huisarts practice
- A need for a spot at a huisarts in their new location

## The Solution

The system detects circular matches (swap cycles) where multiple people can exchange huisarts practices simultaneously. For example, if:
- Person A wants huisarts B's practice
- Person B wants huisarts C's practice
- Person C wants huisarts D's practice
- Person D wants huisarts A's practice

The system detects this circular pattern (A→B→C→D→A) and everyone can swap!

## Tech Stack

- **Backend Matching API**: FastAPI + Neo4j (graph-based circular matching)
- **Huisartsen API**: Flask + PostgreSQL (huisarts data)
- **Frontend**: React + TanStack Start
- **Infrastructure**: Docker Compose for orchestration

## Quick Start

### Prerequisites

- Docker and Docker Compose installed

### Run the Application

```bash
# 1. Start all services
docker-compose up -d

# 2. Load sample data into Neo4j
docker-compose exec backend-matching python scripts/migrate_csv_to_neo4j.py

# 3. Access the services:
# - Backend Matching API: http://localhost:8000
# - API Documentation: http://localhost:8000/docs
# - Neo4j Browser: http://localhost:7474 (neo4j / ruilarts123)
# - Huisartsen API: http://localhost:5001
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend-matching
```

### Stop Services

```bash
docker-compose down

# Or remove all data volumes
docker-compose down -v
```

## Project Structure

```
ruilarts/
├── backend-matching/      # FastAPI circular matching service (Neo4j)
├── backend-geo/           # Geographic matching service
├── frontend/              # React frontend
├── huisartsen_api/        # Huisarts data API (Flask + PostgreSQL)
├── docker-compose.yml     # Unified Docker orchestration
└── sample_circle.csv      # Test data
```

## Services

### Backend Matching API (Port 8000)

Graph-based circular matching algorithm using Neo4j.

**Key Features:**
- Clean architecture (domain, application, infrastructure, API layers)
- Neo4j for efficient cycle detection
- First and second preference support
- RESTful API with FastAPI

**Documentation:** See [backend-matching/README.md](backend-matching/README.md)

### Huisartsen API (Port 5001)

Provides data about huisarts practices.

**Tech:** Flask + PostgreSQL

### Frontend (Port 3000)

User interface for the matching system.

**Tech:** React + TanStack Start + Vite

### Neo4j Database (Ports 7474, 7687)

Graph database for storing and querying circular matches.

**Browser:** http://localhost:7474
**Credentials:** neo4j / ruilarts123

## Test Data

The file `sample_circle.csv` contains test data with three different matching scenarios:

### Scenario 1: Complete Circle (People 1-10)
A perfect 10-person circular match:
- Anna (Amsterdam) → Bram (Utrecht) → Clara (Rotterdam) → Daan (Den Haag) → Emma (Eindhoven) → Finn (Groningen) → Greta (Leiden) → Hugo (Haarlem) → Iris (Nijmegen) → Jan (Tilburg) → Anna (Amsterdam)

**Result:** All 10 people can successfully swap practices ✓

### Scenario 2: Isolated Pair (People 11-12)
- Karen (Arnhem) wants Lars's practice in Zwolle
- Lars (Zwolle) wants Karen's practice in Arnhem

**Result:** These two want to swap with each other but aren't connected to the main circle. They form a separate 2-person circle.

### Scenario 3: Unmatched Person (Person 13)
- Maria (Breda) wants a practice in Apeldoorn
- No one in the dataset currently has that practice and wants to leave

**Result:** Maria is completely unmatched and cannot participate in any swap.

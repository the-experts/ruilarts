# System Architecture

## Clean, Layered, Scalable

---

### High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│        React + TanStack Start + Tailwind               │
│                   (Port 3000)                          │
└──────────────┬──────────────────────────────────────────┘
               │
               ├──────────┐
               │          │
┌──────────────▼───┐  ┌──▼───────────────┐  ┌─────────────┐
│ Backend-Matching │  │ Huisartsen API   │  │ Backend-Geo │
│  TypeScript/Hono │  │   Python/Flask   │  │   Node.js   │
│    (Port 8000)   │  │   (Port 5001)    │  │ (Port 4000) │
└──────┬───────┬───┘  └────────┬─────────┘  └─────────────┘
       │       │               │
   ┌───▼──┐ ┌──▼────────┐  ┌──▼──────────┐
   │Neo4j │ │PostgreSQL │  │ PostgreSQL  │
   │Graph │ │ Circles   │  │  Practices  │
   └──────┘ └───────────┘  └─────────────┘
```

---

### Backend-Matching Architecture

```
src/
├── models/              # Domain Types
│   └── index.ts         # Person, Practice, Circle interfaces
│
├── services/            # Business Logic (Separated!)
│   ├── neo4j.ts         # Graph operations
│   ├── matcher.ts       # Matching algorithm
│   ├── postgres.ts      # DB connection pool
│   ├── circles.ts       # Circle persistence
│   └── cleanup.ts       # Neo4j → PostgreSQL orchestration
│
├── routes/              # API Endpoints
│   ├── people.ts        # Person CRUD
│   └── matches.ts       # Circle retrieval
│
├── config.ts            # Configuration management
├── index.ts             # Application entry point
└── migrations/          # SQL schemas
    └── 001_create_circles_tables.sql
```

**Design Principles:**
- ✅ **Separation of Concerns**: Each service has one responsibility
- ✅ **Type Safety**: TypeScript interfaces throughout
- ✅ **Clean Architecture**: Domain → Services → Routes
- ✅ **Testability**: Pure functions, dependency injection ready

---

### Data Architecture

**Two-Database Strategy:**

**Neo4j (Temporary, Active Pool)**
```
Purpose: Fast cycle detection
Lifecycle: Person added → Matched → Deleted
Nodes: Person, Practice
Relationships: CURRENTLY_AT, WANTS
```

**PostgreSQL (Permanent Storage)**
```
Purpose: Matched circle persistence
Lifecycle: Circle matched → Saved forever
Tables: circles, circle_members
Features: Audit trail, reporting, analytics
```

**Why Two Databases?**
- 🚀 **Performance**: Graph DB optimized for pattern matching
- 📊 **Persistence**: Relational DB reliable for records
- 🧹 **Cleanup**: Remove matched people keeps graph lean
- 📈 **Scalability**: Neo4j stays small, PostgreSQL grows

---

### API Endpoints

**Person Management:**
```
POST   /api/people          Create person (triggers matching)
GET    /api/people          List all unmatched people
GET    /api/people/:id      Get person details
DELETE /api/people/:id      Remove person
```

**Match Retrieval:**
```
GET    /api/matches         Get all matched circles (PostgreSQL)
GET    /api/matches/:id     Get specific circle by UUID
```

**System:**
```
GET    /health              Check Neo4j + PostgreSQL status
```

---

### Configuration

All settings via environment variables:

```bash
# Matching Algorithm
MAX_PRACTICE_CHOICES=10    # How many choices per person
MAX_CIRCLE_SIZE=10         # Largest circle to detect
IDEAL_CIRCLE_SIZE=5        # Sweet spot for coordination

# Scoring Weights (lower score = better)
PREFERENCE_WEIGHT=10       # Penalty for higher preferences
TOTAL_SCORE_WEIGHT=1       # Sum of all preferences
SIZE_WEIGHT=20             # Distance from ideal size

# Databases
NEO4J_URI=bolt://localhost:7687
POSTGRES_HOST=localhost
POSTGRES_DB=huisartsen
```

**Formula:**
```
score = (maxPref × 10) + (totalScore × 1) + (|size - 5| × 20)
```

Customize for different use cases!

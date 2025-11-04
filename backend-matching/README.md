# Ruilarts Backend - Clean Architecture

A REST API for the Ruilarts circular matching system, built with clean architecture principles and powered by Neo4j graph database.

## Architecture

This backend follows clean architecture (aka hexagonal/onion architecture) with clear separation of concerns:

```
backend/
├── src/
│   ├── domain/              # Core business logic (no dependencies)
│   │   ├── models.py        # Person, Practice, Circle, MatchResult
│   │   └── interfaces.py    # Repository and Algorithm interfaces
│   ├── application/         # Use cases and orchestration
│   │   └── matching_service.py
│   ├── infrastructure/      # External dependencies
│   │   ├── neo4j_connection.py
│   │   ├── repositories/
│   │   │   └── neo4j_repository.py
│   │   └── matching/
│   │       └── neo4j_matcher.py
│   └── api/                 # HTTP layer (FastAPI)
│       ├── main.py
│       ├── dependencies.py
│       ├── schemas.py
│       └── routes/
│           ├── people.py
│           ├── matches.py
│           └── statistics.py
├── data/
│   └── sample_circle.csv
├── scripts/
│   └── migrate_csv_to_neo4j.py
├── Dockerfile
├── .dockerignore
└── requirements.txt
```

### Layers

**Domain** (innermost):
- Pure business logic
- No external dependencies
- Defines interfaces for repositories and algorithms

**Application**:
- Orchestrates business logic
- Use cases (e.g., "find matches", "add person")
- Depends only on domain

**Infrastructure**:
- Implementations of domain interfaces
- Neo4j storage and graph-based matching algorithm
- Can be swapped without changing domain

**API** (outermost):
- HTTP/REST layer
- Request/response handling
- Dependency injection

## Benefits

1. **Testability**: Each layer can be tested independently
2. **Flexibility**: Easy to swap implementations (CSV → Neo4j, demonstrated!)
3. **Maintainability**: Clear separation of concerns
4. **Scalability**: Can add features without breaking existing code
5. **Graph Power**: Leverages Neo4j's graph algorithms for efficient circular matching

## Setup

### Prerequisites

- Docker and Docker Compose

### Docker Setup (Recommended)

The easiest way to run the backend-matching service is using Docker Compose from the **project root**:

#### 1. Start All Services

```bash
# From the project root directory
cd /path/to/ruilarts
docker-compose up -d
```

This starts:
- **Neo4j** database (ports 7474, 7687)
- **Backend-matching API** (port 8000)
- PostgreSQL database (for huisartsen-api)
- Huisartsen API (port 5001)

#### 2. Load Initial Data

After services are running, load the sample data into Neo4j:

```bash
docker-compose exec backend-matching python scripts/migrate_csv_to_neo4j.py
```

This will:
- Clear the Neo4j database
- Create schema (constraints and indexes)
- Load all people and practices from `data/sample_circle.csv`
- Verify the migration

#### 3. Access the Services

- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **Neo4j Browser**: http://localhost:7474 (login: neo4j / ruilarts123)

#### View Logs

```bash
# All services
docker-compose logs -f

# Just backend-matching
docker-compose logs -f backend-matching

# Just Neo4j
docker-compose logs -f neo4j
```

#### Stop Services

```bash
docker-compose down

# Or stop and remove volumes (clears all data)
docker-compose down -v
```

### Local Development Setup (Alternative)

If you prefer to run the services locally without Docker:

#### 1. Start Neo4j Database

```bash
# From the project root
docker-compose up -d neo4j
```

#### 2. Install Python Dependencies

```bash
cd backend-matching
pip install -r requirements.txt
```

#### 3. Load Initial Data

```bash
python scripts/migrate_csv_to_neo4j.py
```

#### 4. Start the API Server

```bash
python run.py
# Or use uvicorn directly:
# uvicorn src.api.main:app --reload
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### People Management

**POST /api/people** - Add a new person
```bash
curl -X POST http://localhost:8000/api/people \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "current_practice_name": "Huisartsen Amsterdam",
    "current_location": "Amsterdam",
    "desired_practice_first": "Huisartsen Utrecht",
    "desired_location_first": "Utrecht",
    "desired_practice_second": "Huisartsen Rotterdam",
    "desired_location_second": "Rotterdam"
  }'
```

**GET /api/people/{id}** - Get person details
```bash
curl http://localhost:8000/api/people/{person_id}
```

### Matching

**POST /api/matches** - Run matching algorithm
```bash
curl -X POST http://localhost:8000/api/matches
```

Returns:
- All circular matches found
- Unmatched people
- Statistics

**GET /api/matches** - Get cached results
```bash
curl http://localhost:8000/api/matches
```

### Statistics

**GET /api/statistics** - Get summary statistics
```bash
curl http://localhost:8000/api/statistics
```

Returns:
- Total people, matched, unmatched
- Match rate and preference fulfillment
- Circle size distribution

## Example Workflow

```bash
# 1. Ensure Neo4j is running and data is loaded
docker-compose up -d
python scripts/migrate_csv_to_neo4j.py

# 2. Start the API server
python run.py

# 3. Add a new person (optional)
curl -X POST http://localhost:8000/api/people -H "Content-Type: application/json" -d '{
  "name": "Jan de Vries",
  "current_practice_name": "Huisartsen Amsterdam",
  "current_location": "Amsterdam",
  "desired_practice_first": "Huisartsen Utrecht",
  "desired_location_first": "Utrecht"
}'

# 4. Run the matching algorithm
curl -X POST http://localhost:8000/api/matches

# 5. View match results
curl http://localhost:8000/api/matches

# 6. View statistics
curl http://localhost:8000/api/statistics
```

## Exploring Neo4j

You can explore the data directly in Neo4j Browser:

1. Open http://localhost:7474
2. Login with: neo4j / ruilarts123
3. Try these queries:

```cypher
// View all people and their current practices
MATCH (p:Person)-[:CURRENTLY_AT]->(pr:Practice)
RETURN p, pr
LIMIT 25

// View people and their preferences
MATCH (p:Person)-[r:WANTS_FIRST|WANTS_SECOND]->(pr:Practice)
RETURN p.name, type(r) as preference, pr.name, pr.location

// Find a 2-person circular match
MATCH (p1:Person)-[:CURRENTLY_AT]->(pr1:Practice)
MATCH (p1)-[:WANTS_FIRST]->(pr2:Practice)<-[:CURRENTLY_AT]-(p2:Person)
MATCH (p2)-[:WANTS_FIRST]->(pr1:Practice)
RETURN p1.name, pr1.name, p2.name, pr2.name
LIMIT 5
```

## Development

### Running Tests

```bash
# Add tests in tests/ directory
pytest
```

### Adding a New Repository

1. Create class implementing `PersonRepository` interface
2. Update `dependencies.py` to inject it
3. No changes needed in domain or application layers!

### Adding a New Matching Algorithm

1. Create class implementing `MatchingAlgorithm` interface
2. Update `dependencies.py` to inject it
3. Business logic remains unchanged!

## Neo4j Integration

This backend now uses Neo4j as the primary data store! The integration demonstrates clean architecture's flexibility:

### What Changed
- ✅ Added `Neo4jPersonRepository` implementing `PersonRepository`
- ✅ Added `Neo4jMatcher` implementing `MatchingAlgorithm`
- ✅ Updated `dependencies.py` to inject Neo4j implementations
- ✅ Added migration script to load CSV data into Neo4j
- ⚠️ **No changes** to domain models or application logic!

### Architecture Benefits Demonstrated
The ability to swap from CSV to Neo4j with minimal changes proves the power of clean architecture:
- Domain layer: Unchanged
- Application layer: Unchanged
- Infrastructure: New implementations added
- API: Only dependency injection updated

### Graph Model

**Nodes**:
- `Person` (id, name, current_location)
- `Practice` (name, location)

**Relationships**:
- `CURRENTLY_AT`: Person → Practice (current practice)
- `WANTS_FIRST`: Person → Practice (1st choice, includes location)
- `WANTS_SECOND`: Person → Practice (2nd choice, includes location)

### Environment Variables

The Neo4j connection can be configured via environment variables:

```bash
export NEO4J_URI="bolt://localhost:7687"
export NEO4J_USER="neo4j"
export NEO4J_PASSWORD="ruilarts123"
```

Defaults are provided if not set.

## Troubleshooting

### Neo4j Connection Failed

If you see "Failed to connect to Neo4j":

```bash
# Check if Neo4j is running
docker ps | grep neo4j

# If not, start it
cd backend && docker-compose up -d

# Check logs
docker logs ruilarts-neo4j
```

### Empty Database

If no matches are found:

```bash
# Re-run migration
python scripts/migrate_csv_to_neo4j.py
```

### Port Conflicts

If ports 7474 or 7687 are in use:
- Edit `docker-compose.yml` to use different ports
- Update `NEO4J_URI` environment variable

## Next Steps

Potential enhancements:
1. ✅ ~~Neo4j integration~~ (Complete!)
2. **Authentication**: Add user authentication
3. **WebSockets**: Real-time match notifications
4. **Frontend**: Build React/Vue UI using this API
5. **Tests**: Add comprehensive test suite
6. **Advanced matching**: Use Neo4j Graph Data Science algorithms

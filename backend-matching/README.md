# Ruilarts Backend Matching

A REST API for the Ruilarts circular matching system, built with Hono framework and powered by Neo4j graph database.

## Features

- Circular matching algorithm for huisarts (GP) swaps
- RESTful API built with Hono (fast, lightweight, edge-ready)
- Neo4j graph database for efficient cycle detection
- TypeScript for type safety
- Multi-preference matching (first and second choices)

## Architecture

This backend follows a clean layered architecture with clear separation of concerns:

```
src/
├── models/          # TypeScript types and interfaces
│   ├── person.ts    # Person, Practice domain models
│   └── match.ts     # Circle, MatchResult models
├── services/        # Business logic
│   ├── neo4j.ts     # Neo4j connection and repository
│   └── matching.ts  # Matching algorithm implementation
├── routes/          # API endpoints
│   ├── people.ts    # People management endpoints
│   ├── matches.ts   # Matching endpoints
│   └── statistics.ts # Statistics endpoints
├── config.ts        # Configuration management
└── index.ts         # Main application entry point
```

### Layers

**Models** (domain):
- Core business entities and types
- No external dependencies
- Pure TypeScript interfaces and types

**Services** (application):
- Business logic and orchestration
- Neo4j integration and graph operations
- Matching algorithm implementation

**Routes** (API):
- HTTP/REST layer
- Request/response handling
- Input validation

## Benefits

1. **Testability**: Each layer can be tested independently
2. **Maintainability**: Clear separation of concerns
3. **Type Safety**: Full TypeScript coverage
4. **Performance**: Hono is extremely fast and lightweight
5. **Graph Power**: Leverages Neo4j's graph algorithms for efficient circular matching

## Setup

### Prerequisites

- Node.js 18+ or 20+
- Docker and Docker Compose (recommended)

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

#### 2. Access the Services

- **Backend API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
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

#### Rebuild After Changes

```bash
# Rebuild the backend-matching service
docker-compose build backend-matching

# Restart the service
docker-compose up -d backend-matching
```

#### Stop Services

```bash
docker-compose down

# Or stop and remove volumes (clears all data)
docker-compose down -v
```

### Docker Build (Alternative)

To build and run just the backend-matching service with Docker:

```bash
cd backend-matching

# Build the image
docker build -t ruilarts-backend-matching .

# Run the container
docker run -p 8000:8000 \
  -e NEO4J_URI=bolt://host.docker.internal:7687 \
  -e NEO4J_USERNAME=neo4j \
  -e NEO4J_PASSWORD=ruilarts123 \
  ruilarts-backend-matching
```

Note: Use `host.docker.internal` on Mac/Windows to connect to Neo4j running on the host.

### Local Development Setup (Alternative)

If you prefer to run the services locally without Docker:

#### 1. Start Neo4j Database

```bash
# From the project root
docker-compose up -d neo4j
```

#### 2. Install Dependencies

```bash
cd backend-matching
npm install
```

#### 3. Configure Environment

Create a `.env` file:

```bash
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=ruilarts123
PORT=8000
```

#### 4. Start the Development Server

```bash
# Development mode with hot reload
npm run dev

# Or build and run production
npm run build
npm start
```

The API will be available at:
- **API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Health Check

**GET /health** - Check API and Neo4j connectivity
```bash
curl http://localhost:8000/health
```

### People Management

**POST /api/people** - Add a new person
```bash
curl -X POST http://localhost:8000/api/people \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "currentPracticeName": "Huisartsen Amsterdam",
    "currentLocation": "Amsterdam",
    "choices": [
      {
        "practiceName": "Huisartsen Utrecht",
        "location": "Utrecht"
      },
      {
        "practiceName": "Huisartsen Rotterdam",
        "location": "Rotterdam"
      }
    ]
  }'
```

**GET /api/people/{id}** - Get person details
```bash
curl http://localhost:8000/api/people/{person_id}
```

**GET /api/people** - Get all people
```bash
curl http://localhost:8000/api/people
```

**DELETE /api/people/{id}** - Delete a person
```bash
curl -X DELETE http://localhost:8000/api/people/{person_id}
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
# 1. Ensure services are running
docker-compose up -d

# 2. Check health
curl http://localhost:8000/health

# 3. Add a new person
curl -X POST http://localhost:8000/api/people \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jan de Vries",
    "currentPracticeName": "Huisartsen Amsterdam",
    "currentLocation": "Amsterdam",
    "choices": [
      {
        "practiceName": "Huisartsen Utrecht",
        "location": "Utrecht"
      }
    ]
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

// Find all cycles of any size
MATCH path = (p:Person)-[:CURRENTLY_AT]->(:Practice)<-[:WANTS_FIRST|WANTS_SECOND*]-(p)
WHERE length(path) > 2
RETURN path
LIMIT 10
```

## Matching Algorithm

The algorithm finds circular swaps where multiple people can exchange huisarts practices:

1. **Build graph**: Create Person and Practice nodes with relationships
   - `CURRENTLY_AT`: Person → Practice (current)
   - `WANTS_FIRST`: Person → Practice (1st preference)
   - `WANTS_SECOND`: Person → Practice (2nd preference)

2. **Find cycles**: Use Neo4j Cypher queries to detect circular patterns
   - Check for 2-person, 3-person, and 4-person cycles
   - First try with first preferences only
   - Then try with second preferences for unmatched people

3. **Select matches**: Use greedy algorithm to select non-overlapping cycles
   - Prefer smaller circles (easier to coordinate)
   - Ensure no person appears in multiple circles
   - Maximize total matches

4. **Return results**: Package matched circles and unmatched people with statistics

### Graph Model

**Nodes**:
- `Person` (id, name, currentLocation)
- `Practice` (name, location)

**Relationships**:
- `CURRENTLY_AT`: Person → Practice (current practice)
- `WANTS_FIRST`: Person → Practice (1st choice with location)
- `WANTS_SECOND`: Person → Practice (2nd choice with location)

## Technology Stack

- **Framework**: Hono (v4)
- **Language**: TypeScript (v5)
- **Database**: Neo4j (v5)
- **Runtime**: Node.js (v20)
- **Dev Tools**: tsx for hot reload, tsc for building

## Environment Variables

The application can be configured via environment variables:

```bash
NEO4J_URI=bolt://localhost:7687       # Neo4j connection URI
NEO4J_USERNAME=neo4j                   # Neo4j username
NEO4J_PASSWORD=ruilarts123            # Neo4j password
PORT=8000                             # API server port
```

Defaults are provided in `src/config.ts` if not set.

## Development

### Type Checking

```bash
npm run typecheck
```

### Code Structure

When adding new features:

1. **Add types** in `src/models/` for new entities
2. **Implement logic** in `src/services/` for business operations
3. **Create routes** in `src/routes/` for API endpoints
4. **Update config** in `src/config.ts` if adding new settings

### Hot Reload

The development server (`npm run dev`) watches for file changes and automatically restarts.

## Troubleshooting

### Neo4j Connection Failed

If you see "Failed to connect to Neo4j" or unhealthy status:

```bash
# Check if Neo4j is running
docker ps | grep neo4j

# If not, start it
docker-compose up -d neo4j

# Check Neo4j logs
docker-compose logs neo4j

# Wait for Neo4j to be healthy
docker-compose ps
```

### Port Conflicts

If ports 7474, 7687, or 8000 are in use:

**For Neo4j** (7474, 7687):
- Edit `docker-compose.yml` to use different ports
- Update `NEO4J_URI` environment variable accordingly

**For API** (8000):
- Change `PORT` environment variable
- Update `docker-compose.yml` port mapping

### TypeScript Build Errors

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Docker Build Issues

```bash
# Rebuild from scratch
docker-compose build --no-cache backend-matching
docker-compose up -d backend-matching
```

## Next Steps

Potential enhancements:

1. **Authentication**: Add user authentication and authorization
2. **WebSockets**: Real-time match notifications
3. **Advanced matching**: Use Neo4j Graph Data Science algorithms
4. **Persistence**: Cache match results in Neo4j
5. **Testing**: Add comprehensive test suite with Vitest
6. **Validation**: Add request validation with Zod
7. **Frontend**: Build React/Vue UI using this API

## License

MIT

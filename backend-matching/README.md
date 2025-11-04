# Ruilarts Backend Matching - Node.js

A Node.js/TypeScript rewrite of the Python backend matching service using Hono framework and Neo4j.

## Features

- Circular matching algorithm for huisarts (GP) swaps
- RESTful API built with Hono (fast, lightweight, edge-ready)
- Neo4j graph database for efficient cycle detection
- TypeScript for type safety
- Multi-preference matching (first and second choices)

## Architecture

```
src/
├── models/          # TypeScript types and interfaces
├── services/        # Business logic (Neo4j, matching algorithm)
├── routes/          # API endpoints
├── config.ts        # Configuration management
└── index.ts         # Main application entry point
```

## Prerequisites

- Node.js 18+ or 20+
- Neo4j database running on `bolt://localhost:7687`
- Neo4j credentials: username `neo4j`, password `ruilarts123`

## Installation

```bash
npm install
```

## Configuration

Copy `.env` file and adjust if needed:

```bash
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=ruilarts123
PORT=8000
```

## Running

### Development mode (with hot reload)
```bash
npm run dev
```

### Production build
```bash
npm run build
npm start
```

### Type checking
```bash
npm run typecheck
```

## API Endpoints

### Health Check
- `GET /health` - Check API and Neo4j connectivity

### People Management
- `POST /api/people` - Add a new person
- `GET /api/people/:id` - Get person by ID
- `GET /api/people` - Get all people
- `DELETE /api/people/:id` - Delete a person

### Matching
- `POST /api/matches` - Run the matching algorithm
- `GET /api/matches` - Get cached matching results

### Statistics
- `GET /api/statistics` - Get matching statistics

## Example: Add a Person

```bash
curl -X POST http://localhost:8000/api/people \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "currentPracticeName": "Practice A",
    "currentLocation": "Amsterdam",
    "desiredPracticeFirst": "Practice B",
    "desiredLocationFirst": "Rotterdam",
    "desiredPracticeSecond": "Practice C",
    "desiredLocationSecond": "Utrecht"
  }'
```

## Example: Run Matching

```bash
curl -X POST http://localhost:8000/api/matches
```

## Matching Algorithm

The algorithm finds circular swaps where multiple people can exchange huisarts practices:

1. Build a directed graph: current practice → desired practice
2. Find all cycles (size 2, 3, and 4) using Neo4j Cypher queries
3. Select non-overlapping cycles (greedy algorithm, smallest first)
4. Try first preferences, then second preferences for unmatched people
5. Return matched circles and unmatched people with statistics

## Technology Stack

- **Framework**: Hono (v4)
- **Language**: TypeScript (v5)
- **Database**: Neo4j (v5)
- **Runtime**: Node.js (v18+)
- **Dev Tools**: tsx for hot reload

## Migration from Python

This is a complete rewrite of the Python FastAPI backend with:
- Same API endpoints and response formats
- Same matching algorithm logic
- Simplified architecture (3 layers vs 4)
- Hono instead of FastAPI
- Native TypeScript types instead of Pydantic

## License

MIT

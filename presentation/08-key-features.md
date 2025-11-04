# Key Features

## What Makes Ruilarts Special

---

## 1. Intelligent Circular Matching

**Multi-Size Detection:**
- Searches for circles of 2-10 people simultaneously
- Finds all possible combinations
- Ranks by quality

**Smart Ranking:**
```typescript
score = (maxPref × 10) + (totalScore × 1) + (|size - 5| × 20)
```
- Balances preference satisfaction with practical coordination
- Configurable weights for different use cases
- Transparent scoring shown in logs

**Real-Time Matching:**
- Triggered automatically when person registers
- Asynchronous processing (doesn't block API)
- Results available within seconds

---

## 2. Multi-Choice Preference System

**Flexibility:**
- Up to 10 practice choices per person
- Ordered by preference (first choice = most desired)
- Algorithm tries first choices before second choices

**Example:**
```json
{
  "name": "Jan",
  "currentPracticeId": 48,
  "choices": [69, 33, 1, 25, 37, ...]
}
```

**Smart Fallback:**
- If first choice unavailable, tries second
- If second unavailable, tries third
- Maximizes match probability

---

## 3. Graph Database Power

**Neo4j Advantages:**
```cypher
// Find cycles in milliseconds
MATCH (p0)-[:WANTS]->(pr1)<-[:CURRENTLY_AT]-(p1)-[:WANTS]->(pr0)
WHERE p0.id = $personId
RETURN p0, p1, pr0, pr1
```

**Why Graphs?**
- ⚡ Fast pattern matching (O(n^k) → O(n) with indexes)
- 🔍 Intuitive relationship modeling
- 🎯 Purpose-built for cycles
- 📈 Scales to millions of relationships

**vs. Traditional SQL:**
```sql
-- Equivalent SQL would require complex joins
-- Multiple recursive CTEs
-- Much slower performance
-- Harder to maintain
```

---

## 4. Two-Database Architecture

**Neo4j (Active Pool):**
- Fast matching queries
- Temporary storage
- Cleaned after matching
- Stays lean and fast

**PostgreSQL (Persistence):**
- Permanent circle records
- Audit trail
- Reporting & analytics
- Historical data

**Benefits:**
- 🚀 Best performance for each use case
- 🔒 Data reliability
- 📊 Complete history
- 🧹 Automatic cleanup

---

## 5. Comprehensive Practice Data

**3,000+ Huisarts Practices:**
- Scraped from Zorgkaart Nederland
- Name, address, coordinates
- Practice size, patient reviews
- Contact information

**Geographic Search:**
```typescript
// Haversine distance formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  // ... calculate great-circle distance
  return distance;
}
```

**Find Closest:**
- Returns 3 nearest practices
- Based on user's location
- Sorted by distance
- Includes practice details

---

## 6. Route Planning Integration

**GraphHopper:**
- Netherlands OSM data
- Door-to-door routing
- Multiple transport modes
- Visual route display

**Use Case:**
- Show distance to desired practices
- Help users make informed choices
- Visualize "how far is too far?"

---

## 7. Clean API Design

**RESTful Endpoints:**
```http
# Person Management
POST   /api/people          # Register
GET    /api/people          # List unmatched
GET    /api/people/:id      # Details
DELETE /api/people/:id      # Remove

# Match Retrieval
GET    /api/matches         # All circles
GET    /api/matches/:id     # Specific circle

# System
GET    /health              # Status check
```

**Bruno Collection:**
- All endpoints documented
- Example requests
- Ready for testing

---

## 8. Modern Frontend

**Built with:**
- React 19 (latest)
- TanStack Start (meta-framework)
- Untitled UI components
- Tailwind CSS 4

**Features:**
- 🎨 Responsive design
- 📱 Mobile-friendly
- ♿ Accessible
- 🇳🇱 Dutch language (B1 level)

**User Flow:**
1. Enter address (PDOK lookup)
2. Select current practice
3. Choose desired practices (up to 10)
4. Submit → Matching happens
5. Get notified when circle forms

---

## 9. Configuration-Driven

**Environment Variables:**
```bash
# Matching
MAX_PRACTICE_CHOICES=10
MAX_CIRCLE_SIZE=10
IDEAL_CIRCLE_SIZE=5

# Scoring
PREFERENCE_WEIGHT=10
TOTAL_SCORE_WEIGHT=1
SIZE_WEIGHT=20

# Databases
NEO4J_URI=bolt://localhost:7687
POSTGRES_HOST=localhost
```

**No Code Changes Needed:**
- Tune algorithm via config
- Different settings per environment
- Easy A/B testing

---

## 10. Comprehensive Logging

**Every Step Logged:**
```
[Matcher] Starting match search for person 123...
[Matcher] Searching for cycles of size 2...
[Matcher] Query returned 1 record(s)
[Matcher] Cycle found: Karel(33→48[0]) → Jan(48→33[1])
[Matcher] Cycle size 2: maxPref=1, total=1, score=71.00
[Matcher] Best cycle: size=3, maxPref=1, totalScore=2
[Cleanup] Saving circle to PostgreSQL...
[Cleanup] ✓ Circle saved
[Cleanup] Deleting Person nodes from Neo4j...
[Cleanup] ✓ Cleanup completed
```

**Debuggability:**
- See exactly what algorithm found
- Understand why a circle was chosen
- Track performance
- Monitor errors

---

## 11. Automatic Cleanup

**After Match:**
1. Circle saved to PostgreSQL ✓
2. Matched persons removed from Neo4j ✓
3. Orphaned practices cleaned up ✓

**Keeps Graph Lean:**
```cypher
// Remove practices with no connections
MATCH (pr:Practice)
WHERE NOT (pr)<-[:CURRENTLY_AT]-()
  AND NOT (pr)<-[:WANTS]-()
DELETE pr
```

**Benefits:**
- Fast queries
- Lower memory usage
- No manual maintenance

---

## 12. Rollback Protection

**Transaction Safety:**
```typescript
try {
  await postgresService.saveCircle(circle);  // Step 1
  await neo4jService.deletePeople(personIds); // Step 2
  await neo4jService.cleanupPractices();      // Step 3
} catch (error) {
  // PostgreSQL failed → Neo4j cleanup skipped
  // People stay marked as matched
  // Can retry or handle manually
  console.error('Cleanup failed:', error);
}
```

**Data Integrity:**
- Never lose matched circles
- Consistent state
- Error recovery

---

## 13. Test Scenarios

**Three realistic cases:**

**1. Complete Circle (10 people):**
- Amsterdam → Utrecht → Rotterdam → ... → Amsterdam
- All first preferences
- Perfect match

**2. Isolated Pair:**
- Karen ↔ Lars
- Direct swap
- Independent of main circle

**3. Unmatched Person:**
- Maria wants non-existent practice
- Stays unmatched
- No forced bad matches

**CSV Import:**
- Easy to load test data
- Reproducible scenarios
- Rapid testing

---

## 14. Health Monitoring

**Comprehensive Health Check:**
```typescript
GET /health

{
  "status": "healthy",
  "neo4j": "connected",
  "postgres": "connected"
}
```

**Monitors:**
- Neo4j connectivity
- PostgreSQL connectivity
- Overall system status
- Returns 503 if unhealthy

---

## 15. Docker Orchestration

**5 Services:**
```yaml
services:
  - backend-matching (Port 8000)
  - huisartsen-api (Port 5001)
  - backend-geo (Port 4000)
  - graphhopper (Port 8989)
  - frontend (Port 3000)

databases:
  - neo4j (Port 7687)
  - postgres (Port 5432)
```

**Single Command:**
```bash
docker-compose up
```

**Everything Just Works™**

---

## Bonus: Migration System

**SQL Migrations:**
```sql
-- migrations/001_create_circles_tables.sql
CREATE TABLE circles (...);
CREATE TABLE circle_members (...);
CREATE INDEX ...;
```

**Auto-Run on Startup:**
```typescript
async function startServer() {
  await postgresService.runMigrations();
  // ... start HTTP server
}
```

**Version Controlled:**
- Migrations checked into git
- Reproducible database schema
- Easy rollback if needed

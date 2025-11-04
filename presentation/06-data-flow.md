# Data Flow

## From Registration to Match to Persistence

---

### Step 1: Person Registration

**User submits:**
```json
{
  "name": "Jan de Vries",
  "currentPracticeId": 48,
  "choices": [69, 33, 1]  // Ordered preferences
}
```

**Backend creates:**
```cypher
CREATE (p:Person {id: <uuid>, name: "Jan de Vries"})
CREATE (pr48:Practice {id: 48})
CREATE (pr69:Practice {id: 69})
CREATE (pr33:Practice {id: 33})
CREATE (pr1:Practice {id: 1})

CREATE (p)-[:CURRENTLY_AT]->(pr48)
CREATE (p)-[:WANTS {order: 0}]->(pr69)  // First choice
CREATE (p)-[:WANTS {order: 1}]->(pr33)  // Second choice
CREATE (p)-[:WANTS {order: 2}]->(pr1)   // Third choice
```

---

### Step 2: Automatic Matching

**Triggered asynchronously:**
```typescript
// In POST /api/people route
const person = await neo4jService.addPerson(data);

// Fire and forget (async matching)
matcherService.findMatchesForPerson(person.id)
  .then(circle => {
    if (circle) {
      console.log(`Match found! Circle size: ${circle.size}`);
    }
  });

return res.json(person, 201);  // Don't wait for matching
```

**Why async?**
- API responds immediately
- Matching can take time for large graphs
- User gets instant feedback

---

### Step 3: Cycle Detection

**Neo4j searches for patterns:**

```
Current Graph State:
- Anna: at 37, wants [77, 48]
- Piet: at 69, wants [25, 37]
- Karel: at 33, wants [48, 100]
- Sophie: at 1, wants [69, 200]
- Jan: at 48, wants [69, 33, 1]
```

**Detects circles:**
1. ✓ Karel(33) → 48 → Jan(48) → 33 (size=2)
2. ✓ Anna(37) → 48 → Jan(48) → 69 → Piet(69) → 37 (size=3)
3. ✓ Anna(37) → 48 → Jan(48) → 1 → Sophie(1) → 69 → Piet(69) → 37 (size=4)

---

### Step 4: Ranking & Selection

**Scores computed:**
```
Circle 1 (size=2): score = 71
Circle 2 (size=3): score = 52  ✓ BEST
Circle 3 (size=4): score = 44
```

Wait, size=4 has lower score!

**Adjusted weights favor quality:**
```bash
# Environment variable override
SIZE_WEIGHT=10  # Less emphasis on size
```

**Recalculated:**
```
Circle 1: score = 41
Circle 2: score = 32  ✓ BEST (better preferences)
Circle 3: score = 34
```

Configurability is key! 🎛️

---

### Step 5: Circle Creation

**Build Circle object:**
```typescript
{
  id: "123e4567-...",  // UUID
  size: 3,
  people: [
    {
      person: { id: "anna-id", name: "Anna", ... },
      choiceIndex: 1,  // Used 2nd choice
      getsSpotFrom: "Piet"
    },
    {
      person: { id: "jan-id", name: "Jan", ... },
      choiceIndex: 0,  // Used 1st choice
      getsSpotFrom: "Anna"
    },
    {
      person: { id: "piet-id", name: "Piet", ... },
      choiceIndex: 1,  // Used 2nd choice
      getsSpotFrom: "Jan"
    }
  ],
  choiceIndex: 1  // Worst preference used
}
```

---

### Step 6: Persistence & Cleanup

**CleanupService orchestrates:**

```typescript
async cleanupMatchedCircle(circle, metadata) {
  // 1. Save to PostgreSQL
  await postgresService.query(`
    INSERT INTO circles (id, size, max_preference_order, ...)
    VALUES ($1, $2, $3, ...)
  `);

  await postgresService.query(`
    INSERT INTO circle_members (circle_id, person_id, ...)
    VALUES ...
  `);

  // 2. Delete from Neo4j
  await neo4jService.query(`
    MATCH (p:Person) WHERE p.id IN $personIds
    DETACH DELETE p
  `);

  // 3. Clean up orphans
  await neo4jService.query(`
    MATCH (pr:Practice)
    WHERE NOT (pr)<-[:CURRENTLY_AT]-()
      AND NOT (pr)<-[:WANTS]-()
    DELETE pr
  `);
}
```

**Rollback protection:**
- If PostgreSQL fails, Neo4j cleanup is skipped
- People stay marked as matched (`matchedInCircleId`)
- Can be retried or handled manually

---

### Step 7: Retrieval

**Frontend fetches matched circles:**

```http
GET /api/matches
```

**Response from PostgreSQL:**
```json
{
  "circles": [
    {
      "id": "123e4567-...",
      "size": 3,
      "max_preference_order": 1,
      "total_preference_score": 2,
      "created_at": "2025-11-04T18:52:00Z",
      "status": "active",
      "members": [
        {
          "person_id": "anna-id",
          "person_name": "Anna de Vries",
          "current_practice_id": 37,
          "desired_practice_id": 48,
          "preference_order": 1,
          "gets_spot_from": "Piet Janssen"
        },
        // ... more members
      ]
    }
  ],
  "total": 1
}
```

**Benefits:**
- Fast reads (indexed PostgreSQL)
- Historical data preserved
- Neo4j freed up for new matches

---

### Complete Flow Diagram

```
┌─────────────┐
│   User      │
│ Registers   │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  POST /people    │
│  Create in Neo4j │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Async Matching   │
│ Find Cycles 2-10 │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Rank & Select   │
│  Best Circle     │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Save PostgreSQL  │
│ Delete Neo4j     │
│ Cleanup Orphans  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ GET /matches     │
│ Show Circle      │
└──────────────────┘
```

---

### Data Lifecycle

**Neo4j (Temporary):**
```
Person Added → Searching → Matched → DELETED
                    ↓
                  (if no match, stays)
```

**PostgreSQL (Permanent):**
```
Circle Created → Stored Forever → Available for Reporting
```

**Practice Nodes:**
```
Created with Person → Person Deleted → Check Usage → Delete if Orphaned
```

Efficient and clean! 🧹✨

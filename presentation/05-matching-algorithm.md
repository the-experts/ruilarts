# The Matching Algorithm

## Graph-Based Cycle Detection

---

### Graph Model (Neo4j)

**Nodes:**
```cypher
(:Person {id: UUID, name: string, matchedInCircleId?: UUID})
(:Practice {id: number})
```

**Relationships:**
```cypher
(Person)-[:CURRENTLY_AT]->(Practice)
(Person)-[:WANTS {order: 0..9}]->(Practice)
```

**Example:**
```
Anna -[:CURRENTLY_AT]-> Practice37
Anna -[:WANTS {order: 0}]-> Practice25
Anna -[:WANTS {order: 1}]-> Practice48
```

---

### Cycle Detection Query

**For 3-person circle:**
```cypher
MATCH (p0:Person)-[:CURRENTLY_AT]->(pr0:Practice),
      (p0)-[w0:WANTS]->(pr1:Practice),
      (p1:Person)-[:CURRENTLY_AT]->(pr1),
      (p1)-[w1:WANTS]->(pr2:Practice),
      (p2:Person)-[:CURRENTLY_AT]->(pr2),
      (p2)-[w2:WANTS]->(pr0)
WHERE p0.id = $personId
  AND p0 <> p1 AND p1 <> p2 AND p2 <> p0
  AND (p1.matchedInCircleId IS NULL OR p1.matchedInCircleId = '')
  AND (p2.matchedInCircleId IS NULL OR p2.matchedInCircleId = '')
RETURN p0, pr0, w0, p1, pr1, w1, p2, pr2, w2
```

**Reads as:**
- p0 is currently at pr0, wants pr1
- p1 is currently at pr1, wants pr2
- p2 is currently at pr2, wants pr0
- **Full circle!** 🎯

---

### Dynamic Query Generation

```typescript
buildCycleQuery(size: number) {
  for (let i = 0; i < size; i++) {
    const nextIdx = (i + 1) % size;  // Wrap around

    // Person i currently at Practice i
    patterns.push(`(p${i}:Person)-[:CURRENTLY_AT]->(pr${i}:Practice)`);

    // Person i wants Practice of next person
    patterns.push(`(p${i})-[w${i}:WANTS]->(pr${nextIdx})`);
  }
  // ... add WHERE clauses for distinctness and matching status
}
```

**Searches sizes 2 to 10 simultaneously!**

---

### Ranking System

**Three factors weighted:**

```typescript
score = (maxPreferenceOrder × 10)
      + (totalPreferenceScore × 1)
      + (|circleSize - 5| × 20)
```

**Priority:**
1. **Preference Quality**: Lower is better
   - First choice (0) beats second choice (1)
   - Heavily weighted (×10)

2. **Total Satisfaction**: Sum of all preferences
   - Lightly weighted (×1)
   - Tie-breaker

3. **Circle Size**: Closest to 5
   - Not too small (hard to coordinate)
   - Not too large (harder to coordinate)
   - Weighted (×20)

---

### Example Ranking

**Found 3 circles:**

```
Circle A: size=2, maxPref=1, totalScore=1
  Score = (1×10) + (1×1) + (|2-5|×20) = 10 + 1 + 60 = 71

Circle B: size=3, maxPref=1, totalScore=2
  Score = (1×10) + (2×1) + (|3-5|×20) = 10 + 2 + 40 = 52

Circle C: size=4, maxPref=2, totalScore=4
  Score = (2×10) + (4×1) + (|4-5|×20) = 20 + 4 + 20 = 44 ✓ WINNER
```

**Circle C wins** despite having worse preferences because it's closer to ideal size!

---

### Algorithm Steps

```typescript
async findMatchesForPerson(personId: string) {
  // 1. Search for all cycle sizes (2-10)
  for (size = 2; size <= MAX_CIRCLE_SIZE; size++) {
    cycles = findCyclesOfSize(personId, size);
    allCycles.push(...cycles);
  }

  // 2. Rank by weighted score
  rankedCycles = rankCycles(allCycles);
  bestCycle = rankedCycles[0];

  // 3. Create circle object
  circle = createCircleFromCycle(bestCycle);

  // 4. Save & cleanup
  await cleanupService.cleanupMatchedCircle(circle, metadata);

  return circle;
}
```

**Time Complexity:** O(n^k) where k is circle size
- Mitigated by: anchor person, already-matched filtering
- Fast enough for sizes 2-10 with realistic data

---

### Logging Example

```
[Matcher] Starting match search for person 123e4567-...
[Matcher] Max circle size: 10

[Matcher] Searching for cycles of size 2...
[Matcher] Query returned 1 record(s)
[Matcher] Cycle found: Karel(33→48[0]) → Jan(48→33[1])
[Matcher] Found 1 cycle(s) of size 2

[Matcher] Searching for cycles of size 3...
[Matcher] Query returned 1 record(s)
[Matcher] Cycle found: Anna(37→48[1]) → Jan(48→69[0]) → Piet(69→37[1])
[Matcher] Found 1 cycle(s) of size 3

[Matcher] Total cycles found: 2

[Matcher] Cycle size 2: maxPref=1, total=1, distance=3, score=71.00
[Matcher] Cycle size 3: maxPref=1, total=2, distance=2, score=52.00

[Matcher] Best cycle: size=3, maxPref=1, totalScore=2
[Matcher] Created circle with 3 people
```

**Full observability!** 🔍

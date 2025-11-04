# The Solution

## Circular Matching Algorithm

---

### How It Works

```
Person A (currently at Practice 37) wants Practice 48
Person B (currently at Practice 48) wants Practice 69
Person C (currently at Practice 69) wants Practice 37

✨ MATCH FOUND! ✨

A → 48 → B → 69 → C → 37 → A
```

**Everyone gets a new huisarts closer to their new home!**

---

### The System

1. **Register**: Enter current practice + desired practices (up to 10 choices)
2. **Match**: Algorithm detects circular patterns automatically
3. **Notify**: When a circle forms, all participants are notified
4. **Swap**: Coordinate the simultaneous exchange

---

### Key Innovation

🎯 **Graph Database (Neo4j)**
- Perfect for detecting cycles in relationships
- Fast pattern matching
- Handles complex multi-person swaps (2-10 people)

🎯 **Intelligent Ranking**
- Prefers first choices over second choices
- Balances circle size (sweet spot: 5 people)
- Configurable scoring system

🎯 **Automatic Cleanup**
- Matched people removed from graph
- Circles persisted to PostgreSQL
- System stays efficient

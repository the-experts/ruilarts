# Ruilarts

A circular matching algorithm to help people who moved homes find a huisarts (general practitioner) in their new location.

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

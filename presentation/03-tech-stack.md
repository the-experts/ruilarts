# Tech Stack

## Modern, Scalable, Type-Safe

---

### Backend Services

**1. Backend-Matching (Port 8000)**
```typescript
Framework: Hono (fast, edge-ready)
Language: TypeScript 5
Graph DB: Neo4j 5.15
Persistence: PostgreSQL
```
- Core matching algorithm
- Person management
- Circle detection & ranking

**2. Huisartsen API (Port 5001)**
```python
Framework: Flask
Database: PostgreSQL
```
- 3,000+ huisarts practice records
- Search & filtering
- Closest practice finder (Haversine)

**3. Backend-Geo (Port 4000)**
```javascript
Framework: Node.js
```
- Geographic services
- Address lookup integration

**4. GraphHopper (Port 8989)**
- Route planning engine
- Netherlands OSM data
- Visual route display

---

### Frontend

```typescript
Framework: React 19 + TanStack Start
UI Components: Untitled UI + shadcn/ui + Radix UI
Styling: Tailwind CSS 4
Forms: React Hook Form + Zod
Build Tool: Vite
```

**Features:**
- Landing page (Dutch, B1 language level)
- Registration stepper flow
- Address lookup (PDOK API)
- Practice selection interface
- Responsive design

---

### Infrastructure

```yaml
Orchestration: Docker Compose
Databases: Neo4j + PostgreSQL
API Testing: Bruno
Development: TypeScript + Node.js 22
```

**Why This Stack?**
- ⚡ **Performance**: Hono is one of the fastest Node frameworks
- 🔒 **Type Safety**: TypeScript throughout
- 📊 **Graph Power**: Neo4j purpose-built for relationships
- 🐳 **Easy Deploy**: Docker Compose for all services
- 🎨 **Modern UI**: React 19 with latest patterns

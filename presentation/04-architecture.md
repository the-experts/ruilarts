# Systeemarchitectuur in vogelvlucht

- **Frontend** (React/TanStack/Tailwind) praat met drie services: matching (Hono/TS), huisartsendata (Flask) en geo (Node). GraphHopper levert routes.  
- **Backend-matching** is modulair: modellen → services (Neo4j, matcher, Postgres, cleanup) → routes. Config en migraties houden het netjes.
- **Data**: Neo4j voor actieve graaf (snel zoeken, daarna opschonen), PostgreSQL voor definitieve cirkels en rapportage.
- **API**: `/api/people`, `/api/matches`, `/health` dekken registreren, resultaten en monitoring.
- **Configuratie** via env-vars (max keuzes, cirkelgrootte, wegingen, DB-URI’s) met één scoreformule die eenvoudig aanpasbaar is.

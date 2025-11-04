# Ontwikkeltijdlijn (36 uur in het kort)

- **Dag 1 avond** – projectstructuur + scraping van 3.000 huisartsrecords, PostgreSQL en Flask-API opgezet.
- **Dag 2 ochtend** – eerste matchingservice, grote pivot naar TypeScript/Hono, Docker en GraphHopper ingeregeld.
- **Dag 2 middag** – multi-keuze matching, UI-flow, geo-API’s, ID‑gebaseerde data en PDOK-adreslookup toegevoegd.
- **Dag 2 avond** – frontend↔backend gekoppeld, testdata geladen, algoritmebug gefikst, PostgreSQL-persistentie afgerond.

**Statistieken**: 110 commits, 4 developers, ~10k regels code, 5 services.  
**Kernbeslissingen**: Neo4j + PostgreSQL, rewrite naar TypeScript, async matching, configureerbare scoring.  
**Resultaat**: van idee naar demo-klaar product in één hackathonweekend.

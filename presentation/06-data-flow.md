# Datastroom samengevat

1. **Registratie** – gebruiker meldt huidige praktijk + voorkeuren; Neo4j krijgt nodes en `WANTS`-relaties.
2. **Async matching** – API antwoordt direct, matcher zoekt op achtergrond cirkels van 2‑10 personen.
3. **Ranking & selectie** – beste cirkel gekozen op voorkeursorde, totaalscore en cirkelgrootte.
4. **Opslag & cleanup** – cirkel naar PostgreSQL, personen uit Neo4j verwijderd, weespraktijken opgeruimd.
5. **Terughalen** – frontend leest resultaten via `/api/matches`; Neo4j blijft licht voor nieuwe aanvragen.

Resultaat: snelle feedback voor gebruikers én een opgeschoonde graaf na elke succesvolle match.

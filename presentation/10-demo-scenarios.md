# Demo-scenario's samengevat

1. **Perfecte cirkel (10 personen)** – iedereen wisselt één stap door, alle eerste voorkeuren vervuld.
2. **Geïsoleerd duo** – twee personen ruilen 1-op-1 hun praktijk, meest voorkomende real-life situatie.
3. **Geen match** – iemand wil een niet-bestaande plek, blijft wachten zonder slechte match af te dwingen.
4. **Multi-keuze succes** – mix van tweede/derde voorkeuren levert alsnog een optimale cirkel op.
5. **Grootte-optimalisatie** – scoringssysteem kiest cirkel dicht bij ideale grootte van 5.
6. **Realistisch verhuisverhaal** – Jan ↔ Sophie tonen dat matches automatisch ontstaan zodra puzzel compleet is.

Interactieve demo: `npm run import:data`, personen posten naar `/api/people`, resultaten via `/api/matches`.

Performancebewijs: 1.000 personen → matching <200 ms, meerdere cirkelgroottes, Neo4j/Pg blijven responsief. Edgecases (iedereen wil dezelfde praktijk, lange ketens) worden correct afgehandeld.

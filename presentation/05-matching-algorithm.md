# Het matching-algoritme in het kort

- **Graphmodel**: personen en praktijken in Neo4j met `CURRENTLY_AT` en geordende `WANTS`-relaties.
- **Zoeken**: dynamisch Cypher-patroon voor cirkels van 2‑10 personen, ankerpersoon voorkomt combinatorische explosie.
- **Score**: voorkeur (×10), totale tevredenheid (×1) en afstand tot ideale grootte 5 (×20) bepalen de winnaar.
- **Workflow**: vind alle cirkels → rangschik → maak cirkelobject → schrijf naar PostgreSQL → verwijder uit Neo4j.
- **Transparantie**: uitgebreide logging toont gevonden cirkels, scores en opschoning.

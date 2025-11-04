# De Oplossing

## Circulair matching-algoritme in het kort

- Mensen melden hun huidige én gewenste praktijken (max. 10)
- Het algoritme zoekt onmiddellijk naar cirkels van 2‑10 personen
- Iedereen in de cirkel krijgt tegelijk een passende overstap

```
Persoon A → praktijk B
Persoon B → praktijk C
Persoon C → praktijk A
```

✨ Resultaat: iedereen closer bij huis, ruil in één keer geregeld.

### Waarom dit werkt

- **Neo4j-graph** vindt patronen razendsnel en verwijdert gematchte personen direct
- **Slimme ranking** bewaakt voorkeuren en ideale cirkelgrootte
- **PostgreSQL** bewaart matches, zodat het systeem efficiënt en opgeschoond blijft

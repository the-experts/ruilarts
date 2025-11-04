#!/usr/bin/env python3
"""
Migrate CSV data to Neo4j database.

This script loads data from the CSV file and populates the Neo4j database
using the domain models and repository pattern.
"""

import sys
import csv
from pathlib import Path

# Add backend src to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from src.domain.models import Person, Practice
from src.infrastructure.neo4j_connection import Neo4jConnection
from src.infrastructure.repositories.neo4j_repository import Neo4jPersonRepository


def load_csv_file(csv_path: Path):
    """
    Load people data from CSV file.

    Args:
        csv_path: Path to the CSV file

    Returns:
        List of Person objects
    """
    people = []

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Create current practice
            current_practice = Practice(
                name=row['current_huisarts'],
                location=row['current_location']
            )

            # Create first desired practice
            first_practice = Practice(
                name=row['desired_huisarts'],
                location=row['new_location']
            )

            # Create second desired practice if it exists
            second_practice = None
            if row.get('desired_huisarts_2') and row['desired_huisarts_2'].strip():
                second_practice = Practice(
                    name=row['desired_huisarts_2'],
                    location=row.get('new_location_2', '')
                )

            # Create person
            person = Person(
                id=row['person_id'],
                name=row['name'],
                current_practice=current_practice,
                desired_practice_first=first_practice,
                desired_practice_second=second_practice
            )

            people.append(person)

    return people


def verify_migration(connection: Neo4jConnection):
    """
    Verify the migrated data.

    Args:
        connection: Neo4j connection instance
    """
    with connection.session() as session:
        # Count nodes
        person_count = session.run(
            "MATCH (p:Person) RETURN count(p) as count"
        ).single()['count']

        practice_count = session.run(
            "MATCH (pr:Practice) RETURN count(pr) as count"
        ).single()['count']

        # Count relationships
        currently_at = session.run(
            "MATCH ()-[r:CURRENTLY_AT]->() RETURN count(r) as count"
        ).single()['count']

        wants_first = session.run(
            "MATCH ()-[r:WANTS_FIRST]->() RETURN count(r) as count"
        ).single()['count']

        wants_second = session.run(
            "MATCH ()-[r:WANTS_SECOND]->() RETURN count(r) as count"
        ).single()['count']

        print("\n" + "=" * 60)
        print("DATABASE STATISTICS")
        print("=" * 60)
        print(f"Persons: {person_count}")
        print(f"Practices: {practice_count}")
        print(f"CURRENTLY_AT relationships: {currently_at}")
        print(f"WANTS_FIRST relationships: {wants_first}")
        print(f"WANTS_SECOND relationships: {wants_second}")
        print("=" * 60)


def main():
    """Main migration function."""
    # Default CSV file location
    csv_path = backend_dir / "data" / "sample_circle.csv"

    # Allow custom CSV path as argument
    if len(sys.argv) > 1:
        csv_path = Path(sys.argv[1])

    if not csv_path.exists():
        print(f"✗ Error: CSV file not found at {csv_path}")
        print("\nUsage:")
        print(f"  python {Path(__file__).name} [csv_file_path]")
        print("\nDefault path: backend/data/sample_circle.csv")
        sys.exit(1)

    print("=" * 60)
    print("CSV TO NEO4J MIGRATION")
    print("=" * 60)
    print()

    # Connect to Neo4j
    print("Connecting to Neo4j...")
    connection = Neo4jConnection()

    try:
        # Verify connectivity
        if not connection.verify_connectivity():
            print("✗ Could not connect to Neo4j")
            print("\nMake sure Neo4j is running:")
            print("  cd backend && docker-compose up -d")
            sys.exit(1)

        print("✓ Connected to Neo4j")

        # Ask for confirmation before clearing
        print(f"\n⚠  This will clear all data in the Neo4j database and load data from:")
        print(f"   {csv_path}")
        response = input("\nContinue? (yes/no): ")

        if response.lower() not in ['yes', 'y']:
            print("Migration cancelled.")
            sys.exit(0)

        # Clear database
        print("\nClearing existing data...")
        connection.clear_database()
        print("✓ Database cleared")

        # Initialize schema
        print("\nInitializing schema (constraints and indexes)...")
        connection.initialize_schema()
        print("✓ Schema initialized")

        # Load CSV data
        print(f"\nLoading data from {csv_path.name}...")
        people = load_csv_file(csv_path)
        print(f"✓ Loaded {len(people)} people from CSV")

        # Create repository and add all people
        print("\nMigrating data to Neo4j...")
        repository = Neo4jPersonRepository(connection)

        for i, person in enumerate(people, 1):
            repository.add(person)
            if i % 10 == 0:
                print(f"  Migrated {i}/{len(people)} people...")

        print(f"✓ Successfully migrated {len(people)} people")

        # Verify migration
        print("\nVerifying migration...")
        verify_migration(connection)

        print("\n✓ Migration complete!")
        print("\nNext steps:")
        print("  1. Start the API: cd backend && python run.py")
        print("  2. Browse Neo4j UI: http://localhost:7474")
        print("     Login: neo4j / ruilarts123")
        print("  3. API documentation: http://localhost:8000/docs")
        print()

    except Exception as e:
        print(f"\n✗ Error during migration: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        connection.close()


if __name__ == '__main__':
    main()

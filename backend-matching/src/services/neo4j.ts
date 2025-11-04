import neo4j, { Driver, Session, Record } from 'neo4j-driver';
import { config } from '../config.js';
import { Person, PersonCreate } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';

class Neo4jService {
  private readonly driver: Driver;

  constructor() {
    this.driver = neo4j.driver(
      config.neo4j.uri,
      neo4j.auth.basic(config.neo4j.username, config.neo4j.password)
    );
  }

  async getSession(): Promise<Session> {
    return this.driver.session();
  }

  async close(): Promise<void> {
    await this.driver.close();
  }

  async verifyConnectivity(): Promise<void> {
    await this.driver.getServerInfo();
  }

  private recordToPerson(record: Record): Person {
    const personNode = record.get('p');
    const currentPractice = record.get('currentPractice');
    const firstChoice = record.get('firstChoice');
    const secondChoice = record.has('secondChoice') ? record.get('secondChoice') : null;

    return {
      id: personNode.properties.id,
      name: personNode.properties.name,
      currentPractice: {
        name: currentPractice.properties.name,
        location: currentPractice.properties.location,
      },
      desiredPracticeFirst: {
        name: firstChoice.properties.name,
        location: firstChoice.properties.location,
      },
      desiredPracticeSecond: secondChoice
        ? {
            name: secondChoice.properties.name,
            location: secondChoice.properties.location,
          }
        : undefined,
    };
  }

  async addPerson(personData: PersonCreate): Promise<Person> {
    const session = await this.getSession();
    try {
      const personId = uuidv4();

      const query = `
        MERGE (currentPr:Practice {name: $currentPracticeName, location: $currentLocation})
        MERGE (firstPr:Practice {name: $desiredPracticeFirst, location: $desiredLocationFirst})
        ${
          personData.desiredPracticeSecond
            ? 'MERGE (secondPr:Practice {name: $desiredPracticeSecond, location: $desiredLocationSecond})'
            : ''
        }

        CREATE (p:Person {
          id: $personId,
          name: $name,
          current_location: $currentLocation
        })

        CREATE (p)-[:CURRENTLY_AT]->(currentPr)
        CREATE (p)-[:WANTS_FIRST {location: $desiredLocationFirst}]->(firstPr)
        ${personData.desiredPracticeSecond ? 'CREATE (p)-[:WANTS_SECOND {location: $desiredLocationSecond}]->(secondPr)' : ''}

        RETURN p,
               currentPr as currentPractice,
               firstPr as firstChoice
               ${personData.desiredPracticeSecond ? ', secondPr as secondChoice' : ''}
      `;

      const result = await session.run(query, {
        personId,
        name: personData.name,
        currentPracticeName: personData.currentPracticeName,
        currentLocation: personData.currentLocation,
        desiredPracticeFirst: personData.desiredPracticeFirst,
        desiredLocationFirst: personData.desiredLocationFirst,
        desiredPracticeSecond: personData.desiredPracticeSecond || null,
        desiredLocationSecond: personData.desiredLocationSecond || null,
      });

      return this.recordToPerson(result.records[0]);
    } finally {
      await session.close();
    }
  }

  async getPersonById(personId: string): Promise<Person | null> {
    const session = await this.getSession();
    try {
      const query = `
        MATCH (p:Person {id: $personId})
        MATCH (p)-[:CURRENTLY_AT]->(currentPractice:Practice)
        MATCH (p)-[:WANTS_FIRST]->(firstChoice:Practice)
        OPTIONAL MATCH (p)-[:WANTS_SECOND]->(secondChoice:Practice)
        RETURN p, currentPractice, firstChoice, secondChoice
      `;

      const result = await session.run(query, { personId });

      if (result.records.length === 0) {
        return null;
      }

      return this.recordToPerson(result.records[0]);
    } finally {
      await session.close();
    }
  }

  async getAllPeople(): Promise<Person[]> {
    const session = await this.getSession();
    try {
      const query = `
        MATCH (p:Person)
        MATCH (p)-[:CURRENTLY_AT]->(currentPractice:Practice)
        MATCH (p)-[:WANTS_FIRST]->(firstChoice:Practice)
        OPTIONAL MATCH (p)-[:WANTS_SECOND]->(secondChoice:Practice)
        RETURN p, currentPractice, firstChoice, secondChoice
      `;

      const result = await session.run(query);
      return result.records.map((record) => this.recordToPerson(record));
    } finally {
      await session.close();
    }
  }

  async deletePerson(personId: string): Promise<void> {
    const session = await this.getSession();
    try {
      const query = `
        MATCH (p:Person {id: $personId})
        DETACH DELETE p
      `;

      await session.run(query, { personId });
    } finally {
      await session.close();
    }
  }
}

export const neo4jService = new Neo4jService();

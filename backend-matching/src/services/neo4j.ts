import neo4j, { Driver, Session, Record } from 'neo4j-driver';
import { config } from '../config.js';
import { Person, PersonCreate } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';

const PREFERENCE_RELATIONS = ['WANTS_FIRST', 'WANTS_SECOND'] as const;

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
    const choices: Person['choices'] = [];

    PREFERENCE_RELATIONS.forEach((_, index) => {
      const choiceKey = `choice${index}`;
      if (record.has(choiceKey)) {
        const choiceNode = record.get(choiceKey);
        if (choiceNode) {
          choices.push({
            name: choiceNode.properties.name,
            location: choiceNode.properties.location,
          });
        }
      }
    });

    return {
      id: personNode.properties.id,
      name: personNode.properties.name,
      currentPractice: {
        name: currentPractice.properties.name,
        location: currentPractice.properties.location,
      },
      choices,
    };
  }

  async addPerson(personData: PersonCreate): Promise<Person> {
    const session = await this.getSession();
    try {
      const personId = uuidv4();
      const normalizedChoices = (personData.choices ?? []).slice(0, PREFERENCE_RELATIONS.length);

      if (normalizedChoices.length === 0) {
        throw new Error('At least one desired practice choice is required');
      }

      const choiceMergeClauses = normalizedChoices
        .map(
          (_choice, index) =>
            `MERGE (choice${index}:Practice {name: $choice${index}Name, location: $choice${index}Location})`
        )
        .join('\n        ');

      const choiceRelationshipClauses = normalizedChoices
        .map(
          (_choice, index) =>
            `CREATE (p)-[:${PREFERENCE_RELATIONS[index]} {location: $choice${index}Location}]->(choice${index})`
        )
        .join('\n        ');

      const choiceReturnClause = normalizedChoices
        .map((_choice, index) => `, choice${index}`)
        .join('');

      const query = `
        MERGE (currentPr:Practice {name: $currentPracticeName, location: $currentLocation})
        ${choiceMergeClauses}

        CREATE (p:Person {
          id: $personId,
          name: $name,
          current_location: $currentLocation
        })

        CREATE (p)-[:CURRENTLY_AT]->(currentPr)
        ${choiceRelationshipClauses}

        RETURN p,
               currentPr as currentPractice
               ${choiceReturnClause}
      `;

      const params = {
        personId,
        name: personData.name,
        currentPracticeName: personData.currentPracticeName,
        currentLocation: personData.currentLocation,
      } as any;

      normalizedChoices.forEach((choice, index) => {
        params[`choice${index}Name`] = choice.practiceName;
        params[`choice${index}Location`] = choice.location;
      });

      const result = await session.run(query, params);

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
        MATCH (p)-[:WANTS_FIRST]->(choice0:Practice)
        OPTIONAL MATCH (p)-[:WANTS_SECOND]->(choice1:Practice)
        RETURN p, currentPractice, choice0, choice1
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
        MATCH (p)-[:WANTS_FIRST]->(choice0:Practice)
        OPTIONAL MATCH (p)-[:WANTS_SECOND]->(choice1:Practice)
        RETURN p, currentPractice, choice0, choice1
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

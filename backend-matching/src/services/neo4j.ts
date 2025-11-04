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
    const choicesData = record.get('choices');

    // Helper to convert Neo4j Integer/BigInt to number
    const toNumber = (val: any): number => {
      if (val === null || val === undefined) return 0;
      if (typeof val === 'number') return val;
      if (typeof val === 'bigint') return Number(val);
      if (val.toNumber) return val.toNumber(); // neo4j Integer type
      return Number(val);
    };

    // Sort choices by order property and extract practice info
    const choices: Person['choices'] = choicesData
      .map((item: any) => ({
        id: toNumber(item.practice.properties.id),
        order: toNumber(item.order),
      }))
      .sort((a: any, b: any) => a.order - b.order)
      .map((item: any) => ({ id: item.id }));

    return {
      id: personNode.properties.id,
      name: personNode.properties.name,
      currentPractice: {
        id: toNumber(currentPractice.properties.id),
      },
      choices,
    };
  }

  async addPerson(personData: PersonCreate): Promise<Person> {
    const session = await this.getSession();
    try {
      const personId = uuidv4();
      const normalizedChoices = (personData.choices ?? []).slice(0, config.matching.maxPracticeChoices);

      if (normalizedChoices.length === 0) {
        throw new Error('At least one desired practice choice is required');
      }

      const choiceMergeClauses = normalizedChoices
        .map(
          (_choice, index) =>
            `MERGE (choice${index}:Practice {id: $choice${index}Id})`
        )
        .join('\n        ');

      const choiceRelationshipClauses = normalizedChoices
        .map(
          (_choice, index) =>
            `CREATE (p)-[:WANTS {order: ${index}}]->(choice${index})`
        )
        .join('\n        ');

      const query = `
        MERGE (currentPr:Practice {id: $currentPracticeId})
        ${choiceMergeClauses}

        CREATE (p:Person {
          id: $personId,
          name: $name
        })

        CREATE (p)-[:CURRENTLY_AT]->(currentPr)
        ${choiceRelationshipClauses}

        WITH p, currentPr
        MATCH (p)-[w:WANTS]->(choice:Practice)
        RETURN p,
               currentPr as currentPractice,
               collect({practice: choice, order: w.order}) as choices
      `;

      const params = {
        personId,
        name: personData.name,
        currentPracticeId: personData.currentPracticeId,
      } as any;

      normalizedChoices.forEach((choiceId, index) => {
        params[`choice${index}Id`] = choiceId;
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
        OPTIONAL MATCH (p)-[w:WANTS]->(choice:Practice)
        RETURN p,
               currentPractice,
               collect({practice: choice, order: w.order}) as choices
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
        OPTIONAL MATCH (p)-[w:WANTS]->(choice:Practice)
        RETURN p,
               currentPractice,
               collect({practice: choice, order: w.order}) as choices
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

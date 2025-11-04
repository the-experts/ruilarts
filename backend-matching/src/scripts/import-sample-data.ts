#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import neo4j, { Driver } from 'neo4j-driver';

async function loadConfig() {
  try {
    return (await import('../config.js')).config;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ERR_MODULE_NOT_FOUND') {
      const tsConfigUrl = new URL('../config.ts', import.meta.url);
      return (await import(tsConfigUrl.href)).config;
    }
    throw error;
  }
}

const config = await loadConfig();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CSVRow {
  person_id: string;
  name: string;
  current_huisarts: string;
  current_location: string;
  desired_huisarts: string;
  new_location: string;
  desired_huisarts_2: string;
  new_location_2: string;
}

// Simple CSV parser (handles basic CSV without complex escaping)
function parseCSV(content: string): CSVRow[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || '';
    });
    rows.push(row as CSVRow);
  }

  return rows;
}

async function clearDatabase(driver: Driver): Promise<void> {
  const session = driver.session();
  try {
    console.log('⚠️  Clearing existing data from Neo4j...');
    await session.run('MATCH (n) DETACH DELETE n');
    console.log('✅ Database cleared');
  } finally {
    await session.close();
  }
}

async function importSampleData(): Promise<void> {
  const driver = neo4j.driver(
    config.neo4j.uri,
    neo4j.auth.basic(config.neo4j.username, config.neo4j.password)
  );

  const PREFERENCE_RELATIONS = ['WANTS_FIRST', 'WANTS_SECOND'] as const;

  try {
    // Verify connectivity
    console.log('🔌 Connecting to Neo4j...');
    await driver.verifyConnectivity();
    console.log('✅ Connected to Neo4j');

    // Read CSV file
    const csvPath = path.join(__dirname, '../../data/sample_circle.csv');
    console.log(`📂 Reading CSV from: ${csvPath}`);

    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at: ${csvPath}`);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCSV(csvContent);
    console.log(`📊 Found ${rows.length} people to import`);

    // Clear existing data
    await clearDatabase(driver);

    // Import data
    const session = driver.session();
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const row of rows) {
        try {
          const rawChoices = [
            { practiceName: row.desired_huisarts, location: row.new_location },
            { practiceName: row.desired_huisarts_2, location: row.new_location_2 },
          ]
            .filter(choice => choice.practiceName && choice.location)
            .slice(0, 2);

          if (rawChoices.length === 0) {
            throw new Error(`No valid choices supplied for ${row.name}`);
          }

          const choices = rawChoices.slice(0, PREFERENCE_RELATIONS.length);

          const query = `
            MERGE (currentPr:Practice {name: $currentPracticeName, location: $currentLocation})
            ${choices
              .map(
                (_choice, index) =>
                  `MERGE (choice${index}:Practice {name: $choice${index}Name, location: $choice${index}Location})`
              )
              .join('\n            ')}

            CREATE (p:Person {
              id: $personId,
              name: $name,
              current_location: $currentLocation
            })

            CREATE (p)-[:CURRENTLY_AT]->(currentPr)
            ${choices
              .map(
                (_choice, index) =>
                  `CREATE (p)-[:${PREFERENCE_RELATIONS[index]} {location: $choice${index}Location}]->(choice${index})`
              )
              .join('\n            ')}

            RETURN p
          `;

          const params: Record<string, unknown> = {
            personId: row.person_id,
            name: row.name,
            currentPracticeName: row.current_huisarts,
            currentLocation: row.current_location,
          };

          choices.forEach((choice, index) => {
            params[`choice${index}Name`] = choice.practiceName;
            params[`choice${index}Location`] = choice.location;
          });

          await session.run(query, params);

          successCount++;
          process.stdout.write(`\r⏳ Importing... ${successCount}/${rows.length} people`);
        } catch (error) {
          errorCount++;
          console.error(`\n❌ Error importing person ${row.name}:`, error);
        }
      }

      console.log(`\n\n✅ Import completed successfully!`);
      console.log(`   • People imported: ${successCount}`);
      console.log(`   • Errors: ${errorCount}`);

      // Show statistics
      const stats = await session.run(`
        MATCH (p:Person)
        WITH count(p) as peopleCount
        MATCH (pr:Practice)
        RETURN peopleCount, count(pr) as practiceCount
      `);

      if (stats.records.length > 0) {
        const record = stats.records[0];
        console.log(`\n📊 Database Statistics:`);
        console.log(`   • Total People: ${record.get('peopleCount')}`);
        console.log(`   • Total Practices: ${record.get('practiceCount')}`);
      }

      // Show sample query
      console.log(`\n💡 Try this query in Neo4j Browser:`);
      console.log(`   MATCH (p:Person)-[r]->(pr:Practice) RETURN p, r, pr LIMIT 25`);

    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await driver.close();
    console.log('\n👋 Connection closed');
  }
}

// Run the import
console.log('🚀 Starting sample data import...\n');
importSampleData();

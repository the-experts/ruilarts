#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CSVRow {
  person_id: string;
  name: string;
  current_practice_id: string;
  [key: string]: string;
}

interface PersonSummary {
  id: string;
  name: string;
}

interface PersonCreatePayload {
  name: string;
  currentPracticeId: number;
  choices: number[];
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
      const rawValue = values[index] ?? '';
      row[header] = rawValue.replace(/^"(.*)"$/, '$1').trim();
    });
    rows.push(row as CSVRow);
  }

  return rows;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/')
    ? baseUrl.slice(0, -1)
    : baseUrl;
}

async function deleteExistingPeople(apiBaseUrl: string): Promise<number> {
  console.log('🧹 Clearing existing people via API...');

  try {
    const response = await fetch(`${apiBaseUrl}/people`);

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Failed to list people (${response.status}). Response: ${body}`);
    }

    const people = (await response.json()) as PersonSummary[];

    if (people.length === 0) {
      console.log('ℹ️  No existing people found, skipping delete.');
      return 0;
    }

    let deletedCount = 0;

    for (const person of people) {
      const deleteResponse = await fetch(
        `${apiBaseUrl}/people/${encodeURIComponent(person.id)}`,
        { method: 'DELETE' }
      );

      if (!deleteResponse.ok) {
        const deleteBody = await deleteResponse.text();
        console.error(`❌ Failed to delete person ${person.id} (${person.name}): ${deleteBody}`);
        continue;
      }

      deletedCount++;
    }

    console.log(`✅ Deleted ${deletedCount} people`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Failed to clear existing people:', error);
    throw error;
  }
}

function buildChoices(row: CSVRow): number[] {
  const rawChoices = Object.entries(row)
    .filter(([key]) => key.startsWith('desired_practice_id'))
    .map(([, value]) => parseInt(value, 10))
    .filter(id => !Number.isNaN(id));

  const uniqueChoices: number[] = [];
  for (const id of rawChoices) {
    if (!uniqueChoices.includes(id)) {
      uniqueChoices.push(id);
    }
  }

  return uniqueChoices;
}

function buildPersonPayload(row: CSVRow): PersonCreatePayload {
  const currentPracticeId = parseInt(row.current_practice_id, 10);

  if (Number.isNaN(currentPracticeId)) {
    throw new Error(`Invalid current practice id for ${row.name}`);
  }

  const choices = buildChoices(row);

  if (choices.length === 0) {
    throw new Error(`No valid choices supplied for ${row.name}`);
  }

  return {
    name: row.name,
    currentPracticeId,
    choices,
  };
}

async function importSampleData(): Promise<void> {
  const apiBaseUrl = normalizeBaseUrl(
    process.env.API_BASE_URL ||
      `http://localhost:8000/api`
  );

  console.log(`🌐 Using API base URL: ${apiBaseUrl}`);

  try {
    // Read CSV file
    const csvPath = path.join(__dirname, '../../data/sample_circle.csv');
    console.log(`📂 Reading CSV from: ${csvPath}`);

    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at: ${csvPath}`);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCSV(csvContent);
    console.log(`📊 Found ${rows.length} people to import`);

    if (process.env.SKIP_CLEAR !== '1') {
      await deleteExistingPeople(apiBaseUrl);
    } else {
      console.log('⏭️  Skipping clear step because SKIP_CLEAR=1');
    }

    let successCount = 0;
    let errorCount = 0;

    for (const row of rows) {
      try {
        const payload = buildPersonPayload(row);

        const response = await fetch(`${apiBaseUrl}/people`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(`API responded with ${response.status}: ${body}`);
        }

        await response.json();

        successCount++;
        process.stdout.write(`\r⏳ Importing... ${successCount}/${rows.length} people`);
      } catch (error) {
        errorCount++;
        console.error(`\n❌ Error importing person ${row.name}:`, error);
      }
    }

    console.log(`\n\n✅ Import completed!`);
    console.log(`   • People imported: ${successCount}`);
    console.log(`   • Errors: ${errorCount}`);

    // Show sample query
    console.log(`\n💡 Try this query in Neo4j Browser:`);
    console.log(`   MATCH (p:Person)-[r]->(pr:Practice) RETURN p, r, pr LIMIT 25`);


    console.log('------------------------------------------------------------')
    console.log('Use postal code: "1696 CB" to get the desired Huisarts named "Meijer, A.E."')
    console.log('Use search "Bakashvili" to gete the desired Huisarts named "Bakashvili, N."')
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the import
console.log('🚀 Starting sample data import...\n');
importSampleData();

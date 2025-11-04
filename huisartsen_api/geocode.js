import fs from 'fs';
import csv from 'csv-parser';
import fetch from 'node-fetch';
import { stringify } from 'csv-stringify/sync';

const inputFile = 'huisartsen_zorgkaart.csv';
const outputFile = 'output_with_addresses.csv';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'YourAppName/1.0 (your.email@example.com)' // Replace with your info
    }
  });
  if (!response.ok) return null;
  const data = await response.json();
  const address = data.address || {};
  return {
    street: address.road || '',
    postcode: address.postcode || '',
    city: address.city || address.town || address.village || ''
  };
}

async function processCSV() {
  const rows = [];
  fs.createReadStream(inputFile)
    .pipe(csv())
    .on('data', (data) => rows.push(data))
    .on('end', async () => {
      const enrichedRows = [];

      for (const [index, row] of rows.entries()) {
        console.log(`Processing row ${index + 1}/${rows.length}`);
        const address = await reverseGeocode(row.Latitude, row.Longitude);

        console.log({address})
        enrichedRows.push({
          ...row,
          Street: address?.street || '',
          Postcode: address?.postcode || '',
          City: address?.city || ''
        });
        await delay(1000); // 1 second delay to respect Nominatim's rate limit
      }

      const csvOutput = stringify(enrichedRows, { header: true });
      fs.writeFileSync(outputFile, csvOutput);
      console.log(`Finished writing to ${outputFile}`);
    });
}

processCSV();
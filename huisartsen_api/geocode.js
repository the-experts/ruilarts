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
      'User-Agent': `YourAppName/${lat} (your.email+${lon}@example.com)` // Replace with your info
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

function processRowsSequentially(rows) {
  let isFirstRow = true;

  const processNext = async (index) => {
    if (index >= rows.length) {
      console.log(`Finished writing to ${outputFile}`);
      return;
    }

    const row = rows[index];
    console.log(`Processing row ${index + 1}/${rows.length}`);

    const address = await reverseGeocode(row.Latitude, row.Longitude);
    console.log(address)
    const enrichedRow = {
      ...row,
      Street: address?.street || '',
      Postcode: address?.postcode || '',
      City: address?.city || ''
    };

    const csvRow = stringify([enrichedRow], { header: isFirstRow });
    fs.appendFileSync(outputFile, csvRow);
    isFirstRow = false;

    await delay(1500); // Respect Nominatim's rate limit
    await processNext(index + 1);
  };

  processNext(0);
}

function processCSV() {
  const rows = [];
  fs.createReadStream(inputFile)
    .pipe(csv())
    .on('data', (data) => rows.push(data))
    .on('end', () => {
      processRowsSequentially(rows);
    });
}

processCSV();
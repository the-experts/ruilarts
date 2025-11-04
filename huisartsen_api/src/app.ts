import express from 'express';
import { Request, Response } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 5001;

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'db',
  database: process.env.POSTGRES_DB || 'huisartsen',
  user: process.env.POSTGRES_USER || 'admin',
  password: process.env.POSTGRES_PASSWORD || 'secret',
});

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;

  lat1 = toRad(lat1);
  lon1 = toRad(lon1);
  lat2 = toRad(lat2);
  lon2 = toRad(lon2);

  const dlat = lat2 - lat1;
  const dlon = lon2 - lon1;

  const a = Math.sin(dlat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(a));
  const r = 6371000; // Radius of Earth in meters

  return c * r;
}

app.get('/huisartsen', async (req: Request, res: Response) => {
  const { naam, locatie } = req.query;
  let query = 'SELECT id, naam, adres, latitude, longitude, link FROM huisartsen';
  const filters: string[] = [];
  const params: any[] = [];

  if (naam) {
    filters.push('naam ILIKE $' + (params.length + 1));
    params.push(`%${naam}%`);
  }
  if (locatie) {
    filters.push('adres ILIKE $' + (params.length + 1));
    params.push(`%${locatie}%`);
  }

  if (filters.length > 0) {
    query += ' WHERE ' + filters.join(' AND ');
  }

  try {
    const result = await pool.query(query, params);
    const rows = result.rows.map(row => ({
      id: row.id,
      naam: row.naam,
      adres: row.adres,
      latitude: row.latitude,
      longitude: row.longitude,
      link: row.link,
    }));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.get('/huisartsen/closest', async (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);

  console.log(lat)

  if (isNaN(lat) || isNaN(lon)) {
     res.status(400).json({ error: "Please provide both 'lat' and 'lon' query parameters." });
     return
  }

  try {
    const result = await pool.query('SELECT id, naam, adres, latitude, longitude, link FROM huisartsen');
    const distances = result.rows
      .filter(row => row.latitude !== null && row.longitude !== null)
      .map(row => {
        const distance = haversine(lat, lon, row.latitude, row.longitude);
        return {
          id: row.id,
          naam: row.naam,
          adres: row.adres,
          latitude: row.latitude,
          longitude: row.longitude,
          link: row.link,
          distance_m: Math.round(distance),
        };
      });

    distances.sort((a, b) => a.distance_m - b.distance_m);
    res.json(distances.slice(0, 3));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
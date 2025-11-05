import pg from 'pg';
import { config } from '../config.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PostgresService {
  private pool: pg.Pool;

  constructor() {
    this.pool = new Pool({
      host: config.postgres.host,
      port: config.postgres.port,
      database: config.postgres.database,
      user: config.postgres.user,
      password: config.postgres.password,
      max: config.postgres.max,
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('[Postgres] Unexpected error on idle client', err);
    });

    console.log('[Postgres] Connection pool created');
  }

  /**
   * Get a client from the pool
   */
  async getClient(): Promise<pg.PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Execute a query directly
   */
  async query(text: string, params?: any[]): Promise<pg.QueryResult> {
    return await this.pool.query(text, params);
  }

  /**
   * Verify connectivity to PostgreSQL
   */
  async verifyConnectivity(): Promise<void> {
    try {
      await this.pool.query('SELECT NOW()');
      console.log('[Postgres] Connection verified');
    } catch (error) {
      console.error('[Postgres] Connection verification failed:', error);
      throw error;
    }
  }

  /**
   * Run migrations from SQL files
   */
  async runMigrations(): Promise<void> {
    const migrationsDir = path.join(__dirname, '../../migrations');
    const migrationFiles = [
      '001_create_circles_tables.sql',
      '002_add_score_to_circles.sql'
    ];

    try {
      console.log('[Postgres] Running migrations...');

      for (const file of migrationFiles) {
        const migrationPath = path.join(migrationsDir, file);

        if (fs.existsSync(migrationPath)) {
          console.log(`[Postgres] Running migration: ${file}`);
          const sql = fs.readFileSync(migrationPath, 'utf-8');
          await this.pool.query(sql);
          console.log(`[Postgres] ✓ ${file} completed`);
        } else {
          console.log(`[Postgres] ⚠ Migration file not found: ${file}`);
        }
      }

      console.log('[Postgres] All migrations completed successfully');
    } catch (error) {
      console.error('[Postgres] Migration failed:', error);
      throw error;
    }
  }

  /**
   * Close the pool
   */
  async close(): Promise<void> {
    await this.pool.end();
    console.log('[Postgres] Connection pool closed');
  }
}

export const postgresService = new PostgresService();

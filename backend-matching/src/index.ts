import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { config } from './config.js';
import { neo4jService } from './services/neo4j.js';
import { postgresService } from './services/postgres.js';
import { peopleRoutes } from './routes/people.js';
import { matchesRoutes } from './routes/matches.js';

const app = new Hono();

// CORS middleware
app.use(
  '*',
  cors({
    origin: config.cors.origins,
    credentials: true,
  })
);

// Health check endpoint
app.get('/health', async (c) => {
  const health = {
    status: 'healthy',
    neo4j: 'unknown',
    postgres: 'unknown',
  };

  try {
    await neo4jService.verifyConnectivity();
    health.neo4j = 'connected';
  } catch (error) {
    health.status = 'unhealthy';
    health.neo4j = 'disconnected';
  }

  try {
    await postgresService.verifyConnectivity();
    health.postgres = 'connected';
  } catch (error) {
    health.status = 'unhealthy';
    health.postgres = 'disconnected';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  return c.json(health, statusCode);
});

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Ruilarts Matching API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      people: '/api/people',
      matches: '/api/matches',
      statistics: '/api/statistics',
    },
  });
});

// Register routes
app.route('/api/people', peopleRoutes);
app.route('/api/matches', matchesRoutes);

// Error handling middleware
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json(
    {
      error: 'Internal server error',
      message: err.message,
    },
    500
  );
});

// Initialize database and start server
const port = config.server.port;

async function startServer() {
  console.log(`Starting Ruilarts Matching API on port ${port}...`);

  try {
    // Run PostgreSQL migrations
    console.log('[Init] Running PostgreSQL migrations...');
    await postgresService.runMigrations();
    console.log('[Init] PostgreSQL ready');

    // Verify Neo4j connectivity
    console.log('[Init] Verifying Neo4j connection...');
    await neo4jService.verifyConnectivity();
    console.log('[Init] Neo4j ready');

    // Start HTTP server
    serve({
      fetch: app.fetch,
      port,
    });

    console.log(`\n✓ Server running at http://localhost:${port}`);
    console.log(`✓ Health check: http://localhost:${port}/health`);
    console.log(`✓ API endpoints: http://localhost:${port}/api/*\n`);
  } catch (error) {
    console.error('[Init] Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await Promise.all([
    neo4jService.close(),
    postgresService.close(),
  ]);
  console.log('All connections closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await Promise.all([
    neo4jService.close(),
    postgresService.close(),
  ]);
  console.log('All connections closed');
  process.exit(0);
});

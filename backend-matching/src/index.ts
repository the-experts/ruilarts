import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { config } from './config.js';
import { neo4jService } from './services/neo4j.js';
import { peopleRoutes } from './routes/people.js';
import { matchesRoutes } from './routes/matches.js';
import { statisticsRoutes } from './routes/statistics.js';

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
  try {
    await neo4jService.verifyConnectivity();
    return c.json({
      status: 'healthy',
      neo4j: 'connected',
    });
  } catch (error) {
    return c.json(
      {
        status: 'unhealthy',
        neo4j: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      503
    );
  }
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
app.route('/api/statistics', statisticsRoutes);

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

// Start server
const port = config.server.port;

console.log(`Starting Ruilarts Matching API on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running at http://localhost:${port}`);
console.log(`Health check: http://localhost:${port}/health`);
console.log(`API endpoints: http://localhost:${port}/api/*`);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await neo4jService.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await neo4jService.close();
  process.exit(0);
});

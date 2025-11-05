export const config = {
  neo4j: {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    username: process.env.NEO4J_USERNAME || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'ruilarts123',
  },
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DB || 'huisartsen',
    user: process.env.POSTGRES_USER || 'admin',
    password: process.env.POSTGRES_PASSWORD || 'secret',
    max: parseInt(process.env.POSTGRES_POOL_MAX || '10', 10),
  },
  server: {
    port: parseInt(process.env.PORT || '8000', 10),
  },
  cors: {
    origins: ['http://localhost:3000', 'http://localhost:8000', 'http://localhost:5173'],
  },
  matching: {
    maxPracticeChoices: parseInt(process.env.MAX_PRACTICE_CHOICES || '3', 10),
    maxCircleSize: parseInt(process.env.MAX_CIRCLE_SIZE || '10', 10),
    idealCircleSize: parseInt(process.env.IDEAL_CIRCLE_SIZE || '5', 10),
    // Scoring weights (lower score = better match)
    preferenceWeight: parseInt(process.env.PREFERENCE_WEIGHT || '10', 10),
    totalScoreWeight: parseFloat(process.env.TOTAL_SCORE_WEIGHT || '1'),
    sizeWeight: parseInt(process.env.SIZE_WEIGHT || '20', 10),
  },
  email: {
    serviceUrl: process.env.EMAIL_SERVICE_URL || 'http://email-sender:8080',
    enabled: process.env.EMAIL_ENABLED !== 'false',
  },
  huisartsenApi: {
    url: process.env.HUISARTSEN_API_URL || 'http://huisartsen-api:5001',
  },
};

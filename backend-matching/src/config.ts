export const config = {
  neo4j: {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    username: process.env.NEO4J_USERNAME || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'ruilarts123',
  },
  server: {
    port: parseInt(process.env.PORT || '8000', 10),
  },
  cors: {
    origins: ['http://localhost:3000', 'http://localhost:8000', 'http://localhost:5173'],
  },
  matching: {
    maxPracticeChoices: parseInt(process.env.MAX_PRACTICE_CHOICES || '3', 10),
    maxCircleSize: parseInt(process.env.MAX_CIRCLE_SIZE || '5', 10),
  },
};

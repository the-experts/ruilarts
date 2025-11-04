import { Hono } from 'hono';
import { matcherService } from '../services/matcher.js';

export const matchesRoutes = new Hono();

// Run the matching algorithm
matchesRoutes.post('/', async (c) => {
  try {
    const result = await matcherService.findMatches();
    return c.json(result);
  } catch (error) {
    console.error('Error running matcher:', error);
    return c.json(
      { error: 'Failed to run matching algorithm' },
      500
    );
  }
});

// Get cached matching results
matchesRoutes.get('/', async (c) => {
  try {
    const cachedResult = matcherService.getCachedResult();

    if (!cachedResult) {
      return c.json(
        { error: 'No cached results available. Run POST /api/matches first.' },
        404
      );
    }

    return c.json(cachedResult);
  } catch (error) {
    console.error('Error getting cached results:', error);
    return c.json(
      { error: 'Failed to get cached results' },
      500
    );
  }
});

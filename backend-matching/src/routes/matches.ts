import { Hono } from 'hono';
import { matcherService } from '../services/matcher.js';

export const matchesRoutes = new Hono();

// Get cached matching results
matchesRoutes.get('/', async (c) => {
  try {
    const cachedResult = matcherService.getCachedResult();

    if (!cachedResult) {
      return c.json(
        { error: 'No match results available yet. Matches are calculated automatically when people are added.' },
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

import { Hono } from 'hono';
import { matcherService } from '../services/matcher.js';

export const statisticsRoutes = new Hono();

// Get statistics from cached matching results
statisticsRoutes.get('/', async (c) => {
  try {
    const cachedResult = matcherService.getCachedResult();

    if (!cachedResult) {
      return c.json(
        { error: 'No results available. Run POST /api/matches first.' },
        404
      );
    }

    return c.json(cachedResult.statistics);
  } catch (error) {
    console.error('Error getting statistics:', error);
    return c.json(
      { error: 'Failed to get statistics' },
      500
    );
  }
});

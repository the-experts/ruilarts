import { Hono } from 'hono';
import { circlesService } from '../services/circles.js';

export const matchesRoutes = new Hono();

// Get all matched circles from PostgreSQL
matchesRoutes.get('/', async (c) => {
  try {
    const circles = await circlesService.getAllCircles();

    if (circles.length === 0) {
      return c.json(
        { error: 'No matches found yet. Matches are calculated automatically when people are added.' },
        404
      );
    }

    return c.json({
      circles,
      total: circles.length,
    });
  } catch (error) {
    console.error('Error getting circles:', error);
    return c.json(
      { error: 'Failed to get circles from database' },
      500
    );
  }
});

// Get a specific circle by ID
matchesRoutes.get('/:id', async (c) => {
  try {
    const circleId = c.req.param('id');
    const circle = await circlesService.getCircleById(circleId);

    if (!circle) {
      return c.json({ error: 'Circle not found' }, 404);
    }

    return c.json(circle);
  } catch (error) {
    console.error('Error getting circle:', error);
    return c.json(
      { error: 'Failed to get circle from database' },
      500
    );
  }
});

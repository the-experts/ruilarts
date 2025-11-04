import { Hono } from 'hono';
import { neo4jService } from '../services/neo4j.js';
import { matcherService } from '../services/matcher.js';
import { PersonCreate } from '../models/index.js';

export const peopleRoutes = new Hono();

// Add a new person
peopleRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json<PersonCreate>();

    // Validate required fields
    if (
      !body.name ||
      !body.currentPracticeName ||
      !body.currentLocation ||
      !Array.isArray(body.choices) ||
      body.choices.length === 0 ||
      !body.choices[0]?.practiceName ||
      !body.choices[0]?.location
    ) {
      return c.json(
        { error: 'Missing required fields' },
        400
      );
    }

    const normalizedChoices = body.choices
      .filter(choice => choice && choice.practiceName && choice.location)
      .map(choice => ({
        practiceName: choice.practiceName.trim(),
        location: choice.location.trim(),
      }))
      .slice(0, 2);

    if (normalizedChoices.length === 0) {
      return c.json({ error: 'At least one valid choice is required' }, 400);
    }

    const person = await neo4jService.addPerson({
      ...body,
      choices: normalizedChoices,
    });

    // Trigger match calculation asynchronously (don't await)
    matcherService.findMatches().catch((error) => {
      console.error('Error calculating matches after adding person:', error);
    });

    return c.json(person, 201);
  } catch (error) {
    console.error('Error adding person:', error);
    return c.json(
      { error: 'Failed to add person' },
      500
    );
  }
});

// Get a person by ID
peopleRoutes.get('/:id', async (c) => {
  try {
    const personId = c.req.param('id');
    const person = await neo4jService.getPersonById(personId);

    if (!person) {
      return c.json({ error: 'Person not found' }, 404);
    }

    return c.json(person);
  } catch (error) {
    console.error('Error getting person:', error);
    return c.json(
      { error: 'Failed to get person' },
      500
    );
  }
});

// Get all people
peopleRoutes.get('/', async (c) => {
  try {
    const people = await neo4jService.getAllPeople();
    return c.json(people);
  } catch (error) {
    console.error('Error getting people:', error);
    return c.json(
      { error: 'Failed to get people' },
      500
    );
  }
});

// Delete a person
peopleRoutes.delete('/:id', async (c) => {
  try {
    const personId = c.req.param('id');
    await neo4jService.deletePerson(personId);
    return c.json({ message: 'Person deleted successfully' });
  } catch (error) {
    console.error('Error deleting person:', error);
    return c.json(
      { error: 'Failed to delete person' },
      500
    );
  }
});

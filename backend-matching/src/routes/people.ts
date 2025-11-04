import { Hono } from 'hono';
import { neo4jService } from '../services/neo4j.js';
import { matcherService } from '../services/matcher.js';
import { PersonCreate } from '../models/index.js';
import { config } from '../config.js';

export const peopleRoutes = new Hono();

// Add a new person
peopleRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json<PersonCreate>();

    // Validate required fields
    if (
      !body.name ||
      typeof body.currentPracticeId !== 'number' ||
      !Array.isArray(body.choices) ||
      body.choices.length === 0
    ) {
      return c.json(
        { error: 'Missing required fields' },
        400
      );
    }

    // Validate all choices are numbers
    if (!body.choices.every(choice => typeof choice === 'number')) {
      return c.json(
        { error: 'All choices must be practice IDs (numbers)' },
        400
      );
    }

    // Validate max choices
    if (body.choices.length > config.matching.maxPracticeChoices) {
      return c.json(
        { error: `Maximum ${config.matching.maxPracticeChoices} practice choices allowed` },
        400
      );
    }

    const normalizedChoices = body.choices
      .filter(choice => typeof choice === 'number')
      .slice(0, config.matching.maxPracticeChoices);

    if (normalizedChoices.length === 0) {
      return c.json({ error: 'At least one valid choice is required' }, 400);
    }

    const person = await neo4jService.addPerson({
      ...body,
      choices: normalizedChoices,
    });

    // Trigger person-specific match calculation asynchronously (don't await)
    matcherService.findMatchesForPerson(person.id)
      .then((circle) => {
        if (circle) {
          console.log(`[API] Person ${person.id} matched in circle of size ${circle.size}`);
        } else {
          console.log(`[API] No match found for person ${person.id}`);
        }
      })
      .catch((error) => {
        console.error(`[API] Error finding matches for person ${person.id}:`, error);
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

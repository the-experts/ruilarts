import { postgresService } from './postgres.js';
import { Circle } from '../models/index.js';
import { emailService } from './email.js';

interface CircleMetadata {
  maxPreferenceOrder: number;
  totalPreferenceScore: number;
  score: number;
}

class CirclesService {
  /**
   * Save a matched circle to PostgreSQL
   */
  async saveCircle(circle: Circle, metadata: CircleMetadata): Promise<void> {
    const client = await postgresService.getClient();

    try {
      await client.query('BEGIN');

      // Extract circle ID from first person's matchedInCircleId
      const circleId = circle.people[0]?.person.matchedInCircleId;
      if (!circleId) {
        throw new Error('Circle ID not found on matched people');
      }

      // Insert circle record
      await client.query(
        `INSERT INTO circles (id, size, max_preference_order, total_preference_score, score, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [circleId, circle.size, metadata.maxPreferenceOrder, metadata.totalPreferenceScore, metadata.score, 'active']
      );

      console.log(`[Circles] Saved circle ${circleId} to PostgreSQL`);

      // Insert circle members
      for (const circlePerson of circle.people) {
        const person = circlePerson.person;

        await client.query(
          `INSERT INTO circle_members
           (circle_id, person_id, person_name, email, current_practice_id, desired_practice_id, preference_order, gets_spot_from)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            circleId,
            person.id,
            person.name,
            person.email,
            person.currentPractice.id,
            person.choices[circlePerson.choiceIndex].id,
            circlePerson.choiceIndex,
            circlePerson.getsSpotFrom,
          ]
        );
      }

      console.log(`[Circles] Saved ${circle.people.length} members for circle ${circleId}`);

      await client.query('COMMIT');

      // Send email notifications to all circle members (async, don't block)
      console.log('[Circles] Circle saved successfully, triggering email notifications...');

      const emailData = circle.people.map(circlePerson => ({
        personName: circlePerson.person.name,
        personEmail: circlePerson.person.email,
        desiredPracticeId: circlePerson.person.choices[circlePerson.choiceIndex].id,
        preferenceOrder: circlePerson.choiceIndex,
        circleSize: circle.size,
      }));

      // Send emails asynchronously (don't await - let it run in background)
      emailService.sendCircleNotifications(emailData).catch((error) => {
        console.error('[Circles] Error sending email notifications:', error);
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[Circles] Error saving circle:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all circles from PostgreSQL
   */
  async getAllCircles(): Promise<any[]> {
    try {
      const result = await postgresService.query(
        `SELECT
           c.id,
           c.size,
           c.max_preference_order,
           c.total_preference_score,
           c.score,
           c.created_at,
           c.status,
           json_agg(
             json_build_object(
               'person_id', cm.person_id,
               'person_name', cm.person_name,
               'email', cm.email,
               'current_practice_id', cm.current_practice_id,
               'desired_practice_id', cm.desired_practice_id,
               'preference_order', cm.preference_order,
               'gets_spot_from', cm.gets_spot_from
             ) ORDER BY cm.id
           ) as members
         FROM circles c
         LEFT JOIN circle_members cm ON c.id = cm.circle_id
         GROUP BY c.id, c.size, c.max_preference_order, c.total_preference_score, c.score, c.created_at, c.status
         ORDER BY c.created_at DESC`
      );

      return result.rows;
    } catch (error) {
      console.error('[Circles] Error fetching circles:', error);
      throw error;
    }
  }

  /**
   * Get a specific circle by ID
   */
  async getCircleById(circleId: string): Promise<any | null> {
    try {
      const result = await postgresService.query(
        `SELECT
           c.id,
           c.size,
           c.max_preference_order,
           c.total_preference_score,
           c.score,
           c.created_at,
           c.status,
           json_agg(
             json_build_object(
               'person_id', cm.person_id,
               'person_name', cm.person_name,
               'email', cm.email,
               'current_practice_id', cm.current_practice_id,
               'desired_practice_id', cm.desired_practice_id,
               'preference_order', cm.preference_order,
               'gets_spot_from', cm.gets_spot_from
             ) ORDER BY cm.id
           ) as members
         FROM circles c
         LEFT JOIN circle_members cm ON c.id = cm.circle_id
         WHERE c.id = $1
         GROUP BY c.id, c.size, c.max_preference_order, c.total_preference_score, c.score, c.created_at, c.status`,
        [circleId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('[Circles] Error fetching circle:', error);
      throw error;
    }
  }
}

export const circlesService = new CirclesService();

import { circlesService } from './circles.js';
import { neo4jService } from './neo4j.js';
import { Circle } from '../models/index.js';

interface CircleMetadata {
  maxPreferenceOrder: number;
  totalPreferenceScore: number;
  score: number;
}

class CleanupService {
  /**
   * Clean up a matched circle: save to PostgreSQL and remove from Neo4j
   *
   * This method orchestrates the full cleanup process:
   * 1. Save circle to PostgreSQL (persistent storage)
   * 2. Delete matched Person nodes from Neo4j
   * 3. Clean up orphaned Practice nodes
   *
   * If PostgreSQL save fails, Neo4j cleanup is skipped (rollback)
   */
  async cleanupMatchedCircle(circle: Circle, metadata: CircleMetadata): Promise<void> {
    const personIds = circle.people.map(p => p.person.id);

    console.log(`\n[Cleanup] Starting cleanup for circle with ${personIds.length} people`);

    try {
      // Step 1: Save to PostgreSQL
      console.log('[Cleanup] Step 1: Saving circle to PostgreSQL...');
      await circlesService.saveCircle(circle, metadata);
      console.log('[Cleanup] ✓ Circle saved to PostgreSQL');

      // Step 2: Delete Person nodes from Neo4j
      console.log('[Cleanup] Step 2: Deleting Person nodes from Neo4j...');
      await neo4jService.deletePersonsInCircle(personIds);
      console.log('[Cleanup] ✓ Person nodes deleted from Neo4j');

      // Step 3: Clean up orphaned Practice nodes
      console.log('[Cleanup] Step 3: Cleaning up orphaned Practice nodes...');
      await neo4jService.cleanupOrphanedPractices();
      console.log('[Cleanup] ✓ Orphaned practices cleaned up');

      console.log('[Cleanup] ✓ Cleanup completed successfully\n');
    } catch (error) {
      console.error('[Cleanup] ✗ Cleanup failed:', error);
      console.error('[Cleanup] Rollback: Matched persons remain in Neo4j with matchedInCircleId set');
      throw error;
    }
  }
}

export const cleanupService = new CleanupService();

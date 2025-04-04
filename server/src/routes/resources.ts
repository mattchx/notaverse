import { Router, Request, Response } from 'express';
import { and, eq, desc, asc, inArray, gt, or } from 'drizzle-orm';
import { SessionData } from 'express-session';

import { db, schema } from '../db/config.js';
import { resources, sections, markers } from '../db/schema.js';
import { Resource, Section } from '../types/resource.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const resourceRouter = Router();

// Get all resources (both public and user's own resources if authenticated)
resourceRouter.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    let resourcesQuery;
    
    if (req.isAuthenticated && req.session.userId) {
      // If authenticated, get public resources + user's own resources
      resourcesQuery = await db.query.resources.findMany({
        where: or(
          eq(resources.isPublic, true),
          eq(resources.userId, req.session.userId as string)
        ),
        orderBy: (resources, { desc }) => [desc(resources.createdAt)],
        with: {
          sections: {
            orderBy: (sections, { asc }) => [asc(sections.number)],
            columns: {
              id: true,
              title: true,
              number: true,
            }
          }
        }
      });
    } else {
      // If not authenticated, only get public resources
      resourcesQuery = await db.query.resources.findMany({
        where: eq(resources.isPublic, true),
        orderBy: (resources, { desc }) => [desc(resources.createdAt)],
        with: {
          sections: {
            orderBy: (sections, { asc }) => [asc(sections.number)],
            columns: {
              id: true,
              title: true,
              number: true,
            }
          }
        }
      });
    }

    res.json(resourcesQuery.map(resource => ({
      ...resource,
      sections: resource.sections.map(section => ({
        ...section,
        markers: [] // We don't need markers for the list view
      }))
    })));
  } catch (error) {
    console.error('Error getting resources:', error);
    res.status(500).json({
      error: 'Failed to get resources',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get single resource with sections and markers
resourceRouter.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get the resource
    const resource = await db.query.resources.findFirst({
      where: eq(resources.id, id),
      with: {
        sections: {
          orderBy: asc(sections.number),
          with: {
            markers: {
              orderBy: asc(markers.orderNum)
            }
          }
        }
      }
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // If resource is not public and user is not the owner, reject
    if (!resource.isPublic && (!req.isAuthenticated || req.session.userId !== resource.userId)) {
      return res.status(403).json({ error: 'You do not have permission to view this resource' });
    }

    res.json({
      ...resource,
      isOwner: req.isAuthenticated && req.session.userId === resource.userId,
      sections: resource.sections.map(section => ({
        ...section,
        markers: section.markers.map(marker => ({
          ...marker,
          dateCreated: new Date(Number(marker.createdAt)),
          dateUpdated: new Date(Number(marker.updatedAt))
        }))
      }))
    });
  } catch (error) {
    console.error('Error getting resource:', error);
    res.status(500).json({ error: 'Failed to get resource' });
  }
});

// Create new resource
resourceRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const newResource: Resource = req.body;
    const now = Date.now();

    // Validate required fields
    if (!newResource.name || !newResource.type || !newResource.sections || newResource.sections.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate resource type
    if (!['book', 'podcast', 'article', 'course'].includes(newResource.type)) {
      return res.status(400).json({ error: 'Invalid resource type must be "book", "podcast", "article", or "course"' });
    }

    // Check user authentication
    const userId = req.session.userId as string;

    // Use a transaction for atomic operation
    const result = await db.transaction(async (tx) => {
      // Insert resource
      await tx.insert(resources).values({
        id: newResource.id,
        name: newResource.name,
        type: newResource.type,
        author: newResource.author ?? null,
        sourceUrl: newResource.sourceUrl ?? null,
        isPublic: newResource.isPublic ?? false,
        createdAt: new Date(now),
        updatedAt: new Date(now),
        userId: userId,
      });

      // Insert all sections
      for (const section of newResource.sections) {
        await tx.insert(sections).values({
          id: section.id,
          resourceId: newResource.id,
          title: section.title,
          number: section.number,
          createdAt: new Date(now),
          updatedAt: new Date(now),
        });

        // Insert markers for this section
        if (section.markers?.length > 0) {
          for (const marker of section.markers) {
            await tx.insert(markers).values({
              id: marker.id,
              sectionId: section.id,
              userId: userId,
              position: marker.position,
              orderNum: marker.orderNum,
              quote: marker.quote ?? null,
              note: marker.note,
              type: marker.type ?? 'general',
              createdAt: new Date(now),
              updatedAt: new Date(now),
            });
          }
        }
      }

      // Return the created item with all its data
      return await tx.query.resources.findFirst({
        where: eq(resources.id, newResource.id),
        with: {
          sections: {
            orderBy: asc(sections.number),
            with: {
              markers: {
                orderBy: asc(markers.orderNum)
              }
            }
          }
        }
      });
    });

    if (!result) {
      throw new Error('Failed to create resource');
    }

    // Transform response to match expected format
    res.status(201).json({
      ...result,
      isOwner: true,
      sections: result.sections.map(section => ({
        ...section,
        markers: section.markers.map(marker => ({
          ...marker,
          dateCreated: new Date(Number(marker.createdAt)),
          dateUpdated: new Date(Number(marker.updatedAt))
        }))
      }))
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// Toggle resource public/private status
resourceRouter.patch('/:id/visibility', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isPublic } = req.body;
    
    if (typeof isPublic !== 'boolean') {
      return res.status(400).json({ error: 'isPublic must be a boolean' });
    }
    
    const userId = req.session.userId as string;
    
    // Find the resource
    const resource = await db.query.resources.findFirst({
      where: eq(resources.id, id),
      columns: { id: true, userId: true }
    });
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Check if user owns the resource
    if (resource.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this resource' });
    }
    
    // Update the resource visibility
    await db.update(resources)
      .set({ 
        isPublic, 
        updatedAt: new Date() 
      })
      .where(eq(resources.id, id));
    
    res.json({ success: true, isPublic });
  } catch (error) {
    console.error('Error updating resource visibility:', error);
    res.status(500).json({ error: 'Failed to update resource visibility' });
  }
});

// Add section to resource
resourceRouter.post('/:resourceId/sections', async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.params;
    const section: Section = req.body;
    const now = Date.now();

    const result = await db.transaction(async (tx) => {
      // Verify resource exists
      const resource = await tx.query.resources.findFirst({
        where: eq(resources.id, resourceId),
        columns: { id: true }
      });

      if (!resource) {
        return null;
      }

      // Insert section
      await tx.insert(sections).values({
        id: section.id,
        resourceId: resourceId,
        title: section.title,
        number: section.number,
        createdAt: new Date(now),
        updatedAt: new Date(now)
      });

      return section;
    });

    if (!result) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(201).json({
      ...result,
      markers: []
    });
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ error: 'Failed to create section' });
  }
});

// Update section title
resourceRouter.put('/:resourceId/sections/:sectionId', async (req: Request, res: Response) => {
  try {
    const { resourceId, sectionId } = req.params;
    const { title } = req.body;
    const now = Date.now();
    
    if (!title) {
      return res.status(400).json({ error: 'Missing title' });
    }

    const result = await db.transaction(async (tx) => {
      // Verify section exists and belongs to the resource
      const existingSection = await tx.query.sections.findFirst({
        where: and(
          eq(sections.id, sectionId),
          eq(sections.resourceId, resourceId)
        ),
      });

      if (!existingSection) {
        return null;
      }

      // Update section
      await tx.update(sections)
        .set({
          title,
          updatedAt: new Date(now)
        })
        .where(eq(sections.id, sectionId));

      // Get updated section
      return await tx.query.sections.findFirst({
        where: eq(sections.id, sectionId),
        columns: {
          id: true,
          title: true,
          number: true
        }
      });
    });

    if (!result) {
      return res.status(404).json({ error: 'Section not found' });
    }

    res.json({
      ...result,
      markers: [] // We don't need to fetch markers for a title update
    });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// Add marker to section
resourceRouter.post('/:resourceId/sections/:sectionId/markers', async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'User not logged in' });
    }
    const userId = req.session.userId;

    const { sectionId } = req.params;
    const marker = req.body;
    const now = Date.now();

    const result = await db.transaction(async (tx) => {
      // Verify section exists
      const section = await tx.query.sections.findFirst({
        where: eq(sections.id, sectionId),
        columns: { id: true }
      });

      if (!section) {
        return null;
      }

      // Insert marker
      await tx.insert(markers).values({
        id: marker.id,
        sectionId: sectionId,
        userId: userId,
        position: marker.position,
        orderNum: marker.orderNum,
        quote: marker.quote ?? null,
        note: marker.note,
        type: marker.type ?? 'general',
        createdAt: new Date(now),
        updatedAt: new Date(now)
      });

      return marker;
    });

    if (!result) {
      return res.status(404).json({ error: 'Section not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(201).json({
      ...result,
      dateCreated: new Date(now),
      dateUpdated: new Date(now)
    });
  } catch (error) {
    console.error('Error creating marker:', error);
    res.status(500).json({ error: 'Failed to create marker' });
  }
});

// Update resource
resourceRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Resource = req.body;
    const now = Date.now();

    // Validate required fields
    if (!updates.name || !updates.type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate resource type
    if (!['book', 'podcast', 'article', 'course'].includes(updates.type)) {
      return res.status(400).json({ error: 'Invalid resource type must be "book", "podcast", "article", or "course"' });
    }

    const result = await db.transaction(async (tx) => {
      // Verify and update resource
      const resource = await tx.query.resources.findFirst({
        where: eq(resources.id, id)
      });

      if (!resource) {
        return null;
      }

      // Update resource
      await tx.update(resources)
        .set({
          name: updates.name,
          type: updates.type,
          author: updates.author ?? null,
          sourceUrl: updates.sourceUrl ?? null,
          updatedAt: new Date(now)
        })
        .where(eq(resources.id, id));

      // Get updated resource with sections
      return await tx.query.resources.findFirst({
        where: eq(resources.id, id),
        with: {
          sections: {
            orderBy: asc(sections.number),
            columns: {
              id: true,
              title: true,
              number: true
            }
          }
        }
      });
    });

    if (!result) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({
      ...result,
      sections: result.sections.map(section => ({
        ...section,
        markers: [] // We don't need markers for updates
      }))
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({
      error: 'Failed to update resource',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete resource
resourceRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.transaction(async (tx) => {
      // Verify resource exists
      const resource = await tx.query.resources.findFirst({
        where: eq(resources.id, id),
        columns: { id: true }
      });

      if (!resource) {
        return false;
      }

      // Delete in order: markers -> sections -> resource
      // First, get all sections
      const sectionIds = await tx.query.sections.findMany({
        where: eq(sections.resourceId, id),
        columns: { id: true }
      });

      // Delete all markers for these sections
      if (sectionIds.length > 0) {
        await tx
          .delete(markers)
          .where(inArray(markers.sectionId, sectionIds.map(s => s.id)));
      }

      // Delete sections
      await tx
        .delete(sections)
        .where(eq(sections.resourceId, id));

      // Delete resource
      await tx
        .delete(resources)
        .where(eq(resources.id, id));

      return true;
    });

    if (!result) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.status(204).end();
    } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({
      error: 'Failed to delete resource',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete section
resourceRouter.delete('/:resourceId/sections/:sectionId', async (req: Request, res: Response) => {
  try {
    const { resourceId, sectionId } = req.params;

    const result = await db.transaction(async (tx) => {
      // 1. Get the section to verify it exists and to get its number
      const sectionToDelete = await tx.query.sections.findFirst({
        where: and(
          eq(sections.id, sectionId),
          eq(sections.resourceId, resourceId)
        ),
        columns: { 
          id: true,
          number: true
        }
      });

      if (!sectionToDelete) {
        return false;
      }

      const deletedSectionNumber = sectionToDelete.number;

      // 2. Delete the section
      await tx.delete(sections)
        .where(eq(sections.id, sectionId));

      // 3. Reorder the remaining sections
      // Get all sections with higher numbers
      const laterSections = await tx.query.sections.findMany({
        where: and(
          eq(sections.resourceId, resourceId),
          gt(sections.number, deletedSectionNumber)
        ),
        columns: {
          id: true,
          number: true
        }
      });

      // Update each section with a new number (decrement by 1)
      for (const section of laterSections) {
        await tx.update(sections)
          .set({ number: section.number - 1 })
          .where(eq(sections.id, section.id));
      }

      return true;
    });

    if (!result) {
      return res.status(404).json({ error: 'Section not found' });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({
      error: 'Failed to delete section',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update marker
resourceRouter.put('/:resourceId/sections/:sectionId/markers/:markerId', async (req: Request, res: Response) => {
  try {
    const { resourceId, sectionId, markerId } = req.params;
    const updates = req.body;
    const now = Date.now();

    const result = await db.transaction(async (tx) => {
      // Verify marker exists and belongs to the section
      // Verify marker exists and belongs to the correct section/resource
      const sectionAndMarker = await tx.query.sections.findFirst({
        where: and(
          eq(sections.id, sectionId),
          eq(sections.resourceId, resourceId)
        ),
        with: {
          markers: {
            where: eq(markers.id, markerId)
          }
        }
      });

      if (!sectionAndMarker || sectionAndMarker.markers.length === 0) {
        return null;
      }

      // Update marker
      await tx.update(markers)
        .set({
          position: updates.position,
          quote: updates.quote ?? null,
          note: updates.note,
          type: updates.type,
          updatedAt: new Date(now)
        })
        .where(eq(markers.id, markerId));

      // Get updated marker
      return await tx.query.markers.findFirst({
        where: eq(markers.id, markerId),
      });
    });

    if (!result) {
      return res.status(404).json({ error: 'Marker not found' });
    }

    res.json({
      id: result.id,
      position: result.position,
      orderNum: result.orderNum,
      quote: result.quote,
      note: result.note,
      type: result.type,
      dateCreated: new Date(Number(result.createdAt)).toISOString(),
      dateUpdated: new Date(now).toISOString()
    });
  } catch (error) {
    console.error('Error updating marker:', error);
    res.status(500).json({ error: 'Failed to update marker' });
  }
});

// Delete marker
resourceRouter.delete('/:resourceId/sections/:sectionId/markers/:markerId', async (req: Request, res: Response) => {
  try {
    const { resourceId, sectionId, markerId } = req.params;

    const result = await db.transaction(async (tx) => {
      // Verify marker exists and belongs to the correct section/resource
      const sectionAndMarker = await tx.query.sections.findFirst({
        where: and(
          eq(sections.id, sectionId),
          eq(sections.resourceId, resourceId)
        ),
        with: {
          markers: {
            where: eq(markers.id, markerId)
          }
        }
      });

      if (!sectionAndMarker || sectionAndMarker.markers.length === 0) {
        return false;
      }

      // Delete the marker
      await tx.delete(markers)
        .where(eq(markers.id, markerId));

      return true;
    });

    if (!result) {
      return res.status(404).json({ error: 'Marker not found' });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting marker:', error);
    res.status(500).json({
      error: 'Failed to delete marker',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default resourceRouter;
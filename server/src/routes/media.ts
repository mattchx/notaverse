import { Router } from 'express';
import { and, eq, desc, asc, inArray } from 'drizzle-orm';
import { db, schema } from '../db/config.js';
import { mediaItems, sections, markers } from '../db/schema.js';
import { MediaItem, Section } from '../types/media.js';

const router = Router();

// Get all media items
router.get('/', async (req, res) => {
  try {
    // Get all media items with their sections
    const mediaItems = await db.query.mediaItems.findMany({
      orderBy: (mediaItems, { desc }) => [desc(mediaItems.createdAt)],
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

    res.json(mediaItems.map(item => ({
      ...item,
      sections: item.sections.map(section => ({
        ...section,
        markers: [] // We don't need markers for the list view
      }))
    })));
  } catch (error) {
    console.error('Error getting media items:', error);
    res.status(500).json({
      error: 'Failed to get media items',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get single media item with sections and markers
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const mediaItem = await db.query.mediaItems.findFirst({
      where: eq(mediaItems.id, id),
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

    if (!mediaItem) {
      return res.status(404).json({ error: 'Media item not found' });
    }

    res.json({
      ...mediaItem,
      sections: mediaItem.sections.map(section => ({
        ...section,
        markers: section.markers.map(marker => ({
          ...marker,
          order: marker.orderNum,
          dateCreated: new Date(Number(marker.createdAt)),
          dateUpdated: new Date(Number(marker.updatedAt))
        }))
      }))
    });
  } catch (error) {
    console.error('Error getting media item:', error);
    res.status(500).json({ error: 'Failed to get media item' });
  }
});

// Create new media item
router.post('/', async (req, res) => {
  try {
    const newMedia: MediaItem = req.body;
    const now = Date.now();

    // Validate required fields
    if (!newMedia.name || !newMedia.type || !newMedia.sections || newMedia.sections.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate media type
    if (!['book', 'podcast', 'article'].includes(newMedia.type)) {
      return res.status(400).json({ error: 'Invalid media type' });
    }

    // Use a transaction for atomic operation
    const result = await db.transaction(async (tx) => {
      // Insert media item
      await tx.insert(mediaItems).values({
        id: newMedia.id,
        name: newMedia.name,
        type: newMedia.type,
        author: newMedia.author ?? null,
        sourceUrl: newMedia.sourceUrl ?? null,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      });

      // Insert all sections
      for (const section of newMedia.sections) {
        await tx.insert(sections).values({
          id: section.id,
          mediaId: newMedia.id,
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
              position: marker.position,
              orderNum: marker.order,
              quote: marker.quote ?? null,
              note: marker.note,
              createdAt: new Date(now),
              updatedAt: new Date(now),
            });
          }
        }
      }

      // Return the created item with all its data
      return await tx.query.mediaItems.findFirst({
        where: eq(mediaItems.id, newMedia.id),
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
      throw new Error('Failed to create media item');
    }

    // Transform response to match expected format
    res.status(201).json({
      ...result,
      sections: result.sections.map(section => ({
        ...section,
        markers: section.markers.map(marker => ({
          ...marker,
          order: marker.orderNum,
          dateCreated: new Date(Number(marker.createdAt)),
          dateUpdated: new Date(Number(marker.updatedAt))
        }))
      }))
    });
  } catch (error) {
    console.error('Error creating media item:', error);
    res.status(500).json({ error: 'Failed to create media item' });
  }
});

// Add section to media item
router.post('/:mediaId/sections', async (req, res) => {
  try {
    const { mediaId } = req.params;
    const section: Section = req.body;
    const now = Date.now();

    const result = await db.transaction(async (tx) => {
      // Verify media item exists
      const mediaItem = await tx.query.mediaItems.findFirst({
        where: eq(mediaItems.id, mediaId),
        columns: { id: true }
      });

      if (!mediaItem) {
        return null;
      }

      // Insert section
      await tx.insert(sections).values({
        id: section.id,
        mediaId: mediaId,
        title: section.title,
        number: section.number,
        createdAt: new Date(now),
        updatedAt: new Date(now)
      });

      return section;
    });

    if (!result) {
      return res.status(404).json({ error: 'Media item not found' });
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
router.put('/:mediaId/sections/:sectionId', async (req, res) => {
  try {
    const { mediaId, sectionId } = req.params;
    const { title } = req.body;
    const now = Date.now();

    const result = await db.transaction(async (tx) => {
      // Verify section exists and belongs to the media item
      const existingSection = await tx.query.sections.findFirst({
        where: and(
          eq(sections.id, sectionId),
          eq(sections.mediaId, mediaId)
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
router.post('/:mediaId/sections/:sectionId/markers', async (req, res) => {
  try {
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
        position: marker.position,
        orderNum: marker.order,
        quote: marker.quote ?? null,
        note: marker.note,
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

// Update media item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates: MediaItem = req.body;
    const now = Date.now();

    // Validate required fields
    if (!updates.name || !updates.type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate media type
    if (!['book', 'podcast', 'article'].includes(updates.type)) {
      return res.status(400).json({ error: 'Invalid media type' });
    }

    const result = await db.transaction(async (tx) => {
      // Verify and update media item
      const mediaItem = await tx.query.mediaItems.findFirst({
        where: eq(mediaItems.id, id)
      });

      if (!mediaItem) {
        return null;
      }

      // Update media item
      await tx.update(mediaItems)
        .set({
          name: updates.name,
          type: updates.type,
          author: updates.author ?? null,
          sourceUrl: updates.sourceUrl ?? null,
          updatedAt: new Date(now)
        })
        .where(eq(mediaItems.id, id));

      // Get updated media item with sections
      return await tx.query.mediaItems.findFirst({
        where: eq(mediaItems.id, id),
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
      return res.status(404).json({ error: 'Media item not found' });
    }

    res.json({
      ...result,
      sections: result.sections.map(section => ({
        ...section,
        markers: [] // We don't need markers for updates
      }))
    });
  } catch (error) {
    console.error('Error updating media item:', error);
    res.status(500).json({
      error: 'Failed to update media item',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete media item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.transaction(async (tx) => {
      // Verify media item exists
      const mediaItem = await tx.query.mediaItems.findFirst({
        where: eq(mediaItems.id, id),
        columns: { id: true }
      });

      if (!mediaItem) {
        return false;
      }

      // Delete in order: markers -> sections -> media item
      // First, get all sections
      const sectionIds = await tx.query.sections.findMany({
        where: eq(sections.mediaId, id),
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
        .where(eq(sections.mediaId, id));

      // Delete media item
      await tx
        .delete(mediaItems)
        .where(eq(mediaItems.id, id));

      return true;
    });

    if (!result) {
      return res.status(404).json({ error: 'Media item not found' });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting media item:', error);
    res.status(500).json({
      error: 'Failed to delete media item',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete section
router.delete('/:mediaId/sections/:sectionId', async (req, res) => {
  try {
    const { mediaId, sectionId } = req.params;

    const result = await db.transaction(async (tx) => {
      // Verify section exists and belongs to the media item
      const section = await tx.query.sections.findFirst({
        where: and(
          eq(sections.id, sectionId),
          eq(sections.mediaId, mediaId)
        )
      });

      if (!section) {
        return false;
      }

      // Delete all markers in this section first
      await tx.delete(markers)
        .where(eq(markers.sectionId, sectionId));

      // Then delete the section
      await tx.delete(sections)
        .where(eq(sections.id, sectionId));

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
router.put('/:mediaId/sections/:sectionId/markers/:markerId', async (req, res) => {
  try {
    const { mediaId, sectionId, markerId } = req.params;
    const updates = req.body;
    const now = Date.now();

    const result = await db.transaction(async (tx) => {
      // Verify marker exists and belongs to the section
      // Verify marker exists and belongs to the correct section/media
      const sectionAndMarker = await tx.query.sections.findFirst({
        where: and(
          eq(sections.id, sectionId),
          eq(sections.mediaId, mediaId)
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
      order: result.orderNum,
      quote: result.quote,
      note: result.note,
      dateCreated: new Date(Number(result.createdAt)).toISOString(),
      dateUpdated: new Date(now).toISOString()
    });
  } catch (error) {
    console.error('Error updating marker:', error);
    res.status(500).json({ error: 'Failed to update marker' });
  }
});

// Delete marker
router.delete('/:mediaId/sections/:sectionId/markers/:markerId', async (req, res) => {
  try {
    const { mediaId, sectionId, markerId } = req.params;

    const result = await db.transaction(async (tx) => {
      // Verify marker exists and belongs to the correct section/media
      const sectionAndMarker = await tx.query.sections.findFirst({
        where: and(
          eq(sections.id, sectionId),
          eq(sections.mediaId, mediaId)
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

export default router;
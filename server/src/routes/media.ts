import { Router } from 'express';
import db from '../db.js';
import { MediaItem, Section } from '../types/media.js';

const router = Router();

// Get all media items
router.get('/', async (req, res) => {
  try {
    // Get all media items
    const mediaResult = await db.execute({
      sql: 'SELECT * FROM media_items ORDER BY created_at DESC',
      args: []
    });

    if (!mediaResult.rows) {
      res.json([]);
      return;
    }

    // Transform media items and fetch their sections
    const mediaItems = await Promise.all(mediaResult.rows.map(async row => {
      const { created_at, updated_at, ...rest } = row;

      // Get sections for this media item
      const sectionsResult = await db.execute({
        sql: 'SELECT * FROM sections WHERE media_id = ? ORDER BY number',
        args: [row.id]
      });

      const sections = sectionsResult.rows.map(section => ({
        id: section.id,
        title: section.title,
        number: section.number,
        markers: [], // We don't need markers for the list view
      }));

      return {
        ...rest,
        sections,
        createdAt: new Date(created_at as number).toISOString(),
        updatedAt: new Date(updated_at as number).toISOString()
      };
    }));

    res.json(mediaItems);
  } catch (error) {
    console.error('Error getting media items:', error);
    res.status(500).json({
      error: 'Failed to get media items',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get single media item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get media item
    const result = await db.execute({
      sql: 'SELECT * FROM media_items WHERE id = ?',
      args: [id]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media item not found' });
    }

    const { created_at, updated_at, ...rest } = result.rows[0];

    // Get sections
    const sectionsResult = await db.execute({
      sql: 'SELECT * FROM sections WHERE media_id = ? ORDER BY number',
      args: [id]
    });

    // Get markers for each section
    const sections = await Promise.all(sectionsResult.rows.map(async section => {
      const markersResult = await db.execute({
        sql: 'SELECT * FROM markers WHERE section_id = ? ORDER BY order_num',
        args: [section.id]
      });

      return {
        id: section.id,
        title: section.title,
        number: section.number,
        markers: markersResult.rows.map(marker => ({
          id: marker.id,
          position: marker.position,
          order: marker.order_num,
          quote: marker.quote,
          note: marker.note,
          dateCreated: new Date(marker.created_at as number),
          dateUpdated: new Date(marker.updated_at as number)
        }))
      };
    }));

    const mediaItem = {
      ...rest,
      sections,
      createdAt: new Date(created_at as number),
      updatedAt: new Date(updated_at as number)
    };

    res.setHeader('Content-Type', 'application/json');
    res.json(mediaItem);
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
    if (!['book', 'podcast'].includes(newMedia.type)) {
      return res.status(400).json({ error: 'Invalid media type' });
    }

    // Insert media item
    await db.execute({
      sql: 'INSERT INTO media_items (id, name, type, author, source_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [newMedia.id, newMedia.name, newMedia.type, newMedia.author || null, newMedia.sourceUrl || null, now, now]
    });

    // Insert sections
    for (const section of newMedia.sections) {
      await db.execute({
        sql: 'INSERT INTO sections (id, media_id, title, number, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        args: [section.id, newMedia.id, section.title, section.number, now, now]
      });

      // Insert markers if any
      for (const marker of section.markers) {
        await db.execute({
          sql: 'INSERT INTO markers (id, section_id, position, order_num, quote, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          args: [
            marker.id,
            section.id,
            marker.position,
            marker.order,
            marker.quote || null,
            marker.note,
            now,
            now
          ]
        });
      }
    }

    // Get the created item with all its data
    const result = await db.execute({
      sql: 'SELECT * FROM media_items WHERE id = ?',
      args: [newMedia.id]
    });

    const { created_at, updated_at, ...rest } = result.rows[0];

    // Get sections
    const sectionsResult = await db.execute({
      sql: 'SELECT * FROM sections WHERE media_id = ? ORDER BY number',
      args: [newMedia.id]
    });

    // Get markers for each section
    const sections = await Promise.all(sectionsResult.rows.map(async section => {
      const markersResult = await db.execute({
        sql: 'SELECT * FROM markers WHERE section_id = ? ORDER BY order_num',
        args: [section.id]
      });

      return {
        id: section.id,
        title: section.title,
        number: section.number,
        markers: markersResult.rows.map(marker => ({
          id: marker.id,
          position: marker.position,
          order: marker.order_num,
          quote: marker.quote,
          note: marker.note,
          dateCreated: new Date(marker.created_at as number),
          dateUpdated: new Date(marker.updated_at as number)
        }))
      };
    }));

    const createdMedia = {
      ...rest,
      sections,
      createdAt: new Date(now),
      updatedAt: new Date(now)
    };

    res.setHeader('Content-Type', 'application/json');
    res.status(201).json(createdMedia);
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

    // Verify media item exists
    const mediaResult = await db.execute({
      sql: 'SELECT id FROM media_items WHERE id = ?',
      args: [mediaId]
    });

    if (mediaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Media item not found' });
    }

    // Insert section
    await db.execute({
      sql: 'INSERT INTO sections (id, media_id, title, number, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [section.id, mediaId, section.title, section.number, now, now]
    });

    const createdSection = {
      ...section,
      markers: []
    };

    res.setHeader('Content-Type', 'application/json');
    res.status(201).json(createdSection);
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

    // Verify section exists and belongs to the media item
    const sectionResult = await db.execute({
      sql: 'SELECT id FROM sections WHERE id = ? AND media_id = ?',
      args: [sectionId, mediaId]
    });

    if (sectionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Update section title
    await db.execute({
      sql: 'UPDATE sections SET title = ?, updated_at = ? WHERE id = ?',
      args: [title, now, sectionId]
    });

    // Get updated section
    const updatedSectionResult = await db.execute({
      sql: 'SELECT * FROM sections WHERE id = ?',
      args: [sectionId]
    });

    const section = updatedSectionResult.rows[0];

    res.json({
      id: section.id,
      title: section.title,
      number: section.number,
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

    // Verify section exists
    const sectionResult = await db.execute({
      sql: 'SELECT id FROM sections WHERE id = ?',
      args: [sectionId]
    });

    if (sectionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Insert marker
    await db.execute({
      sql: 'INSERT INTO markers (id, section_id, position, order_num, quote, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [
        marker.id,
        sectionId,
        marker.position,
        marker.order,
        marker.quote || null,
        marker.note,
        now,
        now
      ]
    });

    const createdMarker = {
      ...marker,
      dateCreated: new Date(now),
      dateUpdated: new Date(now)
    };

    res.setHeader('Content-Type', 'application/json');
    res.status(201).json(createdMarker);
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
    if (!['book', 'podcast'].includes(updates.type)) {
      return res.status(400).json({ error: 'Invalid media type' });
    }

    // Verify media item exists
    const mediaResult = await db.execute({
      sql: 'SELECT id FROM media_items WHERE id = ?',
      args: [id]
    });

    if (mediaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Media item not found' });
    }

    // Update media item
    await db.execute({
      sql: 'UPDATE media_items SET name = ?, type = ?, author = ?, source_url = ?, updated_at = ? WHERE id = ?',
      args: [updates.name, updates.type, updates.author || null, updates.sourceUrl || null, now, id]
    });

    // Get updated media item with sections
    const result = await db.execute({
      sql: 'SELECT * FROM media_items WHERE id = ?',
      args: [id]
    });

    const { created_at, updated_at, ...rest } = result.rows[0];

    // Get sections
    const sectionsResult = await db.execute({
      sql: 'SELECT * FROM sections WHERE media_id = ? ORDER BY number',
      args: [id]
    });

    const sections = sectionsResult.rows.map(section => ({
      id: section.id,
      title: section.title,
      number: section.number,
      markers: [], // We don't need markers for updates
    }));

    const updatedMedia = {
      ...rest,
      sections,
      createdAt: new Date(created_at as number),
      updatedAt: new Date(now)
    };

    res.json(updatedMedia);
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

    // First verify the media item exists
    const mediaResult = await db.execute({
      sql: 'SELECT id FROM media_items WHERE id = ?',
      args: [id]
    });

    if (mediaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Media item not found' });
    }

    // Get all sections for this media item
    const sectionsResult = await db.execute({
      sql: 'SELECT id FROM sections WHERE media_id = ?',
      args: [id]
    });

    // Delete in order: markers -> sections -> media item
    for (const section of sectionsResult.rows) {
      // Delete all markers for this section
      await db.execute({
        sql: 'DELETE FROM markers WHERE section_id = ?',
        args: [section.id]
      });
    }

    // Delete all sections
    await db.execute({
      sql: 'DELETE FROM sections WHERE media_id = ?',
      args: [id]
    });

    // Finally, delete the media item
    await db.execute({
      sql: 'DELETE FROM media_items WHERE id = ?',
      args: [id]
    });

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

    // Verify section exists and belongs to the media item
    const sectionResult = await db.execute({
      sql: 'SELECT id FROM sections WHERE id = ? AND media_id = ?',
      args: [sectionId, mediaId]
    });

    if (sectionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Delete all markers in this section first
    await db.execute({
      sql: 'DELETE FROM markers WHERE section_id = ?',
      args: [sectionId]
    });

    // Then delete the section
    await db.execute({
      sql: 'DELETE FROM sections WHERE id = ?',
      args: [sectionId]
    });

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

    // Verify marker exists and belongs to the section
    const markerResult = await db.execute({
      sql: 'SELECT m.id FROM markers m JOIN sections s ON m.section_id = s.id WHERE m.id = ? AND s.id = ? AND s.media_id = ?',
      args: [markerId, sectionId, mediaId]
    });

    if (markerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Marker not found' });
    }

    // Update marker
    await db.execute({
      sql: 'UPDATE markers SET position = ?, quote = ?, note = ?, updated_at = ? WHERE id = ?',
      args: [updates.position, updates.quote || null, updates.note, now, markerId]
    });

    // Get updated marker
    const updatedMarkerResult = await db.execute({
      sql: 'SELECT * FROM markers WHERE id = ?',
      args: [markerId]
    });

    const marker = updatedMarkerResult.rows[0];

    res.json({
      id: marker.id,
      position: marker.position,
      order: marker.order_num,
      quote: marker.quote,
      note: marker.note,
      dateCreated: new Date(marker.created_at as number).toISOString(),
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

    // Verify marker exists and belongs to the section
    const markerResult = await db.execute({
      sql: 'SELECT m.id FROM markers m JOIN sections s ON m.section_id = s.id WHERE m.id = ? AND s.id = ? AND s.media_id = ?',
      args: [markerId, sectionId, mediaId]
    });

    if (markerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Marker not found' });
    }

    // Delete the marker
    await db.execute({
      sql: 'DELETE FROM markers WHERE id = ?',
      args: [markerId]
    });

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
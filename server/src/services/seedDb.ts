import client from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const now = Date.now();

const sampleMediaItems = [
  {
    id: uuidv4(),
    name: "The Pragmatic Programmer",
    type: "book",
    author: "Dave Thomas, Andy Hunt",
    created_at: now,
    updated_at: now
  },
  {
    id: uuidv4(),
    name: "The DevOps Handbook",
    type: "book",
    author: "Gene Kim, Patrick Debois",
    created_at: now,
    updated_at: now
  },
  {
    id: uuidv4(),
    name: "Syntax.fm - TypeScript Tips",
    type: "podcast",
    author: "Wes Bos & Scott Tolinski",
    created_at: now,
    updated_at: now
  }
];

const createSections = (mediaItems: typeof sampleMediaItems) => {
  return mediaItems.flatMap(media => {
    if (media.type === 'book') {
      return [
        {
          id: uuidv4(),
          media_id: media.id,
          name: "Chapter 1: A Pragmatic Philosophy",
          order_num: 1,
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          media_id: media.id,
          name: "Chapter 2: A Pragmatic Approach",
          order_num: 2,
          created_at: now,
          updated_at: now
        }
      ];
    } else {
      // For podcasts, create timestamp-based sections
      return [
        {
          id: uuidv4(),
          media_id: media.id,
          name: "Introduction",
          order_num: 1,
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          media_id: media.id,
          name: "Main Discussion",
          order_num: 2,
          created_at: now,
          updated_at: now
        },
        {
          id: uuidv4(),
          media_id: media.id,
          name: "Q&A Session",
          order_num: 3,
          created_at: now,
          updated_at: now
        }
      ];
    }
  });
};

const createMarkers = (sections: ReturnType<typeof createSections>) => {
  return sections.map(section => ({
    id: uuidv4(),
    section_id: section.id,
    position: section.order_num === 1 ? "p.1" : "p.15",
    order_num: 1,
    quote: "Sample quote from this section",
    note: `Important note about ${section.name}`,
    created_at: now,
    updated_at: now
  }));
};

export async function seedDatabase() {
  try {
    // Step 1: Insert media items
    for (const item of sampleMediaItems) {
      await client.execute({
        sql: 'INSERT INTO media_items (id, name, type, author, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        args: [item.id, item.name, item.type, item.author, item.created_at, item.updated_at]
      });
    }

    // Step 2: Create and insert sections
    const sections = createSections(sampleMediaItems);
    for (const section of sections) {
      await client.execute({
        sql: 'INSERT INTO sections (id, media_id, name, order_num, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        args: [section.id, section.media_id, section.name, section.order_num, section.created_at, section.updated_at]
      });
    }

    // Step 3: Create and insert markers
    const markers = createMarkers(sections);
    for (const marker of markers) {
      await client.execute({
        sql: 'INSERT INTO markers (id, section_id, position, order_num, quote, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [marker.id, marker.section_id, marker.position, marker.order_num, marker.quote, marker.note, marker.created_at, marker.updated_at]
      });
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Command to execute seeding
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
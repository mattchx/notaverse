import { relations, sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Media items table
export const mediaItems = sqliteTable('media_items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ['book', 'podcast'] }).notNull(),
  author: text('author'),
  sourceUrl: text('source_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Sections table
export const sections = sqliteTable('sections', {
  id: text('id').primaryKey(),
  mediaId: text('media_id').notNull().references(() => mediaItems.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  number: integer('number').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Markers table
export const markers = sqliteTable('markers', {
  id: text('id').primaryKey(),
  sectionId: text('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  position: text('position').notNull(),
  orderNum: integer('order_num').notNull(),
  quote: text('quote'),
  note: text('note').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Export table schemas
// Define relationships
export const mediaItemsRelations = relations(mediaItems, ({ many }) => ({
  sections: many(sections)
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  mediaItem: one(mediaItems, {
    fields: [sections.mediaId],
    references: [mediaItems.id]
  }),
  markers: many(markers)
}));

export const markersRelations = relations(markers, ({ one }) => ({
  section: one(sections, {
    fields: [markers.sectionId],
    references: [sections.id]
  })
}));

// Sessions table
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  expires: integer('expires'),
  data: text('data').notNull(),
});

export const schema = {
  users,
  mediaItems,
  sections,
  markers,
  sessions,
  mediaItemsRelations,
  sectionsRelations,
  markersRelations
};
import { relations, sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Resources table
export const resources = sqliteTable('resources', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  type: text('type', { enum: ['book', 'podcast', 'article', 'course'] }).notNull(),
  author: text('author'),
  sourceUrl: text('source_url'),
  description: text('description'),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Sections table
export const sections = sqliteTable('sections', {
  id: text('id').primaryKey(),
  resourceId: text('resource_id').notNull().references(() => resources.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  number: integer('number').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Markers table
export const markers = sqliteTable('markers', {
  id: text('id').primaryKey(),
  sectionId: text('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id),
  position: text('position').notNull(),
  orderNum: integer('order_num').notNull(),
  quote: text('quote'),
  note: text('note').notNull(),
  type: text('type', { enum: ['general', 'concept', 'question', 'summary'] }).notNull().default('general'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Comments table for markers
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  markerId: text('marker_id').notNull().references(() => markers.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Sessions table for authentication
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  data: text('data').notNull(),
  expires: integer('expires', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  resources: many(resources),
  markers: many(markers),
  comments: many(comments)
}));

export const resourcesRelations = relations(resources, ({ one, many }) => ({
  user: one(users, {
    fields: [resources.userId],
    references: [users.id],
  }),
  sections: many(sections),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  resource: one(resources, {
    fields: [sections.resourceId],
    references: [resources.id],
  }),
  markers: many(markers),
}));

export const markersRelations = relations(markers, ({ one, many }) => ({
  section: one(sections, {
    fields: [markers.sectionId],
    references: [sections.id],
  }),
  user: one(users, {
    fields: [markers.userId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  marker: one(markers, {
    fields: [comments.markerId],
    references: [markers.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

// Drizzle migrations table
export const drizzleMigrations = sqliteTable('__drizzle_migrations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  hash: text('hash').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const schema = {
  users,
  resources,
  sections,
  markers,
  comments,
  sessions,
  drizzleMigrations,
  usersRelations,
  resourcesRelations,
  sectionsRelations,
  markersRelations,
  commentsRelations,
};
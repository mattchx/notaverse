import { sqliteTable, AnySQLiteColumn, foreignKey, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const markers = sqliteTable("markers", {
	id: text().primaryKey().notNull(),
	sectionId: text("section_id").notNull().references(() => sections.id, { onDelete: "cascade" } ),
	userId: text("user_id").notNull().references(() => users.id),
	position: text().notNull(),
	orderNum: integer("order_num").notNull(),
	quote: text(),
	note: text().notNull(),
	type: text().default("general").notNull(),
	createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: integer("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const sections = sqliteTable("sections", {
	id: text().primaryKey().notNull(),
	resourceId: text("resource_id").notNull().references(() => resources.id, { onDelete: "cascade" } ),
	title: text().notNull(),
	number: integer().notNull(),
	createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: integer("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const users = sqliteTable("users", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	name: text(),
	avatarUrl: text("avatar_url"),
	createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: integer("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
},
(table) => [
	uniqueIndex("users_email_unique").on(table.email),
]);

export const sessions = sqliteTable("sessions", {
	id: text().primaryKey().notNull(),
	data: text().notNull(),
	expires: integer(),
	createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const resources = sqliteTable("resources", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => users.id),
	name: text().notNull(),
	type: text().notNull(),
	author: text(),
	sourceUrl: text("source_url"),
	description: text(),
	createdAt: integer("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: integer("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const drizzleMigrations = sqliteTable("__drizzle_migrations", {
});


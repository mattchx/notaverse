import { relations } from "drizzle-orm/relations";
import { users, markers, sections, resources } from "./schema.js";

export const markersRelations = relations(markers, ({one}) => ({
	user: one(users, {
		fields: [markers.userId],
		references: [users.id]
	}),
	section: one(sections, {
		fields: [markers.sectionId],
		references: [sections.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	markers: many(markers),
	resources: many(resources),
}));

export const sectionsRelations = relations(sections, ({one, many}) => ({
	markers: many(markers),
	resource: one(resources, {
		fields: [sections.resourceId],
		references: [resources.id]
	}),
}));

export const resourcesRelations = relations(resources, ({one, many}) => ({
	sections: many(sections),
	user: one(users, {
		fields: [resources.userId],
		references: [users.id]
	}),
}));
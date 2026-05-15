import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const preferenceCategoryEnum = pgEnum("preference_category", [
  "food",
  "culture",
  "outdoor",
  "nightlife",
  "shopping",
]);

export const cities = pgTable("cities", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  displayName: text("display_name").notNull(),
  country: text("country").notNull(),
});

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cityId: uuid("city_id")
      .notNull()
      .references(() => cities.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: preferenceCategoryEnum("category").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    costUsd: real("cost_usd").notNull(),
    address: text("address").notNull(),
    lat: real("lat").notNull(),
    lng: real("lng").notNull(),
  },
  (t) => [
    index("activities_city_idx").on(t.cityId),
    uniqueIndex("activities_city_name_idx").on(t.cityId, t.name),
  ],
);

export const citiesRelations = relations(cities, ({ many }) => ({
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  city: one(cities, { fields: [activities.cityId], references: [cities.id] }),
}));

export const itineraries = pgTable(
  "itineraries",
  {
    id: text("id").primaryKey(),
    cityId: uuid("city_id")
      .notNull()
      .references(() => cities.id),
    request: jsonb("request").notNull(),
    response: jsonb("response").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("itineraries_created_at_idx").on(t.createdAt)],
);

export const itinerariesRelations = relations(itineraries, ({ one }) => ({
  city: one(cities, { fields: [itineraries.cityId], references: [cities.id] }),
}));

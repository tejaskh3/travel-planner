import {
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { cities } from "./cities.schema.js";

export const preferenceCategoryEnum = pgEnum("preference_category", [
  "food",
  "culture",
  "outdoor",
  "nightlife",
  "shopping",
]);

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

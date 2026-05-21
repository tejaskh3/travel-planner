import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { cities } from "./cities.schema.js";
import { users } from "./users.schema.js";

export const paceEnum = pgEnum("pace", ["relaxed", "balanced", "packed"]);

export const travelGroupEnum = pgEnum("travel_group", [
  "Solo",
  "Couple",
  "Friends",
  "Family",
]);

export const preferences = pgTable("preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  defaultCityKey: text("default_city_key").references(() => cities.key),
  defaultDays: integer("default_days"),
  defaultBudgetInr: integer("default_budget_inr"),
  defaultPace: paceEnum("default_pace"),
  defaultGroup: travelGroupEnum("default_group"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

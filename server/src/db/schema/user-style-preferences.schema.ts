import {
  index,
  pgEnum,
  pgTable,
  primaryKey,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema.js";

export const travelStyleEnum = pgEnum("travel_style", [
  "Foodie",
  "Culture",
  "Adventure",
  "Nature",
  "Nightlife",
  "Shopping",
  "Relaxed",
]);

export const userStylePreferences = pgTable(
  "user_style_preferences",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    style: travelStyleEnum("style").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.style] }),
    index("user_style_preferences_user_idx").on(t.userId),
  ],
);

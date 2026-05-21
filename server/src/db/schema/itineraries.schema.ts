import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { cities } from "./cities.schema.js";

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

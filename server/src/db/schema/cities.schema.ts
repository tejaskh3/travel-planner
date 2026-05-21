import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const cities = pgTable("cities", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  displayName: text("display_name").notNull(),
  country: text("country").notNull(),
});

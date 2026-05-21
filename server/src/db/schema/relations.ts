import { relations } from "drizzle-orm";
import { activities } from "./activities.schema.js";
import { cities } from "./cities.schema.js";
import { itineraries } from "./itineraries.schema.js";
import { preferences } from "./preferences.schema.js";
import { users } from "./users.schema.js";
import { userStylePreferences } from "./user-style-preferences.schema.js";

export const citiesRelations = relations(cities, ({ many }) => ({
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  city: one(cities, { fields: [activities.cityId], references: [cities.id] }),
}));

export const itinerariesRelations = relations(itineraries, ({ one }) => ({
  city: one(cities, { fields: [itineraries.cityId], references: [cities.id] }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  preferences: one(preferences, {
    fields: [users.id],
    references: [preferences.userId],
  }),
  stylePreferences: many(userStylePreferences),
}));

export const preferencesRelations = relations(preferences, ({ one }) => ({
  user: one(users, { fields: [preferences.userId], references: [users.id] }),
  defaultCity: one(cities, {
    fields: [preferences.defaultCityKey],
    references: [cities.key],
  }),
}));

export const userStylePreferencesRelations = relations(
  userStylePreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [userStylePreferences.userId],
      references: [users.id],
    }),
  }),
);

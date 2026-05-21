import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  preferences,
  users,
  userStylePreferences,
} from "../../db/schema.js";
import type { CityKey } from "../cities/cities.enum.js";
import type { Pace } from "../itinerary/data/itinerary.enum.js";
import type {
  PreferencesResponseDto,
  SavePreferencesDto,
} from "./preferences.dto.js";
import type { TravelGroup, TravelStyle } from "./preferences.enum.js";

export async function upsertPreferences(
  dto: SavePreferencesDto,
): Promise<PreferencesResponseDto> {
  return db.transaction(async (tx) => {
    const [userRow] = await tx
      .insert(users)
      .values({ email: dto.email, name: dto.name ?? null })
      .onConflictDoUpdate({
        target: users.email,
        set: { name: dto.name ?? null },
      })
      .returning({ id: users.id, email: users.email, name: users.name });

    if (!userRow) {
      throw new Error("Failed to upsert user");
    }

    await tx
      .insert(preferences)
      .values({
        userId: userRow.id,
        defaultCityKey: dto.defaultCityKey ?? null,
        defaultDays: dto.defaultDays ?? null,
        defaultBudgetInr: dto.defaultBudgetInr ?? null,
        defaultPace: dto.defaultPace ?? null,
        defaultGroup: dto.defaultGroup ?? null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: preferences.userId,
        set: {
          defaultCityKey: dto.defaultCityKey ?? null,
          defaultDays: dto.defaultDays ?? null,
          defaultBudgetInr: dto.defaultBudgetInr ?? null,
          defaultPace: dto.defaultPace ?? null,
          defaultGroup: dto.defaultGroup ?? null,
          updatedAt: new Date(),
        },
      });

    await tx
      .delete(userStylePreferences)
      .where(eq(userStylePreferences.userId, userRow.id));

    if (dto.defaultStyles && dto.defaultStyles.length > 0) {
      await tx.insert(userStylePreferences).values(
        dto.defaultStyles.map((style) => ({
          userId: userRow.id,
          style,
        })),
      );
    }

    return {
      email: userRow.email,
      name: userRow.name,
      defaultCityKey: (dto.defaultCityKey ?? null) as CityKey | null,
      defaultDays: dto.defaultDays ?? null,
      defaultBudgetInr: dto.defaultBudgetInr ?? null,
      defaultPace: (dto.defaultPace ?? null) as Pace | null,
      defaultGroup: (dto.defaultGroup ?? null) as TravelGroup | null,
      defaultStyles: dto.defaultStyles ?? [],
    };
  });
}

export async function findPreferencesByEmail(
  email: string,
): Promise<PreferencesResponseDto | null> {
  const userRow = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (!userRow) return null;

  const prefRow = await db.query.preferences.findFirst({
    where: eq(preferences.userId, userRow.id),
  });
  const styleRows = await db.query.userStylePreferences.findMany({
    where: eq(userStylePreferences.userId, userRow.id),
  });

  return {
    email: userRow.email,
    name: userRow.name,
    defaultCityKey: (prefRow?.defaultCityKey ?? null) as CityKey | null,
    defaultDays: prefRow?.defaultDays ?? null,
    defaultBudgetInr: prefRow?.defaultBudgetInr ?? null,
    defaultPace: (prefRow?.defaultPace ?? null) as Pace | null,
    defaultGroup: (prefRow?.defaultGroup ?? null) as TravelGroup | null,
    defaultStyles: styleRows.map((r) => r.style as TravelStyle),
  };
}

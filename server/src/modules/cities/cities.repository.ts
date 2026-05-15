import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { cities } from "../../db/schema.js";
import type { CityKey, PreferenceCategory } from "./cities.enum.js";
import type { Activity, City } from "./cities.types.js";

export async function findCityWithActivities(
  cityKey: CityKey,
): Promise<City | null> {
  const row = await db.query.cities.findFirst({
    where: eq(cities.key, cityKey),
    with: { activities: true },
  });
  if (!row) return null;

  // Drizzle returns the postgres enum as a literal-union string; the DB
  // constraint guarantees it's a valid PreferenceCategory value.
  const activities: readonly Activity[] = row.activities.map((a) => ({
    id: a.id,
    name: a.name,
    category: a.category as PreferenceCategory,
    durationMinutes: a.durationMinutes,
    costUsd: a.costUsd,
    address: a.address,
    lat: a.lat,
    lng: a.lng,
  }));

  return {
    id: row.id,
    key: row.key as CityKey,
    displayName: row.displayName,
    country: row.country,
    activities,
  };
}

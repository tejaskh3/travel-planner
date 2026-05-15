import { sql } from "drizzle-orm";
import { db } from "./client.js";
import { activities, cities } from "./schema.js";
import { CITY_SEED_DATA } from "../modules/cities/cities.data.js";

async function seed(): Promise<void> {
  for (const seedCity of CITY_SEED_DATA) {
    const [insertedCity] = await db
      .insert(cities)
      .values({
        key: seedCity.key,
        displayName: seedCity.displayName,
        country: seedCity.country,
      })
      .onConflictDoUpdate({
        target: cities.key,
        set: {
          displayName: seedCity.displayName,
          country: seedCity.country,
        },
      })
      .returning({ id: cities.id });

    if (!insertedCity) {
      throw new Error(`Failed to upsert city ${seedCity.key}`);
    }

    if (seedCity.activities.length === 0) continue;

    await db
      .insert(activities)
      .values(
        seedCity.activities.map((activity) => ({
          cityId: insertedCity.id,
          name: activity.name,
          category: activity.category,
          durationMinutes: activity.durationMinutes,
          costUsd: activity.costUsd,
          address: activity.address,
          lat: activity.lat,
          lng: activity.lng,
        })),
      )
      .onConflictDoUpdate({
        target: [activities.cityId, activities.name],
        set: {
          category: sql`excluded.category`,
          durationMinutes: sql`excluded.duration_minutes`,
          costUsd: sql`excluded.cost_usd`,
          address: sql`excluded.address`,
          lat: sql`excluded.lat`,
          lng: sql`excluded.lng`,
        },
      });

    console.log(
      `Seeded ${seedCity.key}: ${seedCity.activities.length} activities`,
    );
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });

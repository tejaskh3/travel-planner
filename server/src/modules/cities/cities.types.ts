import type { CityKey, PreferenceCategory } from "./cities.enum.js";

export type Activity = {
  readonly id: string;
  readonly name: string;
  readonly category: PreferenceCategory;
  readonly durationMinutes: number;
  readonly costUsd: number;
  readonly address: string;
  readonly lat: number;
  readonly lng: number;
};

export type City = {
  readonly id: string;
  readonly key: CityKey;
  readonly displayName: string;
  readonly country: string;
  readonly activities: readonly Activity[];
};

export type SeedActivity = Omit<Activity, "id">;

export type SeedCity = {
  readonly key: CityKey;
  readonly displayName: string;
  readonly country: string;
  readonly activities: readonly SeedActivity[];
};

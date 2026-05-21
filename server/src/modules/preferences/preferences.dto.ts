import { z } from "zod";
import { CityKey } from "../cities/cities.enum.js";
import { Pace } from "../itinerary/data/itinerary.enum.js";
import { TravelGroup, TravelStyle } from "./preferences.enum.js";

export const savePreferencesSchema = z
  .object({
    email: z.string().email(),
    name: z.string().min(1).max(120).optional(),
    defaultCityKey: z.enum(CityKey).optional(),
    defaultDays: z.number().int().min(1).max(3).optional(),
    defaultBudgetInr: z.number().int().min(1).max(10_000_000).optional(),
    defaultPace: z.enum(Pace).optional(),
    defaultGroup: z.enum(TravelGroup).optional(),
    defaultStyles: z.array(z.enum(TravelStyle)).optional(),
  })
  .strict();

export type SavePreferencesDto = z.infer<typeof savePreferencesSchema>;

export const getPreferencesQuerySchema = z
  .object({
    email: z.string().email(),
  })
  .strict();

export type PreferencesResponseDto = {
  readonly email: string;
  readonly name: string | null;
  readonly defaultCityKey: CityKey | null;
  readonly defaultDays: number | null;
  readonly defaultBudgetInr: number | null;
  readonly defaultPace: Pace | null;
  readonly defaultGroup: TravelGroup | null;
  readonly defaultStyles: readonly TravelStyle[];
};

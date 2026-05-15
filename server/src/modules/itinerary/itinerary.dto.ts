import { z } from "zod";
import { CityKey, PreferenceCategory } from "../cities/cities.enum.js";
import { Pace } from "./itinerary.enum.js";

export const itineraryRequestSchema = z
  .object({
    cityKey: z.enum(CityKey),
    days: z.number().int().min(1).max(3),
    budgetUsd: z.number().positive().max(100_000),
    preferences: z.array(z.enum(PreferenceCategory)).min(1),
    pace: z.enum(Pace),
    seed: z.number().int().min(0).max(0x7fffffff).optional(),
  })
  .strict();

export type ItineraryRequestDto = z.infer<typeof itineraryRequestSchema>;

export type PlannedActivityDto = {
  readonly id: string;
  readonly name: string;
  readonly category: PreferenceCategory;
  readonly startTime: string;
  readonly durationMinutes: number;
  readonly costUsd: number;
  readonly address: string;
  readonly lat: number;
  readonly lng: number;
  readonly mapsUrl: string;
};

export type PlannedDayDto = {
  readonly dayNumber: number;
  readonly activities: readonly PlannedActivityDto[];
  readonly subtotalUsd: number;
};

export type ItineraryResponseDto = {
  readonly id: string;
  readonly cityKey: CityKey;
  readonly cityName: string;
  readonly days: readonly PlannedDayDto[];
  readonly totalCostUsd: number;
  readonly budgetUsd: number;
  readonly unfitReason: string | null;
  readonly seed: number;
  readonly createdAt: string;
};

export type SolverResult = Omit<ItineraryResponseDto, "id" | "createdAt">;

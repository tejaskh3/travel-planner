import { z } from "zod";
import { CityKey, Pace, PreferenceCategory } from "./itinerary.enum";

export const itineraryRequestSchema = z
  .object({
    cityKey: z.nativeEnum(CityKey),
    days: z.number().int().min(1).max(3),
    budgetUsd: z.number().positive().max(100_000),
    preferences: z.array(z.nativeEnum(PreferenceCategory)).min(1),
    pace: z.nativeEnum(Pace),
    seed: z.number().int().min(0).max(0x7fffffff).optional(),
    extraPrompt: z.string().trim().max(500).optional(),
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
  readonly blurb?: string;
};

export type TravelHopMode = "walk" | "metro" | "cab" | "auto" | "bus" | "train";

export type TravelHopDto = {
  readonly fromActivityId: string;
  readonly toActivityId: string;
  readonly mode: TravelHopMode;
  readonly durationMinutes: number;
  readonly tip?: string;
};

export type PlannedDayDto = {
  readonly dayNumber: number;
  readonly activities: readonly PlannedActivityDto[];
  readonly subtotalUsd: number;
  readonly theme?: string;
  readonly travelHops?: readonly TravelHopDto[];
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

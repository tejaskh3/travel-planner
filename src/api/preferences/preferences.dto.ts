import type { CityKey, Pace } from "@/api/itinerary/itinerary.enum";

export type TravelStyle =
  | "Foodie"
  | "Culture"
  | "Adventure"
  | "Nature"
  | "Nightlife"
  | "Shopping"
  | "Relaxed";

export type TravelGroup = "Solo" | "Couple" | "Friends" | "Family";

export type SavePreferencesReqDto = {
  readonly email: string;
  readonly name?: string;
  readonly defaultCityKey?: CityKey;
  readonly defaultDays?: number;
  readonly defaultBudgetInr?: number;
  readonly defaultPace?: Pace;
  readonly defaultGroup?: TravelGroup;
  readonly defaultStyles?: readonly TravelStyle[];
};

export type PreferencesResDto = {
  readonly email: string;
  readonly name: string | null;
  readonly defaultCityKey: CityKey | null;
  readonly defaultDays: number | null;
  readonly defaultBudgetInr: number | null;
  readonly defaultPace: Pace | null;
  readonly defaultGroup: TravelGroup | null;
  readonly defaultStyles: readonly TravelStyle[];
};

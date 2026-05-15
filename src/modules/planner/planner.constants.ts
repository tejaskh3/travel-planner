import {
  BoltIcon,
  BuildingIcon,
  CloudIcon,
  CompassIcon,
  GlassCheersIcon,
  HeartIcon,
  HomeIcon,
  MountainIcon,
  ShoppingBagIcon,
  SunIcon,
  SunsetIcon,
  UserIcon,
  UsersIcon,
  UtensilsIcon,
  type TIcon,
} from "@/icons/icons";

export enum CityKey {
  BANGALORE = "bangalore",
  GOA = "goa",
  JAIPUR = "jaipur",
}

export enum PreferenceCategory {
  FOOD = "food",
  CULTURE = "culture",
  OUTDOOR = "outdoor",
  NIGHTLIFE = "nightlife",
  SHOPPING = "shopping",
}

export enum Pace {
  RELAXED = "relaxed",
  BALANCED = "balanced",
  PACKED = "packed",
}

export type TStyleKey =
  | "Foodie"
  | "Culture"
  | "Adventure"
  | "Nature"
  | "Nightlife"
  | "Shopping"
  | "Relaxed";

export type TGroupKey = "Solo" | "Couple" | "Friends" | "Family";

export type TStyleOption = { key: TStyleKey; Icon: TIcon };
export type TPaceOption = { key: Pace; label: string; sub: string; Icon: TIcon };
export type TGroupOption = { key: TGroupKey; Icon: TIcon };

export const STYLES: readonly TStyleOption[] = [
  { key: "Foodie", Icon: UtensilsIcon },
  { key: "Culture", Icon: BuildingIcon },
  { key: "Adventure", Icon: MountainIcon },
  { key: "Nature", Icon: CompassIcon },
  { key: "Nightlife", Icon: GlassCheersIcon },
  { key: "Shopping", Icon: ShoppingBagIcon },
  { key: "Relaxed", Icon: HeartIcon },
];

export const PACES: readonly TPaceOption[] = [
  { key: Pace.RELAXED, label: "Relaxed", sub: "≈ 6h / day", Icon: SunIcon },
  { key: Pace.BALANCED, label: "Balanced", sub: "≈ 8h / day", Icon: SunsetIcon },
  { key: Pace.PACKED, label: "Packed", sub: "≈ 10h / day", Icon: BoltIcon },
];

export const GROUPS: readonly TGroupOption[] = [
  { key: "Solo", Icon: UserIcon },
  { key: "Couple", Icon: HeartIcon },
  { key: "Friends", Icon: UsersIcon },
  { key: "Family", Icon: HomeIcon },
];

export const DAY_OPTIONS = [1, 2, 3] as const;

export const BUDGET_RANGE_INR = {
  min: 5_000,
  max: 100_000,
  step: 1_000,
  default: 20_000,
} as const;

export const BUDGET_TICKS_INR = [5_000, 25_000, 50_000, 75_000, 100_000] as const;

export type TCityVisual = {
  displayName: string;
  gradient: readonly [string, string, string];
  weather: { temp: number; label: string };
  weatherIcon: TIcon;
  vibe: string;
};

export const CITY_VISUALS: Readonly<Record<CityKey, TCityVisual>> = {
  [CityKey.BANGALORE]: {
    displayName: "Bangalore",
    gradient: ["#3F5A2E", "#7AA563", "#C9D89B"],
    weather: { temp: 26, label: "Pleasant" },
    weatherIcon: CloudIcon,
    vibe: "Garden City • Karnataka",
  },
  [CityKey.GOA]: {
    displayName: "Goa",
    gradient: ["#0E5158", "#2C9CA3", "#90D8DA"],
    weather: { temp: 31, label: "Sunny" },
    weatherIcon: SunIcon,
    vibe: "Coastal Konkan",
  },
  [CityKey.JAIPUR]: {
    displayName: "Jaipur",
    gradient: ["#7A2A18", "#D85432", "#F2A88B"],
    weather: { temp: 29, label: "Clear" },
    weatherIcon: SunIcon,
    vibe: "Pink City • Rajasthan",
  },
};

export const STYLE_TO_PREF: Readonly<Record<TStyleKey, PreferenceCategory>> = {
  Foodie: PreferenceCategory.FOOD,
  Culture: PreferenceCategory.CULTURE,
  Adventure: PreferenceCategory.OUTDOOR,
  Nature: PreferenceCategory.OUTDOOR,
  Nightlife: PreferenceCategory.NIGHTLIFE,
  Shopping: PreferenceCategory.SHOPPING,
  Relaxed: PreferenceCategory.CULTURE,
};

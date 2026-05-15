import type { SeedCity } from "./cities.types.js";
import { bangaloreSeed } from "./data/bangalore.js";
import { goaSeed } from "./data/goa.js";
import { jaipurSeed } from "./data/jaipur.js";

export const CITY_SEED_DATA: readonly SeedCity[] = [
  bangaloreSeed,
  goaSeed,
  jaipurSeed,
];

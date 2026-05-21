import { Pace } from "./itinerary.enum.js";

export const MINUTES_PER_HOUR = 60;
export const HOURS_IN_DAY = 24;
export const DAY_START_HOUR = 9;

export const PACE_TO_DAY_MINUTES_MAP: Readonly<Record<Pace, number>> = {
  [Pace.RELAXED]: 360,
  [Pace.BALANCED]: 480,
  [Pace.PACKED]: 600,
};

export const UNFIT_MESSAGE =
  "Couldn't fit anything within your budget and pace. Try increasing the budget or relaxing the pace.";

export const ITINERARY_ID_ALPHABET =
  "23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
export const ITINERARY_ID_LENGTH = 10;

export const SEED_MAX_EXCLUSIVE = 0x80000000;
export const PRNG_INCREMENT = 0x6d2b79f5;
export const PRNG_DIVISOR = 4294967296;

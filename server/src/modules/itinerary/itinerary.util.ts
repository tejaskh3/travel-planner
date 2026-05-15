import { randomInt } from "node:crypto";
import { customAlphabet } from "nanoid";

const ITINERARY_ID_ALPHABET =
  "23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const ITINERARY_ID_LENGTH = 10;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;
const SEED_MAX_EXCLUSIVE = 0x80000000;
const PRNG_INCREMENT = 0x6d2b79f5;
const PRNG_DIVISOR = 4294967296;

export function buildMapsSearchUrl(lat: number, lng: number): string {
  const query = encodeURIComponent(`${lat},${lng}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function formatHhmm(minutesFromMidnight: number): string {
  const hh = Math.floor(minutesFromMidnight / MINUTES_IN_HOUR) % HOURS_IN_DAY;
  const mm = minutesFromMidnight % MINUTES_IN_HOUR;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function fisherYatesShuffle<T>(
  items: readonly T[],
  random: () => number,
): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const swap = shuffled[i] as T;
    shuffled[i] = shuffled[j] as T;
    shuffled[j] = swap;
  }
  return shuffled;
}

// mulberry32 — pure, deterministic. Same seed → same sequence.
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + PRNG_INCREMENT) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / PRNG_DIVISOR;
  };
}

const nanoIdFactory = customAlphabet(ITINERARY_ID_ALPHABET, ITINERARY_ID_LENGTH);
export function generateItineraryId(): string {
  return nanoIdFactory();
}

export function generateSeed(): number {
  return randomInt(0, SEED_MAX_EXCLUSIVE);
}

import { randomInt } from "node:crypto";
import { customAlphabet } from "nanoid";
import {
  HOURS_IN_DAY,
  ITINERARY_ID_ALPHABET,
  ITINERARY_ID_LENGTH,
  MINUTES_PER_HOUR,
  PRNG_DIVISOR,
  PRNG_INCREMENT,
  SEED_MAX_EXCLUSIVE,
} from "../data/itinerary.constants.js";

const nanoIdFactory = customAlphabet(ITINERARY_ID_ALPHABET, ITINERARY_ID_LENGTH);

export class ItineraryUtil {
  static buildMapsSearchUrl(lat: number, lng: number): string {
    const query = encodeURIComponent(`${lat},${lng}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  static formatHhmm(minutesFromMidnight: number): string {
    const hh = Math.floor(minutesFromMidnight / MINUTES_PER_HOUR) % HOURS_IN_DAY;
    const mm = minutesFromMidnight % MINUTES_PER_HOUR;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }

  static fisherYatesShuffle<T>(
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
  static createSeededRandom(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
      state = (state + PRNG_INCREMENT) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / PRNG_DIVISOR;
    };
  }

  static generateItineraryId(): string {
    return nanoIdFactory();
  }

  static generateSeed(): number {
    return randomInt(0, SEED_MAX_EXCLUSIVE);
  }
}

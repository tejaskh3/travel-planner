import type { PreferenceCategory } from "../cities/cities.enum.js";
import type { Activity, City } from "../cities/cities.types.js";
import {
  DAY_START_HOUR,
  MINUTES_PER_HOUR,
  PACE_TO_DAY_MINUTES_MAP,
  UNFIT_MESSAGE,
} from "./data/itinerary.constants.js";
import type {
  ItineraryRequestDto,
  PlannedActivityDto,
  PlannedDayDto,
  SolverResult,
} from "./data/itinerary.dto.js";
import { ItineraryUtil } from "./utils/itinerary.util.js";

export function generateItinerary(args: {
  readonly dto: ItineraryRequestDto;
  readonly city: City;
  readonly random: () => number;
  readonly seed: number;
}): SolverResult {
  const { dto, city, random, seed } = args;

  const { preferred, fallback } = splitByPreference(
    city.activities,
    dto.preferences,
  );

  const shuffledPreferred = ItineraryUtil.fisherYatesShuffle(preferred, random);
  const shuffledFallback = ItineraryUtil.fisherYatesShuffle(fallback, random);

  const { days, totalCostUsd } = planAllDays({
    totalDays: dto.days,
    paceDayMinutes: PACE_TO_DAY_MINUTES_MAP[dto.pace],
    tripBudget: dto.budgetUsd,
    preferred: shuffledPreferred,
    fallback: shuffledFallback,
  });

  return {
    cityKey: city.key,
    cityName: city.displayName,
    days,
    totalCostUsd,
    budgetUsd: dto.budgetUsd,
    unfitReason: computeUnfitReason(days),
    seed,
  };
}

export function splitByPreference(
  activities: readonly Activity[],
  preferences: readonly PreferenceCategory[],
): { preferred: readonly Activity[]; fallback: readonly Activity[] } {
  const preferenceSet = new Set(preferences);
  const preferred: Activity[] = [];
  const fallback: Activity[] = [];
  for (const activity of activities) {
    if (preferenceSet.has(activity.category)) {
      preferred.push(activity);
    } else {
      fallback.push(activity);
    }
  }
  return { preferred, fallback };
}

export function toPlannedActivity(
  activity: Activity,
  clockMinutes: number,
): PlannedActivityDto {
  return {
    id: activity.id,
    name: activity.name,
    category: activity.category,
    startTime: ItineraryUtil.formatHhmm(clockMinutes),
    durationMinutes: activity.durationMinutes,
    costUsd: activity.costUsd,
    address: activity.address,
    lat: activity.lat,
    lng: activity.lng,
    mapsUrl: ItineraryUtil.buildMapsSearchUrl(activity.lat, activity.lng),
  };
}

export function fillDay(args: {
  readonly dayNumber: number;
  readonly dayMinutes: number;
  readonly remainingBudget: number;
  readonly usedIds: ReadonlySet<string>;
  readonly preferred: readonly Activity[];
  readonly fallback: readonly Activity[];
}): {
  readonly day: PlannedDayDto;
  readonly nextUsedIds: ReadonlySet<string>;
  readonly nextRemainingBudget: number;
} {
  const nextUsedIds = new Set(args.usedIds);
  const picked: PlannedActivityDto[] = [];
  let clock = DAY_START_HOUR * MINUTES_PER_HOUR;
  let remainingMinutes = args.dayMinutes;
  let remainingBudget = args.remainingBudget;
  let subtotalUsd = 0;

  const tryPickFrom = (pool: readonly Activity[]): void => {
    for (const candidate of pool) {
      if (nextUsedIds.has(candidate.id)) continue;
      if (candidate.durationMinutes > remainingMinutes) continue;
      if (candidate.costUsd > remainingBudget) continue;
      picked.push(toPlannedActivity(candidate, clock));
      nextUsedIds.add(candidate.id);
      clock += candidate.durationMinutes;
      remainingMinutes -= candidate.durationMinutes;
      remainingBudget -= candidate.costUsd;
      subtotalUsd += candidate.costUsd;
    }
  };

  tryPickFrom(args.preferred);
  if (picked.length === 0) {
    tryPickFrom(args.fallback);
  }

  return {
    day: {
      dayNumber: args.dayNumber,
      activities: picked,
      subtotalUsd,
    },
    nextUsedIds,
    nextRemainingBudget: remainingBudget,
  };
}

export function planAllDays(args: {
  readonly totalDays: number;
  readonly paceDayMinutes: number;
  readonly tripBudget: number;
  readonly preferred: readonly Activity[];
  readonly fallback: readonly Activity[];
}): { readonly days: readonly PlannedDayDto[]; readonly totalCostUsd: number } {
  const dayNumbers = Array.from({ length: args.totalDays }, (_, i) => i + 1);
  const initial = {
    days: [] as readonly PlannedDayDto[],
    usedIds: new Set<string>() as ReadonlySet<string>,
    remainingBudget: args.tripBudget,
  };

  const result = dayNumbers.reduce((acc, dayNumber) => {
    const stepped = fillDay({
      dayNumber,
      dayMinutes: args.paceDayMinutes,
      remainingBudget: acc.remainingBudget,
      usedIds: acc.usedIds,
      preferred: args.preferred,
      fallback: args.fallback,
    });
    return {
      days: [...acc.days, stepped.day],
      usedIds: stepped.nextUsedIds,
      remainingBudget: stepped.nextRemainingBudget,
    };
  }, initial);

  const totalCostUsd = result.days.reduce(
    (sum, day) => sum + day.subtotalUsd,
    0,
  );
  return { days: result.days, totalCostUsd };
}

export function computeUnfitReason(
  days: readonly PlannedDayDto[],
): string | null {
  return days.every((day) => day.activities.length === 0)
    ? UNFIT_MESSAGE
    : null;
}

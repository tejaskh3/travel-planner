import { z } from "zod";
import type { PlannedActivityDto, SolverResult, TravelHopDto } from "./data/itinerary.dto.js";

export const TRAVEL_HOP_MODES = ["walk", "metro", "cab", "auto", "bus", "train"] as const;
export const travelHopModeSchema = z.enum(TRAVEL_HOP_MODES);
export type TravelHopMode = z.infer<typeof travelHopModeSchema>;

export const llmEnrichmentSchema = z.object({
  dayThemes: z.array(
    z.object({
      dayNumber: z.number().int().positive(),
      theme: z.string().min(1).max(80),
    }),
  ),
  activityBlurbs: z.array(
    z.object({
      activityId: z.string().min(1),
      blurb: z.string().min(1).max(140),
    }),
  ),
  travelHops: z
    .array(
      z.object({
        fromActivityId: z.string().min(1),
        toActivityId: z.string().min(1),
        mode: travelHopModeSchema,
        durationMinutes: z.number().int().min(1).max(240),
        tip: z.string().min(1).max(140).optional(),
      }),
    )
    .optional(),
});

export type LlmEnrichment = z.infer<typeof llmEnrichmentSchema>;
export type LlmTravelHop = NonNullable<LlmEnrichment["travelHops"]>[number];

export type EnrichmentFn = (prompt: string) => Promise<LlmEnrichment | null>;

export const ENRICHMENT_SYSTEM_PROMPT =
  "You enrich travel itineraries with creative day themes, one-line activity descriptions, and short travel notes between consecutive stops. Respond ONLY with valid JSON matching the requested schema. Themes are 2-5 vivid words. Blurbs are one sentence, max 140 characters, factual and specific. Travel hops describe how to move between two stops in the SAME day — pick the most realistic local mode and a short, specific tip (max 140 chars), e.g. 'take the purple line, change at Majestic' or 'short auto via MG Road'.";

export function buildEnrichmentPrompt(result: SolverResult, extraPrompt?: string): string {
  const daySections = result.days.map((day) => {
    const activityLines = day.activities
      .map(
        (activity) =>
          `  - ${activity.id} :: ${activity.name} (${activity.category}, ${activity.durationMinutes}m) @ ${activity.address}`,
      )
      .join("\n");
    const hopHints = day.activities
      .slice(0, -1)
      .map((from, idx) => {
        const to = day.activities[idx + 1];
        return to ? `  - ${from.id} -> ${to.id}` : null;
      })
      .filter((line): line is string => line !== null)
      .join("\n");
    return [
      `Day ${day.dayNumber}:`,
      activityLines || "  (empty)",
      hopHints ? `Hops to describe:\n${hopHints}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  });

  const trimmedExtra = extraPrompt?.trim();

  const sections: string[] = [
    `Itinerary for ${result.cityName}.`,
    daySections.join("\n\n"),
  ];
  if (trimmedExtra) {
    sections.push(
      [
        "User personalization (additional context — let it influence themes, blurbs, and hop tips, but never invent new activities or change the city):",
        trimmedExtra,
      ].join("\n"),
    );
  }
  sections.push(
    [
      'Return JSON exactly matching this shape: { "dayThemes": [{ "dayNumber": number, "theme": string }], "activityBlurbs": [{ "activityId": string, "blurb": string }], "travelHops": [{ "fromActivityId": string, "toActivityId": string, "mode": "walk"|"metro"|"cab"|"auto"|"bus"|"train", "durationMinutes": number, "tip": string }] }.',
      "Provide one theme per day, one blurb per activity, and one hop for each consecutive pair listed above. Use the exact activity ids shown for fromActivityId/toActivityId.",
    ].join("\n"),
  );

  return sections.join("\n\n");
}

function buildHopsForDay(
  activities: readonly PlannedActivityDto[],
  hopByPairKey: ReadonlyMap<string, TravelHopDto>,
): readonly TravelHopDto[] {
  if (activities.length < 2) return [];
  const hops: TravelHopDto[] = [];
  for (let idx = 0; idx < activities.length - 1; idx += 1) {
    const from = activities[idx];
    const to = activities[idx + 1];
    if (!from || !to) continue;
    const hop = hopByPairKey.get(`${from.id}|${to.id}`);
    if (hop) hops.push(hop);
  }
  return hops;
}

export async function enrichItinerary(
  result: SolverResult,
  enrich: EnrichmentFn | null,
  extraPrompt?: string,
): Promise<SolverResult> {
  if (!enrich) return result;
  const hasAnyActivity = result.days.some((day) => day.activities.length > 0);
  if (!hasAnyActivity) return result;

  const enrichment = await enrich(buildEnrichmentPrompt(result, extraPrompt));
  if (!enrichment) return result;

  const themeByDayNumber = new Map(
    enrichment.dayThemes.map((entry) => [entry.dayNumber, entry.theme]),
  );
  const blurbByActivityId = new Map(
    enrichment.activityBlurbs.map((entry) => [entry.activityId, entry.blurb]),
  );
  const hopByPairKey = new Map<string, TravelHopDto>(
    (enrichment.travelHops ?? []).map((hop) => [
      `${hop.fromActivityId}|${hop.toActivityId}`,
      {
        fromActivityId: hop.fromActivityId,
        toActivityId: hop.toActivityId,
        mode: hop.mode,
        durationMinutes: hop.durationMinutes,
        ...(hop.tip === undefined ? {} : { tip: hop.tip }),
      },
    ]),
  );

  return {
    ...result,
    days: result.days.map((day) => {
      const theme = themeByDayNumber.get(day.dayNumber);
      const travelHops = buildHopsForDay(day.activities, hopByPairKey);
      return {
        ...day,
        ...(theme === undefined ? {} : { theme }),
        ...(travelHops.length === 0 ? {} : { travelHops }),
        activities: day.activities.map((activity) => {
          const blurb = blurbByActivityId.get(activity.id);
          return blurb === undefined ? activity : { ...activity, blurb };
        }),
      };
    }),
  };
}

import { z } from "zod";
import type { SolverResult } from "./itinerary.dto.js";

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
});

export type LlmEnrichment = z.infer<typeof llmEnrichmentSchema>;

export type EnrichmentFn = (prompt: string) => Promise<LlmEnrichment | null>;

export const ENRICHMENT_SYSTEM_PROMPT =
  "You enrich travel itineraries with creative, place-specific day themes and one-line activity descriptions. Respond ONLY with valid JSON matching the requested schema. Themes are 2-5 vivid words. Blurbs are one sentence, max 140 characters, factual and specific.";

export function buildEnrichmentPrompt(result: SolverResult): string {
  const dayLines = result.days.map((day) => {
    const activityLines = day.activities
      .map(
        (activity) =>
          `  - ${activity.id} :: ${activity.name} (${activity.category}, ${activity.durationMinutes}m)`,
      )
      .join("\n");
    return `Day ${day.dayNumber}:\n${activityLines || "  (empty)"}`;
  });

  return [
    `Itinerary for ${result.cityName}.`,
    "",
    dayLines.join("\n"),
    "",
    'Return JSON exactly matching this shape: { "dayThemes": [{ "dayNumber": number, "theme": string }], "activityBlurbs": [{ "activityId": string, "blurb": string }] }.',
    "Provide one theme per day and one blurb per activity. Use the exact activity ids shown above.",
  ].join("\n");
}

export async function enrichItinerary(
  result: SolverResult,
  enrich: EnrichmentFn | null,
): Promise<SolverResult> {
  if (!enrich) return result;
  const hasAnyActivity = result.days.some((day) => day.activities.length > 0);
  if (!hasAnyActivity) return result;

  const enrichment = await enrich(buildEnrichmentPrompt(result));
  if (!enrichment) return result;

  const themeByDayNumber = new Map(
    enrichment.dayThemes.map((entry) => [entry.dayNumber, entry.theme]),
  );
  const blurbByActivityId = new Map(
    enrichment.activityBlurbs.map((entry) => [entry.activityId, entry.blurb]),
  );

  return {
    ...result,
    days: result.days.map((day) => {
      const theme = themeByDayNumber.get(day.dayNumber);
      return {
        ...day,
        ...(theme === undefined ? {} : { theme }),
        activities: day.activities.map((activity) => {
          const blurb = blurbByActivityId.get(activity.id);
          return blurb === undefined ? activity : { ...activity, blurb };
        }),
      };
    }),
  };
}

import {
  ENRICHMENT_SYSTEM_PROMPT,
  llmEnrichmentSchema,
  type EnrichmentFn,
} from "./itinerary.llm.js";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const TIMEOUT_MS = 30_000;

type OpenRouterResponse = {
  readonly choices?: ReadonlyArray<{
    readonly message?: { readonly content?: string };
  }>;
};

export function createOpenRouterEnrichmentFn(args: {
  readonly apiKey: string;
  readonly model: string;
}): EnrichmentFn {
  return async (prompt) => {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          authorization: `Bearer ${args.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: args.model,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: ENRICHMENT_SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text();
        console.warn(
          `OpenRouter request failed: ${res.status} ${res.statusText} :: ${body.slice(0, 200)}`,
        );
        return null;
      }

      const json = (await res.json()) as OpenRouterResponse;
      const content = json.choices?.[0]?.message?.content;
      if (!content) {
        console.warn("OpenRouter returned no content");
        return null;
      }

      const parsed = llmEnrichmentSchema.safeParse(JSON.parse(content));
      if (!parsed.success) {
        console.warn(
          "OpenRouter content did not match enrichment schema:",
          parsed.error.flatten().fieldErrors,
        );
        return null;
      }
      return parsed.data;
    } catch (err) {
      console.warn("OpenRouter enrichment failed:", err);
      return null;
    } finally {
      clearTimeout(timeoutHandle);
    }
  };
}

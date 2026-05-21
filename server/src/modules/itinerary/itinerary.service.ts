import { config } from "../../config.js";
import { NotFoundError } from "../../middlewares/error-handler.middleware.js";
import { findCityWithActivities } from "../cities/cities.repository.js";
import type {
  ItineraryRequestDto,
  ItineraryResponseDto,
} from "./data/itinerary.dto.js";
import { enrichItinerary, type EnrichmentFn } from "./itinerary.llm.js";
import { createOpenRouterEnrichmentFn } from "./itinerary.openrouter.js";
import {
  createItinerary,
  findItineraryById,
} from "./itinerary.repository.js";
import { generateItinerary } from "./itinerary.solver.js";
import { ItineraryUtil } from "./utils/itinerary.util.js";

// Boot-time decision: build the enrichment fn once if the key is present.
const enrichmentFn: EnrichmentFn | null = config.openrouterApiKey
  ? createOpenRouterEnrichmentFn({
      apiKey: config.openrouterApiKey,
      model: config.openrouterModel,
    })
  : null;

export async function generateAndPersistItinerary(
  dto: ItineraryRequestDto,
): Promise<ItineraryResponseDto> {
  const city = await findCityWithActivities(dto.cityKey);
  if (!city) {
    throw new NotFoundError("City not found");
  }

  const seed = dto.seed ?? ItineraryUtil.generateSeed();
  const random = ItineraryUtil.createSeededRandom(seed);
  const solverResult = generateItinerary({ dto, city, random, seed });
  const enrichedResult = await enrichItinerary(solverResult, enrichmentFn, dto.extraPrompt);

  const persisted = await createItinerary({
    cityId: city.id,
    request: { ...dto, seed },
    response: enrichedResult,
  });

  return {
    ...enrichedResult,
    id: persisted.id,
    createdAt: persisted.createdAt.toISOString(),
  };
}

export async function getItineraryById(
  itineraryId: string,
): Promise<ItineraryResponseDto> {
  const itinerary = await findItineraryById(itineraryId);
  if (!itinerary) {
    throw new NotFoundError("Itinerary not found");
  }
  return itinerary;
}

import { db } from "../../db/client.js";
import { itineraries } from "../../db/schema.js";
import type { ItineraryRequestDto, SolverResult } from "./itinerary.dto.js";
import { generateItineraryId } from "./itinerary.util.js";

export async function createItinerary(args: {
  readonly cityId: string;
  readonly request: ItineraryRequestDto;
  readonly response: SolverResult;
}): Promise<{ id: string; createdAt: Date }> {
  const id = generateItineraryId();
  const [row] = await db
    .insert(itineraries)
    .values({
      id,
      cityId: args.cityId,
      request: args.request,
      response: args.response,
    })
    .returning({ id: itineraries.id, createdAt: itineraries.createdAt });

  if (!row) {
    throw new Error("Failed to persist itinerary");
  }
  return { id: row.id, createdAt: row.createdAt };
}

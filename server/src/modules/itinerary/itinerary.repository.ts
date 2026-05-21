import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { itineraries } from "../../db/schema.js";
import type {
  ItineraryRequestDto,
  ItineraryResponseDto,
  SolverResult,
} from "./data/itinerary.dto.js";
import { ItineraryUtil } from "./utils/itinerary.util.js";

export async function createItinerary(args: {
  readonly cityId: string;
  readonly request: ItineraryRequestDto;
  readonly response: SolverResult;
}): Promise<{ id: string; createdAt: Date }> {
  const id = ItineraryUtil.generateItineraryId();
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

export async function findItineraryById(
  itineraryId: string,
): Promise<ItineraryResponseDto | null> {
  const row = await db.query.itineraries.findFirst({
    where: eq(itineraries.id, itineraryId),
  });
  if (!row) return null;

  // jsonb column comes back as unknown; the writer above is the only producer
  // and stores SolverResult, so this is a safe true-boundary cast.
  const stored = row.response as SolverResult;
  return {
    ...stored,
    id: row.id,
    createdAt: row.createdAt.toISOString(),
  };
}

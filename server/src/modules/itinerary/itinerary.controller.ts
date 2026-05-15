import type { Request, Response } from "express";
import { findCityWithActivities } from "../cities/cities.repository.js";
import { NotFoundError } from "../../middlewares/error-handler.middleware.js";
import { asyncHandler } from "../../middlewares/async-handler.middleware.js";
import type { ItineraryRequestDto } from "./itinerary.dto.js";
import {
  createItinerary,
  findItineraryById,
} from "./itinerary.repository.js";
import { generateItinerary } from "./itinerary.solver.js";
import { createSeededRandom, generateSeed } from "./itinerary.util.js";

export const itineraryController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as ItineraryRequestDto;

    const city = await findCityWithActivities(dto.cityKey);
    if (!city) {
      throw new NotFoundError("City not found");
    }

    const seed = dto.seed ?? generateSeed();
    const random = createSeededRandom(seed);
    const solverResult = generateItinerary({ dto, city, random, seed });

    const persisted = await createItinerary({
      cityId: city.id,
      request: { ...dto, seed },
      response: solverResult,
    });

    res.json({
      data: {
        ...solverResult,
        id: persisted.id,
        createdAt: persisted.createdAt.toISOString(),
      },
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const itineraryId = req.params.itineraryId;
    if (typeof itineraryId !== "string") {
      throw new NotFoundError("Itinerary not found");
    }
    const itinerary = await findItineraryById(itineraryId);
    if (!itinerary) {
      throw new NotFoundError("Itinerary not found");
    }
    res.json({ data: itinerary });
  }),
};

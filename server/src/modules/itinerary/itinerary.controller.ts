import type { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/async-handler.middleware.js";
import { NotFoundError } from "../../middlewares/error-handler.middleware.js";
import type { ItineraryRequestDto } from "./data/itinerary.dto.js";
import {
  generateAndPersistItinerary,
  getItineraryById,
} from "./itinerary.service.js";

export const itineraryController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as ItineraryRequestDto;
    const itinerary = await generateAndPersistItinerary(dto);
    res.json({ data: itinerary });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const itineraryId = req.params.itineraryId;
    if (typeof itineraryId !== "string") {
      throw new NotFoundError("Itinerary not found");
    }
    const itinerary = await getItineraryById(itineraryId);
    res.json({ data: itinerary });
  }),
};

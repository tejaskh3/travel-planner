import { Router } from "express";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { itineraryController } from "./itinerary.controller.js";
import { itineraryRequestSchema } from "./data/itinerary.dto.js";

export const itineraryRouter = Router();

itineraryRouter.post(
  "/",
  validateBody(itineraryRequestSchema),
  itineraryController.create,
);

itineraryRouter.get("/:itineraryId", itineraryController.getById);

import { Router } from "express";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { preferencesController } from "./preferences.controller.js";
import { savePreferencesSchema } from "./preferences.dto.js";

export const preferencesRouter = Router();

preferencesRouter.post(
  "/",
  validateBody(savePreferencesSchema),
  preferencesController.save,
);

preferencesRouter.get("/", preferencesController.get);

import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";
import { itineraryRouter } from "./modules/itinerary/itinerary.routes.js";

export const app = express();

app.use(cors({ origin: config.frontendOrigin }));
app.use(express.json({ limit: "100kb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/itinerary", itineraryRouter);

app.use(errorHandler);

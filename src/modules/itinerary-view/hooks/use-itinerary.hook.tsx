"use client";

import { useQuery } from "@tanstack/react-query";
import { itineraryApi } from "@/api/itinerary/itinerary.api";

export const useItinerary = (id: string) =>
  useQuery({
    queryKey: ["itinerary", id],
    queryFn: () => itineraryApi.getById(id),
    enabled: Boolean(id),
  });

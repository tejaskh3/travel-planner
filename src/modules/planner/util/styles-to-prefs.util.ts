import { PreferenceCategory } from "@/api/itinerary/itinerary.enum";
import { STYLE_TO_PREF, type TStyleKey } from "../planner.constants";

export const stylesToPrefs = (
  styles: readonly TStyleKey[],
): PreferenceCategory[] => {
  const out = new Set<PreferenceCategory>();
  styles.forEach((s) => out.add(STYLE_TO_PREF[s]));
  return out.size === 0 ? [PreferenceCategory.CULTURE] : Array.from(out);
};

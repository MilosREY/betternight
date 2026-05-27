import type { BreakdownKey, CalculationResult, CalculatorInputs, EventType } from "@/lib/emissions";

export const LOCAL_ESTIMATES_STORAGE_KEY = "ecoevent.saved-estimates.v1";

export type SavedEstimate = {
  id: string;
  createdAt: string;
  eventName: string;
  city: string;
  eventType: EventType;
  participants: number;
  totalKgCO2e: number;
  impactPerParticipant: number;
  ecoEventScore: number;
  breakdown: Record<BreakdownKey, number>;
};

export function loadSavedEstimates(): SavedEstimate[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_ESTIMATES_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedEstimate[]) : [];
  } catch {
    return [];
  }
}

export function persistSavedEstimates(estimates: SavedEstimate[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    LOCAL_ESTIMATES_STORAGE_KEY,
    JSON.stringify(estimates)
  );
}

export function createSavedEstimate(
  values: CalculatorInputs,
  result: CalculationResult
): SavedEstimate {
  return {
    id:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}`,
    createdAt: new Date().toISOString(),
    eventName: values.eventName || "Événement sans nom",
    city: values.city || "Ville non renseignée",
    eventType: values.eventType,
    participants: values.participants,
    totalKgCO2e: result.totalKgCO2e,
    impactPerParticipant: result.impactPerParticipant,
    ecoEventScore: result.ecoEventScore,
    breakdown: Object.fromEntries(
      result.breakdown.map((item) => [item.key, item.kgCO2e])
    ) as Record<BreakdownKey, number>
  };
}

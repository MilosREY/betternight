export type EventType =
  | "soiree"
  | "gala"
  | "wei"
  | "sport"
  | "conference"
  | "autre";

export type TransportMode =
  | "walk-bike"
  | "public-transit"
  | "car"
  | "carpool"
  | "train"
  | "plane";

export type EnergyLevel = "low" | "medium" | "high";

export type CalculatorInputs = {
  eventName: string;
  eventType: EventType;
  city: string;
  participants: number;
  avgRoundTripKm: number;
  transportMode: TransportMode;
  meatMeals: number;
  vegetarianMeals: number;
  snacks: number;
  tshirts: number;
  goodies: number;
  disposableCups: number;
  overnightStays: number;
  energyLevel: EnergyLevel;
};

export type BreakdownKey =
  | "transport"
  | "alimentation"
  | "materiel"
  | "hebergement"
  | "energie";

export type BreakdownItem = {
  key: BreakdownKey;
  label: string;
  kgCO2e: number;
  share: number;
};

export type CalculationResult = {
  totalKgCO2e: number;
  impactPerParticipant: number;
  breakdown: BreakdownItem[];
  topThree: BreakdownItem[];
  recommendations: string[];
};

export const EVENT_TYPE_OPTIONS: Array<{ value: EventType; label: string }> = [
  { value: "soiree", label: "Soirée" },
  { value: "gala", label: "Gala" },
  { value: "wei", label: "WEI" },
  { value: "sport", label: "Événement sportif" },
  { value: "conference", label: "Conférence" },
  { value: "autre", label: "Autre" }
];

export const TRANSPORT_MODE_OPTIONS: Array<{ value: TransportMode; label: string }> = [
  { value: "walk-bike", label: "Marche / vélo" },
  { value: "public-transit", label: "Transports en commun" },
  { value: "car", label: "Voiture" },
  { value: "carpool", label: "Covoiturage" },
  { value: "train", label: "Train" },
  { value: "plane", label: "Avion" }
];

export const ENERGY_LEVEL_OPTIONS: Array<{ value: EnergyLevel; label: string }> = [
  { value: "low", label: "Faible" },
  { value: "medium", label: "Moyen" },
  { value: "high", label: "Élevé" }
];

// Modifiez ici les facteurs d'émission simplifiés si vous voulez ajuster
// la méthode de calcul ou tester d'autres hypothèses.
export const EMISSION_FACTORS = {
  transport: {
    "walk-bike": 0,
    "public-transit": 0.05,
    car: 0.2,
    carpool: 0.08,
    train: 0.01,
    plane: 0.25
  },
  food: {
    meatMeal: 5,
    vegetarianMeal: 1.5,
    snack: 0.8
  },
  material: {
    tshirt: 7,
    goodie: 1.5,
    disposableCup: 0.03
  },
  logistics: {
    overnightStay: 10,
    energy: {
      low: 20,
      medium: 80,
      high: 200
    }
  }
} as const;

const BREAKDOWN_LABELS: Record<BreakdownKey, string> = {
  transport: "Transport",
  alimentation: "Alimentation",
  materiel: "Matériel",
  hebergement: "Hébergement",
  energie: "Énergie"
};

export function calculateImpact(values: CalculatorInputs): CalculationResult {
  const transport =
    values.participants *
    values.avgRoundTripKm *
    EMISSION_FACTORS.transport[values.transportMode];

  const alimentation =
    values.meatMeals * EMISSION_FACTORS.food.meatMeal +
    values.vegetarianMeals * EMISSION_FACTORS.food.vegetarianMeal +
    values.snacks * EMISSION_FACTORS.food.snack;

  const materiel =
    values.tshirts * EMISSION_FACTORS.material.tshirt +
    values.goodies * EMISSION_FACTORS.material.goodie +
    values.disposableCups * EMISSION_FACTORS.material.disposableCup;

  const hebergement =
    values.overnightStays * EMISSION_FACTORS.logistics.overnightStay;

  const energie = EMISSION_FACTORS.logistics.energy[values.energyLevel];

  const totalKgCO2e = transport + alimentation + materiel + hebergement + energie;

  const breakdown = buildBreakdown(
    {
      transport,
      alimentation,
      materiel,
      hebergement,
      energie
    },
    totalKgCO2e
  );

  const topThree = [...breakdown].sort((a, b) => b.kgCO2e - a.kgCO2e).slice(0, 3);

  return {
    totalKgCO2e,
    impactPerParticipant:
      values.participants > 0 ? totalKgCO2e / values.participants : 0,
    breakdown,
    topThree,
    recommendations: buildRecommendations(values, breakdown)
  };
}

function buildBreakdown(
  values: Record<BreakdownKey, number>,
  totalKgCO2e: number
): BreakdownItem[] {
  return (Object.entries(values) as Array<[BreakdownKey, number]>).map(
    ([key, kgCO2e]) => ({
      key,
      label: BREAKDOWN_LABELS[key],
      kgCO2e,
      share: totalKgCO2e > 0 ? (kgCO2e / totalKgCO2e) * 100 : 0
    })
  );
}

function buildRecommendations(
  values: CalculatorInputs,
  breakdown: BreakdownItem[]
): string[] {
  const sorted = [...breakdown].sort((a, b) => b.kgCO2e - a.kgCO2e);
  const highest = sorted[0]?.key;
  const byKey = Object.fromEntries(breakdown.map((item) => [item.key, item]));
  const recommendations: string[] = [];

  if (highest === "transport") {
    recommendations.push(
      "Faites du covoiturage une option visible, partagez les transports en commun, privilégiez un lieu accessible et regardez la faisabilité d'une navette."
    );
  }

  if (byKey.alimentation.share >= 18) {
    recommendations.push(
      "Augmentez la part d'options végétariennes, limitez le gaspillage avec la précommande et ajustez mieux les quantités."
    );
  }

  if (byKey.materiel.share >= 12) {
    recommendations.push(
      "Supprimez les goodies peu utiles, passez les textiles en précommande et réutilisez autant que possible la décoration."
    );
  }

  if (values.disposableCups > 200) {
    recommendations.push(
      "Au-delà de 200 gobelets jetables, basculez vers des écocups ou un système de consigne pour réduire très vite l'impact matériel."
    );
  }

  if (byKey.hebergement.share >= 10) {
    recommendations.push(
      "Cherchez des hébergements proches du lieu et mutualisez les chambres pour réduire l'impact des nuitées."
    );
  }

  if (values.energyLevel === "high") {
    recommendations.push(
      "Pour l'énergie, privilégiez du matériel plus efficient, des horaires optimisés et évitez les groupes électrogènes si une alternative existe."
    );
  }

  if (recommendations.length < 3) {
    recommendations.push(
      "Communiquez en amont sur les bons réflexes participants : venir groupés, éviter les achats de dernière minute et limiter le jetable."
    );
  }

  return recommendations.slice(0, 5);
}

export function formatKg(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(value);
}

export function formatTonnes(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 1000);
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

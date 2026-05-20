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

export type TransportParticipantField =
  | "walkBikeParticipants"
  | "publicTransitParticipants"
  | "carParticipants"
  | "carpoolParticipants"
  | "trainParticipants"
  | "planeParticipants";

export type EnergyLevel = "low" | "medium" | "high";

export type ReusableCupDepositStatus = "yes" | "no";

export type CalculatorInputs = {
  eventName: string;
  eventType: EventType;
  city: string;
  participants: number;
  avgRoundTripKm: number;
  walkBikeParticipants: number;
  publicTransitParticipants: number;
  carParticipants: number;
  carpoolParticipants: number;
  trainParticipants: number;
  planeParticipants: number;
  meatMeals: number;
  vegetarianMeals: number;
  snacks: number;
  tshirts: number;
  goodies: number;
  disposableCups: number;
  reusableCups: number;
  reusableCupsConsigned: ReusableCupDepositStatus;
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

export type TransportDetailItem = {
  key: TransportMode;
  label: string;
  participants: number;
  factor: number;
  kgCO2e: number;
  shareOfTransport: number;
};

export type CalculationResult = {
  totalKgCO2e: number;
  impactPerParticipant: number;
  breakdown: BreakdownItem[];
  topThree: BreakdownItem[];
  transportDetail: TransportDetailItem[];
  transportParticipantsTotal: number;
  transportMismatch: boolean;
  priorityRecommendations: string[];
  additionalRecommendations: string[];
};

export const EVENT_TYPE_OPTIONS: Array<{ value: EventType; label: string }> = [
  { value: "soiree", label: "Soirée" },
  { value: "gala", label: "Gala" },
  { value: "wei", label: "WEI" },
  { value: "sport", label: "Événement sportif" },
  { value: "conference", label: "Conférence" },
  { value: "autre", label: "Autre" }
];

export const TRANSPORT_DISTRIBUTION_FIELDS: Array<{
  key: TransportMode;
  field: TransportParticipantField;
  label: string;
}> = [
  {
    key: "walk-bike",
    field: "walkBikeParticipants",
    label: "Nombre de participants venant à pied ou à vélo"
  },
  {
    key: "public-transit",
    field: "publicTransitParticipants",
    label: "Nombre de participants venant en transports en commun"
  },
  {
    key: "car",
    field: "carParticipants",
    label: "Nombre de participants venant en voiture individuelle"
  },
  {
    key: "carpool",
    field: "carpoolParticipants",
    label: "Nombre de participants venant en covoiturage"
  },
  {
    key: "train",
    field: "trainParticipants",
    label: "Nombre de participants venant en train"
  },
  {
    key: "plane",
    field: "planeParticipants",
    label: "Nombre de participants venant en avion"
  }
];

export const ENERGY_LEVEL_OPTIONS: Array<{
  value: EnergyLevel;
  label: string;
  description: string;
}> = [
  {
    value: "low",
    label: "Faible",
    description:
      "Conférence, petite salle, éclairage standard, peu de matériel technique."
  },
  {
    value: "medium",
    label: "Moyen",
    description:
      "Soirée classique, sonorisation, lumières, bar, salle équipée."
  },
  {
    value: "high",
    label: "Élevé",
    description:
      "Gala, scène, DJ, écrans, lumières importantes, technique lourde."
  }
];

export const REUSABLE_CUP_OPTIONS: Array<{
  value: ReusableCupDepositStatus;
  label: string;
}> = [
  { value: "yes", label: "Oui" },
  { value: "no", label: "Non" }
];

// Modifiez ici les facteurs d'émission simplifiés si vous voulez ajuster
// la méthode de calcul, tester d'autres hypothèses ou affiner la V2.
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
    disposableCup: 0.03,
    reusableCup: {
      yes: 0.04,
      no: 0.08
    }
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

const TRANSPORT_LABELS: Record<TransportMode, string> = {
  "walk-bike": "À pied / vélo",
  "public-transit": "Transports en commun",
  car: "Voiture individuelle",
  carpool: "Covoiturage",
  train: "Train",
  plane: "Avion"
};

export function calculateImpact(values: CalculatorInputs): CalculationResult {
  const transportRaw = TRANSPORT_DISTRIBUTION_FIELDS.map((item) => {
    const participants = values[item.field];
    const factor = EMISSION_FACTORS.transport[item.key];
    const kgCO2e = values.avgRoundTripKm * participants * factor;

    return {
      key: item.key,
      label: TRANSPORT_LABELS[item.key],
      participants,
      factor,
      kgCO2e
    };
  });

  const transport = transportRaw.reduce((sum, item) => sum + item.kgCO2e, 0);

  const alimentation =
    values.meatMeals * EMISSION_FACTORS.food.meatMeal +
    values.vegetarianMeals * EMISSION_FACTORS.food.vegetarianMeal +
    values.snacks * EMISSION_FACTORS.food.snack;

  const materiel =
    values.tshirts * EMISSION_FACTORS.material.tshirt +
    values.goodies * EMISSION_FACTORS.material.goodie +
    values.disposableCups * EMISSION_FACTORS.material.disposableCup +
    values.reusableCups *
      EMISSION_FACTORS.material.reusableCup[values.reusableCupsConsigned];

  const hebergement =
    values.overnightStays * EMISSION_FACTORS.logistics.overnightStay;

  const energie = EMISSION_FACTORS.logistics.energy[values.energyLevel];

  const totalKgCO2e = transport + alimentation + materiel + hebergement + energie;
  const transportParticipantsTotal = getTransportParticipantsTotal(values);
  const transportMismatch = transportParticipantsTotal !== values.participants;

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
  const transportDetail = transportRaw.map((item) => ({
    ...item,
    shareOfTransport: transport > 0 ? (item.kgCO2e / transport) * 100 : 0
  }));

  const { priorityRecommendations, additionalRecommendations } =
    buildRecommendations(values, breakdown, transportDetail, transportMismatch);

  return {
    totalKgCO2e,
    impactPerParticipant:
      values.participants > 0 ? totalKgCO2e / values.participants : 0,
    breakdown,
    topThree,
    transportDetail,
    transportParticipantsTotal,
    transportMismatch,
    priorityRecommendations,
    additionalRecommendations
  };
}

export function getTransportParticipantsTotal(values: CalculatorInputs) {
  return TRANSPORT_DISTRIBUTION_FIELDS.reduce(
    (sum, item) => sum + values[item.field],
    0
  );
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
  breakdown: BreakdownItem[],
  transportDetail: TransportDetailItem[],
  transportMismatch: boolean
) {
  const priorityRecommendations: string[] = [];
  const additionalRecommendations: string[] = [];
  const byKey = Object.fromEntries(
    breakdown.map((item) => [item.key, item])
  ) as Record<BreakdownKey, BreakdownItem>;
  const transportByMode = Object.fromEntries(
    transportDetail.map((item) => [item.key, item])
  ) as Record<TransportMode, TransportDetailItem>;
  const totalTransportParticipants = transportDetail.reduce(
    (sum, item) => sum + item.participants,
    0
  );
  const totalMeals = values.meatMeals + values.vegetarianMeals + values.snacks;
  const carShare =
    totalTransportParticipants > 0
      ? transportByMode.car.participants / totalTransportParticipants
      : 0;
  const publicTransitShare =
    totalTransportParticipants > 0
      ? transportByMode["public-transit"].participants / totalTransportParticipants
      : 0;
  const carpoolShare =
    totalTransportParticipants > 0
      ? transportByMode.carpool.participants / totalTransportParticipants
      : 0;

  const addUnique = (target: string[], message: string) => {
    if (!target.includes(message)) {
      target.push(message);
    }
  };

  if (byKey.transport.share >= 25) {
    addUnique(
      priorityRecommendations,
      "Créer un lien de covoiturage officiel et le mettre dans la billetterie."
    );
  }

  if (transportByMode.car.participants > 0 && (carShare >= 0.2 || transportByMode.car.participants >= 20)) {
    addUnique(
      priorityRecommendations,
      "Créer un lien de covoiturage officiel et le mettre dans la billetterie."
    );
  }

  if (
    transportByMode.car.participants > 0 &&
    (transportByMode.carpool.participants <= Math.max(5, transportByMode.car.participants * 0.35) ||
      carpoolShare < 0.15)
  ) {
    addUnique(
      priorityRecommendations,
      "Proposer un canal WhatsApp ou un formulaire pour regrouper les trajets."
    );
  }

  if (
    totalTransportParticipants > 0 &&
    publicTransitShare < 0.2 &&
    transportByMode["public-transit"].participants <= transportByMode.car.participants
  ) {
    addUnique(
      additionalRecommendations,
      "Ajouter un visuel d’accès en transports en commun dans la communication de l’événement."
    );
  }

  if (transportByMode.plane.participants > 0) {
    addUnique(
      priorityRecommendations,
      "Évaluer une alternative train ou un lieu plus accessible."
    );
  }

  if (
    values.meatMeals > 0 &&
    (values.meatMeals >= values.vegetarianMeals || values.meatMeals >= values.participants * 0.4)
  ) {
    addUnique(
      priorityRecommendations,
      "Augmenter la part de repas végétariens ou proposer une option végétarienne par défaut."
    );
  }

  if (values.snacks >= Math.max(40, values.participants * 0.35)) {
    addUnique(
      additionalRecommendations,
      "Prévoir les quantités via précommande pour réduire le gaspillage."
    );
  }

  if (totalMeals > 0) {
    addUnique(
      additionalRecommendations,
      "Donner les invendus à une association locale si possible."
    );
  }

  if (values.tshirts >= 20) {
    addUnique(
      priorityRecommendations,
      "Passer les t-shirts en précommande plutôt qu’en production automatique."
    );
  }

  if (values.goodies >= 20) {
    addUnique(
      additionalRecommendations,
      "Supprimer les goodies peu utiles ou les remplacer par des objets durables réellement utilisés."
    );
  }

  if (values.disposableCups > 0) {
    addUnique(
      priorityRecommendations,
      "Remplacer les gobelets jetables par des écocups consignées."
    );
  }

  if (values.reusableCups > 0 && values.reusableCupsConsigned === "no") {
    addUnique(
      additionalRecommendations,
      "Mettre en place une consigne pour augmenter le taux de retour."
    );
  }

  if (byKey.hebergement.share >= 10 || values.overnightStays >= 15) {
    addUnique(
      additionalRecommendations,
      "Chercher des hébergements proches du lieu et mutualiser les chambres quand c’est pertinent."
    );
  }

  if (values.energyLevel === "high") {
    addUnique(
      priorityRecommendations,
      "Vérifier les besoins réels en son/lumière, éviter les équipements surdimensionnés, privilégier un lieu déjà équipé."
    );
  }

  if (values.energyLevel !== "low") {
    addUnique(
      additionalRecommendations,
      "Éteindre les équipements non nécessaires pendant le montage, les pauses et le démontage."
    );
  }

  if (transportMismatch) {
    addUnique(
      additionalRecommendations,
      "Vérifier la cohérence de la répartition transport pour fiabiliser l’estimation."
    );
  }

  if (priorityRecommendations.length === 0) {
    addUnique(
      priorityRecommendations,
      "Commencer par agir sur les trois postes les plus élevés : ce sont eux qui feront évoluer le plus vite le résultat."
    );
  }

  addUnique(
    additionalRecommendations,
    "Communiquer les actions responsables avant l’événement sans ton moralisateur."
  );
  addUnique(
    additionalRecommendations,
    "Afficher les accès bas carbone sur la page de billetterie."
  );
  addUnique(
    additionalRecommendations,
    "Faire un mini-bilan après l’événement pour montrer les progrès."
  );

  return {
    priorityRecommendations: priorityRecommendations.slice(0, 6),
    additionalRecommendations: additionalRecommendations
      .filter((item) => !priorityRecommendations.includes(item))
      .slice(0, 6)
  };
}

export function formatKg(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(value);
}

export function formatCount(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
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

import { emissionFactors } from "@/lib/emission-factors";

export type EventType =
  | "soiree"
  | "gala"
  | "wei"
  | "sport"
  | "conference"
  | "autre";

export type TransportCalculationMode = "simple" | "advanced";
export type TransportMode = keyof typeof emissionFactors.transport;
export type EnergyLevel = keyof typeof emissionFactors.energy;
export type ReusableCupDepositStatus = "yes" | "no";

export type TransportParticipantField =
  | "walkingCyclingParticipants"
  | "publicTransportParticipants"
  | "carParticipants"
  | "carpoolParticipants"
  | "trainParticipants"
  | "planeParticipants";

export type CalculatorInputs = {
  eventName: string;
  eventType: EventType;
  city: string;
  participants: number;
  transportCalculationMode: TransportCalculationMode;
  avgRoundTripKm: number;
  majorTransportMode: TransportMode;
  walkingCyclingParticipants: number;
  publicTransportParticipants: number;
  carParticipants: number;
  carpoolParticipants: number;
  trainParticipants: number;
  planeParticipants: number;
  vegetarianMeals: number;
  chickenMeals: number;
  beefMeals: number;
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

export type ImpactDetailItem = {
  key: string;
  label: string;
  quantity: number;
  factor: number;
  unit: string;
  kgCO2e: number;
  shareOfCategory: number;
};

export type CalculationResult = {
  ecoEventScore: number;
  totalKgCO2e: number;
  impactPerParticipant: number;
  breakdown: BreakdownItem[];
  topThree: BreakdownItem[];
  transportCalculationMode: TransportCalculationMode;
  transportDetail: ImpactDetailItem[];
  foodDetail: ImpactDetailItem[];
  materialDetail: ImpactDetailItem[];
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

export const TRANSPORT_CALCULATION_MODE_OPTIONS: Array<{
  value: TransportCalculationMode;
  label: string;
  description: string;
}> = [
  {
    value: "simple",
    label: "Mode simple",
    description:
      "Un mode majoritaire pour aller vite avec participants × distance × facteur."
  },
  {
    value: "advanced",
    label: "Mode avancé",
    description:
      "Une répartition détaillée pour mieux refléter les transports réellement utilisés."
  }
];

export const TRANSPORT_MODE_OPTIONS: Array<{ value: TransportMode; label: string }> = [
  { value: "walkingCycling", label: "Marche / vélo" },
  { value: "publicTransport", label: "Transports en commun" },
  { value: "car", label: "Voiture individuelle" },
  { value: "carpool", label: "Covoiturage" },
  { value: "train", label: "Train" },
  { value: "plane", label: "Avion" }
];

export const TRANSPORT_DISTRIBUTION_FIELDS: Array<{
  key: TransportMode;
  field: TransportParticipantField;
  label: string;
}> = [
  {
    key: "walkingCycling",
    field: "walkingCyclingParticipants",
    label: "Nombre de participants à pied ou à vélo"
  },
  {
    key: "publicTransport",
    field: "publicTransportParticipants",
    label: "Nombre de participants en transports en commun"
  },
  {
    key: "car",
    field: "carParticipants",
    label: "Nombre de participants en voiture individuelle"
  },
  {
    key: "carpool",
    field: "carpoolParticipants",
    label: "Nombre de participants en covoiturage"
  },
  {
    key: "train",
    field: "trainParticipants",
    label: "Nombre de participants en train"
  },
  {
    key: "plane",
    field: "planeParticipants",
    label: "Nombre de participants en avion"
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

const BREAKDOWN_LABELS: Record<BreakdownKey, string> = {
  transport: "Transport",
  alimentation: "Alimentation",
  materiel: "Matériel",
  hebergement: "Hébergement",
  energie: "Énergie"
};

const TRANSPORT_LABELS: Record<TransportMode, string> = {
  walkingCycling: "Marche / vélo",
  publicTransport: "Transports en commun",
  car: "Voiture individuelle",
  carpool: "Covoiturage",
  train: "Train",
  plane: "Avion"
};

const ECOEVENT_SCORE_REFERENCE_MAX_PER_PARTICIPANT = 25;

export function calculateImpact(values: CalculatorInputs): CalculationResult {
  const transportDetail = buildTransportDetail(values);
  const transport = sumCategory(transportDetail);
  const foodDetail = buildFoodDetail(values);
  const alimentation = sumCategory(foodDetail);
  const materialDetail = buildMaterialDetail(values);
  const materiel = sumCategory(materialDetail);
  const hebergement =
    values.overnightStays * emissionFactors.accommodation.night.value;
  const energie = emissionFactors.energy[values.energyLevel].value;

  const totalKgCO2e = transport + alimentation + materiel + hebergement + energie;
  const impactPerParticipant =
    values.participants > 0 ? totalKgCO2e / values.participants : 0;
  const transportParticipantsTotal =
    values.transportCalculationMode === "advanced"
      ? getTransportParticipantsTotal(values)
      : values.participants;
  const transportMismatch =
    values.transportCalculationMode === "advanced" &&
    transportParticipantsTotal !== values.participants;

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

  const sortedBreakdown = [...breakdown].sort((a, b) => b.kgCO2e - a.kgCO2e);
  const positiveBreakdown = sortedBreakdown.filter((item) => item.kgCO2e > 0);
  const topThree =
    positiveBreakdown.length > 0
      ? positiveBreakdown.slice(0, 3)
      : sortedBreakdown.slice(0, 3);

  const { priorityRecommendations, additionalRecommendations } =
    buildRecommendations(
      values,
      breakdown,
      topThree,
      transportDetail,
      transportMismatch
    );

  return {
    ecoEventScore: calculateEcoEventScore(impactPerParticipant),
    totalKgCO2e,
    impactPerParticipant,
    breakdown,
    topThree,
    transportCalculationMode: values.transportCalculationMode,
    transportDetail,
    foodDetail,
    materialDetail,
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

function buildTransportDetail(values: CalculatorInputs): ImpactDetailItem[] {
  const items =
    values.transportCalculationMode === "advanced"
      ? TRANSPORT_DISTRIBUTION_FIELDS.map((item) => ({
          key: item.key,
          label: TRANSPORT_LABELS[item.key],
          quantity: values[item.field],
          factor: emissionFactors.transport[item.key].value,
          unit: emissionFactors.transport[item.key].unit,
          kgCO2e:
            values.avgRoundTripKm *
            values[item.field] *
            emissionFactors.transport[item.key].value
        }))
      : TRANSPORT_MODE_OPTIONS.map((option) => {
          const quantity =
            option.value === values.majorTransportMode ? values.participants : 0;

          return {
            key: option.value,
            label: TRANSPORT_LABELS[option.value],
            quantity,
            factor: emissionFactors.transport[option.value].value,
            unit: emissionFactors.transport[option.value].unit,
            kgCO2e:
              values.avgRoundTripKm *
              quantity *
              emissionFactors.transport[option.value].value
          };
        });

  return addCategoryShares(items);
}

function buildFoodDetail(values: CalculatorInputs): ImpactDetailItem[] {
  return addCategoryShares([
    {
      key: "vegetarianMeal",
      label: "Repas végétariens",
      quantity: values.vegetarianMeals,
      factor: emissionFactors.food.vegetarianMeal.value,
      unit: emissionFactors.food.vegetarianMeal.unit,
      kgCO2e: values.vegetarianMeals * emissionFactors.food.vegetarianMeal.value
    },
    {
      key: "chickenMeal",
      label: "Repas avec poulet / viande blanche",
      quantity: values.chickenMeals,
      factor: emissionFactors.food.chickenMeal.value,
      unit: emissionFactors.food.chickenMeal.unit,
      kgCO2e: values.chickenMeals * emissionFactors.food.chickenMeal.value
    },
    {
      key: "beefMeal",
      label: "Repas avec bœuf / viande rouge",
      quantity: values.beefMeals,
      factor: emissionFactors.food.beefMeal.value,
      unit: emissionFactors.food.beefMeal.unit,
      kgCO2e: values.beefMeals * emissionFactors.food.beefMeal.value
    },
    {
      key: "snack",
      label: "Snacks ou repas légers",
      quantity: values.snacks,
      factor: emissionFactors.food.snack.value,
      unit: emissionFactors.food.snack.unit,
      kgCO2e: values.snacks * emissionFactors.food.snack.value
    }
  ]);
}

function buildMaterialDetail(values: CalculatorInputs): ImpactDetailItem[] {
  const reusableCupFactor =
    values.reusableCupsConsigned === "yes"
      ? emissionFactors.material.reusableCupDeposited
      : emissionFactors.material.reusableCupNotDeposited;

  return addCategoryShares([
    {
      key: "tshirt",
      label: "T-shirts / textiles",
      quantity: values.tshirts,
      factor: emissionFactors.material.tshirt.value,
      unit: emissionFactors.material.tshirt.unit,
      kgCO2e: values.tshirts * emissionFactors.material.tshirt.value
    },
    {
      key: "nonTextileGoodie",
      label: "Goodies non textiles",
      quantity: values.goodies,
      factor: emissionFactors.material.nonTextileGoodie.value,
      unit: emissionFactors.material.nonTextileGoodie.unit,
      kgCO2e: values.goodies * emissionFactors.material.nonTextileGoodie.value
    },
    {
      key: "disposableCup",
      label: "Gobelets jetables",
      quantity: values.disposableCups,
      factor: emissionFactors.material.disposableCup.value,
      unit: emissionFactors.material.disposableCup.unit,
      kgCO2e: values.disposableCups * emissionFactors.material.disposableCup.value
    },
    {
      key: "reusableCup",
      label:
        values.reusableCupsConsigned === "yes"
          ? "Écocups consignées"
          : "Écocups non consignées",
      quantity: values.reusableCups,
      factor: reusableCupFactor.value,
      unit: reusableCupFactor.unit,
      kgCO2e: values.reusableCups * reusableCupFactor.value
    }
  ]);
}

function addCategoryShares(items: Omit<ImpactDetailItem, "shareOfCategory">[]) {
  const total = items.reduce((sum, item) => sum + item.kgCO2e, 0);

  return items.map((item) => ({
    ...item,
    shareOfCategory: total > 0 ? (item.kgCO2e / total) * 100 : 0
  }));
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
  topThree: BreakdownItem[],
  transportDetail: ImpactDetailItem[],
  transportMismatch: boolean
) {
  const priorityRecommendations: string[] = [];
  const additionalRecommendations: string[] = [];
  const topThreeKeys = new Set(topThree.map((item) => item.key));
  const byBreakdown = Object.fromEntries(
    breakdown.map((item) => [item.key, item])
  ) as Record<BreakdownKey, BreakdownItem>;
  const byTransportMode = Object.fromEntries(
    transportDetail.map((item) => [item.key, item])
  ) as Record<TransportMode, ImpactDetailItem>;

  const transportParticipants =
    values.transportCalculationMode === "advanced"
      ? getTransportParticipantsTotal(values)
      : values.participants;
  const carShare =
    transportParticipants > 0
      ? byTransportMode.car.quantity / transportParticipants
      : 0;
  const publicTransportShare =
    transportParticipants > 0
      ? byTransportMode.publicTransport.quantity / transportParticipants
      : 0;
  const carpoolShare =
    transportParticipants > 0
      ? byTransportMode.carpool.quantity / transportParticipants
      : 0;

  const totalMeals =
    values.vegetarianMeals +
    values.chickenMeals +
    values.beefMeals +
    values.snacks;

  const addUnique = (target: string[], message: string) => {
    if (!target.includes(message)) {
      target.push(message);
    }
  };

  const addByCategory = (category: BreakdownKey, message: string) => {
    if (topThreeKeys.has(category)) {
      addUnique(priorityRecommendations, message);
      return;
    }

    addUnique(additionalRecommendations, message);
  };

  const addGeneral = (message: string) => {
    addUnique(additionalRecommendations, message);
  };

  const carIsHigh =
    values.transportCalculationMode === "simple"
      ? values.majorTransportMode === "car"
      : carShare >= 0.2 || byTransportMode.car.quantity >= 30;

  if (carIsHigh) {
    addByCategory(
      "transport",
      "Créer un lien de covoiturage officiel et l’ajouter à la billetterie."
    );
  }

  if (
    values.transportCalculationMode === "advanced" &&
    byTransportMode.publicTransport.quantity > 0 &&
    publicTransportShare < 0.2
  ) {
    addByCategory(
      "transport",
      "Ajouter un visuel d’accès en transports en commun."
    );
  }

  if (
    values.transportCalculationMode === "advanced" &&
    byTransportMode.publicTransport.quantity === 0 &&
    transportParticipants > 0
  ) {
    addByCategory(
      "transport",
      "Ajouter un visuel d’accès en transports en commun."
    );
  }

  if (byTransportMode.plane.quantity > 0) {
    addByCategory(
      "transport",
      "Étudier une alternative train ou un lieu plus accessible."
    );
  }

  if (
    values.transportCalculationMode === "simple"
      ? values.majorTransportMode === "car"
      : byTransportMode.car.quantity > 0 && carpoolShare < 0.15
  ) {
    addByCategory(
      "transport",
      "Créer un groupe WhatsApp ou formulaire de covoiturage."
    );
  }

  if (topThreeKeys.has("transport")) {
    addUnique(
      priorityRecommendations,
      "Mettre en avant les accès bas carbone dans la communication."
    );
  }

  const beefIsHigh =
    values.beefMeals > 0 &&
    (values.beefMeals >= values.chickenMeals ||
      values.beefMeals >= Math.max(20, totalMeals * 0.2));

  if (beefIsHigh) {
    addByCategory(
      "alimentation",
      "Réduire la part de bœuf ou proposer une alternative végétarienne par défaut."
    );
  }

  if (values.snacks >= Math.max(30, values.participants * 0.15)) {
    addByCategory(
      "alimentation",
      "Utiliser des précommandes ou estimations de présence pour limiter le gaspillage."
    );
  }

  if (topThreeKeys.has("alimentation") || byBreakdown.alimentation.kgCO2e > 0) {
    addByCategory(
      "alimentation",
      "Prévoir une solution pour les invendus si possible."
    );
  }

  if (values.tshirts >= 20) {
    addByCategory("materiel", "Passer les t-shirts en précommande.");
  }

  if (values.goodies >= 20) {
    addByCategory(
      "materiel",
      "Supprimer les goodies peu utiles ou choisir des objets vraiment réutilisables."
    );
  }

  if (values.disposableCups > 0) {
    addByCategory(
      "materiel",
      "Remplacer les gobelets jetables par des écocups consignées."
    );
  }

  if (values.reusableCups > 0 && values.reusableCupsConsigned === "no") {
    addByCategory(
      "materiel",
      "Mettre en place une consigne pour augmenter le taux de retour."
    );
  }

  if (values.energyLevel === "high") {
    addByCategory(
      "energie",
      "Privilégier un lieu déjà équipé et éviter les équipements surdimensionnés."
    );
  }

  addByCategory(
    "energie",
    "Éteindre les équipements non nécessaires pendant montage, pauses et démontage."
  );

  if (values.overnightStays > 0 && topThreeKeys.has("hebergement")) {
    addUnique(
      priorityRecommendations,
      "Privilégier des hébergements proches du lieu pour limiter les trajets additionnels."
    );
  }

  if (transportMismatch) {
    addGeneral(
      "Vérifier la cohérence de la répartition transport pour fiabiliser l’ordre de grandeur."
    );
  }

  addGeneral(
    "Expliquer les actions responsables avant l’événement sans ton moralisateur."
  );
  addGeneral("Afficher les accès bas carbone dans la billetterie.");
  addGeneral("Faire un mini-bilan après l’événement pour montrer les progrès.");

  return {
    priorityRecommendations: priorityRecommendations.slice(0, 4),
    additionalRecommendations: additionalRecommendations
      .filter((item) => !priorityRecommendations.includes(item))
      .slice(0, 6)
  };
}

function sumCategory(items: ImpactDetailItem[]) {
  return items.reduce((sum, item) => sum + item.kgCO2e, 0);
}

export function calculateEcoEventScore(impactPerParticipant: number) {
  const normalized = Math.max(
    0,
    1 - impactPerParticipant / ECOEVENT_SCORE_REFERENCE_MAX_PER_PARTICIPANT
  );

  return Math.round(normalized * 100);
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

export function formatPercent(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatFactorValue(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: value < 0.01 && value > 0 ? 4 : 0,
    maximumFractionDigits: value < 0.01 && value > 0 ? 4 : 3
  }).format(value);
}

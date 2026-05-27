export type EmissionFactor = {
  value: number;
  unit: string;
  source: string;
};

export const emissionFactors = {
  transport: {
    walkingCycling: {
      value: 0,
      unit: "kgCO2e / passager.km",
      source:
        "Hypothèse : marche/vélo considérés à 0 en phase d’usage pour cette estimation simplifiée"
    },
    publicTransport: {
      value: 0.05,
      unit: "kgCO2e / passager.km",
      source:
        "Ordre de grandeur simplifié inspiré de facteurs publics ADEME / Impact CO2 pour transports collectifs"
    },
    car: {
      value: 0.142,
      unit: "kgCO2e / passager.km",
      source:
        "Impact CO2 / ADEME indique environ 14,2 kgCO2e pour 100 km en voiture thermique, soit 0,142 kgCO2e/km"
    },
    carpool: {
      value: 0.071,
      unit: "kgCO2e / passager.km",
      source:
        "Hypothèse : voiture thermique divisée par 2 passagers moyens, à affiner selon taux de remplissage réel"
    },
    train: {
      value: 0.0029,
      unit: "kgCO2e / passager.km",
      source:
        "Impact CO2 / ADEME indique environ 0,29 kgCO2e pour 100 km en TGV, soit 0,0029 kgCO2e/km"
    },
    plane: {
      value: 0.225,
      unit: "kgCO2e / passager.km",
      source:
        "Impact CO2 / ADEME indique environ 22,5 kgCO2e pour 100 km en avion court courrier, soit 0,225 kgCO2e/km"
    }
  },
  food: {
    vegetarianMeal: {
      value: 0.85,
      unit: "kgCO2e / repas",
      source: "Impact CO2 / ADEME : repas végétarien ≈ 0,85 kgCO2e"
    },
    chickenMeal: {
      value: 1.46,
      unit: "kgCO2e / repas",
      source: "Impact CO2 / ADEME : repas avec poulet ≈ 1,46 kgCO2e"
    },
    beefMeal: {
      value: 4.97,
      unit: "kgCO2e / repas",
      source: "Impact CO2 / ADEME : repas avec bœuf ≈ 4,97 kgCO2e"
    },
    snack: {
      value: 0.5,
      unit: "kgCO2e / snack",
      source:
        "Hypothèse simplifiée EcoEvent, à remplacer par un facteur Base Empreinte plus précis"
    }
  },
  material: {
    tshirt: {
      value: 7,
      unit: "kgCO2e / textile",
      source:
        "Hypothèse simplifiée EcoEvent pour textile événementiel, à vérifier dans Base Empreinte selon matière, grammage et pays de fabrication"
    },
    nonTextileGoodie: {
      value: 1.5,
      unit: "kgCO2e / goodie",
      source:
        "Hypothèse simplifiée EcoEvent, à affiner selon type d’objet"
    },
    disposableCup: {
      value: 0.03,
      unit: "kgCO2e / gobelet",
      source:
        "Hypothèse simplifiée EcoEvent, à affiner selon matière, poids et fin de vie"
    },
    reusableCupNotDeposited: {
      value: 0.08,
      unit: "kgCO2e / écocup",
      source:
        "Hypothèse simplifiée EcoEvent ; l’impact réel dépend fortement du nombre de réutilisations"
    },
    reusableCupDeposited: {
      value: 0.04,
      unit: "kgCO2e / écocup",
      source:
        "Hypothèse simplifiée EcoEvent avec consigne, supposant un meilleur taux de retour et de réutilisation"
    }
  },
  accommodation: {
    night: {
      value: 10,
      unit: "kgCO2e / nuitée",
      source:
        "Hypothèse simplifiée EcoEvent, à affiner selon type d’hébergement"
    }
  },
  energy: {
    low: {
      value: 20,
      unit: "kgCO2e / événement",
      source:
        "Hypothèse simplifiée : conférence, petite salle, éclairage standard"
    },
    medium: {
      value: 80,
      unit: "kgCO2e / événement",
      source:
        "Hypothèse simplifiée : soirée classique, sonorisation, lumières, bar, salle équipée"
    },
    high: {
      value: 200,
      unit: "kgCO2e / événement",
      source:
        "Hypothèse simplifiée : gala, scène, DJ, écrans, lumières importantes, technique lourde"
    }
  }
} as const;

export type MethodologyFactorRow = {
  category: string;
  factor: string;
  value: number;
  unit: string;
  sourceShort: string;
  source: string;
};

export const methodologyFactorRows: MethodologyFactorRow[] = [
  {
    category: "Transport",
    factor: "Voiture individuelle",
    value: emissionFactors.transport.car.value,
    unit: emissionFactors.transport.car.unit,
    sourceShort: "Impact CO2 / ADEME",
    source: emissionFactors.transport.car.source
  },
  {
    category: "Transport",
    factor: "Train",
    value: emissionFactors.transport.train.value,
    unit: emissionFactors.transport.train.unit,
    sourceShort: "Impact CO2 / ADEME",
    source: emissionFactors.transport.train.source
  },
  {
    category: "Transport",
    factor: "Avion",
    value: emissionFactors.transport.plane.value,
    unit: emissionFactors.transport.plane.unit,
    sourceShort: "Impact CO2 / ADEME",
    source: emissionFactors.transport.plane.source
  },
  {
    category: "Transport",
    factor: "Transports en commun",
    value: emissionFactors.transport.publicTransport.value,
    unit: emissionFactors.transport.publicTransport.unit,
    sourceShort: "ADEME / Impact CO2 simplifié",
    source: emissionFactors.transport.publicTransport.source
  },
  {
    category: "Transport",
    factor: "Covoiturage",
    value: emissionFactors.transport.carpool.value,
    unit: emissionFactors.transport.carpool.unit,
    sourceShort: "Hypothèse EcoEvent",
    source: emissionFactors.transport.carpool.source
  },
  {
    category: "Alimentation",
    factor: "Repas végétarien",
    value: emissionFactors.food.vegetarianMeal.value,
    unit: emissionFactors.food.vegetarianMeal.unit,
    sourceShort: "Impact CO2 / ADEME",
    source: emissionFactors.food.vegetarianMeal.source
  },
  {
    category: "Alimentation",
    factor: "Repas poulet / viande blanche",
    value: emissionFactors.food.chickenMeal.value,
    unit: emissionFactors.food.chickenMeal.unit,
    sourceShort: "Impact CO2 / ADEME",
    source: emissionFactors.food.chickenMeal.source
  },
  {
    category: "Alimentation",
    factor: "Repas bœuf / viande rouge",
    value: emissionFactors.food.beefMeal.value,
    unit: emissionFactors.food.beefMeal.unit,
    sourceShort: "Impact CO2 / ADEME",
    source: emissionFactors.food.beefMeal.source
  },
  {
    category: "Matériel",
    factor: "Gobelet jetable",
    value: emissionFactors.material.disposableCup.value,
    unit: emissionFactors.material.disposableCup.unit,
    sourceShort: "Hypothèse EcoEvent",
    source: emissionFactors.material.disposableCup.source
  },
  {
    category: "Matériel",
    factor: "Écocup consignée",
    value: emissionFactors.material.reusableCupDeposited.value,
    unit: emissionFactors.material.reusableCupDeposited.unit,
    sourceShort: "Hypothèse EcoEvent",
    source: emissionFactors.material.reusableCupDeposited.source
  },
  {
    category: "Matériel",
    factor: "Écocup non consignée",
    value: emissionFactors.material.reusableCupNotDeposited.value,
    unit: emissionFactors.material.reusableCupNotDeposited.unit,
    sourceShort: "Hypothèse EcoEvent",
    source: emissionFactors.material.reusableCupNotDeposited.source
  },
  {
    category: "Matériel",
    factor: "T-shirt / textile",
    value: emissionFactors.material.tshirt.value,
    unit: emissionFactors.material.tshirt.unit,
    sourceShort: "Hypothèse EcoEvent",
    source: emissionFactors.material.tshirt.source
  },
  {
    category: "Énergie",
    factor: "Niveau faible",
    value: emissionFactors.energy.low.value,
    unit: emissionFactors.energy.low.unit,
    sourceShort: "Hypothèse EcoEvent",
    source: emissionFactors.energy.low.source
  },
  {
    category: "Énergie",
    factor: "Niveau moyen",
    value: emissionFactors.energy.medium.value,
    unit: emissionFactors.energy.medium.unit,
    sourceShort: "Hypothèse EcoEvent",
    source: emissionFactors.energy.medium.source
  },
  {
    category: "Énergie",
    factor: "Niveau élevé",
    value: emissionFactors.energy.high.value,
    unit: emissionFactors.energy.high.unit,
    sourceShort: "Hypothèse EcoEvent",
    source: emissionFactors.energy.high.source
  }
];

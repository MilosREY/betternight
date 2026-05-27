"use client";

import Link from "next/link";
import {
  startTransition,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode
} from "react";
import {
  createSavedEstimate,
  loadSavedEstimates,
  persistSavedEstimates,
  type SavedEstimate
} from "@/lib/local-estimates";
import {
  calculateImpact,
  type BreakdownKey,
  type CalculationResult,
  type CalculatorInputs,
  type ImpactDetailItem,
  ENERGY_LEVEL_OPTIONS,
  EVENT_TYPE_OPTIONS,
  formatCount,
  formatFactorValue,
  formatKg,
  formatPercent,
  getTransportParticipantsTotal,
  REUSABLE_CUP_OPTIONS,
  TRANSPORT_CALCULATION_MODE_OPTIONS,
  TRANSPORT_DISTRIBUTION_FIELDS,
  TRANSPORT_MODE_OPTIONS
} from "@/lib/emissions";

const defaultValues: CalculatorInputs = {
  eventName: "Événement à Lyon",
  eventType: "soiree",
  city: "Lyon",
  participants: 300,
  transportCalculationMode: "simple",
  avgRoundTripKm: 15,
  majorTransportMode: "publicTransport",
  walkingCyclingParticipants: 40,
  publicTransportParticipants: 120,
  carParticipants: 70,
  carpoolParticipants: 60,
  trainParticipants: 10,
  planeParticipants: 0,
  vegetarianMeals: 0,
  chickenMeals: 0,
  beefMeals: 0,
  snacks: 0,
  tshirts: 0,
  goodies: 0,
  disposableCups: 0,
  reusableCups: 300,
  reusableCupsConsigned: "yes",
  overnightStays: 0,
  energyLevel: "medium"
};

type NumberFieldKey = {
  [Key in keyof CalculatorInputs]: CalculatorInputs[Key] extends number ? Key : never;
}[keyof CalculatorInputs];

type ComparisonSummary = {
  savedEstimate: SavedEstimate;
  totalDifferenceKg: number;
  totalDifferencePercent: number | null;
  perParticipantDifferenceKg: number;
  scoreDifference: number;
  mostDecreased: { label: string; diffKg: number } | null;
  mostIncreased: { label: string; diffKg: number } | null;
};

const transportWarningMessage =
  "Votre répartition transport ne correspond pas au nombre total de participants. Le calcul reste possible, mais pensez à vérifier les chiffres.";

export function CalculatorForm() {
  const [values, setValues] = useState<CalculatorInputs>(defaultValues);
  const [currentValues, setCurrentValues] = useState<CalculatorInputs | null>(null);
  const [currentResult, setCurrentResult] = useState<CalculationResult | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [savedEstimates, setSavedEstimates] = useState<SavedEstimate[]>([]);
  const [comparisonEstimateId, setComparisonEstimateId] = useState<string | null>(
    null
  );

  useEffect(() => {
    setSavedEstimates(loadSavedEstimates());
  }, []);

  const liveTransportParticipantsTotal = getTransportParticipantsTotal(values);
  const liveTransportMismatch =
    values.transportCalculationMode === "advanced" &&
    liveTransportParticipantsTotal !== values.participants;
  const emailHref =
    currentValues && currentResult ? buildEmailHref(currentValues, currentResult) : "#";
  const comparisonEstimate =
    comparisonEstimateId !== null
      ? savedEstimates.find((estimate) => estimate.id === comparisonEstimateId) || null
      : null;
  const comparisonSummary =
    currentResult && comparisonEstimate
      ? buildComparisonSummary(currentResult, comparisonEstimate)
      : null;

  const updateValue = <Key extends keyof CalculatorInputs>(
    key: Key,
    value: CalculatorInputs[Key]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const updateNumberField = (key: NumberFieldKey, rawValue: string) => {
    const trimmed = rawValue.trim();
    const parsed = trimmed === "" ? 0 : Number(rawValue);
    const nextValue = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;

    setValues((current) => ({ ...current, [key]: nextValue }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShareFeedback(null);
    setSaveFeedback(null);

    startTransition(() => {
      setCurrentValues(values);
      setCurrentResult(calculateImpact(values));
    });
  };

  const handleSaveEstimate = () => {
    if (!currentValues || !currentResult) {
      return;
    }

    const nextEstimate = createSavedEstimate(currentValues, currentResult);
    const nextSavedEstimates = [nextEstimate, ...savedEstimates];

    persistSavedEstimates(nextSavedEstimates);
    setSavedEstimates(nextSavedEstimates);
    setSaveFeedback("Estimation enregistrée sur cet appareil.");
  };

  const handleDeleteEstimate = (estimateId: string) => {
    const nextSavedEstimates = savedEstimates.filter(
      (estimate) => estimate.id !== estimateId
    );

    persistSavedEstimates(nextSavedEstimates);
    setSavedEstimates(nextSavedEstimates);
    if (comparisonEstimateId === estimateId) {
      setComparisonEstimateId(null);
    }
  };

  const handleShareResult = async () => {
    if (!currentValues || !currentResult) {
      return;
    }

    const summary = buildSummaryText(currentValues, currentResult);
    const browserNavigator =
      typeof window !== "undefined" ? window.navigator : undefined;

    try {
      if (browserNavigator && typeof browserNavigator.share === "function") {
        await browserNavigator.share({
          title: `Résumé EcoEvent — ${currentValues.eventName || "Événement"}`,
          text: summary
        });
        setShareFeedback("Résumé partagé.");
        return;
      }

      if (
        browserNavigator?.clipboard &&
        typeof browserNavigator.clipboard.writeText === "function"
      ) {
        await browserNavigator.clipboard.writeText(summary);
        setShareFeedback("Résumé copié dans le presse-papiers.");
        return;
      }

      setShareFeedback("Le partage n’est pas disponible sur ce navigateur.");
    } catch {
      setShareFeedback("Partage annulé ou non disponible.");
    }
  };

  const handleImproveEvent = () => {
    document
      .getElementById("recommendations-card")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="eyebrow">Calculateur V3</span>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.04em] text-ink">
                Simulez l’impact de votre événement
              </h2>
              <p className="mt-3 text-sm leading-6 text-mist sm:text-base">
                Un calculateur autonome pour obtenir un ordre de grandeur clair,
                comparer des scénarios et prioriser les actions utiles.
              </p>
            </div>

            <div className="hidden rounded-[24px] border border-mint/10 bg-mint/5 px-4 py-3 text-right sm:block">
              <p className="text-xs uppercase tracking-[0.18em] text-mist">
                Prêt à calculer
              </p>
              <p className="mt-2 text-2xl font-semibold text-ink">
                {formatCount(values.participants)} pers.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-8">
            <SectionBlock
              title="Contexte"
              description="Les champs numériques vides sont traités comme 0."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nom de l’événement">
                  <input
                    value={values.eventName}
                    onChange={(event) => updateValue("eventName", event.target.value)}
                    className="input-base"
                    placeholder="Ex. Soirée de rentrée"
                  />
                </Field>

                <Field label="Type d’événement">
                  <select
                    value={values.eventType}
                    onChange={(event) =>
                      updateValue(
                        "eventType",
                        event.target.value as CalculatorInputs["eventType"]
                      )
                    }
                    className="input-base"
                  >
                    {EVENT_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Ville de l’événement"
                  hint="La ville sert à identifier et retrouver l’événement dans votre historique. Elle ne modifie pas le calcul."
                >
                  <input
                    value={values.city}
                    onChange={(event) => updateValue("city", event.target.value)}
                    className="input-base"
                    placeholder="Ex. Lyon"
                  />
                </Field>

                <Field label="Nombre total de participants">
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={values.participants}
                    onChange={(event) =>
                      updateNumberField("participants", event.target.value)
                    }
                    className="input-base"
                  />
                </Field>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Transport"
              description="Le mode simple s’ouvre par défaut. Le mode avancé sert si vous connaissez mieux la répartition réelle."
            >
              <div className="grid gap-3 lg:grid-cols-2">
                {TRANSPORT_CALCULATION_MODE_OPTIONS.map((option) => {
                  const selected =
                    values.transportCalculationMode === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        updateValue("transportCalculationMode", option.value)
                      }
                      className={`rounded-[24px] border px-5 py-4 text-left transition-colors ${
                        selected
                          ? "border-sky bg-sky/5"
                          : "border-line bg-white hover:border-sky/40"
                      }`}
                    >
                      <p className="font-medium text-ink">{option.label}</p>
                      <p className="mt-2 text-sm leading-6 text-mist">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field
                  label="Distance moyenne aller-retour par participant"
                  className="sm:col-span-2"
                >
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={values.avgRoundTripKm}
                    onChange={(event) =>
                      updateNumberField("avgRoundTripKm", event.target.value)
                    }
                    className="input-base"
                  />
                </Field>

                {values.transportCalculationMode === "simple" ? (
                  <Field label="Mode de transport majoritaire" className="sm:col-span-2">
                    <select
                      value={values.majorTransportMode}
                      onChange={(event) =>
                        updateValue(
                          "majorTransportMode",
                          event.target.value as CalculatorInputs["majorTransportMode"]
                        )
                      }
                      className="input-base"
                    >
                      {TRANSPORT_MODE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                ) : (
                  <div className="sm:col-span-2 rounded-[24px] border border-line bg-cloud/60 p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          Répartition détaillée des transports
                        </p>
                        <p className="mt-1 text-sm text-mist">
                          Utilisez cette vue si vous avez une estimation plus fine
                          des déplacements réels.
                        </p>
                      </div>
                      <div className="rounded-full border border-line bg-white px-4 py-2 text-sm text-mist">
                        {formatCount(liveTransportParticipantsTotal)} participants
                        renseignés
                      </div>
                    </div>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      {TRANSPORT_DISTRIBUTION_FIELDS.map((item) => (
                        <Field key={item.field} label={item.label}>
                          <input
                            type="number"
                            min="0"
                            inputMode="numeric"
                            value={values[item.field]}
                            onChange={(event) =>
                              updateNumberField(item.field, event.target.value)
                            }
                            className="input-base"
                          />
                        </Field>
                      ))}
                    </div>

                    {liveTransportMismatch ? (
                      <div className="mt-5 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                        {transportWarningMessage}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </SectionBlock>

            <SectionBlock
              title="Alimentation"
              description="Les repas sont séparés par type pour éviter un poste “viande” trop flou."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nombre de repas végétariens">
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={values.vegetarianMeals}
                    onChange={(event) =>
                      updateNumberField("vegetarianMeals", event.target.value)
                    }
                    className="input-base"
                  />
                </Field>

                <Field label="Nombre de repas avec poulet / viande blanche">
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={values.chickenMeals}
                    onChange={(event) =>
                      updateNumberField("chickenMeals", event.target.value)
                    }
                    className="input-base"
                  />
                </Field>

                <Field label="Nombre de repas avec bœuf / viande rouge">
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={values.beefMeals}
                    onChange={(event) =>
                      updateNumberField("beefMeals", event.target.value)
                    }
                    className="input-base"
                  />
                </Field>

                <Field label="Nombre de snacks ou repas légers">
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={values.snacks}
                    onChange={(event) =>
                      updateNumberField("snacks", event.target.value)
                    }
                    className="input-base"
                  />
                </Field>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Matériel"
              description="Textiles, goodies, gobelets jetables et écocups sont regroupés ici."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nombre de t-shirts ou textiles">
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={values.tshirts}
                    onChange={(event) =>
                      updateNumberField("tshirts", event.target.value)
                    }
                    className="input-base"
                  />
                </Field>

                <Field label="Nombre de goodies non textiles">
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={values.goodies}
                    onChange={(event) =>
                      updateNumberField("goodies", event.target.value)
                    }
                    className="input-base"
                  />
                </Field>

                <Field label="Nombre de gobelets jetables">
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={values.disposableCups}
                    onChange={(event) =>
                      updateNumberField("disposableCups", event.target.value)
                    }
                    className="input-base"
                  />
                </Field>

                <Field
                  label="Nombre d’écocups réutilisables"
                  hint="L’impact réel d’une écocup dépend surtout de son nombre de réutilisations. La consigne est utilisée ici comme indicateur simplifié d’un meilleur taux de retour."
                >
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={values.reusableCups}
                    onChange={(event) =>
                      updateNumberField("reusableCups", event.target.value)
                    }
                    className="input-base"
                  />
                </Field>

                <div className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-ink">
                    Les écocups sont-elles consignées ?
                  </span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {REUSABLE_CUP_OPTIONS.map((option) => {
                      const selected = values.reusableCupsConsigned === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            updateValue("reusableCupsConsigned", option.value)
                          }
                          className={`rounded-[22px] border px-4 py-4 text-left transition-colors ${
                            selected
                              ? "border-sky bg-sky/5"
                              : "border-line bg-white hover:border-sky/40"
                          }`}
                        >
                          <p className="font-medium text-ink">{option.label}</p>
                          <p className="mt-2 text-sm leading-6 text-mist">
                            {option.value === "yes"
                              ? "La consigne est utilisée ici comme indicateur simplifié d’un meilleur taux de retour."
                              : "Sans consigne, le facteur utilisé est plus élevé car le retour est moins certain."}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Énergie"
              description="Le niveau technique donne un ordre de grandeur simplifié pour la partie son, lumière et équipements."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nombre de nuitées d’hébergement">
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={values.overnightStays}
                    onChange={(event) =>
                      updateNumberField("overnightStays", event.target.value)
                    }
                    className="input-base"
                  />
                </Field>

                <div className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-ink">
                    Niveau technique / énergie de l’événement
                  </span>
                  <div className="grid gap-3 lg:grid-cols-3">
                    {ENERGY_LEVEL_OPTIONS.map((option) => {
                      const selected = values.energyLevel === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateValue("energyLevel", option.value)}
                          className={`rounded-[22px] border px-4 py-4 text-left transition-colors ${
                            selected
                              ? "border-sky bg-sky/5"
                              : "border-line bg-white hover:border-sky/40"
                          }`}
                        >
                          <p className="font-medium text-ink">{option.label}</p>
                          <p className="mt-2 text-sm leading-6 text-mist">
                            {option.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </SectionBlock>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="submit" className="button-primary">
              Lancer une estimation
            </button>
            <p className="text-sm text-mist">
              Les résultats sont des estimations indicatives basées sur des
              facteurs d’émission documentés.
            </p>
          </div>
        </form>

        <div className="space-y-6">
          {currentResult && currentValues ? (
            <>
              <div className="glass-card p-6 sm:p-8">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <span className="eyebrow">Résultats</span>
                    <h3 className="text-2xl font-semibold tracking-[-0.03em] text-ink">
                      {currentValues.eventName || "Votre événement"}
                    </h3>
                    <p className="text-sm leading-6 text-mist">
                      Ordre de grandeur pédagogique calculé à partir des données
                      saisies et des facteurs documentés.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <MetricCard
                      label="Score EcoEvent"
                      value={`${formatCount(currentResult.ecoEventScore)} / 100`}
                      note="Indice simplifié basé sur l’impact par participant."
                    />
                    <MetricCard
                      label="Impact total"
                      value={`${formatKg(currentResult.totalKgCO2e)} kgCO2e`}
                    />
                    <MetricCard
                      label="Impact par participant"
                      value={`${formatKg(currentResult.impactPerParticipant)} kgCO2e`}
                    />
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-ink">
                      Top 3 des postes
                    </h4>
                    <div className="mt-4 grid gap-4">
                      {currentResult.topThree.map((item, index) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between rounded-[22px] border border-line bg-white/90 px-5 py-4"
                        >
                          <div className="flex items-center gap-4">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-sm font-semibold text-white">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-ink">{item.label}</p>
                              <p className="text-sm text-mist">
                                {formatPercent(item.share)} % du total
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-ink">
                            {formatKg(item.kgCO2e)} kgCO2e
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div id="recommendations-card">
                    <h4 className="text-lg font-semibold text-ink">Priorités</h4>
                    <div className="mt-4 space-y-3">
                      {currentResult.priorityRecommendations.length > 0 ? (
                        currentResult.priorityRecommendations.map((recommendation) => (
                          <RecommendationCard
                            key={recommendation}
                            tone="highlight"
                            text={recommendation}
                          />
                        ))
                      ) : (
                        <RecommendationCard
                          tone="highlight"
                          text="Aucun poste ne ressort fortement pour l’instant. Conservez cette base et affinez vos données pour prioriser plus précisément."
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        onClick={handleSaveEstimate}
                        className="button-primary"
                      >
                        Enregistrer cette estimation
                      </button>
                      <a href={emailHref} className="button-secondary">
                        Recevoir le résumé par email
                      </a>
                      <button
                        type="button"
                        onClick={handleShareResult}
                        className="button-secondary"
                      >
                        Partager votre résultat
                      </button>
                      <button
                        type="button"
                        onClick={handleImproveEvent}
                        className="button-secondary"
                      >
                        Améliorer mon événement
                      </button>
                    </div>

                    <p className="text-sm text-mist">
                      Les estimations sont enregistrées uniquement dans votre
                      navigateur.
                    </p>

                    {saveFeedback ? (
                      <p className="text-sm text-mint">{saveFeedback}</p>
                    ) : null}
                    {shareFeedback ? (
                      <p className="text-sm text-mist">{shareFeedback}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <details className="glass-card overflow-hidden">
                <summary className="cursor-pointer list-none px-6 py-5 text-lg font-semibold text-ink">
                  Détail transport
                </summary>
                <div className="border-t border-line px-6 pb-6 pt-4">
                  {currentResult.transportMismatch ? (
                    <div className="mb-5 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                      {transportWarningMessage}
                    </div>
                  ) : null}
                  <DetailList
                    items={currentResult.transportDetail}
                    quantityLabel="participants"
                  />
                </div>
              </details>

              <details className="glass-card overflow-hidden">
                <summary className="cursor-pointer list-none px-6 py-5 text-lg font-semibold text-ink">
                  Détail alimentation
                </summary>
                <div className="border-t border-line px-6 pb-6 pt-4">
                  <DetailList items={currentResult.foodDetail} quantityLabel="unités" />
                </div>
              </details>

              <details className="glass-card overflow-hidden">
                <summary className="cursor-pointer list-none px-6 py-5 text-lg font-semibold text-ink">
                  Détail matériel
                </summary>
                <div className="border-t border-line px-6 pb-6 pt-4">
                  <DetailList
                    items={currentResult.materialDetail}
                    quantityLabel="unités"
                  />
                </div>
              </details>

              <div className="glass-card p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-ink">Autres pistes</h3>
                <div className="mt-4 space-y-3">
                  {currentResult.additionalRecommendations.length > 0 ? (
                    currentResult.additionalRecommendations.map((recommendation) => (
                      <RecommendationCard
                        key={recommendation}
                        tone="neutral"
                        text={recommendation}
                      />
                    ))
                  ) : (
                    <RecommendationCard
                      tone="neutral"
                      text="Ajoutez plus de détails sur les transports, les repas ou le matériel pour faire ressortir davantage de pistes d’amélioration."
                    />
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-6 sm:p-8">
              <span className="eyebrow">Résultats</span>
              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-ink">
                Lancez une estimation pour voir votre résultat
              </h3>
              <p className="mt-3 text-sm leading-6 text-mist sm:text-base">
                Le score EcoEvent, l’impact total, les principaux postes et les
                recommandations apparaîtront ici après calcul.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="glass-card p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">Historique</span>
              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-ink">
                Mes estimations précédentes
              </h3>
              <p className="mt-2 text-sm leading-6 text-mist">
                Les estimations sont enregistrées uniquement dans votre navigateur.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {savedEstimates.length === 0 ? (
              <div className="rounded-[22px] border border-line bg-white/90 px-5 py-4 text-sm leading-6 text-mist">
                Vos estimations enregistrées apparaîtront ici.
              </div>
            ) : (
              savedEstimates.map((estimate) => {
                const isSelected = estimate.id === comparisonEstimateId;

                return (
                  <div
                    key={estimate.id}
                    className="rounded-[24px] border border-line bg-white/90 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-medium text-ink">{estimate.eventName}</p>
                        <p className="mt-1 text-sm text-mist">
                          {estimate.city} · {formatSavedDate(estimate.createdAt)}
                        </p>
                      </div>
                      <div className="rounded-full border border-line bg-cloud/70 px-3 py-1 text-sm font-medium text-ink">
                        Score {formatCount(estimate.ecoEventScore)}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      <CompactStat
                        label="Impact total"
                        value={`${formatKg(estimate.totalKgCO2e)} kgCO2e`}
                      />
                      <CompactStat
                        label="Impact / participant"
                        value={`${formatKg(estimate.impactPerParticipant)} kgCO2e`}
                      />
                      <CompactStat
                        label="Participants"
                        value={formatCount(estimate.participants)}
                      />
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() =>
                          setComparisonEstimateId(
                            isSelected ? null : estimate.id
                          )
                        }
                        className="button-secondary"
                      >
                        Comparer
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEstimate(estimate.id)}
                        className="button-secondary"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 sm:p-8">
            <span className="eyebrow">Comparaison</span>
            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-ink">
              {comparisonEstimate
                ? `Comparaison avec ${comparisonEstimate.eventName}`
                : "Comparer avec un événement enregistré"}
            </h3>

            {comparisonEstimate ? (
              currentResult ? (
                comparisonSummary ? (
                  <div className="mt-6 space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <MetricCard
                        label="Impact total actuel"
                        value={`${formatKg(currentResult.totalKgCO2e)} kgCO2e`}
                      />
                      <MetricCard
                        label="Impact total enregistré"
                        value={`${formatKg(
                          comparisonSummary.savedEstimate.totalKgCO2e
                        )} kgCO2e`}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      <CompactStat
                        label="Impact / participant"
                        value={`${formatKg(
                          currentResult.impactPerParticipant
                        )} vs ${formatKg(
                          comparisonSummary.savedEstimate.impactPerParticipant
                        )}`}
                      />
                      <CompactStat
                        label="Score"
                        value={`${formatCount(currentResult.ecoEventScore)} vs ${formatCount(
                          comparisonSummary.savedEstimate.ecoEventScore
                        )}`}
                      />
                      <CompactStat
                        label="Différence totale"
                        value={`${comparisonSummary.totalDifferenceKg > 0 ? "+" : ""}${formatKg(
                          comparisonSummary.totalDifferenceKg
                        )} kgCO2e`}
                      />
                    </div>

                    <div className="rounded-[22px] border border-line bg-white/90 px-5 py-4 text-sm leading-7 text-ink">
                      <p>
                        Différence relative :
                        {" "}
                        {comparisonSummary.totalDifferencePercent === null
                          ? "non disponible"
                          : `${comparisonSummary.totalDifferencePercent > 0 ? "+" : ""}${formatPercent(
                              comparisonSummary.totalDifferencePercent
                            )} %`}
                      </p>
                      <p>
                        Différence par participant :
                        {" "}
                        {comparisonSummary.perParticipantDifferenceKg > 0 ? "+" : ""}
                        {formatKg(comparisonSummary.perParticipantDifferenceKg)} kgCO2e
                      </p>
                      <p>
                        Différence de score :
                        {" "}
                        {comparisonSummary.scoreDifference > 0 ? "+" : ""}
                        {formatCount(comparisonSummary.scoreDifference)} points
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <CompactStat
                        label="Poste qui a le plus diminué"
                        value={
                          comparisonSummary.mostDecreased
                            ? `${comparisonSummary.mostDecreased.label} (${formatKg(
                                comparisonSummary.mostDecreased.diffKg
                              )} kgCO2e)`
                            : "Aucune baisse marquée"
                        }
                      />
                      <CompactStat
                        label="Poste qui a le plus augmenté"
                        value={
                          comparisonSummary.mostIncreased
                            ? `${comparisonSummary.mostIncreased.label} (+${formatKg(
                                comparisonSummary.mostIncreased.diffKg
                              )} kgCO2e)`
                            : "Aucune hausse marquée"
                        }
                      />
                    </div>
                  </div>
                ) : null
              ) : (
                <p className="mt-6 text-sm leading-6 text-mist">
                  Lancez d’abord une estimation pour comparer avec un événement enregistré.
                </p>
              )
            ) : (
              <p className="mt-6 text-sm leading-6 text-mist">
                Choisissez une estimation enregistrée dans l’historique pour
                afficher la comparaison.
              </p>
            )}
          </div>

          <div className="glass-card p-6 sm:p-8">
            <span className="eyebrow">Méthodologie</span>
            <p className="mt-4 text-sm leading-7 text-mist sm:text-base">
              Les calculs sont des estimations indicatives basées sur des
              facteurs d’émission documentés.
            </p>
            <Link href="/methodologie" className="button-secondary mt-5">
              Voir la méthodologie
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionBlock({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-mist">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  className,
  children
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={className ? `block ${className}` : "block"}>
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint ? (
        <span className="mt-2 block text-sm leading-6 text-mist">{hint}</span>
      ) : null}
    </label>
  );
}

function MetricCard({
  label,
  value,
  note
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="metric-card">
      <p className="text-sm text-mist">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-ink">
        {value}
      </p>
      {note ? <p className="mt-2 text-sm leading-6 text-mist">{note}</p> : null}
    </div>
  );
}

function CompactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-line bg-cloud/50 px-4 py-3">
      <p className="text-sm text-mist">{label}</p>
      <p className="mt-2 font-medium text-ink">{value}</p>
    </div>
  );
}

function DetailList({
  items,
  quantityLabel
}: {
  items: ImpactDetailItem[];
  quantityLabel: string;
}) {
  const visibleItems = items.filter((item) => item.quantity > 0 || item.kgCO2e > 0);

  if (visibleItems.length === 0) {
    return (
      <div className="rounded-[20px] border border-line bg-cloud/50 px-4 py-3 text-sm leading-6 text-mist">
        Aucun poste renseigné dans cette catégorie pour cette estimation.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visibleItems.map((item) => (
        <DetailBar
          key={item.key}
          label={item.label}
          value={`${formatCount(item.quantity)} ${quantityLabel} · ${formatKg(
            item.kgCO2e
          )} kgCO2e`}
          secondary={`${formatFactorValue(item.factor)} ${item.unit} · ${formatPercent(
            item.shareOfCategory
          )} % de la catégorie`}
          width={item.shareOfCategory}
        />
      ))}
    </div>
  );
}

function DetailBar({
  label,
  value,
  secondary,
  width
}: {
  label: string;
  value: string;
  secondary?: string;
  width: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-medium text-ink">{label}</span>
        <span className="text-sm text-mist">{value}</span>
      </div>
      {secondary ? <p className="text-sm text-mist">{secondary}</p> : null}
      <div className="h-2 rounded-full bg-cloud">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-mint to-sky"
          style={{ width: `${Math.max(width, width > 0 ? 3 : 0)}%` }}
        />
      </div>
    </div>
  );
}

function RecommendationCard({
  text,
  tone
}: {
  text: string;
  tone: "highlight" | "neutral";
}) {
  return (
    <div
      className={`rounded-[22px] px-5 py-4 text-sm leading-6 ${
        tone === "highlight"
          ? "border border-mint/10 bg-mint/5 text-ink"
          : "border border-line bg-white/90 text-ink"
      }`}
    >
      {text}
    </div>
  );
}

function buildSummaryText(values: CalculatorInputs, result: CalculationResult) {
  const topThreeText = result.topThree
    .map(
      (item, index) =>
        `${index + 1}. ${item.label} — ${formatKg(item.kgCO2e)} kgCO2e (${formatPercent(
          item.share
        )} %)`
    )
    .join("\n");

  return [
    `Résumé EcoEvent — ${values.eventName || "Événement"}`,
    `Ville : ${values.city || "Non renseignée"}`,
    `Score EcoEvent : ${formatCount(result.ecoEventScore)} / 100`,
    `Impact total : ${formatKg(result.totalKgCO2e)} kgCO2e`,
    `Impact par participant : ${formatKg(result.impactPerParticipant)} kgCO2e`,
    "",
    "Top 3 des postes :",
    topThreeText,
    "",
    "EcoEvent fournit ici un ordre de grandeur pédagogique. Cette estimation ne constitue pas un Bilan Carbone® certifié."
  ].join("\n");
}

function buildEmailHref(values: CalculatorInputs, result: CalculationResult) {
  const subject = `Résumé EcoEvent — ${values.eventName || "Événement"}`;
  const body = buildSummaryText(values, result);

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    body
  )}`;
}

function buildComparisonSummary(
  currentResult: CalculationResult,
  savedEstimate: SavedEstimate
): ComparisonSummary {
  const currentBreakdown = currentResult.breakdown.reduce<
    Partial<Record<BreakdownKey, { label: string; kgCO2e: number }>>
  >((accumulator, item) => {
    accumulator[item.key] = {
      label: item.label,
      kgCO2e: item.kgCO2e
    };
    return accumulator;
  }, {});

  const comparisonDiffs = (Object.keys(savedEstimate.breakdown) as BreakdownKey[]).map(
    (key) => ({
      key,
      label: currentBreakdown[key]?.label || key,
      diffKg: (currentBreakdown[key]?.kgCO2e || 0) - savedEstimate.breakdown[key]
    })
  );

  const mostDecreased =
    comparisonDiffs
      .filter((item) => item.diffKg < 0)
      .sort((a, b) => a.diffKg - b.diffKg)[0] || null;
  const mostIncreased =
    comparisonDiffs
      .filter((item) => item.diffKg > 0)
      .sort((a, b) => b.diffKg - a.diffKg)[0] || null;

  return {
    savedEstimate,
    totalDifferenceKg: currentResult.totalKgCO2e - savedEstimate.totalKgCO2e,
    totalDifferencePercent:
      savedEstimate.totalKgCO2e > 0
        ? ((currentResult.totalKgCO2e - savedEstimate.totalKgCO2e) /
            savedEstimate.totalKgCO2e) *
          100
        : null,
    perParticipantDifferenceKg:
      currentResult.impactPerParticipant - savedEstimate.impactPerParticipant,
    scoreDifference: currentResult.ecoEventScore - savedEstimate.ecoEventScore,
    mostDecreased,
    mostIncreased
  };
}

function formatSavedDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

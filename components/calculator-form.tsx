"use client";

import {
  startTransition,
  useState,
  type FormEvent,
  type ReactNode
} from "react";
import {
  calculateImpact,
  type CalculatorInputs,
  ENERGY_LEVEL_OPTIONS,
  EVENT_TYPE_OPTIONS,
  formatCount,
  formatKg,
  formatPercent,
  getTransportParticipantsTotal,
  REUSABLE_CUP_OPTIONS,
  TRANSPORT_DISTRIBUTION_FIELDS
} from "@/lib/emissions";

const defaultValues: CalculatorInputs = {
  eventName: "Gala de printemps",
  eventType: "gala",
  city: "Lyon",
  participants: 450,
  avgRoundTripKm: 18,
  walkBikeParticipants: 35,
  publicTransitParticipants: 125,
  carParticipants: 110,
  carpoolParticipants: 145,
  trainParticipants: 30,
  planeParticipants: 5,
  meatMeals: 260,
  vegetarianMeals: 150,
  snacks: 120,
  tshirts: 35,
  goodies: 180,
  disposableCups: 120,
  reusableCups: 320,
  reusableCupsConsigned: "yes",
  overnightStays: 0,
  energyLevel: "medium"
};

type NumberFieldKey = {
  [Key in keyof CalculatorInputs]: CalculatorInputs[Key] extends number ? Key : never;
}[keyof CalculatorInputs];

const transportWarningMessage =
  "Votre répartition transport ne correspond pas au nombre total de participants. Le calcul reste possible, mais pensez à vérifier les chiffres.";

export function CalculatorForm() {
  const [values, setValues] = useState<CalculatorInputs>(defaultValues);
  const [submittedValues, setSubmittedValues] =
    useState<CalculatorInputs>(defaultValues);
  const [result, setResult] = useState(() => calculateImpact(defaultValues));
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const transportParticipantsTotal = getTransportParticipantsTotal(values);
  const liveTransportMismatch = transportParticipantsTotal !== values.participants;
  const emailHref = buildEmailHref(submittedValues, result);

  const updateValue = <Key extends keyof CalculatorInputs>(
    key: Key,
    value: CalculatorInputs[Key]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const updateNumberField = (key: NumberFieldKey, value: string) => {
    setValues((current) => ({
      ...current,
      [key]: Number(value) >= 0 ? Number(value) : 0
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShareFeedback(null);

    startTransition(() => {
      setSubmittedValues(values);
      setResult(calculateImpact(values));
    });
  };

  const handleShareResult = async () => {
    const summary = buildSummaryText(submittedValues, result);
    const browserNavigator =
      typeof window !== "undefined" ? window.navigator : undefined;

    try {
      if (browserNavigator && typeof browserNavigator.share === "function") {
        await browserNavigator.share({
          title: `Résumé EcoEvent — ${submittedValues.eventName}`,
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
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="eyebrow">Calculateur V2</span>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.04em] text-ink">
                Simulez l’impact de votre événement
              </h2>
              <p className="mt-3 text-sm leading-6 text-mist sm:text-base">
                Cette estimation est autonome, pédagogique et basée sur des
                facteurs simplifiés. Elle sert à repérer rapidement les postes
                qui pèsent le plus.
              </p>
            </div>

            <div className="hidden rounded-[24px] border border-mint/10 bg-mint/5 px-4 py-3 text-right sm:block">
              <p className="text-xs uppercase tracking-[0.18em] text-mist">
                Estimation actuelle
              </p>
              <p className="mt-2 text-2xl font-semibold text-ink">
                {formatKg(result.totalKgCO2e)} kgCO2e
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-8">
            <SectionBlock
              title="Contexte"
              description="Décrivez rapidement votre événement pour contextualiser l’estimation."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nom de l’événement">
                  <input
                    value={values.eventName}
                    onChange={(event) => updateValue("eventName", event.target.value)}
                    className="input-base"
                    placeholder="Ex. Gala de printemps"
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
                  label="Ville"
                  hint="Dans cette version, la ville sert à contextualiser l’événement. Elle ne modifie pas encore automatiquement les facteurs de calcul."
                >
                  <input
                    value={values.city}
                    onChange={(event) => updateValue("city", event.target.value)}
                    className="input-base"
                    placeholder="Ex. Lyon"
                  />
                </Field>

                <Field label="Nombre de participants">
                  <input
                    type="number"
                    min="0"
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
              description="Le transport est souvent le premier poste d’impact. Cette V2 fonctionne avec une répartition des participants par mode."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Distance moyenne aller-retour par participant (km)"
                  className="sm:col-span-2"
                >
                  <input
                    type="number"
                    min="0"
                    value={values.avgRoundTripKm}
                    onChange={(event) =>
                      updateNumberField("avgRoundTripKm", event.target.value)
                    }
                    className="input-base"
                  />
                </Field>
              </div>

              <div className="mt-5 rounded-[24px] border border-line bg-cloud/60 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Répartition des participants par mode de transport
                    </p>
                    <p className="mt-1 text-sm text-mist">
                      Renseignez vos hypothèses. Le calcul reste possible même si
                      tout n’est pas encore parfaitement consolidé.
                    </p>
                  </div>
                  <div className="rounded-full border border-line bg-white px-4 py-2 text-sm text-mist">
                    {formatCount(transportParticipantsTotal)} participants
                    renseignés
                  </div>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {TRANSPORT_DISTRIBUTION_FIELDS.map((item) => (
                    <Field key={item.field} label={item.label}>
                      <input
                        type="number"
                        min="0"
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
            </SectionBlock>

            <SectionBlock
              title="Alimentation"
              description="Les repas et snacks pèsent vite dans le résultat dès que le volume participant augmente."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nombre de repas viande">
                  <input
                    type="number"
                    min="0"
                    value={values.meatMeals}
                    onChange={(event) =>
                      updateNumberField("meatMeals", event.target.value)
                    }
                    className="input-base"
                  />
                </Field>

                <Field label="Nombre de repas végétariens">
                  <input
                    type="number"
                    min="0"
                    value={values.vegetarianMeals}
                    onChange={(event) =>
                      updateNumberField("vegetarianMeals", event.target.value)
                    }
                    className="input-base"
                  />
                </Field>

                <Field label="Nombre de snacks / repas légers" className="sm:col-span-2">
                  <input
                    type="number"
                    min="0"
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
              title="Matériel & consommables"
              description="Textiles, goodies, gobelets jetables et écocups sont regroupés ici."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nombre de t-shirts ou textiles">
                  <input
                    type="number"
                    min="0"
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
                    value={values.disposableCups}
                    onChange={(event) =>
                      updateNumberField("disposableCups", event.target.value)
                    }
                    className="input-base"
                  />
                </Field>

                <Field
                  label="Nombre d’écocups réutilisables"
                  hint="L’impact réel d’une écocup dépend surtout de son nombre de réutilisations. Le facteur utilisé ici est simplifié."
                >
                  <input
                    type="number"
                    min="0"
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
                              ? "border-sky bg-sky/5 text-ink"
                              : "border-line bg-white text-mist hover:border-sky/40"
                          }`}
                        >
                          <p className="font-medium text-ink">{option.label}</p>
                          <p className="mt-2 text-sm leading-6 text-mist">
                            {option.value === "yes"
                              ? "Une consigne simplifie le retour et réduit mieux l’impact par usage."
                              : "Sans consigne, le retour est plus incertain et le facteur utilisé est plus élevé."}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock
              title="Logistique & énergie"
              description="Hébergement et niveau technique permettent d’approcher la part logistique de l’événement."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nombre de nuitées d’hébergement">
                  <input
                    type="number"
                    min="0"
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
              Estimation indicative, utile pour arbitrer vite avant l’événement.
            </p>
          </div>
        </form>

        <div className="space-y-6">
          <div className="glass-card p-6 sm:p-8">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span className="eyebrow">Résultats</span>
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-ink">
                  {submittedValues.eventName || "Votre événement"}
                </h3>
                <p className="text-sm text-mist">
                  {submittedValues.city || "Ville non renseignée"} · estimation
                  autonome EcoEvent
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <MetricCard
                  label="Impact total"
                  value={`${formatKg(result.totalKgCO2e)} kgCO2e`}
                />
                <MetricCard
                  label="Impact par participant"
                  value={`${formatKg(result.impactPerParticipant)} kgCO2e`}
                />
                <MetricCard
                  label="Participants transport renseignés"
                  value={`${formatCount(result.transportParticipantsTotal)} / ${formatCount(
                    submittedValues.participants
                  )}`}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
                  Continuer à améliorer mon événement
                </button>
              </div>

              {shareFeedback ? (
                <p className="text-sm text-mist">{shareFeedback}</p>
              ) : null}
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-ink">Répartition par poste</h3>
                <p className="text-sm text-mist">
                  Transport, alimentation, matériel, hébergement, énergie
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {result.breakdown
                  .slice()
                  .sort((a, b) => b.kgCO2e - a.kgCO2e)
                  .map((item) => (
                    <div key={item.key} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-ink">{item.label}</span>
                        <span className="text-mist">
                          {formatKg(item.kgCO2e)} kgCO2e ·{" "}
                          {formatPercent(item.share)} %
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-cloud">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-mint to-sky"
                          style={{ width: `${Math.max(item.share, 3)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="glass-card p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-ink">Top 3 des postes d’impact</h3>
            <div className="mt-5 grid gap-4">
              {result.topThree.map((item, index) => (
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

          <div className="glass-card p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-ink">
                Détail transport par mode
              </h3>
              <p className="text-sm text-mist">
                Distance moyenne utilisée : {submittedValues.avgRoundTripKm} km
              </p>
            </div>

            {result.transportMismatch ? (
              <div className="mt-5 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                {transportWarningMessage}
              </div>
            ) : null}

            <div className="mt-5 space-y-4">
              {result.transportDetail.map((item) => (
                <div key={item.key} className="space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-ink">{item.label}</p>
                      <p className="text-sm text-mist">
                        {formatCount(item.participants)} participants · facteur{" "}
                        {item.factor} kgCO2e/km/personne
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-ink">
                      {formatKg(item.kgCO2e)} kgCO2e
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-cloud">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-sky to-mint"
                      style={{ width: `${Math.max(item.shareOfTransport, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="recommendations-card" className="glass-card p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-ink">
              Recommandations prioritaires
            </h3>
            <div className="mt-5 space-y-3">
              {result.priorityRecommendations.map((recommendation) => (
                <div
                  key={recommendation}
                  className="rounded-[22px] border border-mint/10 bg-mint/5 px-5 py-4 text-sm leading-6 text-ink"
                >
                  {recommendation}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-ink">
              Recommandations complémentaires
            </h3>
            <div className="mt-5 space-y-3">
              {result.additionalRecommendations.map((recommendation) => (
                <div
                  key={recommendation}
                  className="rounded-[22px] border border-line bg-white/90 px-5 py-4 text-sm leading-6 text-ink"
                >
                  {recommendation}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 sm:p-8">
        <span className="eyebrow">Méthodologie</span>
        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-ink">
          Comment est calculée l’estimation ?
        </h3>
        <p className="mt-4 text-sm leading-7 text-mist sm:text-base">
          EcoEvent utilise une méthode simple : donnée d’activité × facteur
          d’émission. Par exemple, le transport est estimé à partir du nombre
          de participants, de la distance moyenne et du mode de transport. Les
          facteurs utilisés sont volontairement simplifiés pour donner un ordre
          de grandeur et aider à identifier les principaux postes d’impact.
        </p>

        <p className="mt-4 text-sm leading-7 text-mist sm:text-base">
          Cette estimation est indicative et pédagogique. Elle ne constitue pas
          un Bilan Carbone® certifié.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            "Transport : distance × nombre de participants × facteur par mode",
            "Alimentation : nombre de repas × facteur par type de repas",
            "Matériel : textiles, goodies, gobelets et écocups",
            "Hébergement : nombre de nuitées",
            "Énergie : niveau technique estimé de l’événement"
          ].map((item) => (
            <div key={item} className="rounded-[22px] border border-line bg-white/90 px-5 py-4 text-sm leading-6 text-ink">
              {item}
            </div>
          ))}
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
      {hint ? <span className="mt-2 block text-sm leading-6 text-mist">{hint}</span> : null}
    </label>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-mist">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-ink">
        {value}
      </p>
    </div>
  );
}

function buildSummaryText(values: CalculatorInputs, result: ReturnType<typeof calculateImpact>) {
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
    `Impact total : ${formatKg(result.totalKgCO2e)} kgCO2e`,
    `Impact par participant : ${formatKg(result.impactPerParticipant)} kgCO2e`,
    `Top 3 des postes :`,
    topThreeText,
    "",
    "Estimation indicative et pédagogique, non certifiée Bilan Carbone®."
  ].join("\n");
}

function buildEmailHref(
  values: CalculatorInputs,
  result: ReturnType<typeof calculateImpact>
) {
  const subject = `Résumé EcoEvent — ${values.eventName || "Événement"}`;
  const body = buildSummaryText(values, result);

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    body
  )}`;
}

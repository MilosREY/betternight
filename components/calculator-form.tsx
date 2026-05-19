"use client";

import { startTransition, useState } from "react";
import {
  calculateImpact,
  type CalculatorInputs,
  ENERGY_LEVEL_OPTIONS,
  EVENT_TYPE_OPTIONS,
  formatKg,
  formatPercent,
  TRANSPORT_MODE_OPTIONS
} from "@/lib/emissions";

const defaultValues: CalculatorInputs = {
  eventName: "Gala de printemps",
  eventType: "gala",
  city: "Lyon",
  participants: 450,
  avgRoundTripKm: 18,
  transportMode: "carpool",
  meatMeals: 260,
  vegetarianMeals: 150,
  snacks: 120,
  tshirts: 35,
  goodies: 180,
  disposableCups: 400,
  overnightStays: 0,
  energyLevel: "medium"
};

type NumberFieldKey =
  | "participants"
  | "avgRoundTripKm"
  | "meatMeals"
  | "vegetarianMeals"
  | "snacks"
  | "tshirts"
  | "goodies"
  | "disposableCups"
  | "overnightStays";

export function CalculatorForm() {
  const [values, setValues] = useState<CalculatorInputs>(defaultValues);
  const [result, setResult] = useState(() => calculateImpact(defaultValues));

  const updateTextField = <
    K extends Exclude<keyof CalculatorInputs, NumberFieldKey>
  >(
    key: K,
    value: CalculatorInputs[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const updateNumberField = (key: NumberFieldKey, value: string) => {
    setValues((current) => ({
      ...current,
      [key]: Number(value) >= 0 ? Number(value) : 0
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(() => {
      setResult(calculateImpact(values));
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="eyebrow">Calculateur</span>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.04em] text-ink">
              Simulez l’impact de votre événement
            </h2>
            <p className="mt-3 text-sm leading-6 text-mist sm:text-base">
              Renseignez vos hypothèses pour obtenir une estimation indicative,
              un top 3 des postes d’impact et des pistes d’action immédiates.
            </p>
          </div>
          <div className="hidden rounded-[24px] border border-mint/10 bg-mint/5 px-4 py-3 text-right sm:block">
            <p className="text-xs uppercase tracking-[0.18em] text-mist">
              Résultat instantané
            </p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {formatKg(result.totalKgCO2e)} kgCO2e
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Field label="Nom de l’événement">
            <input
              value={values.eventName}
              onChange={(event) => updateTextField("eventName", event.target.value)}
              className="input-base"
              placeholder="Ex. Gala de printemps"
            />
          </Field>

          <Field label="Type d’événement">
            <select
              value={values.eventType}
              onChange={(event) => updateTextField("eventType", event.target.value as CalculatorInputs["eventType"])}
              className="input-base"
            >
              {EVENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Ville">
            <input
              value={values.city}
              onChange={(event) => updateTextField("city", event.target.value)}
              className="input-base"
              placeholder="Ex. Lyon"
            />
          </Field>

          <Field label="Nombre de participants">
            <input
              type="number"
              min="0"
              value={values.participants}
              onChange={(event) => updateNumberField("participants", event.target.value)}
              className="input-base"
            />
          </Field>

          <Field label="Distance moyenne aller-retour par participant (km)">
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

          <Field label="Mode de transport principal">
            <select
              value={values.transportMode}
              onChange={(event) =>
                updateTextField("transportMode", event.target.value as CalculatorInputs["transportMode"])
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

          <Field label="Nombre de repas viande">
            <input
              type="number"
              min="0"
              value={values.meatMeals}
              onChange={(event) => updateNumberField("meatMeals", event.target.value)}
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

          <Field label="Nombre de snacks / repas légers">
            <input
              type="number"
              min="0"
              value={values.snacks}
              onChange={(event) => updateNumberField("snacks", event.target.value)}
              className="input-base"
            />
          </Field>

          <Field label="Nombre de t-shirts ou textiles">
            <input
              type="number"
              min="0"
              value={values.tshirts}
              onChange={(event) => updateNumberField("tshirts", event.target.value)}
              className="input-base"
            />
          </Field>

          <Field label="Nombre de goodies non textiles">
            <input
              type="number"
              min="0"
              value={values.goodies}
              onChange={(event) => updateNumberField("goodies", event.target.value)}
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

          <Field label="Niveau d’énergie">
            <select
              value={values.energyLevel}
              onChange={(event) =>
                updateTextField("energyLevel", event.target.value as CalculatorInputs["energyLevel"])
              }
              className="input-base"
            >
              {ENERGY_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="submit" className="button-primary">
            Calculer l’impact
          </button>
          <p className="text-sm text-mist">
            Estimation indicative, utile pour arbitrer vite avant l’événement.
          </p>
        </div>
      </form>

      <div className="space-y-6">
        <div className="glass-card p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              label="Impact total"
              value={`${formatKg(result.totalKgCO2e)} kgCO2e`}
            />
            <MetricCard
              label="Impact par participant"
              value={`${formatKg(result.impactPerParticipant)} kgCO2e`}
            />
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink">Répartition par poste</h3>
              <p className="text-sm text-mist">Transport, alimentation, matériel, hébergement, énergie</p>
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
                        {formatKg(item.kgCO2e)} kgCO2e · {formatPercent(item.share)} %
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
          <h3 className="text-lg font-semibold text-ink">Recommandations automatiques</h3>
          <div className="mt-5 space-y-3">
            {result.recommendations.map((recommendation) => (
              <div
                key={recommendation}
                className="rounded-[22px] border border-mint/10 bg-mint/5 px-5 py-4 text-sm leading-6 text-ink"
              >
                {recommendation}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      {children}
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

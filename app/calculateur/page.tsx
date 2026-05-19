import { CalculatorForm } from "@/components/calculator-form";
import { SectionHeading } from "@/components/section-heading";

export default function CalculatorPage() {
  return (
    <section className="section-space">
      <div className="page-shell">
        <SectionHeading
          eyebrow="Simulation"
          title="Un calculateur simple pour cadrer rapidement votre impact"
          description="Ce calculateur BetterNight donne une estimation pédagogique à partir de facteurs simplifiés. L’objectif est de repérer vos principaux postes d’impact et les leviers les plus faciles à activer avant l’événement."
        />

        <div className="mt-10">
          <CalculatorForm />
        </div>
      </div>
    </section>
  );
}

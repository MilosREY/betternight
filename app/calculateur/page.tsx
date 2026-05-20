import { CalculatorForm } from "@/components/calculator-form";
import { SectionHeading } from "@/components/section-heading";

export default function CalculatorPage() {
  return (
    <section className="section-space">
      <div className="page-shell">
        <SectionHeading
          eyebrow="Simulation"
          title="Un calculateur simple pour cadrer rapidement votre impact"
          description="Ce calculateur EcoEvent donne une estimation pédagogique à partir de facteurs simplifiés pour une soirée, un gala, une conférence, un séminaire, un événement sportif ou un événement étudiant."
        />

        <div className="mt-10">
          <CalculatorForm />
        </div>
      </div>
    </section>
  );
}

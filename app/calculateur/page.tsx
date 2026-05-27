import { CalculatorForm } from "@/components/calculator-form";
import { SectionHeading } from "@/components/section-heading";

export default function CalculatorPage() {
  return (
    <section className="section-space">
      <div className="page-shell">
        <SectionHeading
          eyebrow="Simulation"
          title="Un calculateur transparent pour cadrer rapidement votre impact"
          description="Des ordres de grandeur pédagogiques pour comprendre les principaux postes d’impact d’une soirée, d’un gala, d’une conférence, d’un séminaire ou d’un événement sportif."
        />

        <div className="mt-10">
          <CalculatorForm />
        </div>
      </div>
    </section>
  );
}

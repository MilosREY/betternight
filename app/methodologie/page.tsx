import { CalculatorMethodology } from "@/components/calculator-methodology";
import { SectionHeading } from "@/components/section-heading";

export default function MethodologyPage() {
  return (
    <section className="section-space">
      <div className="page-shell">
        <SectionHeading
          eyebrow="Références"
          title="Méthodologie de calcul"
          description="Une vue simple des hypothèses, des catégories suivies et des facteurs actuellement utilisés dans le calculateur."
        />

        <div className="mt-10">
          <CalculatorMethodology />
        </div>
      </div>
    </section>
  );
}

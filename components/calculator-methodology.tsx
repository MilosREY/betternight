import { methodologyFactorRows } from "@/lib/emission-factors";
import { formatFactorValue } from "@/lib/emissions";

export function CalculatorMethodology() {
  return (
    <section className="glass-card p-6 sm:p-8">
      <span className="eyebrow">Méthodologie</span>
      <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-ink">
        Méthodologie de calcul
      </h3>

      <p className="mt-4 text-sm leading-7 text-mist sm:text-base">
        EcoEvent utilise une méthode simple : donnée d’activité × facteur
        d’émission.
      </p>

      <div className="mt-6 rounded-[22px] border border-line bg-cloud/60 px-5 py-4 text-sm leading-7 text-ink">
        Exemple : 50 personnes × 20 km × 0,142 kgCO2e/km = 142 kgCO2e.
      </div>

      <p className="mt-6 text-sm leading-7 text-mist sm:text-base">
        Les résultats sont des ordres de grandeur pédagogiques. Ils ne
        constituent pas un Bilan Carbone® certifié.
      </p>

      <p className="mt-4 text-sm leading-7 text-mist sm:text-base">
        Les facteurs utilisés sont centralisés dans le code et documentés avec
        leur unité et leur source. Certains facteurs proviennent d’ordres de
        grandeur publics ADEME / Impact CO2, d’autres sont des hypothèses
        simplifiées à affiner.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          "Transport : distance × nombre de participants × facteur par mode",
          "Alimentation : nombre de repas × facteur par type de repas",
          "Matériel : textiles, goodies, gobelets et écocups",
          "Hébergement : nombre de nuitées",
          "Énergie : niveau technique estimé de l’événement"
        ].map((item) => (
          <div
            key={item}
            className="rounded-[22px] border border-line bg-white/90 px-5 py-4 text-sm leading-6 text-ink"
          >
            {item}
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h4 className="text-lg font-semibold text-ink">
          Facteurs actuellement utilisés
        </h4>
        <div className="mt-4 overflow-x-auto rounded-[24px] border border-line bg-white/90">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-cloud/60 text-mist">
              <tr>
                <th className="px-4 py-3 font-medium">Catégorie</th>
                <th className="px-4 py-3 font-medium">Facteur</th>
                <th className="px-4 py-3 font-medium">Valeur</th>
                <th className="px-4 py-3 font-medium">Unité</th>
                <th className="px-4 py-3 font-medium">Source courte</th>
              </tr>
            </thead>
            <tbody>
              {methodologyFactorRows.map((row) => (
                <tr key={`${row.category}-${row.factor}`} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3 font-medium text-ink">{row.category}</td>
                  <td className="px-4 py-3 text-ink">{row.factor}</td>
                  <td className="px-4 py-3 text-ink">
                    {formatFactorValue(row.value)}
                  </td>
                  <td className="px-4 py-3 text-mist">{row.unit}</td>
                  <td className="px-4 py-3 text-mist" title={row.source}>
                    {row.sourceShort}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

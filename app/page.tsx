import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";

const solutionSteps = [
  {
    step: "01",
    title: "Renseignez votre événement",
    description:
      "Type d’événement, participants, transport, repas, textile, goodies, énergie : l’essentiel pour cadrer l’impact."
  },
  {
    step: "02",
    title: "Identifiez les principaux postes d’impact",
    description:
      "EcoEvent met en évidence les arbitrages qui pèsent vraiment : transport, alimentation, matériel ou logistique."
  },
  {
    step: "03",
    title: "Recevez des recommandations concrètes",
    description:
      "Des actions activables avant l’événement, sans transformer votre orga en usine à gaz."
  }
];

const outputs = [
  "Estimation carbone indicative",
  "Top 3 des postes d’impact",
  "Recommandations concrètes",
  "Kit de communication école / sponsors",
  "Rapport pilote personnalisable"
];

export default function HomePage() {
  return (
    <>
      <section className="section-space">
        <div className="page-shell">
          <div className="glass-card overflow-hidden bg-hero-glow p-8 sm:p-10 lg:p-14">
            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <span className="eyebrow">Pour les BDE, BDS et assos étudiantes</span>
                <h1 className="display-title mt-6 max-w-4xl">
                  Des événements étudiants plus responsables, simplement.
                </h1>
                <p className="body-copy mt-6 max-w-3xl">
                  EcoEvent aide les BDE, BDS et associations étudiantes à
                  estimer l’impact carbone de leurs soirées, galas, WEI et
                  événements, puis à identifier des actions concrètes pour
                  réduire leur impact.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/calculateur" className="button-primary">
                    Tester le calculateur
                  </Link>
                  <Link href="/rapport-exemple" className="button-secondary">
                    Voir un exemple de rapport
                  </Link>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="metric-card">
                  <p className="text-sm text-mist">Exemple EcoEvent</p>
                  <p className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] text-ink">
                    5,8 tCO2e
                  </p>
                  <p className="mt-3 text-sm leading-6 text-mist">
                    Estimation d’un gala étudiant de 450 participants avec un
                    poste transport dominant.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="metric-card">
                    <p className="text-sm text-mist">Réduction potentielle</p>
                    <p className="mt-3 text-3xl font-semibold text-mint">-28 %</p>
                  </div>
                  <div className="metric-card">
                    <p className="text-sm text-mist">Temps de prise en main</p>
                    <p className="mt-3 text-3xl font-semibold text-sky">10 min</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="page-shell">
          <SectionHeading
            eyebrow="Le constat"
            title="Organiser un bel événement étudiant, c’est déjà arbitrer dans tous les sens."
            description="Les BDE veulent proposer des soirées, galas ou WEI marquants, tout en gérant le budget, l’image auprès de l’école, les déchets, le transport, les sponsors et une pression RSE de plus en plus visible. EcoEvent sert à objectiver rapidement ces arbitrages sans culpabiliser les équipes."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              "Budget serré et attentes élevées des participants",
              "Besoin de rassurer l’école et les partenaires",
              "Déchets, transport et logistique souvent sous-estimés",
              "Sponsors qui demandent des preuves concrètes",
              "Équipes étudiantes avec peu de temps et beaucoup à gérer",
              "Envie d’agir sans perdre l’énergie de l’événement"
            ].map((item) => (
              <div key={item} className="glass-card p-5 text-sm leading-6 text-ink">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="page-shell">
          <SectionHeading
            eyebrow="Méthode"
            title="Une solution simple en 3 étapes"
            description="L’idée n’est pas de transformer votre équipe en cabinet carbone, mais de vous donner une base claire pour décider vite et mieux."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {solutionSteps.map((item) => (
              <div key={item.step} className="glass-card p-7">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky">
                  {item.step}
                </p>
                <h3 className="mt-4 font-display text-2xl font-semibold tracking-[-0.03em] text-ink">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-mist">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="page-shell">
          <SectionHeading
            eyebrow="Livrables"
            title="Ce que vous obtenez"
            description="Des livrables utiles pour piloter votre événement, justifier vos choix et valoriser votre démarche auprès de l’école ou des sponsors."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {outputs.map((item, index) => (
              <div key={item} className="glass-card p-6">
                <p className="text-sm font-semibold text-sky">0{index + 1}</p>
                <h3 className="mt-5 text-lg font-semibold text-ink">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="page-shell">
          <div className="glass-card p-8 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <span className="eyebrow">Exemple</span>
                <h2 className="section-title mt-4">Gala étudiant — 450 participants</h2>
                <p className="body-copy mt-4">
                  Une prévisualisation du type de lecture qu’EcoEvent peut
                  fournir pour lancer une discussion utile avec l’école, les
                  partenaires et l’équipe orga.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="metric-card">
                  <p className="text-sm text-mist">Impact estimé</p>
                  <p className="mt-3 text-3xl font-semibold text-ink">5,8 tCO2e</p>
                </div>
                <div className="metric-card">
                  <p className="text-sm text-mist">Principal poste</p>
                  <p className="mt-3 text-3xl font-semibold text-ink">Transport</p>
                </div>
                <div className="metric-card">
                  <p className="text-sm text-mist">Réduction potentielle</p>
                  <p className="mt-3 text-3xl font-semibold text-mint">-28 %</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="page-shell">
          <div className="overflow-hidden rounded-[32px] bg-ink px-6 py-10 text-white shadow-float sm:px-10 sm:py-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <span className="eyebrow border-white/15 bg-white/10 text-white">
                  Appel à pilotes
                </span>
                <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  Je cherche 3 BDE ou associations étudiantes à Lyon pour tester
                  EcoEvent gratuitement sur un vrai événement.
                </h2>
              </div>

              <Link
                href="mailto:hello@ecoevent.fr?subject=Je%20veux%20devenir%20%C3%A9v%C3%A9nement%20pilote"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition-transform duration-200 hover:-translate-y-0.5"
              >
                Devenir événement pilote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

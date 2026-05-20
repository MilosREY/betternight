const breakdown = [
  { label: "Transport", share: 61, color: "from-sky to-sky/70" },
  { label: "Alimentation", share: 22, color: "from-mint to-mint/70" },
  { label: "Matériel", share: 9, color: "from-ink to-ink/70" },
  { label: "Énergie", share: 5, color: "from-sky/60 to-mint/60" },
  { label: "Déchets / logistique", share: 3, color: "from-ink/40 to-sky/50" }
];

const recommendations = [
  "Mettre en avant un plan covoiturage + transports en commun dans toute la communication participant.",
  "Concentrer l’événement sur un lieu plus accessible pour limiter la part transport.",
  "Renforcer l’offre végétarienne et passer une partie des repas en précommande.",
  "Supprimer les goodies à faible valeur perçue et basculer les textiles sur commande utile.",
  "Installer un système d’écocups consignés pour réduire les consommables jetables."
];

const reportUseCases = [
  "communication école",
  "sponsors",
  "amélioration de l’événement",
  "bilan post-event"
];

export default function SampleReportPage() {
  return (
    <section className="section-space">
      <div className="page-shell">
        <div className="mx-auto max-w-5xl">
          <div className="glass-card overflow-hidden">
            <div className="border-b border-line bg-gradient-to-r from-ink to-sky px-6 py-8 text-white sm:px-10">
              <p className="text-sm uppercase tracking-[0.18em] text-white/75">
                Exemple de rapport EcoEvent
              </p>
              <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Gala étudiant — 450 participants
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
                Une preview de rapport pensée pour aider un BDE à structurer sa
                communication, prioriser ses actions et partager un premier bilan
                lisible avec l’école ou les partenaires.
              </p>
            </div>

            <div className="p-6 sm:p-10">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="metric-card">
                  <p className="text-sm text-mist">Impact estimé</p>
                  <p className="mt-3 text-3xl font-semibold text-ink">5,8 tCO2e</p>
                </div>
                <div className="metric-card">
                  <p className="text-sm text-mist">Impact par participant</p>
                  <p className="mt-3 text-3xl font-semibold text-ink">12,9 kgCO2e</p>
                </div>
                <div className="metric-card">
                  <p className="text-sm text-mist">Poste principal</p>
                  <p className="mt-3 text-3xl font-semibold text-ink">Transport</p>
                </div>
                <div className="metric-card">
                  <p className="text-sm text-mist">Potentiel d’amélioration</p>
                  <p className="mt-3 text-3xl font-semibold text-mint">-28 %</p>
                </div>
              </div>

              <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.95fr]">
                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold text-ink">Répartition estimée</h2>
                  <div className="mt-6 space-y-4">
                    {breakdown.map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-ink">{item.label}</span>
                          <span className="text-mist">{item.share} %</span>
                        </div>
                        <div className="h-3 rounded-full bg-cloud">
                          <div
                            className={`h-3 rounded-full bg-gradient-to-r ${item.color}`}
                            style={{ width: `${item.share}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold text-ink">
                    5 recommandations prioritaires
                  </h2>
                  <div className="mt-6 space-y-3">
                    {recommendations.map((item, index) => (
                      <div
                        key={item}
                        className="rounded-[22px] border border-line bg-white/90 px-5 py-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky">
                          Priorité {index + 1}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-ink">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10 glass-card p-6">
                <h2 className="text-xl font-semibold text-ink">
                  Ce rapport peut servir à :
                </h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {reportUseCases.map((item) => (
                    <div
                      key={item}
                      className="rounded-[22px] border border-mint/10 bg-mint/5 px-5 py-5 text-center text-sm font-medium text-ink"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-[24px] border border-dashed border-line bg-cloud/70 px-5 py-4 text-sm leading-6 text-mist">
                EcoEvent fournit une estimation indicative et pédagogique. Cette estimation ne constitue pas un Bilan Carbone® certifié.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

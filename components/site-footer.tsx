import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white/70">
      <div className="page-shell flex flex-col gap-6 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="font-display text-lg font-semibold text-ink">BetterNight</p>
          <p className="mt-2 text-sm leading-6 text-mist">
            BetterNight fournit une estimation indicative et pédagogique. Cette
            estimation ne constitue pas un Bilan Carbone® certifié.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm text-mist sm:items-end">
          <Link href="mailto:hello@betternight.fr" className="font-medium text-ink">
            hello@betternight.fr
          </Link>
          <p>Pour les BDE, BDS et associations étudiantes qui veulent agir sans alourdir l’organisation.</p>
        </div>
      </div>
    </footer>
  );
}

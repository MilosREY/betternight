"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/calculateur", label: "Calculateur" },
  { href: "/rapport-exemple", label: "Rapport exemple" }
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="page-shell flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-mint to-sky text-lg font-bold text-white shadow-float">
            BN
          </span>
          <div>
            <p className="font-display text-lg font-semibold tracking-[-0.03em] text-ink">
              BetterNight
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-mist">
              Impact événementiel étudiant
            </p>
          </div>
        </Link>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <nav className="flex flex-wrap items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-ink text-white"
                    : "text-mist hover:bg-cloud hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
              );
            })}
          </nav>

          <Link href="/calculateur" className="button-primary w-full sm:w-auto">
            Tester gratuitement
          </Link>
        </div>
      </div>
    </header>
  );
}

import { Link } from "react-router";
import { chapters, groups } from "../data/nav";
import { LogoMark } from "./Header";

export default function Footer() {
  return (
    <footer className="relative mt-10 overflow-hidden border-t border-line bg-bg-2 no-print">
      <div className="wrap py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark size={36} />
              <span className="font-display text-2xl">Atlas do Café</span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-2">
              Um guia aberto e visual sobre o café — da botânica ao mercado global —, construído com dados públicos da USDA, OIC, Conab, Banco
              Mundial, ABIC, Cecafé e literatura científica revisada por pares.
            </p>
            <p className="mt-4 text-xs text-ink-3">Dados atualizados até outubro de 2026. Conteúdo educativo; não constitui recomendação médica ou de investimento.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {groups.map((g) => (
              <div key={g.id}>
                <p className="kicker mb-3">{g.label}</p>
                <ul className="space-y-2">
                  {chapters
                    .filter((c) => c.group === g.id)
                    .map((c) => (
                      <li key={c.path}>
                        <Link to={c.path} className="text-sm text-ink-2 transition-colors hover:text-ink">
                          {c.short}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pointer-events-none select-none overflow-hidden border-t border-line" aria-hidden>
        <p className="display translate-y-[18%] whitespace-nowrap text-center text-[19vw] leading-none text-surface-3">café</p>
      </div>
    </footer>
  );
}

import { ExternalLink } from "lucide-react";
import { PageHero, Reveal, Section, NextChapter } from "../components/ui";
import { sources } from "../data/sources";

const method = [
  { t: "Sacas de 60 kg", d: "Unidade padrão do mercado. 1 saca = 60 kg de café verde = 132,28 lb. Café torrado é convertido para equivalente verde × 1,19; solúvel × 2,6 (USDA)." },
  { t: "Anos-safra", d: "A USDA usa o ano comercial de cada país (Brasil: julho–junho; Colômbia: outubro–setembro; Indonésia: abril–março). A OIC converte tudo para o ano-cafeeiro de outubro a setembro — por isso os totais diferem." },
  { t: "Consumo per capita", d: "Calculado pelo Atlas: consumo doméstico da USDA (2025/26) × 60 kg ÷ população estimada de 2025 (ONU, Eurostat, IBGE). Para a UE, usa-se a média do bloco. Rankings populares (como os ~12 kg da Finlândia) vêm de outras bases e anos." },
  { t: "Preços", d: "Séries do Banco Mundial (Pink Sheet): indicadores OIC de 'outros suaves' (arábica) e 'robustas', em US$/kg, nominais e em dólares constantes de 2010. Conversão para US¢/lb: ÷ 2,20462 × 100." },
  { t: "Xícaras por dia", d: "Estimativa do Atlas: consumo OIC 2025/26 (180,6 mi sacas = 10,8 mi t de café verde) ÷ 1,19 ≈ 9,1 mi t de torrado por ano (~25 mil t/dia) ÷ 10 g por xícara ≈ 2,5 bilhões de xícaras por dia." },
  { t: "Ilustrações e modelos", d: "Ilustrações são originais. O simulador climático, a curva de torra e o modelo de cafeína são simplificações didáticas, explicitadas em cada capítulo." },
];

export default function Fontes() {
  const groups = Array.from(new Set(sources.map((s) => s.group)));
  return (
    <>
      <PageHero
        path="/fontes"
        title={
          <>
            Fontes <span className="italic text-ink-2">&</span> método
          </>
        }
        lead="O Atlas foi construído com dados públicos de órgãos oficiais e literatura científica revisada por pares. Os números de mercado refletem as publicações disponíveis até outubro de 2026."
      />
      <Section kicker="Referências" title={`${sources.length} fontes consultadas`} tight>
        <div className="space-y-12">
          {groups.map((g) => (
            <div key={g}>
              <h3 className="mb-4 border-b border-line pb-3 font-display text-2xl">{g}</h3>
              <ul className="grid gap-3 md:grid-cols-2">
                {sources
                  .filter((s) => s.group === g)
                  .map((s, i) => (
                    <Reveal key={s.title} delay={(i % 2) * 0.04} as="li">
                      <a href={s.url} target="_blank" rel="noreferrer noopener" className="card card-hover group flex h-full flex-col p-5">
                        <span className="flex items-start justify-between gap-3">
                          <span className="font-semibold leading-snug text-ink">{s.title}</span>
                          <ExternalLink size={15} className="mt-1 shrink-0 text-ink-3 transition-colors group-hover:text-accent" />
                        </span>
                        <span className="mt-1 text-sm text-ink-3">
                          {s.org} · {s.year}
                        </span>
                        <span className="mt-3 text-sm text-ink-2">{s.used}</span>
                      </a>
                    </Reveal>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
      <Section kicker="Metodologia" title="Notas de método">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {method.map((m, i) => (
            <Reveal key={m.t} delay={(i % 3) * 0.05}>
              <div className="card h-full p-6">
                <h3 className="font-display text-2xl">{m.t}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{m.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
      <NextChapter path="/fontes" />
    </>
  );
}

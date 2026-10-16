import { motion } from "motion/react";
import { Check, CloudSun, Dna, Droplets, Leaf, Recycle, Sprout, Thermometer, TreePine, Users, Handshake, FlaskConical } from "lucide-react";
import { PageHero, Reveal, Section, NextChapter, SourceNote, ChartCard, Callout, Stat } from "../components/ui";
import BarList from "../components/charts/BarList";
import { useLocalState } from "../lib/hooks";

function HeatCard() {
  return (
    <div className="card relative overflow-hidden p-8">
      <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent opacity-20 blur-3xl" />
      <Thermometer className="text-accent" size={28} />
      <p className="display mt-4 text-8xl leading-none">+47</p>
      <p className="mt-3 text-lg text-ink">dias por ano acima de 30 °C</p>
      <p className="mt-2 text-sm text-ink-2">em média, nos 25 países que produzem 97% do café, por causa da mudança climática (2021–2025).</p>
      <p className="mt-4 text-xs text-ink-3">Climate Central, fevereiro de 2026</p>
    </div>
  );
}

const heatRows = [
  { id: "sv", label: "El Salvador", v: 99 },
  { id: "ni", label: "Nicarágua", v: 77 },
  { id: "th", label: "Tailândia", v: 75 },
  { id: "top5", label: "Média dos 5 maiores produtores", v: 57 },
  { id: "all", label: "Média dos 25 países", v: 47 },
];

const eudr = [
  { date: "Jun 2023", title: "Regulamento aprovado", text: "A UE adota o Regulamento 2023/1115 contra o desmatamento (EUDR), que inclui café, cacau, soja, gado, óleo de palma, madeira e borracha." },
  { date: "Dez 2024 → 2025", title: "Primeiro adiamento", text: "A aplicação, prevista para 30/12/2024, é adiada em um ano." },
  { date: "Dez 2025", title: "Segundo adiamento", text: "O Regulamento 2025/2650 adia de novo, citando problemas de TI e custo administrativo." },
  { date: "30 dez 2026", title: "Vale para médias e grandes empresas", text: "Café vendido na UE precisa provar que não veio de área desmatada após 31/12/2020, com geolocalização das fazendas.", highlight: true },
  { date: "30 jun 2027", title: "Micro e pequenas empresas", text: "Prazo estendido para os operadores menores." },
  { date: "30 dez 2027", title: "Café solúvel entra no escopo", text: "Produtos recém-incluídos, como o solúvel, passam a ser cobertos." },
];

const solutions = [
  { icon: TreePine, t: "Agroflorestas", d: "Árvores de sombra reduzem a temperatura sob a copa, protegem o solo, guardam carbono e abrigam aves e polinizadores." },
  { icon: Dna, t: "Novas variedades", d: "Híbridos F1, variedades resistentes à ferrugem e à seca e programas de melhoramento participativo." },
  { icon: Leaf, t: "Outras espécies", d: "Robusta de qualidade, libérica, excelsa e a redescoberta stenophylla, que tolera calor bem maior que o arábica." },
  { icon: Droplets, t: "Água bem usada", d: "Gotejamento, despolpadores ecológicos que usam pouca água e tratamento das águas residuárias do processamento." },
  { icon: Sprout, t: "Agricultura regenerativa", d: "Cobertura do solo, adubação orgânica, bioinsumos e manejo integrado de pragas." },
  { icon: Handshake, t: "Renda justa", d: "Preços mínimos, prêmios de qualidade, contratos de longo prazo e transparência na cadeia." },
];

const circular = [
  { t: "Casca → cascara", d: "A casca seca vira uma infusão frutada (cascara), farinha ou adubo." },
  { t: "Casca → energia", d: "Queimada nas fornalhas, a casca aquece os secadores da própria fazenda." },
  { t: "Borra → cogumelos", d: "A borra de café é um ótimo substrato para cultivar shimeji e shiitake." },
  { t: "Borra → adubo e biocombustível", d: "Compostada, fertiliza o solo; seus óleos podem virar biodiesel e pellets." },
];

const actions = [
  "Prefira cafés com origem rastreável (fazenda, cooperativa ou região).",
  "Valorize certificações e torrefações que pagam prêmios ao produtor.",
  "Compre a quantidade certa e guarde bem, para não desperdiçar.",
  "Use a borra como adubo ou no composto.",
  "Leve sua própria caneca para a cafeteria.",
  "Experimente robustas de qualidade e espécies alternativas.",
];

function Checklist() {
  const [done, setDone] = useLocalState<number[]>("atlas-checklist", []);
  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-baseline justify-between">
        <p className="kicker">O que você pode fazer</p>
        <span className="text-sm text-ink-3">
          {done.length}/{actions.length}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3">
        <motion.div className="h-full rounded-full bg-leaf" animate={{ width: `${(done.length / actions.length) * 100}%` }} />
      </div>
      <ul className="mt-5 space-y-2">
        {actions.map((a, i) => {
          const on = done.includes(i);
          return (
            <li key={a}>
              <button
                type="button"
                onClick={() => setDone((d) => (on ? d.filter((x) => x !== i) : [...d, i]))}
                className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors ${on ? "bg-leaf-soft" : "hover:bg-surface-2"}`}
                aria-pressed={on}
              >
                <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border ${on ? "border-leaf bg-leaf text-bg" : "border-line-strong"}`}>{on && <Check size={13} />}</span>
                <span className={`text-sm ${on ? "text-ink" : "text-ink-2"}`}>{a}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Sustentabilidade() {
  return (
    <>
      <PageHero
        path="/sustentabilidade"
        title={
          <>
            O futuro <span className="italic text-ink-2">do</span> café
          </>
        }
        lead="Calor extremo, espécies silvestres ameaçadas, produtores pobres e pressão sobre florestas: o café enfrenta desafios enormes — e também uma onda de inovação na ciência, no campo e no mercado."
        aside={<HeatCard />}
      />

      <Section kicker="Clima" title="Um cinturão cada vez mais quente">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Reveal className="space-y-8">
            <Stat value={50} suffix="%" label="da área apta ao café pode ser perdida até 2050" note="Bunn et al., Climatic Change (2015) — faixa dos modelos: 20% a 85%" big />
            <Stat value={80} suffix="%" label="dos produtores são pequenos agricultores" note="que receberam só 0,36% do financiamento de adaptação necessário em 2021 (Climate Central)" big />
            <p className="text-sm leading-relaxed text-ink-2">
              Áreas quentes e baixas — como o norte de Minas, partes da Índia e a Nicarágua — são as mais vulneráveis. Terras altas equatoriais resistem melhor, mas também perdem
              aptidão. O arábica sofre mais: acima de ~30 °C, a fotossíntese cai, os frutos amadurecem rápido demais e pragas como a broca se multiplicam.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <ChartCard title="Dias extras de calor nocivo ao café por ano" subtitle="Dias acima de 30 °C atribuídos à mudança climática, média 2021–2025 · Climate Central (2026)">
              <BarList rows={heatRows.map((r) => ({ id: r.id, label: r.label, values: { v: r.v } }))} keys={[{ key: "v", label: "Dias", color: "var(--s1)" }]} format={(v) => `+${v}`} labelWidth={230} ariaLabel="Dias extras de calor por país" />
              <SourceNote>Os cinco maiores produtores (Brasil, Vietnã, Colômbia, Etiópia e Indonésia) respondem por 75% do café mundial.</SourceNote>
            </ChartCard>
          </Reveal>
        </div>
      </Section>

      <Section kicker="Biodiversidade" title="Os parentes silvestres estão desaparecendo">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="grid grid-cols-10 gap-1.5" role="img" aria-label="75 de 124 espécies de café silvestre ameaçadas">
              {Array.from({ length: 124 }, (_, i) => {
                const cat = i < 13 ? "cr" : i < 53 ? "en" : i < 75 ? "vu" : i < 110 ? "ok" : "dd";
                const color = { cr: "var(--s1)", en: "var(--s3)", vu: "var(--seq-3)", ok: "var(--s5)", dd: "var(--surface-3)" }[cat];
                return (
                  <motion.span
                    key={i}
                    className="aspect-square rounded-full"
                    style={{ background: color }}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.006, type: "spring", stiffness: 300, damping: 20 }}
                  />
                );
              })}
            </div>
            <ul className="mt-5 grid grid-cols-2 gap-2 text-sm text-ink-2 sm:grid-cols-3">
              {[
                ["var(--s1)", "Criticamente em perigo (13)"],
                ["var(--s3)", "Em perigo (40)"],
                ["var(--seq-3)", "Vulnerável (22)"],
                ["var(--s5)", "Não ameaçada (35)"],
                ["var(--surface-3)", "Dados insuficientes (14)"],
              ].map(([c, l]) => (
                <li key={l} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: c }} />
                  {l}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.08} className="prose-atlas">
            <p>
              Em 2019, pesquisadores do Royal Botanic Gardens, Kew, avaliaram as <strong>124 espécies</strong> de café conhecidas: <strong>75 (60%) estavam ameaçadas</strong> de
              extinção, pela perda de florestas, mudança climática e pragas. Cerca de 28% delas não ocorrem em nenhuma área protegida.
            </p>
            <p>
              Esses parentes silvestres guardam genes de resistência a doenças, a seca e ao calor — um seguro de vida para o café cultivado, que tem diversidade genética muito
              baixa. Hoje, 133 espécies são reconhecidas.
            </p>
            <SourceNote>Davis et al., Science Advances (2019); Davis et al., Nature Plants (2025).</SourceNote>
          </Reveal>
        </div>
      </Section>

      <Section kicker="Pessoas" title="Quem planta o café do mundo">
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-3">
          <Reveal>
            <Stat value={12.5} digits={1} suffix=" mi" label="de fazendas que vendem café" note="Enveritas" />
          </Reveal>
          <Reveal delay={0.06}>
            <Stat value={95} suffix="%" label="têm menos de 5 hectares" note="Enveritas" />
          </Reveal>
          <Reveal delay={0.12}>
            <Stat value={60} suffix="%" label="do café mundial vem dessas pequenas fazendas" note="Enveritas" />
          </Reveal>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Callout title="Preço volátil, renda instável" tone="accent">
            Recordes de preço como os de 2025 nem sempre chegam ao produtor, e as quedas — como a de 2026 — chegam rápido. Muitos vivem abaixo da linha de renda digna.
          </Callout>
          <Callout title="Trabalho" tone="gold">
            A colheita manual depende de mão de obra temporária. Auditorias, certificações e a fiscalização buscam combater trabalho infantil e condições análogas à escravidão.
          </Callout>
          <Callout title="Mulheres no café" tone="leaf">
            Mulheres realizam grande parte do trabalho no campo, mas costumam ter menos acesso a terra, crédito e assistência técnica.
          </Callout>
        </div>
      </Section>

      <Section kicker="Florestas" title="EUDR: a lei europeia contra o desmatamento" intro="A União Europeia é o maior mercado de café do mundo. A partir do fim de 2026, só poderá entrar no bloco café comprovadamente livre de desmatamento.">
        <ol className="relative grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {eudr.map((e, i) => (
            <Reveal key={e.title} delay={i * 0.06} as="li">
              <div className={`card h-full p-5 ${e.highlight ? "ring-2 ring-accent" : ""}`}>
                <p className={`font-mono text-xs ${e.highlight ? "text-accent" : "text-ink-3"}`}>{e.date}</p>
                <p className="mt-2 font-display text-xl leading-tight">{e.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{e.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
        <SourceNote>Regulamentos (UE) 2023/1115 e 2025/2650; revisão de simplificação da Comissão Europeia (maio de 2026). Datas sujeitas a mudanças legislativas.</SourceNote>
      </Section>

      <Section kicker="Soluções" title="Como o café pode ter futuro">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.t} delay={(i % 3) * 0.06}>
                <div className="card h-full p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-leaf-soft text-leaf">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-4 font-display text-2xl">{s.t}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{s.d}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <div className="card p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <Recycle className="text-leaf" size={22} />
                <p className="font-display text-2xl">Economia circular</p>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {circular.map((c) => (
                  <div key={c.t} className="rounded-2xl bg-surface-2 p-4">
                    <p className="font-semibold text-ink">{c.t}</p>
                    <p className="mt-1 text-sm text-ink-2">{c.d}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-4 border-t border-line pt-5 text-sm text-ink-2">
                <span className="flex items-center gap-2">
                  <CloudSun size={16} className="text-gold" /> Sombra reduz a temperatura da folha
                </span>
                <span className="flex items-center gap-2">
                  <FlaskConical size={16} className="text-s2" /> Bioinsumos substituem químicos
                </span>
                <span className="flex items-center gap-2">
                  <Users size={16} className="text-accent" /> Cooperativas dão escala aos pequenos
                </span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <Checklist />
          </Reveal>
        </div>
      </Section>

      <NextChapter path="/sustentabilidade" />
    </>
  );
}

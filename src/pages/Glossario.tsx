import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowUpRight, Search } from "lucide-react";
import { PageHero, NextChapter } from "../components/ui";
import { glossary } from "../data/glossary";
import { chapterByPath } from "../data/nav";
import { norm } from "../lib/format";
import { scrollToEl } from "../lib/smooth";

const slug = (t: string) => `termo-${norm(t).replace(/[^a-z0-9]+/g, "-")}`;

export default function Glossario() {
  const [params] = useSearchParams();
  const focus = params.get("termo");
  const [q, setQ] = useState("");
  const [letter, setLetter] = useState<string | null>(null);

  const sorted = useMemo(() => [...glossary].sort((a, b) => a.term.localeCompare(b.term, "pt-BR")), []);
  const letters = useMemo(() => Array.from(new Set(sorted.map((g) => norm(g.term)[0].toUpperCase()))), [sorted]);
  const list = sorted.filter((g) => {
    const n = norm(q);
    const okQ = !n || norm(`${g.term} ${g.en ?? ""} ${g.def}`).includes(n);
    const okL = !letter || norm(g.term)[0].toUpperCase() === letter;
    return okQ && okL;
  });

  useEffect(() => {
    if (!focus) return;
    const t = window.setTimeout(() => scrollToEl(document.getElementById(slug(focus)), -160), 450);
    return () => window.clearTimeout(t);
  }, [focus]);

  return (
    <>
      <PageHero
        path="/glossario"
        title={
          <>
            O dicionário <span className="italic text-ink-2">do</span> café
          </>
        }
        lead={`${glossary.length} termos — do agronômico ao sensorial, do mercado à cafeteria — com links para os capítulos onde cada assunto é explicado em detalhe.`}
      />
      <section className="pb-20">
        <div className="wrap">
          <div className="sticky top-[76px] z-20 -mx-2 mb-8 rounded-[22px] border border-line p-3 glass">
            <label className="flex h-12 items-center gap-3 rounded-full bg-surface px-4">
              <Search size={18} className="text-ink-3" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar termo, tradução ou definição…" className="h-full flex-1 bg-transparent outline-none placeholder:text-ink-3" aria-label="Buscar no glossário" />
              {q && (
                <button type="button" onClick={() => setQ("")} className="text-sm text-ink-3 hover:text-ink">
                  limpar
                </button>
              )}
            </label>
            <div className="scroll-x mt-3 flex gap-1 pb-1" data-lenis-prevent-wheel>
              <button type="button" className="chip px-3! py-1! text-xs!" aria-pressed={!letter} onClick={() => setLetter(null)}>
                Todas
              </button>
              {letters.map((l) => (
                <button key={l} type="button" className="chip px-2.5! py-1! text-xs!" aria-pressed={letter === l} onClick={() => setLetter(letter === l ? null : l)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <p className="mb-5 text-sm text-ink-3">{list.length} termos</p>
          <motion.div layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false}>
              {list.map((g) => {
                const ch = g.link ? chapterByPath(g.link) : undefined;
                const isFocus = !!focus && norm(focus) === norm(g.term);
                return (
                  <motion.article
                    key={g.term}
                    id={slug(g.term)}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25 }}
                    className={`card flex flex-col p-5 ${isFocus ? "ring-2 ring-accent" : ""}`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-2xl leading-tight">{g.term}</h3>
                      {g.en && <span className="text-xs italic text-ink-3">{g.en}</span>}
                    </div>
                    <p className="mt-2 flex-1 text-[0.93rem] leading-relaxed text-ink-2">{g.def}</p>
                    {ch && (
                      <Link to={ch.path} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-ink-3 hover:text-accent">
                        {ch.title} <ArrowUpRight size={13} />
                      </Link>
                    )}
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
          {list.length === 0 && <p className="py-16 text-center text-ink-3">Nenhum termo encontrado.</p>}
        </div>
      </section>
      <NextChapter path="/glossario" />
    </>
  );
}

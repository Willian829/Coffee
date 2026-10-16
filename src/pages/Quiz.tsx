import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Award, Check, RotateCcw, X, ArrowRight } from "lucide-react";
import { PageHero, NextChapter } from "../components/ui";
import { questions, type Question } from "../data/quiz";
import { useLocalState } from "../lib/hooks";

const ROUND = 10;

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

type Prepared = Question & { order: number[] };
const prepare = (): Prepared[] => shuffle(questions).slice(0, ROUND).map((q) => ({ ...q, order: shuffle(q.options.map((_, i) => i)) }));

const verdicts = [
  { min: 10, t: "Mestre de torra!", d: "Gabaritou. Você poderia escrever este Atlas." },
  { min: 8, t: "Q Grader em formação", d: "Conhecimento de quem já provou muitos cafés." },
  { min: 6, t: "Barista de respeito", d: "Mandou bem — dá para afinar em alguns capítulos." },
  { min: 4, t: "Apreciador curioso", d: "Bom começo! Que tal reler os capítulos e tentar de novo?" },
  { min: 0, t: "Café com leite", d: "Todo mundo começa em algum lugar. O Atlas está aqui para isso." },
];

export default function Quiz() {
  const [round, setRound] = useState<Prepared[]>(prepare);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useLocalState<number>("atlas-quiz-best", 0);
  const finished = i >= round.length;
  const q = round[Math.min(i, round.length - 1)];
  const verdict = useMemo(() => verdicts.find((v) => score >= v.min)!, [score]);

  const choose = (opt: number) => {
    if (picked != null) return;
    setPicked(opt);
    if (opt === q.answer) setScore((s) => s + 1);
  };
  const next = () => {
    if (i + 1 >= round.length) {
      setBest((b) => Math.max(b, score));
    }
    setI((x) => x + 1);
    setPicked(null);
  };
  const restart = () => {
    setRound(prepare());
    setI(0);
    setScore(0);
    setPicked(null);
  };

  return (
    <>
      <PageHero
        path="/quiz"
        title={
          <>
            Quanto você <span className="italic text-ink-2">sabe</span> de café?
          </>
        }
        lead={`${ROUND} perguntas sorteadas de um banco de ${questions.length}, cobrindo todos os capítulos do Atlas. Cada resposta vem com uma explicação.`}
      />
      <section className="overflow-x-clip pb-24">
        <div className="wrap-narrow">
          <div className="mb-5 flex items-center justify-between text-sm text-ink-3">
            <span>
              {finished ? "Resultado" : `Pergunta ${i + 1} de ${round.length}`} · {score} acerto{score === 1 ? "" : "s"}
            </span>
            <span>Recorde: {best}/{ROUND}</span>
          </div>
          <div className="mb-8 flex gap-1">
            {round.map((_, k) => (
              <span key={k} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${k < i ? "bg-accent" : k === i && !finished ? "bg-ink-3" : "bg-surface-3"}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {!finished ? (
              <motion.div key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="card p-6 sm:p-10">
                <p className="kicker text-accent">{q.topic}</p>
                <h2 className="mt-3 text-balance text-[clamp(1.6rem,3.6vw,2.4rem)]">{q.q}</h2>
                <div className="mt-8 grid gap-3">
                  {q.order.map((oi) => {
                    const isAnswer = oi === q.answer;
                    const isPicked = oi === picked;
                    const state = picked == null ? "idle" : isAnswer ? "right" : isPicked ? "wrong" : "dim";
                    return (
                      <motion.button
                        key={oi}
                        type="button"
                        onClick={() => choose(oi)}
                        disabled={picked != null}
                        whileTap={{ scale: picked == null ? 0.98 : 1 }}
                        animate={state === "wrong" ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                        className={`flex items-center justify-between gap-4 rounded-2xl border p-4 text-left text-[1.02rem] transition-colors ${
                          state === "right"
                            ? "border-leaf bg-leaf-soft text-ink"
                            : state === "wrong"
                              ? "border-accent bg-accent-soft text-ink"
                              : state === "dim"
                                ? "border-line text-ink-3"
                                : "border-line bg-surface hover:border-line-strong hover:bg-surface-2"
                        }`}
                      >
                        {q.options[oi]}
                        {state === "right" && <Check size={18} className="shrink-0 text-leaf" />}
                        {state === "wrong" && <X size={18} className="shrink-0 text-accent" />}
                      </motion.button>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {picked != null && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                      <p className={`mt-6 font-semibold ${picked === q.answer ? "text-leaf" : "text-accent"}`}>{picked === q.answer ? "Isso mesmo!" : "Não foi dessa vez."}</p>
                      <p className="mt-1 text-ink-2">{q.explain}</p>
                      <button type="button" onClick={next} className="btn btn-primary mt-6">
                        {i + 1 >= round.length ? "Ver resultado" : "Próxima pergunta"} <ArrowRight size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="card p-8 text-center sm:p-14">
                <motion.span initial={{ rotate: -20, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-accent text-on-accent">
                  <Award size={36} />
                </motion.span>
                <p className="display mt-6 text-7xl">
                  {score}
                  <span className="text-3xl text-ink-3">/{round.length}</span>
                </p>
                <p className="mt-3 font-display text-3xl">{verdict.t}</p>
                <p className="mt-2 text-ink-2">{verdict.d}</p>
                <button type="button" onClick={restart} className="btn btn-primary mt-8">
                  <RotateCcw size={16} /> Jogar de novo
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      <NextChapter path="/quiz" />
    </>
  );
}

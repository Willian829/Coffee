import { AnimatePresence, motion } from "motion/react";
import Fuse from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { BookOpen, CornerDownLeft, Globe2, Leaf, ScrollText, Search, Coffee, type LucideIcon } from "lucide-react";
import { chapters } from "../data/nav";
import { countryProfiles } from "../data/countries";
import { glossary } from "../data/glossary";
import { varieties } from "../data/botany";
import { timeline } from "../data/history";
import { brewMethods } from "../data/brew";
import { stopScroll } from "../lib/smooth";

type Item = { id: string; kind: string; title: string; subtitle: string; to: string; icon: LucideIcon; keywords?: string };

const buildIndex = (): Item[] => [
  ...chapters.map((c) => ({ id: `c-${c.path}`, kind: "Capítulo", title: c.title, subtitle: c.description, to: c.path, icon: c.icon })),
  ...countryProfiles.map((c) => ({
    id: `p-${c.iso}`,
    kind: "País",
    title: c.name,
    subtitle: `${c.species} · ${c.regions.slice(0, 3).join(", ")}`,
    to: `/mundo?pais=${c.iso}`,
    icon: Globe2,
    keywords: c.regions.join(" "),
  })),
  ...varieties.map((v) => ({
    id: `v-${v.name}`,
    kind: "Variedade",
    title: v.name,
    subtitle: `${v.lineage} · ${v.origin}`,
    to: `/botanica?variedade=${encodeURIComponent(v.name)}`,
    icon: Leaf,
  })),
  ...brewMethods.map((b) => ({
    id: `b-${b.id}`,
    kind: "Preparo",
    title: b.name,
    subtitle: `Proporção ${b.ratioRange} · moagem ${b.grind.toLowerCase()}`,
    to: `/preparo?metodo=${b.id}`,
    icon: Coffee,
  })),
  ...timeline.map((t) => ({
    id: `h-${t.sort}-${t.title}`,
    kind: "História",
    title: t.title,
    subtitle: `${t.year} · ${t.text.slice(0, 80)}…`,
    to: `/historia`,
    icon: ScrollText,
  })),
  ...glossary.map((g) => ({
    id: `g-${g.term}`,
    kind: "Glossário",
    title: g.term,
    subtitle: g.def,
    to: `/glossario?termo=${encodeURIComponent(g.term)}`,
    icon: BookOpen,
    keywords: g.en,
  })),
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();

  const items = useMemo(buildIndex, []);
  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: [
          { name: "title", weight: 3 },
          { name: "keywords", weight: 1.5 },
          { name: "subtitle", weight: 1 },
          { name: "kind", weight: 0.5 },
        ],
        threshold: 0.36,
        ignoreLocation: true,
        ignoreDiacritics: true,
      }),
    [items],
  );

  const results = useMemo(() => {
    if (!q.trim()) return items.filter((i) => i.kind === "Capítulo");
    // agrupa por tipo, mantendo a ordem de relevância do primeiro item de cada grupo
    const found = fuse.search(q.trim(), { limit: 30 }).map((r) => r.item);
    const order: string[] = [];
    const byKind = new Map<string, Item[]>();
    found.forEach((it) => {
      if (!byKind.has(it.kind)) {
        byKind.set(it.kind, []);
        order.push(it.kind);
      }
      byKind.get(it.kind)!.push(it);
    });
    return order.flatMap((k) => byKind.get(k)!);
  }, [q, fuse, items]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/" && !typing && !open) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("atlas:search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("atlas:search", onOpen);
    };
  }, [open]);

  useEffect(() => {
    stopScroll(open);
    if (open) {
      setQ("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setActive(0), [q]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (item: Item | undefined) => {
    if (!item) return;
    setOpen(false);
    navigate(item.to);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Buscar no Atlas"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="card relative w-full max-w-2xl overflow-hidden shadow-lift"
            style={{ background: "var(--surface)" }}
          >
            <div className="flex items-center gap-3 border-b border-line px-5">
              <Search size={18} className="text-ink-3" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Busque países, variedades, métodos, termos…"
                className="h-16 flex-1 bg-transparent text-[1.05rem] text-ink outline-none placeholder:text-ink-3"
                aria-label="Termo de busca"
                aria-controls="atlas-search-results"
                aria-activedescendant={results[active] ? `opt-${results[active].id}` : undefined}
              />
              <kbd className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[0.68rem] text-ink-3">Esc</kbd>
            </div>
            <ul ref={listRef} id="atlas-search-results" role="listbox" className="max-h-[56vh] overflow-y-auto p-2" data-lenis-prevent>
              {results.length === 0 && <li className="px-4 py-10 text-center text-ink-3">Nada encontrado para “{q}”.</li>}
              {results.map((r, i) => {
                const Icon = r.icon;
                const showKind = i === 0 || results[i - 1].kind !== r.kind;
                return (
                  <li key={r.id}>
                    {showKind && <p className="kicker px-3 pb-1.5 pt-3">{r.kind}</p>}
                    <button
                      type="button"
                      id={`opt-${r.id}`}
                      role="option"
                      aria-selected={i === active}
                      data-idx={i}
                      onMouseMove={() => setActive(i)}
                      onClick={() => go(r)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${i === active ? "bg-surface-2" : ""}`}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.95rem] font-medium text-ink">{r.title}</span>
                        <span className="block truncate text-[0.8rem] text-ink-3">{r.subtitle}</span>
                      </span>
                      {i === active && <CornerDownLeft size={15} className="shrink-0 text-ink-3" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center gap-4 border-t border-line px-5 py-2.5 text-[0.72rem] text-ink-3">
              <span>↑↓ navegar</span>
              <span>↵ abrir</span>
              <span className="ml-auto">{items.length} itens indexados</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

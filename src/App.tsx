import { MotionConfig, motion } from "motion/react";
import { lazy, Suspense, useEffect, useLayoutEffect } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CommandPalette from "./components/CommandPalette";
import { chapters } from "./data/nav";
import { initSmoothScroll, scrollToTop } from "./lib/smooth";

const pageLoaders = {
  Historia: () => import("./pages/Historia"),
  Botanica: () => import("./pages/Botanica"),
  Cultivo: () => import("./pages/Cultivo"),
  Colheita: () => import("./pages/Colheita"),
  Processamento: () => import("./pages/Processamento"),
  Mundo: () => import("./pages/Mundo"),
  Brasil: () => import("./pages/Brasil"),
  Mercado: () => import("./pages/Mercado"),
  Torra: () => import("./pages/Torra"),
  Preparo: () => import("./pages/Preparo"),
  Sabor: () => import("./pages/Sabor"),
  Cultura: () => import("./pages/Cultura"),
  Saude: () => import("./pages/Saude"),
  Sustentabilidade: () => import("./pages/Sustentabilidade"),
  Glossario: () => import("./pages/Glossario"),
  Quiz: () => import("./pages/Quiz"),
  Fontes: () => import("./pages/Fontes"),
};

/** Pré-carrega os capítulos em segundo plano para a navegação ficar instantânea. */
function prefetchPages() {
  const run = () => Object.values(pageLoaders).forEach((load, i) => window.setTimeout(() => void load(), i * 120));
  const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(run);
  else setTimeout(run, 1500);
}

const Home = lazy(() => import("./pages/Home"));
const Historia = lazy(pageLoaders.Historia);
const Botanica = lazy(pageLoaders.Botanica);
const Cultivo = lazy(pageLoaders.Cultivo);
const Colheita = lazy(pageLoaders.Colheita);
const Processamento = lazy(pageLoaders.Processamento);
const Mundo = lazy(pageLoaders.Mundo);
const Brasil = lazy(pageLoaders.Brasil);
const Mercado = lazy(pageLoaders.Mercado);
const Torra = lazy(pageLoaders.Torra);
const Preparo = lazy(pageLoaders.Preparo);
const Sabor = lazy(pageLoaders.Sabor);
const Cultura = lazy(pageLoaders.Cultura);
const Saude = lazy(pageLoaders.Saude);
const Sustentabilidade = lazy(pageLoaders.Sustentabilidade);
const Glossario = lazy(pageLoaders.Glossario);
const Quiz = lazy(pageLoaders.Quiz);
const Fontes = lazy(pageLoaders.Fontes);
const NotFound = lazy(() => import("./pages/NotFound"));

function Loader() {
  return (
    <div className="grid min-h-[70vh] place-items-center" aria-busy="true" aria-label="Carregando">
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-accent" />
    </div>
  );
}

function TitleSync() {
  const { pathname } = useLocation();
  useEffect(() => {
    const ch = chapters.find((c) => c.path === pathname);
    document.title = ch ? `${ch.title} — Atlas do Café` : "Atlas do Café — da semente à xícara";
  }, [pathname]);
  return null;
}

function Shell() {
  const location = useLocation();
  useLayoutEffect(() => {
    scrollToTop(true);
  }, [location.pathname]);

  useEffect(() => {
    initSmoothScroll();
    const t = window.setTimeout(prefetchPages, 2500);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="grain">
      <button
        type="button"
        onClick={() => document.getElementById("conteudo")?.focus()}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
      >
        Pular para o conteúdo
      </button>
      <TitleSync />
      <Header />
      <motion.main
        id="conteudo"
        tabIndex={-1}
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-screen outline-none"
      >
        <Suspense fallback={<Loader />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/historia" element={<Historia />} />
            <Route path="/botanica" element={<Botanica />} />
            <Route path="/cultivo" element={<Cultivo />} />
            <Route path="/colheita" element={<Colheita />} />
            <Route path="/processamento" element={<Processamento />} />
            <Route path="/mundo" element={<Mundo />} />
            <Route path="/brasil" element={<Brasil />} />
            <Route path="/mercado" element={<Mercado />} />
            <Route path="/torra" element={<Torra />} />
            <Route path="/preparo" element={<Preparo />} />
            <Route path="/sabor" element={<Sabor />} />
            <Route path="/cultura" element={<Cultura />} />
            <Route path="/saude" element={<Saude />} />
            <Route path="/sustentabilidade" element={<Sustentabilidade />} />
            <Route path="/glossario" element={<Glossario />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/fontes" element={<Fontes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.main>
      <Footer />
      <CommandPalette />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <Shell />
      </HashRouter>
    </MotionConfig>
  );
}

import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  Coffee,
  Droplets,
  Flame,
  Globe2,
  Hand,
  HeartPulse,
  Library,
  LineChart,
  MapPin,
  ScrollText,
  Sparkles,
  Sprout,
  TreePine,
  Utensils,
  Leaf,
} from "lucide-react";

export type Chapter = {
  path: string;
  title: string;
  short: string;
  description: string;
  icon: LucideIcon;
  group: GroupId;
  /** cor de destaque usada nos cartões */
  tone: "accent" | "gold" | "leaf";
};

export type GroupId = "origem" | "campo" | "mundo" | "xicara" | "extras";

export const groups: { id: GroupId; label: string; blurb: string }[] = [
  { id: "origem", label: "Origem", blurb: "Lendas, ciência e a planta" },
  { id: "campo", label: "Do campo", blurb: "Plantio, colheita e pós-colheita" },
  { id: "mundo", label: "Mundo & mercado", blurb: "Quem produz, quem bebe, quanto vale" },
  { id: "xicara", label: "Na xícara", blurb: "Torra, preparo, sabor e saúde" },
  { id: "extras", label: "Explorar", blurb: "Glossário, quiz e fontes" },
];

/** Ordem de leitura sugerida (usada também no "próximo capítulo"). */
export const chapters: Chapter[] = [
  {
    path: "/historia",
    title: "História do café",
    short: "História",
    description: "Da lenda de Kaldi na Etiópia ao Brasil, maior produtor do planeta há mais de 150 anos.",
    icon: ScrollText,
    group: "origem",
    tone: "gold",
  },
  {
    path: "/botanica",
    title: "Botânica & variedades",
    short: "Botânica",
    description: "As espécies do gênero Coffea, a anatomia do fruto e o catálogo de variedades.",
    icon: Leaf,
    group: "origem",
    tone: "leaf",
  },
  {
    path: "/cultivo",
    title: "Plantio & cultivo",
    short: "Cultivo",
    description: "Clima, altitude, solo, mudas, floradas, pragas e o ciclo de vida do cafeeiro.",
    icon: Sprout,
    group: "campo",
    tone: "leaf",
  },
  {
    path: "/colheita",
    title: "Colheita",
    short: "Colheita",
    description: "Catação seletiva, derriça e colhedoras mecânicas — e quando cada país colhe.",
    icon: Hand,
    group: "campo",
    tone: "accent",
  },
  {
    path: "/processamento",
    title: "Processamento",
    short: "Processamento",
    description: "Natural, lavado, honey, fermentações controladas, secagem e classificação.",
    icon: Droplets,
    group: "campo",
    tone: "gold",
  },
  {
    path: "/mundo",
    title: "Mapa mundial do café",
    short: "Mapa mundial",
    description: "Produção, exportação e consumo de cada país em um mapa interativo.",
    icon: Globe2,
    group: "mundo",
    tone: "accent",
  },
  {
    path: "/brasil",
    title: "Café do Brasil",
    short: "Brasil",
    description: "Estados, regiões, indicações geográficas e a safra recorde de 2026.",
    icon: MapPin,
    group: "mundo",
    tone: "leaf",
  },
  {
    path: "/mercado",
    title: "Mercado & economia",
    short: "Mercado",
    description: "Preços desde 1960, bolsas, balanço global, cadeia de valor e certificações.",
    icon: LineChart,
    group: "mundo",
    tone: "gold",
  },
  {
    path: "/torra",
    title: "Torra",
    short: "Torra",
    description: "Simulador de torra: temperatura, crack, Maillard e como a cor muda o sabor.",
    icon: Flame,
    group: "xicara",
    tone: "accent",
  },
  {
    path: "/preparo",
    title: "Métodos de preparo",
    short: "Preparo",
    description: "Calculadora de receitas, cronômetro guiado, moagem, água e bebidas de espresso.",
    icon: Coffee,
    group: "xicara",
    tone: "gold",
  },
  {
    path: "/sabor",
    title: "Sabor & degustação",
    short: "Sabor",
    description: "A roda de sabores interativa, o protocolo de cupping e a escala de 100 pontos.",
    icon: Sparkles,
    group: "xicara",
    tone: "accent",
  },
  {
    path: "/cultura",
    title: "Culturas do café",
    short: "Culturas",
    description: "Cerimônias, rituais e jeitos de beber café ao redor do mundo.",
    icon: Utensils,
    group: "origem",
    tone: "gold",
  },
  {
    path: "/saude",
    title: "Café & saúde",
    short: "Saúde",
    description: "Cafeína no corpo, limites seguros e o que dizem as grandes revisões científicas.",
    icon: HeartPulse,
    group: "xicara",
    tone: "leaf",
  },
  {
    path: "/sustentabilidade",
    title: "Sustentabilidade & futuro",
    short: "Futuro",
    description: "Clima, espécies ameaçadas, renda do produtor, desmatamento e inovação.",
    icon: TreePine,
    group: "mundo",
    tone: "leaf",
  },
  {
    path: "/glossario",
    title: "Glossário",
    short: "Glossário",
    description: "Mais de 110 termos do universo do café, da acidez à xícara limpa.",
    icon: BookOpen,
    group: "extras",
    tone: "gold",
  },
  {
    path: "/quiz",
    title: "Quiz do café",
    short: "Quiz",
    description: "Teste o que você aprendeu com perguntas de todos os capítulos.",
    icon: Award,
    group: "extras",
    tone: "accent",
  },
  {
    path: "/fontes",
    title: "Fontes & metodologia",
    short: "Fontes",
    description: "Todas as referências, bases de dados e notas de método usadas no Atlas.",
    icon: Library,
    group: "extras",
    tone: "leaf",
  },
];

export const chapterByPath = (path: string) => chapters.find((c) => c.path === path);


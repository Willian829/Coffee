# ☕ Atlas do Café

Um site interativo e completo sobre café — da semente à xícara — com dados oficiais atualizados até **outubro de 2026**.

17 capítulos, mapas, simuladores e gráficos: história, botânica, plantio, colheita, processamento, mapa mundial, Brasil, mercado, torra, preparo, sabor, culturas, saúde, sustentabilidade, glossário, quiz e fontes.

## Como rodar

Requisitos: Node.js 22+ (testado com Node 24).

```bash
npm install
```

```bash
npm run dev
```

Abra http://localhost:5173. Para gerar a versão de produção:

```bash
npm run build
```

```bash
npm run preview
```

A pasta `dist/` resultante é estática (roteamento por hash e caminhos relativos), então pode ser publicada em qualquer hospedagem — GitHub Pages, Netlify, Vercel, S3 ou um servidor simples.

## Destaques

| Recurso | Onde |
| --- | --- |
| Hero animado, jornada "da semente à xícara" com scrollytelling | Início |
| Mapa animado da dispersão do café (Etiópia → Brasil) e linha do tempo filtrável | História |
| Corte interativo da cereja, comparação arábica × robusta, árvore genealógica e catálogo filtrável de 28 variedades | Botânica |
| Simulador de aptidão climática (latitude, altitude, chuva), roda fenológica com o mês atual, bienalidade | Cultivo |
| Estágios de maturação, métodos de colheita e calendário mundial de colheita ("quem colhe agora") | Colheita |
| Explorador de 6 processos (natural, lavado, honey, giling basah, anaeróbico, maceração carbônica), umidade, classificação COB/SCA | Processamento |
| Mapa-múndi coroplético com produção/exportação/consumo/per capita por ano-safra, painel por país e rankings | Mapa mundial |
| Mapa do Brasil (regiões e bolhas por estado), safra Conab 2026, exportações, consumo e IGs | Brasil |
| Preços de 1960 a 2026 (nominal/real, US$/kg ou ¢/lb), indicadores OIC, balanço oferta × demanda, cadeia de valor | Mercado |
| Simulador de torra com curva de temperatura, cor do grão, cracks (com som opcional) e escala Agtron | Torra |
| Calculadora de receitas para 10 métodos, cronômetro guiado com peso-alvo, moagem, água e bússola de extração | Preparo |
| Roda de sabores SCA/WCR com zoom e calculadora de pontuação de cupping | Sabor |
| Mapa de rituais e costumes em 20 países | Culturas |
| Molécula da cafeína, simulador de cafeína no corpo ao longo do dia, evidências científicas | Saúde |
| Clima, espécies ameaçadas, renda do produtor, linha do tempo da EUDR e checklist pessoal | Futuro |
| Busca global com <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> (ou <kbd>/</kbd>) em 249 itens | Em todo o site |
| Tema claro/escuro/sistema, rolagem suave, respeito a `prefers-reduced-motion`, layout responsivo | Em todo o site |

## Dados e fontes

- **USDA FAS** — *Coffee: World Markets and Trade* (jul/2026): produção, comércio, consumo e estoques por país.
- **OIC/ICO** — *Coffee Market Report* (set/2026): preços indicativos e balanço global.
- **Banco Mundial** — *Pink Sheet*: séries de preço de arábica e robusta de 1960 a set/2026 (`src/data/prices.ts`).
- **Conab** — 3º levantamento da safra 2026 (set/2026), por estado.
- **ABIC** e **Cecafé** — consumo interno e exportações brasileiras de 2025.
- Literatura científica (Nature Genetics, Nature Plants, Science Advances, BMJ, EFSA, Climatic Change…), SCA, World Coffee Research e Climate Central.

A lista completa, com links e notas de método, está no capítulo **Fontes** (`src/data/sources.ts`).

## Estrutura

```
src/
  App.tsx              rotas (HashRouter), transições e pré-carregamento
  components/          cabeçalho, busca, rodapé, ilustrações SVG, gráficos e mapa
  data/                todo o conteúdo e os dados (um módulo por tema)
  lib/                 formatação pt-BR, hooks, geografia e rolagem suave
  pages/               um arquivo por capítulo
  styles/global.css    design tokens (tema claro/escuro) e componentes
scripts/
  build-south-america.mjs   gera o recorte leve da América do Sul usado no mapa do Brasil
```

## Tecnologias

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Motion · React Router · D3 (geo, scale, shape, hierarchy, zoom) · TopoJSON / world-atlas · Lenis · Fuse.js · Lucide · fontes Fraunces, Inter e JetBrains Mono (self-hosted).

As ilustrações são originais (SVG) e a paleta dos gráficos foi validada para daltonismo nos dois temas.

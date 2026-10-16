export type Ritual = {
  country: string;
  name: string;
  coords: [number, number];
  text: string;
  detail: string;
  tag?: string;
};

export const rituals: Ritual[] = [
  {
    country: "Etiópia",
    name: "Buna — a cerimônia do café",
    coords: [38.75, 9.0],
    text: "Grãos verdes são lavados e torrados numa chapa diante dos convidados, moídos no pilão e fervidos na jebena, um bule de barro.",
    detail: "Servem-se três rodadas — abol, tona e baraka (a 'bênção') —, com incenso queimando ao lado. Pode durar duas horas.",
    tag: "Origem",
  },
  {
    country: "Iêmen e Golfo",
    name: "Qahwa árabe",
    coords: [46.7, 24.7],
    text: "Torra clara, cardamomo (às vezes açafrão e cravo), servida da dallah em pequenas xícaras sem alça — os finjan —, com tâmaras.",
    detail: "Reconhecido pela UNESCO em 2015 como símbolo de generosidade. Para dizer 'chega', balance levemente a xícara.",
    tag: "UNESCO",
  },
  {
    country: "Turquia",
    name: "Türk kahvesi",
    coords: [28.98, 41.01],
    text: "Pó finíssimo, água e açúcar aquecidos no cezve até formar espuma; servido com um copo d'água e lokum.",
    detail: "Patrimônio Cultural Imaterial da UNESCO desde 2013. A borra no fundo da xícara é usada para 'ler a sorte'.",
    tag: "UNESCO",
  },
  {
    country: "Itália",
    name: "Espresso al banco",
    coords: [12.5, 41.9],
    text: "Toma-se em pé, no balcão, em poucos goles. Cappuccino? Tradicionalmente só de manhã.",
    detail: "Em Nápoles, o 'caffè sospeso' é o café pago antecipadamente para um desconhecido que não pode pagar.",
  },
  {
    country: "Áustria",
    name: "Cafés de Viena",
    coords: [16.37, 48.21],
    text: "Mármore, jornais, garçons de smoking e um copo d'água acompanhando a Melange — pode-se ficar horas com uma xícara.",
    detail: "A cultura dos cafés vienenses está no inventário de patrimônio imaterial da Comissão Austríaca da UNESCO (2011).",
  },
  {
    country: "Suécia",
    name: "Fika",
    coords: [18.07, 59.33],
    text: "A pausa para café com doces (como o kanelbulle) é instituição social — inclusive no trabalho.",
    detail: "Mais que bebida, é um momento de convivência: 'vamos fikar?'.",
  },
  {
    country: "Finlândia",
    name: "Kahvi — campeões do consumo",
    coords: [24.94, 60.17],
    text: "Os finlandeses bebem em torno de 12 kg de café por pessoa ao ano, a maior marca do mundo.",
    detail: "Tradicionalmente preferem torras claras, e as pausas para café são previstas em muitos acordos de trabalho.",
  },
  {
    country: "Vietnã",
    name: "Cà phê sữa đá e café com ovo",
    coords: [105.85, 21.03],
    text: "Robusta forte gotejando lentamente pelo filtro phin sobre leite condensado e gelo.",
    detail: "Em Hanói, o cà phê trứng (café com gema batida e açúcar) surgiu em 1946, quando faltava leite fresco.",
  },
  {
    country: "Brasil",
    name: "Cafezinho",
    coords: [-46.63, -23.55],
    text: "Pequeno, coado e (quase sempre) doce: oferecer um cafezinho é o gesto universal de hospitalidade brasileira.",
    detail: "Na padaria, há pingado, média e café com leite. Os brasileiros consomem ~1.400 xícaras por pessoa ao ano (ABIC).",
  },
  {
    country: "Cuba",
    name: "Cafecito",
    coords: [-82.38, 23.13],
    text: "Espresso adoçado com açúcar demerara batido até virar a 'espumita'.",
    detail: "A 'colada' é um cafecito grande servido com copinhos para dividir entre amigos.",
  },
  {
    country: "México",
    name: "Café de olla",
    coords: [-99.13, 19.43],
    text: "Preparado numa panela de barro com canela e piloncillo (rapadura).",
    detail: "O barro dá um sabor terroso que, segundo a tradição, nenhuma outra panela reproduz.",
  },
  {
    country: "Irlanda",
    name: "Irish coffee",
    coords: [-9.1, 52.6],
    text: "Criado em 1943 pelo chef Joe Sheridan para aquecer passageiros de hidroaviões em Foynes.",
    detail: "Café quente, açúcar, uísque irlandês e creme levemente batido flutuando por cima.",
  },
  {
    country: "Índia",
    name: "Filter coffee do Sul",
    coords: [80.27, 13.08],
    text: "Decocção forte (muitas vezes com chicória) misturada a leite fervido e açúcar.",
    detail: "Servido no conjunto dabarah-tumbler e 'puxado' de um recipiente a outro para esfriar e espumar.",
  },
  {
    country: "Japão",
    name: "Kissaten e café em lata",
    coords: [139.69, 35.69],
    text: "Os kissaten — cafés à moda antiga — cultivam o coado à mão e o sifão com precisão artesanal.",
    detail: "O país popularizou o café em lata (a partir de 1969) vendido quente ou frio em máquinas automáticas.",
  },
  {
    country: "Grécia",
    name: "Frappé",
    coords: [22.94, 40.64],
    text: "Café solúvel batido com água, gelo e açúcar até virar espuma.",
    detail: "Nasceu por acaso em 1957, na Feira Internacional de Tessalônica.",
  },
  {
    country: "Senegal",
    name: "Café Touba",
    coords: [-15.88, 14.85],
    text: "Café torrado com grãos de selim (pimenta-da-guiné) e às vezes cravo.",
    detail: "Ligado à confraria Mouride e à cidade sagrada de Touba; vendido nas ruas de Dakar.",
  },
  {
    country: "Malásia e Singapura",
    name: "Kopi",
    coords: [103.82, 1.35],
    text: "Robusta ou libérica torrada com margarina e açúcar, coada em 'meia' de pano nos kopitiams.",
    detail: "Há um vocabulário inteiro: kopi-o (sem leite), kopi-c (com leite evaporado), kopi peng (gelado)…",
  },
  {
    country: "Portugal",
    name: "Bica e cimbalino",
    coords: [-9.14, 38.72],
    text: "O espresso ganha nomes regionais: bica em Lisboa, cimbalino no Porto.",
    detail: "O galão — café com bastante leite servido em copo — é o par perfeito de um pastel de nata.",
  },
  {
    country: "Estados Unidos",
    name: "Coffee break",
    coords: [-74.0, 40.71],
    text: "O maior mercado consumidor do mundo transformou o café de garrafa térmica em hábito diário.",
    detail: "A expressão 'coffee break' foi popularizada por uma campanha publicitária do Pan-American Coffee Bureau em 1952.",
  },
  {
    country: "Coreia do Sul",
    name: "Dalgona e cafés temáticos",
    coords: [126.98, 37.57],
    text: "O 'dalgona coffee' (solúvel batido sobre leite) viralizou no mundo em 2020.",
    detail: "Seul tem uma das maiores densidades de cafeterias do planeta, muitas com design espetacular.",
  },
];

export type Species = {
  id: string;
  name: string;
  common: string;
  share: string;
  ploidy: string;
  pollination: string;
  altitude: string;
  temperature: string;
  caffeine: string;
  bean: string;
  flavor: string;
  strengths: string;
  origin: string;
};

export const species: Species[] = [
  {
    id: "arabica",
    name: "Coffea arabica",
    common: "Arábica",
    share: "≈ 56% da produção mundial",
    ploidy: "Tetraploide (2n = 44 cromossomos)",
    pollination: "Autofértil — a flor se poliniza sozinha",
    altitude: "600–2.200 m (nos trópicos)",
    temperature: "18–23 °C de média anual",
    caffeine: "0,9–1,5% do grão (média ≈ 1,2%)",
    bean: "Oval, alongado, com a fenda central em 'S'",
    flavor: "Acidez, doçura, aromas florais e frutados, grande complexidade.",
    strengths: "Qualidade de bebida; base do mercado de cafés especiais.",
    origin: "Florestas montanhosas do sudoeste da Etiópia e do Boma (Sudão do Sul).",
  },
  {
    id: "canephora",
    name: "Coffea canephora",
    common: "Robusta / Conilon",
    share: "≈ 43% da produção mundial",
    ploidy: "Diploide (2n = 22)",
    pollination: "Autoincompatível — precisa de pólen de outra planta (propagação por clones)",
    altitude: "0–800 m (até 1.500 m em Uganda)",
    temperature: "22–30 °C de média anual",
    caffeine: "1,7–4,0% (média ≈ 2,2–2,7%)",
    bean: "Arredondado, menor, fenda reta",
    flavor: "Corpo, amargor, notas de cacau, cereais e madeira; crema densa no espresso.",
    strengths: "Produtividade, vigor e resistência a pragas, doenças e calor.",
    origin: "Florestas de baixada da África Ocidental e Central (do Guiné a Uganda).",
  },
  {
    id: "liberica",
    name: "Coffea liberica",
    common: "Libérica",
    share: "< 2% (com a excelsa)",
    ploidy: "Diploide",
    pollination: "Autoincompatível",
    altitude: "0–600 m",
    temperature: "Tolera calor intenso",
    caffeine: "≈ 1,2–1,5%",
    bean: "Grande, assimétrico; árvore de até 15 m",
    flavor: "Aroma forte, frutado (jaca, frutas secas) e defumado.",
    strengths: "Resistência ao calor e à ferrugem; aposta para a adaptação climática.",
    origin: "África Ocidental (Libéria, Serra Leoa, Costa do Marfim).",
  },
  {
    id: "excelsa",
    name: "Coffea dewevrei",
    common: "Excelsa",
    share: "Nicho (Sudeste Asiático, Uganda, Sudão do Sul)",
    ploidy: "Diploide",
    pollination: "Autoincompatível",
    altitude: "0–1.000 m",
    temperature: "Tolera calor e seca",
    caffeine: "Moderada",
    bean: "Menor que a libérica, fruto vermelho-escuro",
    flavor: "Frutado, ácido, notas de frutas escuras e madeira.",
    strengths: "Reconhecida como espécie própria em 2025 (antes, 'variedade de libérica').",
    origin: "África Central (bacia do Congo).",
  },
  {
    id: "stenophylla",
    name: "Coffea stenophylla",
    common: "Estenofila",
    share: "Experimental",
    ploidy: "Diploide",
    pollination: "—",
    altitude: "Baixada e média altitude",
    temperature: "Tolera temperatura média anual ≈ 6 °C maior que a arábica",
    caffeine: "Semelhante à arábica",
    bean: "Fruto preto quando maduro",
    flavor: "Perfil sensorial comparável ao de bons arábicas em testes cegos.",
    strengths: "Redescoberta em Serra Leoa em 2018; candidata contra o aquecimento global.",
    origin: "Guiné, Serra Leoa e Costa do Marfim.",
  },
];

export const fruitLayers = [
  { id: "exocarpo", name: "Exocarpo (casca)", text: "Pele fina que passa de verde a vermelho ou amarelo quando o fruto amadurece." },
  { id: "mesocarpo", name: "Mesocarpo (polpa)", text: "Polpa doce e carnuda; a camada mais interna é a mucilagem, rica em açúcares e pectina — protagonista da fermentação." },
  { id: "endocarpo", name: "Endocarpo (pergaminho)", text: "Envoltório fibroso e duro que protege cada semente. O café 'em pergaminho' é armazenado assim até o beneficiamento." },
  { id: "pelicula", name: "Espermoderma (película prateada)", text: "Pele finíssima colada à semente; solta-se durante a torra e vira o 'chaff'." },
  { id: "endosperma", name: "Endosperma (o grão)", text: "A semente propriamente dita: reservas de açúcares, lipídios, proteínas e ácidos clorogênicos que a torra transforma em sabor." },
  { id: "embriao", name: "Embrião", text: "A futura planta, minúscula, numa extremidade do grão." },
];

export type Variety = {
  name: string;
  species: "arábica" | "canéfora";
  lineage: string;
  origin: string;
  year: string;
  stature: "alta" | "compacta";
  yield: 1 | 2 | 3 | 4;
  quality: 1 | 2 | 3 | 4 | 5;
  rust: "suscetível" | "tolerante" | "resistente";
  note: string;
};

export const lineages = [
  "Etíope / landrace",
  "Typica",
  "Bourbon",
  "Typica × Bourbon",
  "Introgressão (Híbrido de Timor)",
  "Híbrido F1",
  "Canéfora",
];

export const varieties: Variety[] = [
  { name: "Typica", species: "arábica", lineage: "Typica", origin: "Iêmen → Índia → Java", year: "séc. XVII", stature: "alta", yield: 1, quality: 4, rust: "suscetível", note: "Uma das mais antigas linhagens cultivadas; ancestral de grande parte dos cafés das Américas (Kona, Blue Mountain)." },
  { name: "Bourbon", species: "arábica", lineage: "Bourbon", origin: "Ilha Bourbon (Reunião)", year: "c. 1715", stature: "alta", yield: 2, quality: 4, rust: "suscetível", note: "Levada do Iêmen por missionários franceses. Doce e complexa; produz 20–30% mais que a Typica." },
  { name: "Bourbon Amarelo", species: "arábica", lineage: "Bourbon", origin: "São Paulo, Brasil", year: "c. 1930", stature: "alta", yield: 2, quality: 4, rust: "suscetível", note: "Bourbon de frutos amarelos, muito associado a cafés especiais do Sul de Minas e da Mogiana." },
  { name: "Laurina (Bourbon Pointu)", species: "arábica", lineage: "Bourbon", origin: "Ilha da Reunião", year: "séc. XVIII", stature: "compacta", yield: 1, quality: 5, rust: "suscetível", note: "Mutação com cerca de metade da cafeína do arábica comum e formato de árvore de Natal." },
  { name: "Caturra", species: "arábica", lineage: "Bourbon", origin: "Minas Gerais, Brasil", year: "1915–1918", stature: "compacta", yield: 3, quality: 3, rust: "suscetível", note: "Mutação anã de Bourbon. Permitiu plantios adensados e dominou a Colômbia e a América Central." },
  { name: "Mundo Novo", species: "arábica", lineage: "Typica × Bourbon", origin: "Mundo Novo (Urupês), SP", year: "1943", stature: "alta", yield: 3, quality: 3, rust: "suscetível", note: "Cruzamento natural Sumatra × Bourbon selecionado pelo IAC. Vigorosa e produtiva." },
  { name: "Catuaí", species: "arábica", lineage: "Typica × Bourbon", origin: "IAC, Campinas", year: "1972", stature: "compacta", yield: 4, quality: 3, rust: "suscetível", note: "Mundo Novo × Caturra. Vermelho e Amarelo — a variedade mais plantada do Brasil." },
  { name: "Maragogipe", species: "arábica", lineage: "Typica", origin: "Maragogipe, Bahia", year: "1870", stature: "alta", yield: 1, quality: 3, rust: "suscetível", note: "Mutação de Typica com grãos gigantes ('elephant beans')." },
  { name: "Pacas", species: "arábica", lineage: "Bourbon", origin: "El Salvador", year: "1949", stature: "compacta", yield: 3, quality: 3, rust: "suscetível", note: "Mutação anã de Bourbon descoberta na fazenda da família Pacas." },
  { name: "Pacamara", species: "arábica", lineage: "Typica × Bourbon", origin: "El Salvador (ISIC)", year: "1958", stature: "compacta", yield: 3, quality: 5, rust: "suscetível", note: "Pacas × Maragogipe: grãos grandes, perfil exuberante e presença constante em concursos." },
  { name: "Gesha / Geisha", species: "arábica", lineage: "Etíope / landrace", origin: "Floresta de Gori Gesha, Etiópia → Panamá", year: "1931 / 1963", stature: "alta", yield: 1, quality: 5, rust: "tolerante", note: "Coletada nos anos 1930, passou por Quênia e Costa Rica até o Panamá. Floral, de jasmim e bergamota." },
  { name: "Etíopes 74110 / 74112", species: "arábica", lineage: "Etíope / landrace", origin: "JARC, Etiópia", year: "1970s", stature: "compacta", yield: 2, quality: 4, rust: "suscetível", note: "Seleções do Centro de Pesquisa de Jimma resistentes à antracnose dos frutos; parte do 'heirloom' etíope." },
  { name: "Sidra", species: "arábica", lineage: "Etíope / landrace", origin: "Pichincha, Equador", year: "2000s", stature: "alta", yield: 2, quality: 5, rust: "suscetível", note: "Origem debatida; análises genéticas a aproximam de landraces etíopes. Estrela dos campeonatos de barista." },
  { name: "Pink Bourbon", species: "arábica", lineage: "Etíope / landrace", origin: "Huila, Colômbia", year: "2000s", stature: "alta", yield: 2, quality: 5, rust: "tolerante", note: "Frutos rosados. Apesar do nome, estudos genéticos indicam parentesco com landraces etíopes, não com Bourbon." },
  { name: "SL28", species: "arábica", lineage: "Bourbon", origin: "Scott Laboratories, Quênia", year: "1935", stature: "alta", yield: 2, quality: 5, rust: "suscetível", note: "Tolerante à seca; responsável pela acidez de groselha negra dos grandes quenianos." },
  { name: "SL34", species: "arábica", lineage: "Bourbon", origin: "Scott Laboratories, Quênia", year: "1930s", stature: "alta", yield: 3, quality: 4, rust: "suscetível", note: "Adaptada a altitudes elevadas com muita chuva." },
  { name: "Ruiru 11", species: "arábica", lineage: "Introgressão (Híbrido de Timor)", origin: "Quênia", year: "1985", stature: "compacta", yield: 4, quality: 3, rust: "resistente", note: "Resistente à ferrugem e à antracnose dos frutos (CBD)." },
  { name: "Batian", species: "arábica", lineage: "Introgressão (Híbrido de Timor)", origin: "Quênia", year: "2010", stature: "alta", yield: 3, quality: 4, rust: "resistente", note: "Resistente a ferrugem e CBD com qualidade próxima à das SL." },
  { name: "Híbrido de Timor", species: "arábica", lineage: "Introgressão (Híbrido de Timor)", origin: "Ilha de Timor", year: "c. 1927", stature: "alta", yield: 3, quality: 2, rust: "resistente", note: "Cruzamento natural arábica × robusta: a fonte de resistência à ferrugem da maioria das variedades modernas." },
  { name: "Catimor", species: "arábica", lineage: "Introgressão (Híbrido de Timor)", origin: "CIFC, Portugal", year: "1959", stature: "compacta", yield: 4, quality: 2, rust: "resistente", note: "Caturra × Híbrido de Timor. Muito produtiva; qualidade melhora em altitude." },
  { name: "Castillo", species: "arábica", lineage: "Introgressão (Híbrido de Timor)", origin: "Cenicafé, Colômbia", year: "2005", stature: "compacta", yield: 4, quality: 3, rust: "resistente", note: "Ocupa grande parte dos cafezais colombianos, com versões regionais adaptadas." },
  { name: "Obatã", species: "arábica", lineage: "Introgressão (Híbrido de Timor)", origin: "IAC, Brasil", year: "2000", stature: "compacta", yield: 4, quality: 3, rust: "resistente", note: "Sarchimor (Villa Sarchi × Híbrido de Timor) de alta produtividade." },
  { name: "Arara", species: "arábica", lineage: "Introgressão (Híbrido de Timor)", origin: "Fundação Procafé, Brasil", year: "2012", stature: "compacta", yield: 4, quality: 4, rust: "resistente", note: "Obatã × Catuaí Amarelo: frutos amarelos, alta produtividade e lotes premiados." },
  { name: "Marsellesa", species: "arábica", lineage: "Introgressão (Híbrido de Timor)", origin: "Nicarágua (ECOM/CIRAD)", year: "2009", stature: "compacta", yield: 3, quality: 4, rust: "resistente", note: "Sarchimor com boa acidez e boa adaptação à América Central." },
  { name: "Centroamericano (H1)", species: "arábica", lineage: "Híbrido F1", origin: "CATIE / CIRAD / PROMECAFE", year: "2010", stature: "compacta", yield: 4, quality: 4, rust: "resistente", note: "Híbrido F1 (Sarchimor × Rume Sudan) com vigor híbrido e alta qualidade." },
  { name: "Starmaya", species: "arábica", lineage: "Híbrido F1", origin: "ECOM / CIRAD", year: "2016", stature: "compacta", yield: 4, quality: 4, rust: "tolerante", note: "Primeiro híbrido F1 de arábica propagado por semente (graças a uma linhagem macho-estéril)." },
  { name: "Conilon Vitória Incaper 8142", species: "canéfora", lineage: "Canéfora", origin: "Incaper, Espírito Santo", year: "2004", stature: "alta", yield: 4, quality: 2, rust: "tolerante", note: "Variedade clonal composta por 13 clones, base da renovação do conilon capixaba." },
  { name: "Robustas Amazônicos (BRS)", species: "canéfora", lineage: "Canéfora", origin: "Embrapa Rondônia", year: "2019", stature: "alta", yield: 4, quality: 3, rust: "resistente", note: "Híbridos clonais conilon × robusta, base da Denominação de Origem Matas de Rondônia (2021)." },
];

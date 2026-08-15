import heroAbomey from "@/assets/hero-abomey.jpg";
import museum from "@/assets/museum.jpg";
import ganvie from "@/assets/site-ganvie.jpg";
import pendjari from "@/assets/site-pendjari.jpg";
import artisanImg from "@/assets/artisan.jpg";
import bronze from "@/assets/art-bronze.jpg";

const recadeBebanzin = "/Recede de béhanzin_danxomè.jpg";
const tentureDouzeRois = "/Tenture des douze rois_danxomè.jpg";
const asenMemoire = "/Asen-autel de mémoire_danxomè.jpg";
const masqueGelede = "/Masque guèlèdè_danxomè.jpg";
const pagneAdjrado = "/pagne adjrado_danxomè.jpg";
const bochioGardien = "/Botchio gardien_danxomè.jpg";

const vodounDays = "/vodoun days_danxomè.png";
const gaani = "/La gaani_danxomè.jpg";
const biennaleCotonou = "/Biennale de cotonou_danxomè.jpg";
const nonvitcha = "/Nonvitcha_danxomè.jpg";
const feteIgname = "/Fête de l'igname_danxomè.jpg";
const festivalQuintessence = "/Festival de quintesence_danxomè.jpg";

const museeAbomey = "/musée historique d'abomey_danxomè.jpg";
const fondationZinsou = "/Fondation zinsou_danxomè.jpg";
const museeDaSilva = "/Musée daSilva_danxomè.jpg";
const royaumeHogbonu = "/royaume de hogbonou_danxomè.jpg";
const royaumeNikki = "/royaume baatonu de nikki_danxomè.jpg";
const porteNonRetour = "/Porte du non retour_danxomè.jpg";
const artisanSculpteur = "/artisan-sculpteur.jpg";
const artisanTenturiere = "/artisan-tenturiere.jpg";
const artisanBronzier = "/artisan-bronzier.jpg";

export const images = { heroAbomey, museum, ganvie, pendjari, artisanImg, bronze };

export type Site = {
  slug: string;
  nom: string;
  region: string;
  type: string;
  note: number;
  avis: number;
  prix: number;
  image: string;
  resume: string;
  coords: { x: number; y: number };
  virtuel: boolean;
};

export const sites: Site[] = [
  {
    slug: "palais-royaux-abomey",
    nom: "Palais royaux d'Abomey",
    region: "Zou",
    type: "Patrimoine UNESCO",
    note: 4.9,
    avis: 812,
    prix: 5000,
    image: heroAbomey,
    resume:
      "Douze palais de terre rouge, bas-reliefs et trônes des rois du DanXomè, inscrits au patrimoine mondial depuis 1985.",
    coords: { x: 38, y: 55 },
    virtuel: true,
  },
  {
    slug: "ganvie",
    nom: "Ganvié, la cité lacustre",
    region: "Atlantique",
    type: "Village lacustre",
    note: 4.7,
    avis: 634,
    prix: 7500,
    image: ganvie,
    resume:
      "Fondée au XVIIIe siècle sur le lac Nokoué, la « Venise de l'Afrique » se visite en pirogue au lever du jour.",
    coords: { x: 46, y: 78 },
    virtuel: true,
  },
  {
    slug: "pendjari",
    nom: "Parc national de la Pendjari",
    region: "Atacora",
    type: "Réserve naturelle",
    note: 4.8,
    avis: 421,
    prix: 15000,
    image: pendjari,
    resume:
      "L'un des derniers sanctuaires d'éléphants et de lions d'Afrique de l'Ouest, au nord du pays.",
    coords: { x: 30, y: 16 },
    virtuel: false,
  },
  {
    slug: "porte-du-non-retour",
    nom: "Porte du Non-Retour, Ouidah",
    region: "Atlantique",
    type: "Mémoire",
    note: 4.6,
    avis: 559,
    prix: 3000,
    image: porteNonRetour,
    resume:
      "Au bout de la Route des Esclaves, un mémorial face à l'Atlantique qui clôt un parcours de 4 km.",
    coords: { x: 40, y: 84 },
    virtuel: true,
  },
];

export type Musee = {
  slug: string;
  nom: string;
  ville: string;
  image: string;
  resume: string;
  horaires: string[];
};

export const musees: Musee[] = [
  {
    slug: "musee-histoire-abomey",
    nom: "Musée historique d'Abomey",
    ville: "Abomey",
    image: museeAbomey,
    resume:
      "Installé dans les palais des rois Ghézo et Glélé, il conserve trônes, récades et tentures appliquées.",
    horaires: ["Lun – Sam · 9h – 18h", "Dim · 10h – 16h", "Fermé les jours fériés"],
  },
  {
    slug: "musee-fondation-zinsou",
    nom: "Fondation Zinsou, Ouidah",
    ville: "Ouidah",
    image: fondationZinsou,
    resume:
      "Première fondation d'art contemporain africaine en accès libre, installée dans la villa Ajavon.",
    horaires: ["Mar – Dim · 10h – 19h", "Lundi fermé"],
  },
  {
    slug: "musee-da-silva",
    nom: "Musée da Silva, Porto-Novo",
    ville: "Porto-Novo",
    image: museeDaSilva,
    resume: "Mémoire des Afro-Brésiliens revenus au Bénin : architecture, objets et costumes.",
    horaires: ["Lun – Sam · 9h – 17h30"],
  },
];

export type FriseItem = { annee: string; texte: string };

export type Royaume = {
  slug: string;
  nom: string;
  periode: string;
  image: string;
  resume: string;
  conte: string[];
  frise: FriseItem[];
  visiter: { titre: string; slug: string; type: "site" | "visite" | "musee" }[];
};

export const royaumes: Royaume[] = [
  {
    slug: "abomey",
    nom: "Royaume d'Abomey",
    periode: "1620 – 1894",
    image: museeAbomey,
    resume:
      "Fondé par Dakodonu et porté à son apogée par Gbéhanzin, le DanXomè a conquis un vaste territoire du fleuve Mono au Niger. Ses douze palais de terre rouge, ses bas-reliefs narratifs et ses récades de bronze témoignent d'un art de cour unique. L'armée des Amazones, les Mino, redoutée de tous les voisins, incarne la puissance militaire et l'indépendance de ce royaume qui a résisté à la colonisation française jusqu'en 1894.",
    conte: [
      "Sur le plateau d'Agbomè, la terre est rouge et la mémoire tenace. Trois siècles durant, le DanXomè y a inventé une manière d'État : une cour, une armée, une administration des récoltes, et un art chargé de tenir la chronique.",
      "Chaque roi devait laisser derrière lui une devise, un animal emblème et un palais. Les bas-reliefs modelés dans la terre des murs racontaient les campagnes, les alliances, les proverbes. On ne lisait pas le royaume dans des livres : on le lisait sur ses façades, sur les tentures appliquées et sur les récades que portaient les messagers.",
      "« Le trou creusé par le premier roi, ses fils continuent de le creuser. »",
      "L'ouverture vers la côte, au début du XVIIIe siècle, change tout : le royaume devient acteur d'un commerce atlantique dont Ouidah est le port. Cette histoire, douloureuse, fait aujourd'hui l'objet d'un travail mémoriel porté par les musées béninois et les familles concernées.",
      "Sous Ghézo, la réorganisation militaire donne naissance au corps féminin des Agodjié, longtemps réduit à un exotisme de récits de voyage, et que les historiennes béninoises replacent aujourd'hui dans une logique d'État : recrutement, hiérarchie, discipline, rituel.",
    ],
    frise: [
      { annee: "1620", texte: "Do-Aklin fonde le lignage d'Abomey sur le plateau d'Agbomè." },
      { annee: "1645", texte: "Houégbadja délimite le royaume et institue la coutume du palais." },
      { annee: "1708", texte: "Agadja s'ouvre à l'Atlantique et prend Allada puis Ouidah." },
      { annee: "1818", texte: "Ghézo réorganise l'armée, y compris le corps des Agodjié." },
      { annee: "1858", texte: "Glélé bâtit son palais ; les tentures appliquées deviennent chronique d'État." },
      { annee: "1892", texte: "Gbêhanzin résiste aux colonnes françaises pendant deux campagnes." },
      { annee: "1894", texte: "Déportation de Gbêhanzin en Martinique ; fin de l'indépendance du royaume." },
      { annee: "1985", texte: "Les palais royaux d'Abomey sont inscrits au patrimoine mondial de l'UNESCO." },
      { annee: "2021", texte: "Vingt-six œuvres royales sont restituées par la France." },
    ],
    visiter: [
      { titre: "Fiche du site", slug: "palais-royaux-abomey", type: "site" },
      { titre: "Visite virtuelle 360°", slug: "palais-royaux-abomey", type: "visite" },
      { titre: "Musée historique", slug: "musee-histoire-abomey", type: "musee" },
    ],
  },
  {
    slug: "porto-novo",
    nom: "Royaume de Hogbonu",
    periode: "1730 – 1908",
    image: royaumeHogbonu,
    resume:
      "Établi par des commerçants yoruba venus d'Oyo, le royaume de Hogbonu s'est développé autour du port naturel de l'étang lacustre. Le roi Toffa Ier a ouvert la cité aux marchands afro-brésiliens, créant un syncrétisme architectural et culturel rare : églises coloniales, mosquées et temples vodun coexistent. Capitale politique actuelle du Bénin, Porto-Novo garde l'empreinte de trois héritages — fon, yoruba et afro-brésilien — dans ses rues et ses palais royaux.",
    conte: [
      "Au bord de l'étang lacustre, là où les pirogues glissent entre les mangroves, Hogbonu est née d'une rencontre entre la mer et la forêt. Des marchands yoruba venus du royaume d'Oyo, chassés par les guerres, se sont installés sur ces rives au XVIIIe siècle et y ont bâti un comptoir devenu capitale.",
      "Le roi Toffa Ier comprit que la richesse de Hogbonu ne viendrait pas de la guerre, mais des échanges. Il accueillit les Afro-Brésiliens — descendants d'esclaves revenus d'Amérique — qui apportèrent leur architecture, leur foi catholique et leur savoir-faire commercial. De cette greffe naquit une ville où un temple vodun, une mosquée et une cathédrale se regardent sans se nuire.",
      "« La parole du roi est un filet : elle ne laisse rien échapper. »",
      "Sous la colonisation française, Porto-Novo devint la capitale administrative du Dahomey, éclipsant Abomey. Mais Hogbonu ne s'est jamais éteint : ses familles royales, ses prêtres vodun et ses griots perpétuent une mémoire vivante que les bâtiments coloniaux n'ont jamais recouverte.",
      "Aujourd'hui, Porto-Novo est à la fois capitale politique du Bénin et carrefour culturel unique en Afrique de l'Ouest. Le musée honoraire Alexandre Adjaré, le palais royal de Hogbonu et le quartier des Tofinu sur l'eau racontent trois siècles de métissage et de résilience.",
    ],
    frise: [
      { annee: "vers 1730", texte: "Des commerçants yoruba venus d'Oyo fondent le comptoir de Hogbonu." },
      { annee: "1810", texte: "Le roi Toffa Ier accueille les premiers colons afro-brésiliens." },
      { annee: "1863", texte: "Hogbonu est intégré à la colonie française du Dahomey." },
      { annee: "1883", texte: "Porto-Novo devient la capitale administrative du territoire du Dahomey." },
      { annee: "1900", texte: "Construction du palais royal dans le style afro-brésilien caractéristique." },
      { annee: "1960", texte: "Porto-Novo devient capitale de la République du Dahomey indépendant." },
      { annee: "1975", texte: "Le pays est rebaptisé République Populaire du Bénin." },
      { annee: "1990", texte: "Conférence nationale souveraine : Porto-Novo confirmée comme capitale." },
      { annee: "2015", texte: "Le palais royal de Hogbonu est restauré et ouvert au public." },
    ],
    visiter: [
      { titre: "Palais royal de Hogbonu", slug: "palais-royal-hogbonu", type: "site" },
      { titre: "Musée honoraire Alexandre Adjaré", slug: "musee-adjare", type: "musee" },
      { titre: "Quartier des Tofinu sur l'eau", slug: "quartier-tofinu", type: "site" },
    ],
  },
  {
    slug: "nikki",
    nom: "Royaume baatonu de Nikki",
    periode: "XVe siècle – aujourd'hui",
    image: royaumeNikki,
    resume:
      "Au nord-est du Bénin, le royaume baatonu de Nikki est l'un des plus anciens du pays. Ses rois, les Bokonon, ont préservé une tradition équestre sans équivalent : chaque année, la Gaani rassemble des milliers de cavaliers en tenue de parade pour célébrer la paix, la bravoure et la mémoire des ancêtres. Le tchoukoutou, bière de mil brassée par les femmes du palais, accompagne toutes les cérémonies de cette terre de tradition orale et de chevaux de race.",
    conte: [
      "Dans la savane-parsemée de latérites rousses du nord-est béninois, Nikki dresse ses murailles de terre depuis plus de cinq siècles. Cité des cavaliers et des conteurs, elle est la capitale d'un royaume où la parole a la même valeur que l'épée : celle de protéger et de gouverner.",
      "Les rois Bokonon, dynastie ininterrompue, ont fait de Nikki un carrefour commercial entre le Sahel et la côte. Leurs marchés de bétail attiraient des peuls, des haoussas et des Dendi, tandis que les forgerons et les tisserants produisaient des objets dont la renommée dépassait les frontières du royaume.",
      "« Le cheval du Bokonon ne dort jamais debout : il veille sur le peuple. »",
      "La Gaani, grande fête équestre annuelle, est le cœur battant de Nikki. Des milliers de cavaliers, en costume de parade brodé de perles, parcourent la ville au pas. Chaque cheval est choisi pour sa robe, sa robe et son tempérament ; chaque cavalier descend d'une lignée dont la bravoure est consignée dans les chants griotiques.",
      "Contrairement aux royaumes du sud, le royaume baatonu n'a jamais connu la traite atlantique sur son territoire. Cette distance géographique et militaire a préservé une culture orale d'une richesse exceptionnelle : épopées, généalogies et proverbes constituent une bibliothèque vivante que les anciens transmettent aux jeunes lors des cérémonies du tchoukoutou.",
    ],
    frise: [
      { annee: "vers 1450", texte: "Les premiers Bokonon fondent la cité de Nikki sur un plateau stratégique." },
      { annee: "1600", texte: "Nikki devient un carrefour commercial majeur entre le Sahel et la côte." },
      { annee: "1741", texte: "Le royaume résiste aux incursions du royaume d'Oyo." },
      { annee: "1860", texte: "Les premiers explorateurs européens documentent la tradition équestre de Nikki." },
      { annee: "1897", texte: "Nikki est intégré au territoire du Dahomey français malgré la résistance des Bokonon." },
      { annee: "1960", texte: "Indépendance : Nikki reste un centre culturel majeur du nord-est béninois." },
      { annee: "1996", texte: "La Gaani est reconnue comme patrimoine culturel immatériel du Bénin." },
      { annee: "2010", texte: "Le musée royal de Nikki ouvre ses portes pour préserver la mémoire baatonu." },
      { annee: "2023", texte: "La Gaani rassemble plus de dix mille cavaliers et cinquante mille visiteurs." },
    ],
    visiter: [
      { titre: "Fiche de la ville", slug: "nikki", type: "site" },
      { titre: "Fête de la Gaani", slug: "gaani", type: "site" },
      { titre: "Musée royal de Nikki", slug: "musee-royal-nikki", type: "musee" },
    ],
  },
];

export const langues = [
  { nom: "Fon", locuteurs: "4,3 M", region: "Sud et centre", salut: "Kudo!", sens: "Bonjour" },
  { nom: "Yoruba", locuteurs: "1,2 M", region: "Sud-est", salut: "Ẹ kú àbọ̀", sens: "Bienvenue" },
  {
    nom: "Bariba (Baatonum)",
    locuteurs: "900 k",
    region: "Nord-est",
    salut: "A yaa gia?",
    sens: "Comment vas-tu ?",
  },
  { nom: "Dendi", locuteurs: "350 k", region: "Nord", salut: "Foforo", sens: "Salutations" },
  {
    nom: "Mina / Gen",
    locuteurs: "500 k",
    region: "Littoral ouest",
    salut: "Ŋdi",
    sens: "Bonjour",
  },
  {
    nom: "Ditammari",
    locuteurs: "220 k",
    region: "Atacora",
    salut: "Ni yaa",
    sens: "Paix sur toi",
  },
];

export type Artiste = {
  slug: string;
  nom: string;
  metier: string;
  ville: string;
  image: string;
  bio: string;
};

export const artistes: Artiste[] = [
  {
    slug: "kossi-adanou",
    nom: "Kossi Adanou",
    metier: "Sculpteur sur bois",
    ville: "Abomey",
    image: artisanSculpteur,
    bio: "Formé dans l'atelier familial des Houngbédji, Kossi taille des masques cérémoniels en iroko et réinterprète les récades royales.",
  },
  {
    slug: "adjoa-gbedo",
    nom: "Adjoa Gbédo",
    metier: "Tenture appliquée",
    ville: "Bohicon",
    image: artisanTenturiere,
    bio: "Elle perpétue l'art des tentures d'Abomey, chaque motif racontant un règne, un proverbe ou une victoire.",
  },
  {
    slug: "raphael-tossou",
    nom: "Raphaël Tossou",
    metier: "Bronzier",
    ville: "Porto-Novo",
    image: artisanBronzier,
    bio: "Cire perdue et laiton de récupération : Raphaël fond des pièces contemporaines nourries de statuaire vodun.",
  },
];

export type Oeuvre = {
  slug: string;
  titre: string;
  artiste: string;
  artisteSlug: string;
  categorie: string;
  region: string;
  prix: number;
  image: string;
  description: string;
};

export const oeuvres: Oeuvre[] = [
  {
    slug: "recade-gbehanzin",
    titre: "Récade de Gbêhanzin",
    artiste: "Kossi Adanou",
    artisteSlug: "kossi-adanou",
    categorie: "Sculpture",
    region: "Zou",
    prix: 185000,
    image: recadeBebanzin,
    description:
      "Bois d'iroko et laiton martelé, 62 cm. Réinterprétation du sceptre royal, symbole de parole et d'autorité.",
  },
  {
    slug: "tenture-des-douze-rois",
    titre: "Tenture des douze rois",
    artiste: "Adjoa Gbédo",
    artisteSlug: "adjoa-gbedo",
    categorie: "Textile",
    region: "Zou",
    prix: 240000,
    image: tentureDouzeRois,
    description: "Coton appliqué, 180 × 120 cm. Douze registres pour douze règnes du DanXomè.",
  },
  {
    slug: "asen-memoire",
    titre: "Asen — autel de mémoire",
    artiste: "Raphaël Tossou",
    artisteSlug: "raphael-tossou",
    categorie: "Bronze",
    region: "Ouémé",
    prix: 320000,
    image: asenMemoire,
    description: "Fonte à la cire perdue, 74 cm. Autel portatif dédié aux ancêtres.",
  },
  {
    slug: "masque-gelede",
    titre: "Masque Gèlèdé",
    artiste: "Kossi Adanou",
    artisteSlug: "kossi-adanou",
    categorie: "Sculpture",
    region: "Plateau",
    prix: 145000,
    image: masqueGelede,
    description: "Bois polychrome, 48 cm. Hommage à la puissance des mères, tradition yoruba-nago.",
  },
  {
    slug: "pagne-adjrado",
    titre: "Pagne Adjrado",
    artiste: "Adjoa Gbédo",
    artisteSlug: "adjoa-gbedo",
    categorie: "Textile",
    region: "Atlantique",
    prix: 68000,
    image: pagneAdjrado,
    description: "Tissage bandes étroites, indigo naturel, 200 × 110 cm.",
  },
  {
    slug: "statuette-bochio",
    titre: "Bochio gardien",
    artiste: "Raphaël Tossou",
    artisteSlug: "raphael-tossou",
    categorie: "Bronze",
    region: "Zou",
    prix: 96000,
    image: bochioGardien,
    description: "Laiton patiné, 35 cm. Figure de protection du seuil.",
  },
];

export type Evenement = {
  slug: string;
  titre: string;
  date: string;
  jour: number;
  mois: string;
  lieu: string;
  categorie: string;
  image: string;
  resume: string;
};

export const evenements: Evenement[] = [
  {
    slug: "vodun-days",
    titre: "Vodun Days",
    date: "9 – 11 janvier",
    jour: 9,
    mois: "JAN",
    lieu: "Ouidah",
    categorie: "Festival",
    image: vodounDays,
    resume: "Trois jours de cultes, de danses zangbéto et de concerts sur la plage de Ouidah.",
  },
  {
    slug: "gaani",
    titre: "La Gaani",
    date: "12 – 14 avril",
    jour: 12,
    mois: "AVR",
    lieu: "Nikki",
    categorie: "Tradition",
    image: gaani,
    resume: "Fête équestre baatonu : cavaliers, tambours royaux et cortège du roi de Nikki.",
  },
  {
    slug: "biennale-benin",
    titre: "Biennale de Cotonou",
    date: "3 mai – 30 juin",
    jour: 3,
    mois: "MAI",
    lieu: "Cotonou",
    categorie: "Art contemporain",
    image: biennaleCotonou,
    resume: "Expositions dans toute la ville, ateliers ouverts et rencontres de commissaires.",
  },
  {
    slug: "nonvitcha",
    titre: "Nonvitcha",
    date: "18 – 19 mai",
    jour: 18,
    mois: "MAI",
    lieu: "Grand-Popo",
    categorie: "Rassemblement",
    image: nonvitcha,
    resume: "Grande retrouvaille de la communauté xwla, entre mer et lagune.",
  },
  {
    slug: "fete-igname",
    titre: "Fête de l'igname",
    date: "15 août",
    jour: 15,
    mois: "AOÛ",
    lieu: "Savalou",
    categorie: "Tradition",
    image: feteIgname,
    resume: "Bénédiction des nouvelles récoltes par le roi de Savalou.",
  },
  {
    slug: "quintessence",
    titre: "Festival Quintessence",
    date: "5 – 10 décembre",
    jour: 5,
    mois: "DÉC",
    lieu: "Ouidah",
    categorie: "Cinéma",
    image: festivalQuintessence,
    resume: "Compétition de films africains, projections en plein air et masterclasses.",
  },
];

export type Plat = {
  slug: string;
  nom: string;
  region: string;
  categorie: string;
  image: string;
  resume: string;
  ingredients: string[];
  preparation: string;
  origine: string;
  ou: string;
  histoire: string;
  curiosite: string;
};

export const plats: Plat[] = [
  {
    slug: "pate-rouge",
    nom: "Pâte rouge (Atassi)",
    region: "Centre",
    categorie: "Plat principal",
    image: "/Atassi_danxomè.jpg",
    resume:
      "Pâte de maïs fermentée, teintée en rouge par le jus de graines de « zomi ». Servie avec une sauce riche à base de tomates, de piment et de viande de boeuf.",
    ingredients: [
      "Maïs fermenté",
      "Graines de zomi",
      "Tomates",
      "Boeuf",
      "Piment",
      "Huile de palme",
    ],
    preparation:
      "Le maïs est fermenté puis pilé pour obtenir une pâte fluide. Le jus de zomi lui donne sa couleur rouge caractéristique. La sauce est préparée séparément avec des tomates concassées, du piment et de la viande mijotée.",
    origine: "Région des Collines, Abomey et Bohicon",
    ou: "Marchés d'Abomey, restaurants traditionnels de Bohicon",
    histoire:
      "La pâte rouge est un plat ancestral du peuple Fon. Sa couleur rouge symbolise le sang versé par les guerriers du royaume du Dahomey. Elle était servie lors des cérémonies d'intronisation des rois et des fêtes guerrières. Le zomi, graines qui lui donne sa teinte, est un arbre sacré dans la culture fon.",
    curiosite:
      "Selon la tradition, plus la pâte est rouge, plus elle est savoureuse. Les grands-mères transmettent secrètement la recette du zomi de génération en génération.",
  },
  {
    slug: "ablo",
    nom: "Ablo",
    region: "Sud",
    categorie: "Accompagnement",
    image: "/Ablo_danxomè.jpg",
    resume:
      "Beignet de riz cuit à la vapeur, moelleux et légèrement sucré. Accompagne les sauces tomate et les poisson grillé du littoral.",
    ingredients: ["Riz", "Levure", "Sucre", "Sel", "Eau"],
    preparation:
      "Le riz est cuit à la vapeur puis écrasé avec de la levure et du sucre. La pâte est laissée à lever puis cuite à la vapeur dans des moules. L'ablo est servie chaud avec de la sauce tomate au poisson.",
    origine: "Littoral atlantique, Cotonou et Porto-Novo",
    ou: "Streets foods de Cotonou, marchés de Dantokpa",
    histoire:
      "L'ablo est né du métissage entre les traditions culinaires africaines et portugaises. Les esclaves libérés revenus du Brésil au XIXe siècle ont apporté la technique de cuisson à la vapeur du riz, qui s'est intégrée aux habitudes du littoral béninois.",
    curiosite:
      "L'ablo est toujours servie le dimanche matin dans les foyers côtiers. Son nom signifie « pain » en langue mina, un héritage direct du portugais « pão ».",
  },
  {
    slug: "wagashi",
    nom: "Wagashi",
    region: "Nord",
    categorie: "Fromage",
    image: "/Wagashi_danxomè.jpg",
    resume:
      "Fromage de lait de vache caillé, pressé et fumé. Aliment de base dans le nord du Bénin, consommé frais ou séché.",
    ingredients: ["Lait de vache frais", "Raisin sauvage (acide)", "Sel"],
    preparation:
      "Le lait est caillé avec le jus de feuilles de « wakri » ou de raisin sauvage. Le caillé est pressé pour en extraire le sérum, puis façonné en boules et séché au soleil ou fumé doucement.",
    origine: "Région de Parakou et Nikki",
    ou: "Marchés de Parakou, boutiques laitières du nord",
    histoire:
      "Le wagashi est le fromage des peuples baatonu et bariba du nord du Bénin. La fabrication du fromage a été introduite par les Pasteurs nomades peuls au cours du XVIIIe siècle, puis adoptée et transformée par les communautés sédentaires. Il fait partie intégrante de l'économie laitière du nord.",
    curiosite:
      "Le wagashi est offert aux ancêtres lors des cérémonies funéraires. On dit que plus le fromage est fumé, plus il est proche du monde des esprits.",
  },
  {
    slug: "akassa",
    nom: "Akassa",
    region: "Sud",
    categorie: "Accompagnement",
    image: "/Akassa_danxomè.jpg",
    resume:
      "Pâte de maïs fermentée, enveloppée dans des feuilles de bananier et cuite à l'eau. Aliment de base du sud, accompagné de sauces variées.",
    ingredients: ["Maïs fermenté", "Feuilles de bananier", "Sel"],
    preparation:
      "Le maïs est fermenté puis pétri en une pâte souple. Divisée en portions, chaque boule est enveloppée dans une feuille de bananier et cuite à l'eau pendant plusieurs heures.",
    origine: "Littoral et plateau Adja",
    ou: "Marchés côtiers de Ouidah et Grand-Popo",
    histoire:
      "L'akassa est l'aliment de base des peuples gun et xwla du sud du Bénin depuis des siècles. La fermentation du maïs, qui peut durer plusieurs jours, est un savoir-faire transmis exclusivement par les femmes. Chaque famille possède sa propre technique de fermentation.",
    curiosite:
      "L'akassa emballée dans des feuilles de bananier est considérée comme plus authentique. Les feuilles apportent un parfum unique que les Béninois reconnaissent les yeux fermés.",
  },
  {
    slug: "tchoukoutou",
    nom: "Tchoukoutou",
    region: "Nord",
    categorie: "Boisson",
    image: "/Tchoukoutou_danxomè.jpg",
    resume:
      "Bière de mil traditionnelle, légèrement acide et rafraîchissante. Boisson de la communauté baatonu, servie lors des cérémonies et du quotidien.",
    ingredients: ["Mil germé", "Levure naturelle", "Eau"],
    preparation:
      "Le mil est malté puis fermenté avec une levure naturelle. La mixture est filtrée et laissée à fermenter quelques jours. Le tchoukoutou est servi frais, souvent dans des calebasses.",
    origine: "Région de Nikki et Bassila",
    ou: "Cabanes à tchoukoutou de Nikki, marchés du nord",
    histoire:
      "Le tchoukoutou est la boisson sacrée du royaume baatonu de Nikki. Brassé depuis des siècles par les femmes, il accompagne toutes les cérémonies : mariages, funérailles, fêtes équestres de la Gaani. La brasserie du mil est un art maîtrisé par les « bieri », les femmes brassent du palais royal.",
    curiosite:
      "Le tchoukoutou ne se boit jamais seul. Lors de la Gaani, la grande fête équestre, les cavaliers en buvent pour retrouver force et courage avant la compétition.",
  },
  {
    slug: "sauce-arachide",
    nom: "Sauce arachide au poulet",
    region: "Centre",
    categorie: "Plat principal",
    image: "/Sauce d'arachide au poulet_danxomè.jpg",
    resume:
      "Sauce onctueuse à base de pâte d'arachide, servie avec du riz blanc et du poulet grillé. Plat familial très apprécié dans tout le pays.",
    ingredients: ["Pâte d'arachide", "Poulet", "Tomates", "Oignons", "Piment", "Huile"],
    preparation:
      "Le poulet est assaisonné et grillé. La sauce est préparée en faisant revenir les oignons, les tomates et la pâte d'arachide diluée. Le tout mijote jusqu'à obtenir une consistance crémeuse.",
    origine: "Bassin du Zou et Plateau",
    ou: "Tous les restaurants traditionnels du centre",
    histoire:
      "La sauce arachide est un plat fédérateur du Bénin, présent dans toutes les régions mais尤其 populaire chez les peuples fon et yoruba. L'arachide, introduite par les Portugais au XVIe siècle, s'est naturellement intégrée à la gastronomie béninoise et est devenue un pilier alimentaire.",
    curiosite:
      "Au Bénin, on dit qu'une sauce arachide ne rate jamais. C'est le plat que les étudiants et les jeunes célibataires apprennent en premier quand ils quittent le foyer familial.",
  },
  {
    slug: "kuli-kuli",
    nom: "Kuli-kuli",
    region: "Centre",
    categorie: "Snack",
    image: "/Kuli-kuli_danxomè.jpg",
    resume:
      "Beignet croustillant à base de pâte d'arachide pressée. Snack populaire, vendu sur les marchés et les trottoirs.",
    ingredients: ["Pâte d'arachide", "Sel", "Piment", "Huile d'arachide"],
    preparation:
      "La pâte d'arachide est pressée pour en extraire l'huile, puis pétrie avec du sel et du piment. Elle est façonnée en bâtonnets ou en boules et frite dans l'huile d'arachide jusqu'à croquant.",
    origine: "Toutes les régions",
    ou: "Vendeurs ambulants, marchés de Cotonou",
    histoire:
      "Le kuli-kuli est né du besoin de conserver l'arachide excédentaire. Les femmes peules et haoussa du nord du Nigeria et du Bénin ont mis au point cette technique de pressage et de friture il y a plusieurs siècles. C'est l'un des snacks les plus anciens d'Afrique de l'Ouest.",
    curiosite:
      "Le kuli-kuli est si populaire qu'il voyage partout : on le trouve même dans les avions comme snack de vol sur certaines compagnies ouest-africaines. Il peut se conserver plusieurs mois sans réfrigération.",
  },
  {
    slug: "dèkouinni",
    nom: "Dèkouinni",
    region: "Sud",
    categorie: "Poisson",
    image: "/Dèkouinni_danxomè.jpg",
    resume:
      "Poisson fumé du lac Nokoué, cuisiné en sauce avec des légumes. Spécialité de Ganvié et des villages lacustres.",
    ingredients: [
      "Poisson fumé (capitaine ou carpe)",
      "Feuilles de manioc",
      "Tomates",
      "Piment",
      "Huile de palme",
    ],
    preparation:
      "Le poisson fumé est dépecé puis cuit lentement dans une sauce de tomates et de feuilles de manioc pilées. L'huile de palme apporte sa couleur orange caractéristique.",
    origine: "Lac Nokoué, Ganvié",
    ou: "Marché flottant de Ganvié, restaurants sur pilotis",
    histoire:
      "Le dèkouinni est le plat emblématique des Tofinu, le peuple lacustre de Ganvié. Vivant sur l'eau depuis le XVIIe siècle pour échapper aux razzias esclavagistes du royaume du Dahomey, les Tofinu ont développé une cuisine unique basée sur le poisson fumé du lac Nokoué, qu'ils pêchent depuis des pirogues.",
    curiosite:
      "Le fumage du poisson se fait traditionnellement sur des foyers de bois de palétuvier. Ce fumage particulier donne au dèkouinni son goût incomparable que les gourmets béninois qualifient de « goût du lac ».",
  },
];

export const formatFcfa = (n: number) =>
  `${n.toLocaleString("fr-FR").replace(/\u202f/g, " ")} FCFA`;

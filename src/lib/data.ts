import heroAbomey from "@/assets/hero-abomey.jpg";
import museum from "@/assets/museum.jpg";
import ganvie from "@/assets/site-ganvie.jpg";
import pendjari from "@/assets/site-pendjari.jpg";
import artisanImg from "@/assets/artisan.jpg";
import bronze from "@/assets/art-bronze.jpg";

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
      "Douze palais de terre rouge, bas-reliefs et trônes des rois du Dãhomè, inscrits au patrimoine mondial depuis 1985.",
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
    image: museum,
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
    image: heroAbomey,
    resume:
      "Installé dans les palais des rois Ghézo et Glélé, il conserve trônes, récades et tentures appliquées.",
    horaires: ["Lun – Sam · 9h – 18h", "Dim · 10h – 16h", "Fermé les jours fériés"],
  },
  {
    slug: "musee-fondation-zinsou",
    nom: "Fondation Zinsou, Ouidah",
    ville: "Ouidah",
    image: museum,
    resume:
      "Première fondation d'art contemporain africaine en accès libre, installée dans la villa Ajavon.",
    horaires: ["Mar – Dim · 10h – 19h", "Lundi fermé"],
  },
  {
    slug: "musee-da-silva",
    nom: "Musée da Silva, Porto-Novo",
    ville: "Porto-Novo",
    image: bronze,
    resume: "Mémoire des Afro-Brésiliens revenus au Bénin : architecture, objets et costumes.",
    horaires: ["Lun – Sam · 9h – 17h30"],
  },
];

export const royaumes = [
  {
    slug: "abomey",
    nom: "Royaume d'Abomey",
    periode: "1620 – 1894",
    image: heroAbomey,
    resume:
      "Le Dãhomè, puissance militaire et diplomatique, a bâti en trois siècles une cour, une armée et un art d'État.",
  },
  {
    slug: "porto-novo",
    nom: "Royaume de Hogbonu",
    periode: "1730 – 1908",
    image: bronze,
    resume: "Porto-Novo, carrefour yoruba, gbe et afro-brésilien, capitale politique du Bénin.",
  },
  {
    slug: "nikki",
    nom: "Royaume baatonu de Nikki",
    periode: "XVe siècle – aujourd'hui",
    image: pendjari,
    resume: "Terre du cavalier baatonu et de la Gaani, fête équestre du nord.",
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
    image: artisanImg,
    bio: "Formé dans l'atelier familial des Houngbédji, Kossi taille des masques cérémoniels en iroko et réinterprète les récades royales.",
  },
  {
    slug: "adjoa-gbedo",
    nom: "Adjoa Gbédo",
    metier: "Tenture appliquée",
    ville: "Bohicon",
    image: bronze,
    bio: "Elle perpétue l'art des tentures d'Abomey, chaque motif racontant un règne, un proverbe ou une victoire.",
  },
  {
    slug: "raphael-tossou",
    nom: "Raphaël Tossou",
    metier: "Bronzier",
    ville: "Porto-Novo",
    image: museum,
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
    image: bronze,
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
    image: heroAbomey,
    description: "Coton appliqué, 180 × 120 cm. Douze registres pour douze règnes du Dãhomè.",
  },
  {
    slug: "asen-memoire",
    titre: "Asen — autel de mémoire",
    artiste: "Raphaël Tossou",
    artisteSlug: "raphael-tossou",
    categorie: "Bronze",
    region: "Ouémé",
    prix: 320000,
    image: museum,
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
    image: artisanImg,
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
    image: ganvie,
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
    image: pendjari,
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
    image: museum,
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
    image: pendjari,
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
    image: bronze,
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
    image: ganvie,
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
    image: heroAbomey,
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
    image: artisanImg,
    resume: "Compétition de films africains, projections en plein air et masterclasses.",
  },
];

export const formatFcfa = (n: number) =>
  `${n.toLocaleString("fr-FR").replace(/\u202f/g, " ")} FCFA`;

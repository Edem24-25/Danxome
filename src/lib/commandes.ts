import { useEffect, useState } from "react";

export const statutsCommandes = [
  { id: "recue", label: "Reçue" },
  { id: "validee", label: "Validée" },
  { id: "en_cours", label: "En cours" },
  { id: "expediee", label: "Expédiée" },
  { id: "livree", label: "Livrée" },
] as const;

export type CommandeStatut = (typeof statutsCommandes)[number]["id"];

export type Commande = {
  ref: string;
  client: string;
  piece: string;
  montant: number;
  date: string;
  statut: CommandeStatut;
};

const KEY = "dahome.commandes";

const seed: Commande[] = [
  {
    ref: "DH-4821",
    client: "M. Dossou",
    piece: "Récade de Gbêhanzin",
    montant: 185000,
    date: "2 août 2026",
    statut: "recue",
  },
  {
    ref: "DH-4809",
    client: "Galerie Nokoué",
    piece: "Masque Gèlèdé",
    montant: 145000,
    date: "28 juillet 2026",
    statut: "validee",
  },
  {
    ref: "DH-4776",
    client: "L. Ahouandjinou",
    piece: "Bochio gardien",
    montant: 96000,
    date: "19 juillet 2026",
    statut: "en_cours",
  },
  {
    ref: "DH-4752",
    client: "M. Kpodo",
    piece: "Asen — autel de mémoire",
    montant: 320000,
    date: "8 juillet 2026",
    statut: "expediee",
  },
  {
    ref: "DH-4701",
    client: "Galerie Zannou",
    piece: "Tenture des douze rois",
    montant: 240000,
    date: "26 juin 2026",
    statut: "livree",
  },
];

function lire(): Commande[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Commande[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return seed;
}

/** Commandes reçues par l'artiste (démo, persistées localement). */
export function useCommandes() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    setCommandes(lire());
    setPret(true);
  }, []);

  const changerStatut = (ref: string, statut: CommandeStatut) => {
    const valides = statutsCommandes.map((s) => s.id);
    if (!valides.includes(statut)) return;
    const suivante = lire().map((c) => (c.ref === ref ? { ...c, statut } : c));
    window.localStorage.setItem(KEY, JSON.stringify(suivante));
    setCommandes(suivante);
  };

  return { commandes, pret, changerStatut };
}

export function statutLabel(id: CommandeStatut): string {
  return statutsCommandes.find((s) => s.id === id)?.label ?? id;
}

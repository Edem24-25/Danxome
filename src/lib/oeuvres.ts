import { useEffect, useState } from "react";
import { images, oeuvres, type Oeuvre } from "./data";

export type OeuvreStatut = "publiee" | "brouillon";

export type MesOeuvre = Oeuvre & { statut: OeuvreStatut };

const KEY = "dahome.mes-oeuvres";

function lire(): MesOeuvre[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MesOeuvre[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return oeuvres
    .filter((o) => o.artisteSlug === "kossi-adanou" || o.categorie === "Sculpture")
    .map((o) => ({ ...o, statut: "publiee" as const }));
}

/** Œuvres de l'artiste connecté (démo, persistées localement). */
export function useMesOeuvres() {
  const [liste, setListe] = useState<MesOeuvre[]>([]);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    setListe(lire());
    setPret(true);
  }, []);

  const sauvegarder = (suivante: MesOeuvre[]) => {
    window.localStorage.setItem(KEY, JSON.stringify(suivante));
    setListe(suivante);
  };

  const ajouter = (o: Oeuvre) => sauvegarder([{ ...o, statut: "publiee" as const }, ...lire()]);

  const changerStatut = (slug: string, statut: OeuvreStatut) =>
    sauvegarder(lire().map((o) => (o.slug === slug ? { ...o, statut } : o)));

  const retirer = (slug: string) => sauvegarder(lire().filter((o) => o.slug !== slug));

  const publiees = liste.filter((o) => o.statut === "publiee");
  const brouillons = liste.filter((o) => o.statut === "brouillon");

  return { liste, publiees, brouillons, pret, ajouter, changerStatut, retirer };
}

export const imageParDefaut = images.bronze;

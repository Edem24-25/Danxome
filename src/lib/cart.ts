import { useEffect, useState } from "react";
import { oeuvres, type Oeuvre } from "./data";

export type LigneP = { slug: string; qte: number };

const KEY = "dahome.panier";
const EVT = "dahome-panier";
const MAX_QTE = 10;

function lire(): LigneP[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as LigneP[]) : [];
    return Array.isArray(parsed)
      ? parsed
          .filter(
            (l) => oeuvres.some((o) => o.slug === l.slug) && Number.isFinite(l.qte) && l.qte > 0,
          )
          .map((l) => ({ ...l, qte: Math.min(Math.max(1, Math.round(l.qte)), MAX_QTE) }))
      : [];
  } catch {
    return [];
  }
}

function ecrire(lignes: LigneP[]) {
  window.localStorage.setItem(KEY, JSON.stringify(lignes));
  window.dispatchEvent(new Event(EVT));
}

/** Panier local (démo, sans backend) partagé entre les pages Art. */
export function usePanier() {
  const [lignes, setLignes] = useState<LigneP[]>([]);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    setLignes(lire());
    setPret(true);
    const sync = () => setLignes(lire());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const ajouter = (slug: string, qte = 1) => {
    const safeQte = Math.min(Math.max(1, Math.round(Number(qte) || 1)), MAX_QTE);
    const courant = lire();
    const existant = courant.find((l) => l.slug === slug);
    ecrire(
      existant
        ? courant.map((l) =>
            l.slug === slug ? { ...l, qte: Math.min(l.qte + safeQte, MAX_QTE) } : l,
          )
        : [...courant, { slug, qte: safeQte }],
    );
  };

  const definir = (slug: string, qte: number) => {
    const safe = Math.min(Math.max(0, Math.round(Number(qte) || 0)), MAX_QTE);
    ecrire(
      safe <= 0
        ? lire().filter((l) => l.slug !== slug)
        : lire().map((l) => (l.slug === slug ? { ...l, qte: safe } : l)),
    );
  };

  const retirer = (slug: string) => definir(slug, 0);
  const vider = () => ecrire([]);

  const articles = lignes
    .map((l) => {
      const oeuvre = oeuvres.find((o) => o.slug === l.slug);
      return oeuvre ? { oeuvre, qte: l.qte } : null;
    })
    .filter((a): a is { oeuvre: Oeuvre; qte: number } => a !== null);

  const total = articles.reduce((s, a) => s + a.oeuvre.prix * a.qte, 0);
  const nombre = articles.reduce((s, a) => s + a.qte, 0);

  return { articles, total, nombre, pret, ajouter, definir, retirer, vider };
}

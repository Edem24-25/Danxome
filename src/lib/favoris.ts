import { useCallback, useEffect, useState } from "react";

const CLE = "dahome:favoris";

export function useFavoris() {
  const [favoris, setFavoris] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CLE);
      setFavoris(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setFavoris([]);
    }
  }, []);

  const basculer = useCallback((slug: string) => {
    setFavoris((prev) => {
      const suivant = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      try {
        localStorage.setItem(CLE, JSON.stringify(suivant));
      } catch {
        /* stockage indisponible */
      }
      return suivant;
    });
  }, []);

  const estFavori = useCallback((slug: string) => favoris.includes(slug), [favoris]);

  const vider = useCallback(() => {
    try {
      localStorage.removeItem(CLE);
    } catch {
      /* stockage indisponible */
    }
    setFavoris([]);
  }, []);

  return { favoris, basculer, estFavori, vider };
}

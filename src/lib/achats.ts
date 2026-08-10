export interface AchatArticle {
  titre: string;
  artiste: string;
  image: string;
  quantite: number;
  prix: number;
}

export interface Achat {
  reference: string;
  date: string;
  articles: AchatArticle[];
  total: number;
  livraison: number;
}

const CLE = "dahome:achats";

export function lireAchats(): Achat[] {
  try {
    const raw = localStorage.getItem(CLE);
    return raw ? (JSON.parse(raw) as Achat[]) : [];
  } catch {
    return [];
  }
}

export function enregistrerAchat(achat: Achat) {
  try {
    const precedent = lireAchats();
    localStorage.setItem(CLE, JSON.stringify([achat, ...precedent]));
  } catch {
    /* stockage indisponible */
  }
}

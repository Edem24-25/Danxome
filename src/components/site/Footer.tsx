import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import { Heart } from "lucide-react";

const columns = [
  {
    titre: "Découvrir",
    liens: [
      { to: "/culture", label: "Culture & patrimoine" },
      { to: "/tourisme", label: "Sites touristiques" },
      { to: "/tourisme/carte", label: "Carte interactive" },
      { to: "/evenements", label: "Calendrier culturel" },
    ],
  },
  {
    titre: "Créateurs",
    liens: [
      { to: "/art", label: "Galerie d'artistes" },
      { to: "/art/boutique", label: "Boutique" },
      { to: "/artiste", label: "Espace artiste" },
      { to: "/auth/register", label: "Devenir artisan partenaire" },
    ],
  },
  {
    titre: "Institution",
    liens: [
      { to: "/a-propos", label: "À propos" },
      { to: "/contact", label: "Contact" },
      { to: "/faq", label: "FAQ" },
      { to: "/legal", label: "Mentions légales" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-24">
      {/* Section principale */}
      <div className="relative overflow-hidden bg-forest-darker">
        {/* Motifs décoratifs */}
        <div className="pattern-fon absolute inset-0 opacity-[0.07]" aria-hidden />
        <div className="absolute inset-0 texture-grain" aria-hidden />

        {/* Gradient décoratif haut */}
        <div
          className="absolute top-0 left-0 h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--gold) 30%, var(--forest) 50%, var(--gold) 70%, transparent)",
          }}
          aria-hidden
        />

        <div className="relative px-4 pt-16 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal variant="up">
              <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
                {/* Colonne gauche — Newsletter */}
                <div>
                  <img src="/logo.png" alt="DanXomè" className="h-10 w-auto mb-6" />
                  <p className="font-display text-3xl leading-tight text-ivory sm:text-4xl">
                    La mémoire du DanXomè,
                    <br />
                    <span className="text-gradient-gold">vivante et partagée.</span>
                  </p>
                  <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/60">
                    Recevez chaque mois un récit du patrimoine béninois, les nouvelles œuvres des
                    artisans et l'agenda culturel.
                  </p>
                  <form
                    className="mt-8 flex max-w-md gap-2"
                    onSubmit={(e) => e.preventDefault()}
                    aria-label="Inscription à la lettre"
                  >
                    <Input
                      type="email"
                      required
                      placeholder="votre@email.com"
                      className="flex-1 border-ivory/15 bg-ivory/8 text-ivory placeholder:text-ivory/40 focus-visible:ring-accent"
                    />
                    <Button variant="gold" type="submit" className="rounded-full">
                      S'abonner
                    </Button>
                  </form>

                  {/* Réseaux sociaux */}
                  <div className="mt-8 flex gap-3">
                    {["Facebook", "Instagram", "Twitter", "YouTube"].map((social) => (
                      <span
                        key={social}
                        className="flex size-9 items-center justify-center rounded-full border border-ivory/15 text-xs text-ivory/50 transition-all duration-300 hover:border-accent/40 hover:text-accent hover:bg-accent/10 cursor-pointer"
                      >
                        {social[0]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Colonne droite — Liens */}
                <div className="grid gap-10 sm:grid-cols-3">
                  {columns.map((col) => (
                    <div key={col.titre}>
                      <p className="eyebrow-gold">{col.titre}</p>
                      <ul className="mt-5 space-y-3">
                        {col.liens.map((l) => (
                          <li key={l.to + l.label}>
                            <Link
                              to={l.to}
                              className="group/link flex items-center gap-2 text-sm text-ivory/60 transition-all duration-300 hover:text-accent hover:translate-x-1"
                            >
                              <span className="size-1 rounded-full bg-accent/0 transition-colors group-hover/link:bg-accent" />
                              {l.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Barre inférieure */}
      <div className="bg-forest-darker border-t border-ivory/8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-6 text-xs text-ivory/40 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="flex items-center gap-1.5">
            © {new Date().getFullYear()} DanXomè · Fait avec
            <Heart className="size-3 fill-terracotta text-terracotta" />
            au Bénin
          </p>
          <div className="flex flex-wrap gap-5">
            <Link to="/legal" className="transition-colors hover:text-accent">
              Confidentialité
            </Link>
            <Link to="/legal" className="transition-colors hover:text-accent">
              Conditions
            </Link>
            <Link to="/contact" className="transition-colors hover:text-accent">
              Presse
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, CreditCard, Minus, Plus, ShieldCheck, Ticket } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHead } from "@/components/site/Bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSites, useCreateReservation, formatFcfa } from "@/hooks/use-data";
import { useAuth } from "@/contexts/auth";
import { reservationSchema } from "@/lib/validations";
import { cn } from "@/lib/utils";

type Search = { site?: string };

export const Route = createFileRoute("/tourisme/reservation")({
  validateSearch: (search: Record<string, unknown>): Search =>
    typeof search["site"] === "string" ? { site: search["site"] } : {},
  head: () => ({
    meta: [
      { title: "Réserver une visite guidée au Bénin — DanXomè" },
      {
        name: "description",
        content:
          "Choisissez un site, une date et un nombre de visiteurs : réservation en trois étapes avec guide francophone et annulation gratuite.",
      },
      { property: "og:title", content: "Réserver une visite guidée — DanXomè" },
      {
        property: "og:description",
        content: "Réservation en trois étapes, guide inclus, annulation gratuite.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Reservation,
});

const creneaux = ["08 h 00", "10 h 30", "14 h 00", "16 h 30"];
const etapes = ["Visite", "Date & personnes", "Coordonnées"];

function Reservation() {
  const { data: sites = [] } = useSites();
  const { site: siteParam } = Route.useSearch();
  const { user } = useAuth();
  const createReservation = useCreateReservation();
  const [etape, setEtape] = useState(0);
  const [slug, setSlug] = useState(siteParam ?? "");
  const [date, setDate] = useState("");
  const [creneau, setCreneau] = useState(creneaux[1]!);
  const [personnes, setPersonnes] = useState(2);
  const [envoye, setEnvoye] = useState(false);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");

  const site = useMemo(() => sites.find((s) => s.slug === slug) ?? sites[0], [sites, slug]);
  const currentSlug = useMemo(() => site?.slug ?? sites[0]?.slug ?? "", [site, sites]);
  const sousTotal = (site?.prix ?? 0) * personnes;
  const frais = Math.round(sousTotal * 0.04);

  if (envoye && site) {
    return (
      <SiteShell>
        <PageHead
          eyebrow="Réservation"
          title="Votre demande est enregistrée"
          intro="Un guide du réseau DanXomè vous confirme le créneau par e-mail sous 24 heures. Aucun paiement n'a été débité à cette étape."
          crumbs={[{ label: "Tourisme", to: "/tourisme" }, { label: "Réservation" }]}
        />
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-border bg-card p-8">
            <div className="flex size-12 items-center justify-center rounded-full bg-forest text-primary-foreground">
              <Check className="size-6" />
            </div>
            <h2 className="mt-6 font-display text-2xl text-forest-deep">{site.nom}</h2>
            <dl className="mt-5 space-y-2.5 text-sm">
              <Ligne label="Date" value={date || "à confirmer"} />
              <Ligne label="Créneau" value={creneau} />
              <Ligne label="Visiteurs" value={`${personnes} personne${personnes > 1 ? "s" : ""}`} />
              <Ligne label="Total estimé" value={formatFcfa(sousTotal + frais)} />
            </dl>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="gold">
                <Link to="/profil">Voir mes réservations</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/tourisme">Explorer d'autres sites</Link>
              </Button>
            </div>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PageHead
        eyebrow="Réservation"
        title="Trois étapes, un guide, une date"
        intro="Les visites sont opérées avec des guides locaux certifiés. Paiement sur place ou en ligne, annulation gratuite jusqu'à 48 heures avant."
        crumbs={[{ label: "Tourisme", to: "/tourisme" }, { label: "Réservation" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <ol className="flex flex-wrap gap-2">
          {etapes.map((e, i) => (
            <li key={e}>
              <button
                onClick={() => setEtape(i)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                  i === etape
                    ? "border-forest bg-forest text-primary-foreground"
                    : i < etape
                      ? "border-accent text-forest-deep"
                      : "border-border text-muted-foreground",
                )}
              >
                <span className="font-display text-sm">{i + 1}</span> {e}
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
            {etape === 0 && (
              <div>
                <h2 className="font-display text-2xl text-forest-deep">Quelle visite ?</h2>
                <div className="mt-6 space-y-3">
                  {sites.map((s) => (
                    <button
                      key={s.slug}
                      onClick={() => setSlug(s.slug)}
                      className={cn(
                        "flex w-full items-center gap-4 rounded-lg border p-3 text-left transition-colors",
                        s.slug === currentSlug
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50",
                      )}
                    >
                      <img
                        src={s.image_url}
                        alt={s.nom}
                        loading="lazy"
                        className="media-warm size-16 shrink-0 rounded-md object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-forest-deep">
                          {s.nom}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {s.region} · {s.type}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-forest">
                        {formatFcfa(s.prix)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {etape === 1 && (
              <div>
                <h2 className="font-display text-2xl text-forest-deep">Date et visiteurs</h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="date">Date de visite</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Nombre de visiteurs</Label>
                    <div className="mt-2 flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Retirer un visiteur"
                        onClick={() => setPersonnes((p) => Math.max(1, p - 1))}
                      >
                        <Minus />
                      </Button>
                      <span className="font-display text-2xl text-forest-deep">{personnes}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Ajouter un visiteur"
                        onClick={() => setPersonnes((p) => Math.min(12, p + 1))}
                      >
                        <Plus />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="mt-7 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Créneau
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {creneaux.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCreneau(c)}
                      className={cn(
                        "rounded-md border px-4 py-2 text-sm font-semibold transition-colors",
                        c === creneau
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border text-foreground/70 hover:border-accent/50",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {etape === 2 && (
              <div>
                <h2 className="font-display text-2xl text-forest-deep">Vos coordonnées</h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="nom">Nom complet</Label>
                    <Input
                      id="nom"
                      className="mt-2"
                      placeholder="Aïssatou Dossou"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      className="mt-2"
                      placeholder="vous@exemple.bj"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tel">Téléphone</Label>
                    <Input
                      id="tel"
                      className="mt-2"
                      placeholder="+229 …"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="langue">Langue du guide</Label>
                    <Input id="langue" className="mt-2" defaultValue="Français" disabled />
                  </div>
                </div>
                <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-4 text-forest" /> Démonstration : aucune donnée
                  bancaire n'est collectée.
                </p>
              </div>
            )}

            <div className="mt-8 flex justify-between gap-3 border-t border-border pt-6">
              <Button
                variant="ghost"
                onClick={() => setEtape((e) => Math.max(0, e - 1))}
                disabled={etape === 0}
              >
                Retour
              </Button>
              {etape < 2 ? (
                <Button variant="gold" onClick={() => setEtape((e) => e + 1)}>
                  Continuer
                </Button>
              ) : (
                <Button
                  variant="gold"
                  disabled={createReservation.isPending}
                  onClick={async () => {
                    if (!site) return;

                    const parsed = reservationSchema.safeParse({
                      siteId: site.id,
                      date,
                      creneau,
                      personnes,
                      nom,
                      email,
                      telephone,
                    });

                    if (!parsed.success) {
                      const firstError = parsed.error.errors[0];
                      toast.error("Erreur de validation", {
                        description: firstError?.message ?? "Veuillez remplir tous les champs.",
                      });
                      return;
                    }

                    try {
                      await createReservation.mutateAsync({
                        site_id: site.id,
                        site_nom: site.nom,
                        date,
                        creneau,
                        personnes,
                        sous_total: sousTotal,
                        frais,
                        montant_total: sousTotal + frais,
                        nom_contact: nom,
                        email_contact: email,
                        telephone_contact: telephone,
                      });
                      setEnvoye(true);
                    } catch {
                      toast.error("Erreur", {
                        description: "Impossible d'enregistrer la réservation. Réessayez.",
                      });
                    }
                  }}
                >
                  <CreditCard /> Confirmer la réservation
                </Button>
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            {site && (
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <img
                  src={site.image_url}
                  alt={site.nom}
                  className="media-warm aspect-[4/3] w-full object-cover"
                />
                <div className="p-6">
                  <Badge variant="quiet">{site.type}</Badge>
                  <h3 className="mt-3 font-display text-xl text-forest-deep">{site.nom}</h3>
                  <dl className="mt-5 space-y-2.5 text-sm">
                    <Ligne label="Date" value={date || "—"} />
                    <Ligne label="Créneau" value={creneau} />
                    <Ligne
                      label={`${formatFcfa(site.prix)} × ${personnes}`}
                      value={formatFcfa(sousTotal)}
                    />
                    <Ligne label="Frais de service" value={formatFcfa(frais)} />
                  </dl>
                  <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
                    <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                      Total
                    </span>
                    <span className="font-display text-2xl text-forest-deep">
                      {formatFcfa(sousTotal + frais)}
                    </span>
                  </div>
                  <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Ticket className="size-4 text-accent" /> Entrée et guide francophone inclus
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}

function Ligne({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold text-forest-deep">{value}</dd>
    </div>
  );
}

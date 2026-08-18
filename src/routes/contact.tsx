import { createFileRoute } from "@tanstack/react-router";
import { Check, Mail, MapPin, Phone } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHead } from "@/components/site/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSendContact } from "@/hooks/use-data";
import { contactSchema } from "@/lib/validations";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & presse — DanXomè" },
      {
        name: "description",
        content:
          "Écrivez à l'équipe DanXomè : partenariats culturels, demandes presse, artisans candidats et assistance visiteurs.",
      },
      { property: "og:title", content: "Contact & presse — DanXomè" },
      { property: "og:description", content: "Nous joindre à Cotonou, Porto-Novo et Abomey." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

const canaux = [
  { icon: Mail, titre: "Écrire", valeur: "bonjour@dahome.bj" },
  { icon: Phone, titre: "Appeler", valeur: "+229 21 30 00 00" },
  { icon: MapPin, titre: "Nous rendre visite", valeur: "Boulevard de la Marina, Cotonou" },
];

const sujets = [
  "Partenariat institutionnel",
  "Candidature artisan",
  "Presse",
  "Assistance visiteur",
];

function Contact() {
  const [envoye, setEnvoye] = useState(false);
  const sendContact = useSendContact();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <SiteShell>
      <PageHead
        eyebrow="Contact"
        title="Parlons patrimoine"
        intro="Une question sur une visite, un projet de partenariat ou une demande presse ? L'équipe répond sous deux jours ouvrés."
        crumbs={[{ label: "Contact" }]}
      />

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:px-8">
        <div className="rounded-lg border border-border bg-card p-7 sm:p-9">
          {envoye ? (
            <div className="py-10 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-forest text-ivory">
                <Check className="size-6" />
              </span>
              <h2 className="mt-6 font-display text-3xl text-forest-deep">Message envoyé</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Merci — votre demande est enregistrée. Nous revenons vers vous très vite.
              </p>
              <Button variant="outline" className="mt-7" onClick={() => setEnvoye(false)}>
                Écrire un autre message
              </Button>
            </div>
          ) : (
            <form
              ref={formRef}
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const parsed = contactSchema.safeParse({
                  nom: fd.get("nom") as string,
                  email: fd.get("email") as string,
                  sujet: fd.get("sujet") as string,
                  message: fd.get("message") as string,
                });
                if (!parsed.success) {
                  const firstError = parsed.error.errors[0];
                  toast.error("Erreur de validation", {
                    description: firstError?.message ?? "Veuillez vérifier vos informations.",
                  });
                  return;
                }
                sendContact.mutate(parsed.data, { onSuccess: () => setEnvoye(true) });
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom complet</Label>
                  <Input id="nom" name="nom" required placeholder="Ayaba Dossou" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="vous@email.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sujet">Sujet</Label>
                <select
                  id="sujet"
                  name="sujet"
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring"
                >
                  {sujets.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  placeholder="Décrivez votre demande…"
                />
              </div>
              <Button
                type="submit"
                variant="gold"
                className="w-full sm:w-auto"
                disabled={sendContact.isPending}
              >
                {sendContact.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Envoi en cours…
                  </span>
                ) : (
                  "Envoyer le message"
                )}
              </Button>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          {canaux.map((c) => (
            <div
              key={c.titre}
              className="flex gap-4 rounded-lg border border-border bg-secondary/50 p-6"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-forest-deep text-ivory">
                <c.icon className="size-4" />
              </span>
              <div>
                <p className="eyebrow">{c.titre}</p>
                <p className="mt-1 text-sm text-foreground/85">{c.valeur}</p>
              </div>
            </div>
          ))}
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            <p className="eyebrow">Horaires</p>
            <p className="mt-3">Lundi – vendredi · 8h – 17h30</p>
            <p>Samedi · 9h – 13h</p>
          </div>
        </aside>
      </section>
    </SiteShell>
  );
}

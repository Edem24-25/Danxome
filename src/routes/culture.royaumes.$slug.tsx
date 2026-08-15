import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Breadcrumbs, Rule } from "@/components/site/Bits";
import { Reveal } from "@/components/site/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { royaumes } from "@/lib/data";

export const Route = createFileRoute("/culture/royaumes/$slug")({
  loader: ({ params }) => {
    const royaume = royaumes.find((r) => r.slug === params.slug);
    if (!royaume) throw notFound();
    return { royaume };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Royaume introuvable — DanXomè" }, { name: "robots", content: "noindex" }],
      };
    }
    const { royaume } = loaderData;
    return {
      meta: [
        { title: `${royaume.nom} — DanXomè` },
        { name: "description", content: royaume.resume },
        { property: "og:title", content: `${royaume.nom} — DanXomè` },
        { property: "og:description", content: royaume.resume },
      ],
    };
  },
  component: RoyaumeDetail,
});

function RoyaumeDetail() {
  const { royaume } = Route.useLoaderData();

  return (
    <SiteShell>
      <section className="relative isolate flex min-h-[62vh] items-end overflow-hidden">
        <img
          src={royaume.image}
          alt={royaume.nom}
          className="media-warm absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/60 to-forest-deep/20" />
        <div className="relative mx-auto w-full max-w-4xl px-4 pt-28 pb-14 sm:px-6">
          <Breadcrumbs
            dark
            items={[{ label: "Culture", to: "/culture" }, { label: royaume.nom }]}
          />
          <Badge variant="onDark" className="mt-6">
            {royaume.periode}
          </Badge>
          <h1 className="mt-5 font-display text-4xl leading-[1.02] text-ivory sm:text-6xl">
            {royaume.nom}
          </h1>
          <p className="mt-5 max-w-2xl text-ivory/80">{royaume.resume}</p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="font-display text-2xl leading-snug text-forest-deep">
          {royaume.conte[0]}
        </p>

        <div className="mt-8 space-y-6 text-[15px] leading-[1.8] text-foreground/85">
          {royaume.conte.slice(1).map((paragraphe, i) => {
            if (paragraphe.startsWith("«") || paragraphe.startsWith('"')) {
              return (
                <blockquote key={i} className="border-l-2 border-accent pl-5 font-display text-xl text-forest-deep italic">
                  {paragraphe}
                </blockquote>
              );
            }
            return <p key={i}>{paragraphe}</p>;
          })}
        </div>

        <Rule className="my-14" />

        <h2 className="font-display text-3xl text-forest-deep">Frise chronologique</h2>
        <ol className="mt-8 border-l border-border">
          {royaume.frise.map((f, i) => (
            <Reveal key={f.annee} delay={i * 60}>
              <li className="relative py-5 pl-8">
                <span className="absolute top-7 -left-[7px] size-3.5 rounded-full border-2 border-background bg-terracotta" />
                <p className="font-display text-xl text-terracotta">{f.annee}</p>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">{f.texte}</p>
              </li>
            </Reveal>
          ))}
        </ol>

        <div className="mt-14 rounded-lg border border-border bg-card p-7">
          <p className="eyebrow">Sur place</p>
          <h3 className="mt-2 font-display text-2xl text-forest-deep">
            {royaume.visiter[0]?.type === "site"
              ? `Visiter ${royaume.nom}`
              : royaume.visiter[0]?.type === "musee"
                ? `Découvrir ${royaume.nom}`
                : `Explorer ${royaume.nom}`}
          </h3>
          <div className="mt-6 flex flex-wrap gap-3">
            {royaume.visiter.map((v) => {
              const linkTo =
                v.type === "site"
                  ? `/tourisme/sites/$slug`
                  : v.type === "visite"
                    ? `/visite/$slug`
                    : `/culture/musees/$slug`;
              return (
                <Button
                  key={v.slug}
                  asChild
                  variant={v.type === "site" ? "gold" : v.type === "visite" ? "outline" : "ghost"}
                >
                  <Link to={linkTo} params={{ slug: v.slug }}>
                    {v.titre}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </article>
    </SiteShell>
  );
}

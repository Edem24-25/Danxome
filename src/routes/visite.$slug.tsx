import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Compass,
  Headphones,
  Info,
  Maximize2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sites } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/visite/$slug")({
  loader: ({ params }) => {
    const site = sites.find((s) => s.slug === params.slug && s.virtuel);
    if (!site) throw notFound();
    return { site };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Visite indisponible — Dãhomè" }, { name: "robots", content: "noindex" }],
      };
    }
    const { site } = loaderData;
    return {
      meta: [
        { title: `Visite virtuelle 360° — ${site.nom} | Dãhomè` },
        {
          name: "description",
          content: `Explorez ${site.nom} en immersion 360°.`,
        },
        { property: "og:title", content: `Visite virtuelle 360° — ${site.nom}` },
        { property: "og:description", content: `Explorez ${site.nom} en immersion 360°.` },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: VisiteVirtuelle,
});

interface HotspotData {
  x: number;
  y: number;
  label: string;
  description: string;
}

interface Scene {
  id: string;
  titre: string;
  description: string;
  narration: string;
  hotspots: HotspotData[];
  yawPositions: number[];
}

const scenesBySite: Record<string, Scene[]> = {
  "palais-royaux-abomey": [
    {
      id: "cour",
      titre: "Cour d'honneur",
      description:
        "Point de départ du parcours royal. Fontaine cérémonielle et bas-reliefs des victoires.",
      narration:
        "Bienvenue dans la cour d'honneur des palais royaux d'Abomey. Les rois du Dahomey recevaient ici leurs sujets.",
      hotspots: [
        {
          x: 30,
          y: 45,
          label: "Fontaine cérémonielle",
          description:
            "Au centre de la cour, cette fontaine rituelle bénie par les prêtres vodun approvisionnait les cérémonies royales.",
        },
        {
          x: 65,
          y: 40,
          label: "Bas-relief",
          description:
            "Cinquante-six panneaux en terre cuite peinte racontent les exploits militaires des douze rois.",
        },
      ],
      yawPositions: [20, 40, 60, 80],
    },
    {
      id: "trones",
      titre: "Salle des trônes",
      description:
        "Trônes en bois sculpté, récades et tentures appliquées ornent cette salle sacrée.",
      narration:
        "La salle des trônes, cœur politique du royaume. Chaque trône incarne un roi et son règne.",
      hotspots: [
        {
          x: 40,
          y: 35,
          label: "Trône de Guézo",
          description:
            "Trône en bois de caillebarde, symbole du pouvoir du roi Guézo qui régna de 1818 à 1858.",
        },
        {
          x: 70,
          y: 50,
          label: "Récade royale",
          description:
            "Bâton de commandement sculpté, remis à chaque nouveau roi lors de l'intronisation.",
        },
      ],
      yawPositions: [30, 50, 70, 90],
    },
    {
      id: "bas-reliefs",
      titre: "Galerie des bas-reliefs",
      description: "Panneaux en terre cuite racontant l'histoire des douze rois du Dahomey.",
      narration:
        "Cette galerie unique au monde présente les bas-reliefs d'Abomey, inscrits au patrimoine mondial de l'UNESCO.",
      hotspots: [
        {
          x: 25,
          y: 40,
          label: "Règne d'Agaja",
          description:
            "Agaja, foncteur de l'expansion du royaume vers le sud, est représenté en guerrier triomphant.",
        },
        {
          x: 60,
          y: 45,
          label: "Investiture royale",
          description:
            "Cérémonie d'intronisation où le nouveau roi recevait les symboles du pouvoir.",
        },
      ],
      yawPositions: [25, 45, 65, 85],
    },
    {
      id: "place",
      titre: "Place cérémonielle",
      description: "Espace des danses rituelles et des serments d'allégeance.",
      narration:
        "La place cérémonielle vibrait au rythme des tambours royaux. Ici se déroulaient les danses d'Agbadza.",
      hotspots: [
        {
          x: 35,
          y: 50,
          label: "Autel vodun",
          description:
            "Autel dédié aux divinités vodun, gardiennes du royaume et protectrices des rois.",
        },
        {
          x: 65,
          y: 35,
          label: "Tambours royaux",
          description:
            "Les tambours Atoumpan, réservés à la cour, accompagnaient toutes les cérémonies officielles.",
        },
      ],
      yawPositions: [20, 50, 70, 90],
    },
  ],
  ganvie: [
    {
      id: "marche",
      titre: "Marché flottant",
      description: "Le cœur battant de Ganvié : pirogues chargées de poissons et de tissus wax.",
      narration:
        "Bienvenue au marché flottant de Ganvié. Chaque matin, des centaines de pirogues se rencontrent sur le lac Nokoué.",
      hotspots: [
        {
          x: 40,
          y: 55,
          label: "Pirogue de pêcheur",
          description:
            "Les pirogues monoxyles taillées dans un seul tronc sont le moyen de transport principal.",
        },
        {
          x: 70,
          y: 40,
          label: "Vendeuse de maïs",
          description:
            "Les marchandes de Ganvié vendent maïs, manioc, poisson fumé et tissus wax depuis leurs embarcations.",
        },
      ],
      yawPositions: [20, 50, 70, 90],
    },
    {
      id: "habitations",
      titre: "Habitations lacustres",
      description: "Maisons sur pilotis en bois de palétuvier et feuilles de raphia.",
      narration:
        "Les habitations de Ganvié sont construites sur des pilotis. La communauté Tofinu a adapté sa vie à cet environnement unique.",
      hotspots: [
        {
          x: 30,
          y: 45,
          label: "Maison traditionnelle",
          description:
            "Construite en bois de palétuvier et feuilles de raphia, elle abrite une famille entière.",
        },
        {
          x: 65,
          y: 50,
          label: "Passerelle",
          description:
            "Réseau de planches reliant les habitations, véritable rue aquatique de Ganvié.",
        },
      ],
      yawPositions: [30, 50, 70, 85],
    },
    {
      id: "ecole",
      titre: "École lacustre",
      description: "L'une des rares écoles sur pilotis du lac Nokoué.",
      narration:
        "L'école de Ganvié accueille chaque matin des enfants venus en pirogue, parfois de loin, pour apprendre à lire et écrire.",
      hotspots: [
        {
          x: 45,
          y: 40,
          label: "Salle de classe",
          description:
            "Des enfants de 6 à 14 ans viennent de toute la lagune pour fréquenter cette école unique.",
        },
        {
          x: 70,
          y: 55,
          label: "Quai d'arrivée",
          description: "Chaque élève attache sa pirogue au quai avant d'entrer en classe.",
        },
      ],
      yawPositions: [25, 45, 65, 80],
    },
  ],
  "porte-du-non-retour": [
    {
      id: "memorial",
      titre: "Le Mémorial",
      description: "Monument face à l'Atlantique honorant la mémoire des déportés.",
      narration:
        "La Porte du Non-Retour marque la fin de la Route des Esclaves. Ce mémorial rappelle les millions d'Africains déportés.",
      hotspots: [
        {
          x: 40,
          y: 45,
          label: "Stèle commémorative",
          description:
            "Érigée en 1995, cette stèle rend hommage à tous les esclaves déportés vers les Amériques.",
        },
        {
          x: 70,
          y: 50,
          label: "Plage de Ouidah",
          description:
            "Cette plage fut le dernier point de contact avec l'Afrique pour des millions de déportés.",
        },
      ],
      yawPositions: [20, 45, 70, 90],
    },
    {
      id: "route",
      titre: "Route des Esclaves",
      description: "Parcours de 4 km jalonné de bas-reliefs racontant la traite négrière.",
      narration:
        "La Route des Esclaves de Ouidah, longue de 4 kilomètres, est jalonnée de 32 bas-reliefs et marquages commémoratifs.",
      hotspots: [
        {
          x: 35,
          y: 40,
          label: "Arbre de l'oubli",
          description:
            "Selon la tradition, les esclaves devaient tourner autour de cet arbre pour oublier leur passé.",
        },
        {
          x: 65,
          y: 55,
          label: "Place Chacha",
          description:
            "Point de rassemblement où les captifs étaient marchandés avant l'embarquement.",
        },
      ],
      yawPositions: [25, 50, 70, 85],
    },
    {
      id: "temple",
      titre: "Temple des Pythons",
      description: "Sanctuaire vodun où des centaines de pythons vivent en liberté.",
      narration:
        "Le Temple des Pythons de Ouidah est l'un des lieux vodun les plus sacrés du Bénin. Des centaines de pythons règnent ici.",
      hotspots: [
        {
          x: 40,
          y: 50,
          label: "Autel principal",
          description: "L'autel dédié au python Dan, divinité de la fertilité et de la divination.",
        },
        {
          x: 65,
          y: 40,
          label: "Pythons sacrés",
          description:
            "Les pythons sont considérés comme des messagers entre le monde des vivants et celui des esprits.",
        },
      ],
      yawPositions: [30, 55, 75, 90],
    },
  ],
};

function VisiteVirtuelle() {
  const { site } = Route.useLoaderData();
  const scenes = scenesBySite[site.slug] ?? scenesBySite["palais-royaux-abomey"]!;
  const [sceneIndex, setSceneIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [yaw, setYaw] = useState(50);
  const [pitch, setPitch] = useState(0);
  const [infoOpen, setInfoOpen] = useState(true);
  const [audioOn, setAudioOn] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hotspotDetail, setHotspotDetail] = useState<HotspotData | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const scene = scenes[sceneIndex]!;

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      drag.current = { x: e.clientX, y: e.clientY, yaw, pitch };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [yaw, pitch],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = ((e.clientX - drag.current.x) / window.innerWidth) * 360;
    const dy = ((e.clientY - drag.current.y) / window.innerHeight) * 120;
    setYaw((drag.current.yaw + dx + 360) % 360);
    setPitch(Math.min(60, Math.max(-60, drag.current.pitch - dy)));
  }, []);

  const onPointerUp = useCallback(() => {
    drag.current = null;
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    if (autoPlay) {
      autoTimer.current = setInterval(() => {
        setSceneIndex((i) => (i + 1) % scenes.length);
        setYaw(50);
        setPitch(0);
      }, 8000);
    }
    return () => {
      if (autoTimer.current) clearInterval(autoTimer.current);
    };
  }, [autoPlay, scenes.length]);

  useEffect(() => {
    setHotspotDetail(null);
  }, [sceneIndex]);

  const visibleHotspots = scene.hotspots.map((h) => {
    const dx = (((h.x / 100) * 360 - yaw + 540) % 360) - 180;
    const screenX = 50 + (dx / 180) * 50;
    const screenY = h.y + pitch * 0.3;
    const visible = Math.abs(dx) < 100 && screenX > 5 && screenX < 95;
    return { ...h, screenX, screenY, visible };
  });

  return (
    <div className="flex min-h-screen flex-col bg-forest-deep text-ivory">
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button asChild variant="onDark" size="sm">
            <Link to="/tourisme/sites/$slug" params={{ slug: site.slug }}>
              <ArrowLeft /> Fiche
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase">
              Visite 360°
            </p>
            <p className="truncate font-display text-lg leading-tight">{site.nom}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="onDark" className="hidden gap-1 sm:inline-flex">
            <Headphones className="size-3" /> Audio FR
          </Badge>
          <Button
            variant="onDark"
            size="icon"
            aria-label="Audio"
            onClick={() => setAudioOn((v) => !v)}
          >
            {audioOn ? <Volume2 /> : <VolumeX />}
          </Button>
          <Button
            variant="onDark"
            size="icon"
            aria-label="Infos"
            onClick={() => setInfoOpen((v) => !v)}
          >
            <Info />
          </Button>
        </div>
      </header>

      {/* Viewer */}
      <div
        ref={containerRef}
        className="relative flex-1 cursor-grab touch-none overflow-hidden select-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Panorama image with CSS transform-based 360 simulation */}
        <div
          className="absolute inset-0 transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${zoom}) perspective(1000px) rotateY(${(yaw - 50) * 0.6}deg) rotateX(${-pitch * 0.3}deg)`,
          }}
        >
          <img
            src={site.image}
            alt={`Panorama ${scene.titre} — ${site.nom}`}
            draggable={false}
            className="size-full object-cover"
          />
        </div>

        {/* Vignette overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,oklch(0.19_0.03_160/0.8)_100%)]" />

        {/* Compass */}
        <div className="absolute top-4 right-4 z-10 sm:right-6">
          <div className="relative size-16 overflow-hidden rounded-full border border-ivory/20 bg-forest-deep/60 backdrop-blur-sm">
            <img src="/compass.svg" alt="Boussole" className="size-full" />
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: `rotate(${-yaw + 180}deg)` }}
            >
              <div className="h-0.5 w-8 bg-terracotta" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-2 rounded-full bg-terracotta shadow-lg" />
            </div>
          </div>
        </div>

        {/* Hotspots */}
        {visibleHotspots
          .filter((h) => h.visible)
          .map((h) => (
            <button
              key={h.label}
              style={{ left: `${h.screenX}%`, top: `${h.screenY}%` }}
              className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
              aria-label={h.label}
              onClick={() => setHotspotDetail(hotspotDetail?.label === h.label ? null : h)}
            >
              <span className="relative flex size-9 items-center justify-center rounded-full border border-ivory/60 bg-ivory/15 backdrop-blur-sm transition-transform group-hover:scale-110">
                <span className="absolute inset-0 animate-ping rounded-full border border-accent/60" />
                <Plus className="size-4 text-ivory" />
              </span>
              <span className="pointer-events-none absolute top-1/2 left-11 -translate-y-1/2 rounded-md bg-forest-deep/90 px-2.5 py-1 text-xs font-semibold whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
                {h.label}
              </span>
            </button>
          ))}

        {/* Hotspot detail panel */}
        {hotspotDetail && (
          <div className="absolute bottom-20 left-4 z-20 max-w-xs rounded-lg border border-ivory/15 bg-forest-deep/90 p-5 backdrop-blur-md sm:left-6">
            <p className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase">
              Point d'intérêt
            </p>
            <h3 className="mt-1 font-display text-lg">{hotspotDetail.label}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ivory/75">
              {hotspotDetail.description}
            </p>
          </div>
        )}

        {/* Info panel */}
        {infoOpen && (
          <div className="absolute top-4 left-4 z-10 max-w-xs rounded-lg border border-ivory/15 bg-forest-deep/85 p-5 backdrop-blur-md sm:left-6">
            <p className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase">
              Scène {sceneIndex + 1} / {scenes.length}
            </p>
            <h2 className="mt-2 font-display text-xl">{scene.titre}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ivory/75">{scene.description}</p>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-ivory/60">
              <Compass className="size-3.5 text-accent" /> Glissez pour pivoter
            </p>
          </div>
        )}

        {/* Zoom + fullscreen controls */}
        <div className="absolute top-1/2 right-4 z-10 flex -translate-y-1/2 flex-col gap-2 sm:right-6">
          <Button
            variant="onDark"
            size="icon"
            aria-label="Zoom avant"
            onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.15).toFixed(2)))}
          >
            <Plus />
          </Button>
          <Button
            variant="onDark"
            size="icon"
            aria-label="Zoom arrière"
            onClick={() => setZoom((z) => Math.max(0.8, +(z - 0.15).toFixed(2)))}
          >
            <Minus />
          </Button>
          <Button
            variant="onDark"
            size="icon"
            aria-label="Réinitialiser"
            onClick={() => {
              setZoom(1);
              setYaw(50);
              setPitch(0);
            }}
          >
            <RotateCcw />
          </Button>
          <Button variant="onDark" size="icon" aria-label="Plein écran" onClick={toggleFullscreen}>
            <Maximize2 />
          </Button>
        </div>
      </div>

      {/* Bottom bar: narration + scene strip */}
      <div className="border-t border-ivory/10 bg-forest-deep/95">
        {/* Narration */}
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-ivory hover:text-accent"
            onClick={() => setAudioOn((v) => !v)}
          >
            {audioOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </Button>
          <p className="min-w-0 flex-1 text-sm italic leading-relaxed text-ivory/60">
            {scene.narration}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className={cn("shrink-0 text-ivory hover:text-accent", autoPlay && "text-accent")}
            aria-label={autoPlay ? "Pause" : "Lecture auto"}
            onClick={() => setAutoPlay((v) => !v)}
          >
            {autoPlay ? <Pause className="size-4" /> : <Play className="size-4" />}
          </Button>
        </div>

        {/* Scene strip */}
        <div className="flex gap-3 overflow-x-auto px-4 pb-4 sm:px-6">
          {scenes.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setSceneIndex(i);
                setYaw(50);
                setPitch(0);
                setHotspotDetail(null);
              }}
              className={cn(
                "group relative w-40 shrink-0 overflow-hidden rounded-md border text-left transition-all",
                i === sceneIndex
                  ? "border-accent ring-1 ring-accent/30"
                  : "border-ivory/15 hover:border-ivory/40",
              )}
            >
              <img
                src={site.image}
                alt=""
                loading="lazy"
                className="h-20 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                style={{ objectPosition: `${scene.yawPositions[i] ?? 50}% 50%` }}
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-deep to-transparent px-2.5 py-1.5 text-xs font-semibold">
                {s.titre}
              </span>
              {i === sceneIndex && (
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent shadow-lg" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

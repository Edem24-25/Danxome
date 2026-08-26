import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  UserRound,
  Phone,
  MapPin,
  Globe,
  ArrowLeft,
  Save,
  Camera,
  Trash2,
} from "lucide-react";
import { ProfilShell } from "@/components/site/ProfilShell";
import { ProfilBadge } from "@/components/site/ProfilBadge";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth";
import { createClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/profil/details")({
  head: () => ({
    meta: [
      { title: "Mes informations — DanXomè" },
      {
        name: "description",
        content: "Modifiez vos informations personnelles sur DanXomè.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilDetails,
});

function ProfilDetails() {
  const { profile, loading, user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [enCours, setEnCours] = useState(false);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ville, setVille] = useState("");
  const [pays, setPays] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setPrenom(profile.prenom ?? "");
      setNom(profile.nom ?? "");
      setTelephone(profile.telephone ?? "");
      setAdresse(profile.adresse ?? "");
      setVille(profile.ville ?? "");
      setPays(profile.pays ?? "");
    }
  }, [profile]);

  const initiales = useMemo(
    () => `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase() || "D",
    [prenom, nom],
  );

  const hasChanges = useMemo(() => {
    if (!profile) return false;
    return (
      prenom.trim() !== (profile.prenom ?? "") ||
      nom.trim() !== (profile.nom ?? "") ||
      telephone.trim() !== (profile.telephone ?? "") ||
      adresse.trim() !== (profile.adresse ?? "") ||
      ville.trim() !== (profile.ville ?? "") ||
      pays.trim() !== (profile.pays ?? "")
    );
  }, [prenom, nom, telephone, adresse, ville, pays, profile]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (prenom.trim().length > 0 && prenom.trim().length < 2) e.prenom = "2 caractères minimum";
    if (nom.trim().length > 0 && nom.trim().length < 2) e.nom = "2 caractères minimum";
    if (telephone && !/^[+\d\s()-]{6,20}$/.test(telephone)) e.telephone = "Numéro invalide";
    return e;
  }, [prenom, nom, telephone]);

  const isValid =
    prenom.trim().length >= 2 && nom.trim().length >= 2 && Object.keys(errors).length === 0;

  if (loading || !user || !profile) {
    return (
      <ProfilShell title="Mes informations" crumbs={[{ label: "Mon profil", to: "/profil" }]}>
        <div className="space-y-4 py-4">
          <Skeleton className="h-4 w-32" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </ProfilShell>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setEnCours(true);
    const { error } = await updateProfile({
      prenom: prenom.trim(),
      nom: nom.trim(),
      telephone: telephone.trim() || null,
      adresse: adresse.trim() || null,
      ville: ville.trim() || null,
      pays: pays.trim() || null,
    });
    setEnCours(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Informations mises à jour", {
      description: "Votre profil a été modifié avec succès.",
    });
    navigate({ to: "/profil" });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Fichier trop volumineux", { description: "5 Mo maximum." });
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format non supporté", { description: "JPEG, PNG ou WebP uniquement." });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !profile) return;
    setUploadingAvatar(true);

    const ext = avatarFile.name.split(".").pop() ?? "jpg";
    const path = `${profile.id}/${Date.now()}.${ext}`;
    const supabase = createClient();

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { contentType: avatarFile.type, upsert: true });

    if (uploadError) {
      setUploadingAvatar(false);
      toast.error("Erreur lors de l'envoi", { description: "Impossible de charger l'image." });
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const newAvatarUrl = urlData.publicUrl;
    const { error: updateError } = await updateProfile({ avatar_url: newAvatarUrl });

    if (updateError) {
      setUploadingAvatar(false);
      toast.error(updateError);
      return;
    }

    // Sync to artistes.image_url if the user is an artist/artisan
    if (profile.profil === "artiste" || profile.profil === "artisan") {
      await supabase.from("artistes").update({ image_url: newAvatarUrl }).eq("user_id", profile.id);
    }

    setUploadingAvatar(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    toast.success("Photo de profil mise à jour");
  };

  const handleAvatarRemove = async () => {
    if (!profile?.avatar_url) return;
    setUploadingAvatar(true);

    const { error } = await updateProfile({ avatar_url: null });

    if (error) {
      setUploadingAvatar(false);
      toast.error(error);
      return;
    }

    // Sync to artistes.image_url if the user is an artist/artisan
    if (profile.profil === "artiste" || profile.profil === "artisan") {
      const supabase = createClient();
      await supabase.from("artistes").update({ image_url: null }).eq("user_id", profile.id);
    }

    setUploadingAvatar(false);
    toast.success("Photo de profil supprimée");
  };

  const currentAvatar = avatarPreview ?? profile.avatar_url;

  return (
    <ProfilShell
      title="Mes informations"
      crumbs={[{ label: "Mon profil", to: "/profil" }, { label: "Informations" }]}
    >
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* ═══ APERÇU PROFIL ═══ */}
        <Reveal variant="up">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="relative group">
                <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-forest/10 font-display text-4xl text-forest ring-4 ring-background ring-offset-2 transition-transform group-hover:scale-105">
                  {currentAvatar ? (
                    <img
                      src={currentAvatar}
                      alt={`${prenom} ${nom}`}
                      className="size-full object-cover"
                    />
                  ) : (
                    initiales
                  )}
                </div>

                {/* Bouton camera */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full bg-forest text-foreground shadow-md transition-all hover:bg-forest-deep hover:scale-110"
                  title="Changer la photo"
                >
                  <Camera className="size-3.5" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <div className="text-center sm:text-left">
                <h3 className="font-display text-2xl text-forest-deep">
                  {prenom || "Prénom"} {nom || "Nom"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
                <div className="mt-2">
                  <ProfilBadge profil={profile.profil} />
                </div>

                {/* Actions avatar */}
                {avatarPreview && (
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="gold"
                      onClick={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? "Envoi…" : "Enregistrer la photo"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                )}

                {profile.avatar_url && !avatarPreview && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="mt-2 text-destructive hover:text-destructive"
                    onClick={handleAvatarRemove}
                    disabled={uploadingAvatar}
                  >
                    <Trash2 className="size-3.5" /> Supprimer la photo
                  </Button>
                )}

                {!hasChanges && !avatarPreview && (
                  <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1 justify-center sm:justify-start">
                    <CheckCircle2 className="size-3" /> Profil à jour
                  </p>
                )}
                {(hasChanges || avatarPreview) && (
                  <p className="mt-2 text-xs text-amber-600">Modifications non enregistrées</p>
                )}
              </div>
            </div>
          </div>
        </Reveal>

        {/* ═══ FORMULAIRE ═══ */}
        <Reveal variant="up" delay={100}>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="eyebrow mb-6">Informations personnelles</p>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="prenom" className="flex items-center gap-1.5">
                  <UserRound className="size-3.5" /> Prénom
                </Label>
                <Input
                  id="prenom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  required
                  maxLength={60}
                  placeholder="Votre prénom"
                  className={
                    errors.prenom ? "border-terracotta focus-visible:ring-terracotta/20" : ""
                  }
                />
                {errors.prenom && <p className="text-xs text-terracotta">{errors.prenom}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom" className="flex items-center gap-1.5">
                  <UserRound className="size-3.5" /> Nom
                </Label>
                <Input
                  id="nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  maxLength={60}
                  placeholder="Votre nom"
                  className={errors.nom ? "border-terracotta focus-visible:ring-terracotta/20" : ""}
                />
                {errors.nom && <p className="text-xs text-terracotta">{errors.nom}</p>}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="telephone" className="flex items-center gap-1.5">
                  <Phone className="size-3.5" /> Téléphone
                </Label>
                <Input
                  id="telephone"
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+229 00 00 00 00"
                  maxLength={20}
                  className={
                    errors.telephone ? "border-terracotta focus-visible:ring-terracotta/20" : ""
                  }
                />
                {errors.telephone && <p className="text-xs text-terracotta">{errors.telephone}</p>}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="adresse" className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" /> Adresse
                </Label>
                <Input
                  id="adresse"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Quartier, rue…"
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ville" className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" /> Ville
                </Label>
                <Input
                  id="ville"
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  placeholder="Cotonou"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pays" className="flex items-center gap-1.5">
                  <Globe className="size-3.5" /> Pays
                </Label>
                <Input
                  id="pays"
                  value={pays}
                  onChange={(e) => setPays(e.target.value)}
                  placeholder="Bénin"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
              <Button type="submit" variant="gold" disabled={enCours || !isValid || !hasChanges}>
                {enCours ? (
                  "Enregistrement…"
                ) : (
                  <>
                    <Save /> Enregistrer
                  </>
                )}
              </Button>
              <Button asChild type="button" variant="ghost">
                <Link to="/profil">
                  <ArrowLeft /> Retour
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </form>
    </ProfilShell>
  );
}

 -- ============================================================
-- Database complète — DanXomè (Supabase)
-- Ce fichier remplace tous les fichiers SQL individuels.
-- Exécuter dans l'ordre : schéma → storage → seed → commandes → artistes → admin
-- ============================================================

-- ============================================================
-- PARTIE 1 : SCHÉMA — Tables, fonctions, triggers, RLS
-- ============================================================

-- ============================================================
-- Table profiles (liée à auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  profil TEXT NOT NULL CHECK (profil IN ('visiteur', 'artiste', 'artisan', 'admin')),
  statut TEXT NOT NULL DEFAULT 'valide' CHECK (statut IN ('en_attente', 'valide', 'rejete')),
  avatar_url TEXT,
  telephone TEXT,
  adresse TEXT,
  ville TEXT,
  pays TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_profil ON profiles(profil);
CREATE INDEX IF NOT EXISTS idx_profiles_statut ON profiles(statut);

-- ============================================================
-- Fonction : créer un profile automatiquement
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  requested_profil TEXT;
  final_profil TEXT;
  final_statut TEXT;
  nom_complet TEXT;
  slug_base TEXT;
  meta JSONB;
  g_prenom TEXT;
  g_nom TEXT;
  g_full TEXT;
BEGIN
  meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);

  requested_profil := meta->>'profil';
  IF requested_profil IN ('artiste', 'artisan') THEN
    final_profil := requested_profil;
    final_statut := 'en_attente';
  ELSE
    final_profil := 'visiteur';
    final_statut := 'valide';
  END IF;

  -- Extraire prenom/nom depuis les métadonnées Google ou les métadonnées custom
  g_prenom := COALESCE(meta->>'prenom', meta->>'given_name', '');
  g_nom    := COALESCE(meta->>'nom', meta->>'family_name', '');

  -- Si les deux sont vides, essayer de splitter full_name / name
  IF g_prenom = '' AND g_nom = '' THEN
    g_full := TRIM(COALESCE(meta->>'full_name', meta->>'name', ''));
    IF g_full != '' THEN
      g_prenom := split_part(g_full, ' ', 1);
      g_nom    := TRIM(BOTH ' ' FROM regexp_replace(g_full, '^\S+\s*', ''));
      IF g_nom = '' THEN
        g_nom := g_prenom;
      END IF;
    END IF;
  END IF;

  nom_complet := TRIM(g_prenom || ' ' || g_nom);

  INSERT INTO public.profiles (id, email, prenom, nom, profil, statut, telephone, ville)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(g_prenom, ''),
    NULLIF(g_nom, ''),
    final_profil,
    final_statut,
    NULLIF(meta->>'telephone', ''),
    NULLIF(meta->>'ville', '')
  );

  IF final_profil IN ('artiste', 'artisan') AND nom_complet != '' THEN
    slug_base := lower(nom_complet);
    slug_base := regexp_replace(slug_base, '[^a-z0-9]+', '-', 'g');
    slug_base := regexp_replace(slug_base, '(^-|-$)', '', 'g');

    INSERT INTO public.artistes (slug, nom, metier, ville, bio, user_id)
    VALUES (
      slug_base || '-' || floor(extract(epoch from now()))::text,
      nom_complet,
      NULLIF(meta->>'categorie', ''),
      NULLIF(meta->>'ville', ''),
      NULLIF(meta->>'description', ''),
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Fonction : empêcher le changement de rôle non autorisé
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.profil IS DISTINCT FROM OLD.profil AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Modification du rôle non autorisée.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profiles_role_change ON profiles;
CREATE TRIGGER on_profiles_role_change
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_change();

-- ============================================================
-- Fonction : mettre à jour updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profiles_updated ON profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Fonction : vérifier si l'utilisateur est admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND profil = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- Fonction : supprimer complètement un compte
-- ============================================================
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS VOID AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RLS profiles
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Les utilisateurs lisent leur propre profil" ON profiles;
CREATE POLICY "Les utilisateurs lisent leur propre profil"
  ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Les utilisateurs mettent à jour leur propre profil" ON profiles;
CREATE POLICY "Les utilisateurs mettent à jour leur propre profil"
  ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Profils publics lisibles par tous" ON profiles;
CREATE POLICY "Profils publics lisibles par tous"
  ON profiles FOR SELECT USING (profil IN ('artiste', 'artisan') AND statut = 'valide');

DROP POLICY IF EXISTS "Admins lisent tous les profils" ON profiles;
CREATE POLICY "Admins lisent tous les profils"
  ON profiles FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins mettent à jour tous les profils" ON profiles;
CREATE POLICY "Admins mettent à jour tous les profils"
  ON profiles FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Les utilisateurs suppriment leur propre profil" ON profiles;
CREATE POLICY "Les utilisateurs suppriment leur propre profil"
  ON profiles FOR DELETE USING (auth.uid() = id);

-- ============================================================
-- Table sites (sites touristiques)
-- ============================================================
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  region TEXT NOT NULL,
  type TEXT NOT NULL,
  note NUMERIC(2,1),
  avis_count INTEGER DEFAULT 0,
  prix INTEGER,
  image_url TEXT,
  resume TEXT,
  coords_x NUMERIC(5,2),
  coords_y NUMERIC(5,2),
  virtuel BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Sites publics" ON sites;
CREATE POLICY "Sites publics" ON sites FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins gèrent les sites" ON sites;
CREATE POLICY "Admins gèrent les sites" ON sites FOR ALL USING (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_sites_slug ON sites(slug);
CREATE INDEX IF NOT EXISTS idx_sites_region ON sites(region);

-- ============================================================
-- Table musees
-- ============================================================
CREATE TABLE IF NOT EXISTS musees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  ville TEXT NOT NULL,
  image_url TEXT,
  resume TEXT,
  horaires JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE musees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Musées publics" ON musees;
CREATE POLICY "Musées publics" ON musees FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins gèrent les musées" ON musees;
CREATE POLICY "Admins gèrent les musées" ON musees FOR ALL USING (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_musees_slug ON musees(slug);

-- ============================================================
-- Table royaumes
-- ============================================================
CREATE TABLE IF NOT EXISTS royaumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  periode TEXT,
  image_url TEXT,
  resume TEXT,
  conte JSONB DEFAULT '[]',
  frise JSONB DEFAULT '[]',
  visiter JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE royaumes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Royaumes publics" ON royaumes;
CREATE POLICY "Royaumes publics" ON royaumes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins gèrent les royaumes" ON royaumes;
CREATE POLICY "Admins gèrent les royaumes" ON royaumes FOR ALL USING (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_royaumes_slug ON royaumes(slug);

-- ============================================================
-- Table langues
-- ============================================================
CREATE TABLE IF NOT EXISTS langues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT UNIQUE NOT NULL,
  locuteurs TEXT,
  region TEXT,
  salut TEXT,
  sens TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE langues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Langues publiques" ON langues;
CREATE POLICY "Langues publiques" ON langues FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins gèrent les langues" ON langues;
CREATE POLICY "Admins gèrent les langues" ON langues FOR ALL USING (public.is_admin());

-- ============================================================
-- Table artistes
-- ============================================================
CREATE TABLE IF NOT EXISTS artistes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  metier TEXT,
  ville TEXT,
  image_url TEXT,
  bio TEXT,
  categorie TEXT,
  portfolio_url TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE artistes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Artistes publics" ON artistes;
CREATE POLICY "Artistes publics" ON artistes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Artiste gère son profil" ON artistes;
CREATE POLICY "Artiste gère son profil" ON artistes FOR ALL USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins gèrent les artistes" ON artistes;
CREATE POLICY "Admins gèrent les artistes" ON artistes FOR ALL USING (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_artistes_slug ON artistes(slug);
CREATE INDEX IF NOT EXISTS idx_artistes_user_id ON artistes(user_id);

-- ============================================================
-- Table oeuvres
-- ============================================================
CREATE TABLE IF NOT EXISTS oeuvres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  titre TEXT NOT NULL,
  artiste_id UUID REFERENCES artistes(id) ON DELETE CASCADE,
  categorie TEXT,
  region TEXT,
  prix INTEGER,
  image_url TEXT,
  description TEXT,
  statut TEXT DEFAULT 'publiee' CHECK (statut IN ('publiee', 'brouillon', 'vendue')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oeuvres_artiste ON oeuvres(artiste_id);
CREATE INDEX IF NOT EXISTS idx_oeuvres_categorie ON oeuvres(categorie);
CREATE INDEX IF NOT EXISTS idx_oeuvres_slug ON oeuvres(slug);
CREATE INDEX IF NOT EXISTS idx_oeuvres_statut ON oeuvres(statut);

ALTER TABLE oeuvres ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Œuvres publiées publiques" ON oeuvres;
CREATE POLICY "Œuvres publiées publiques" ON oeuvres
  FOR SELECT USING (statut = 'publiee' OR artiste_id IN (
    SELECT id FROM artistes WHERE user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "Artiste gère ses œuvres" ON oeuvres;
CREATE POLICY "Artiste gère ses œuvres" ON oeuvres
  FOR ALL USING (artiste_id IN (
    SELECT id FROM artistes WHERE user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "Admins gèrent les œuvres" ON oeuvres;
CREATE POLICY "Admins gèrent les œuvres" ON oeuvres FOR ALL USING (public.is_admin());

-- ============================================================
-- Table evenements
-- ============================================================
CREATE TABLE IF NOT EXISTS evenements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  titre TEXT NOT NULL,
  date TEXT,
  jour INTEGER,
  mois TEXT,
  lieu TEXT,
  categorie TEXT,
  image_url TEXT,
  resume TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Événements publics" ON evenements;
CREATE POLICY "Événements publics" ON evenements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins gèrent les événements" ON evenements;
CREATE POLICY "Admins gèrent les événements" ON evenements FOR ALL USING (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_evenements_slug ON evenements(slug);
CREATE INDEX IF NOT EXISTS idx_evenements_date ON evenements(date);

-- ============================================================
-- Table plats (gastronomie)
-- ============================================================
CREATE TABLE IF NOT EXISTS plats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  region TEXT,
  categorie TEXT,
  image_url TEXT,
  resume TEXT,
  ingredients JSONB DEFAULT '[]',
  preparation TEXT,
  origine TEXT,
  ou TEXT,
  histoire TEXT,
  curiosite TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE plats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Plats publics" ON plats;
CREATE POLICY "Plats publics" ON plats FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins gèrent les plats" ON plats;
CREATE POLICY "Admins gèrent les plats" ON plats FOR ALL USING (public.is_admin());

-- ============================================================
-- Table avis_plats (avis sur les plats)
-- ============================================================
CREATE TABLE IF NOT EXISTS avis_plats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plat_slug TEXT NOT NULL,
  note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
  commentaire TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plat_slug)
);

CREATE INDEX IF NOT EXISTS idx_avis_plats_plat ON avis_plats(plat_slug);
CREATE INDEX IF NOT EXISTS idx_avis_plats_user ON avis_plats(user_id);

ALTER TABLE avis_plats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Les avis sont publics" ON avis_plats;
CREATE POLICY "Les avis sont publics" ON avis_plats FOR SELECT USING (true);
DROP POLICY IF EXISTS "Les utilisateurs créent un avis" ON avis_plats;
CREATE POLICY "Les utilisateurs créent un avis" ON avis_plats FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Les utilisateurs modifient leur avis" ON avis_plats;
CREATE POLICY "Les utilisateurs modifient leur avis" ON avis_plats FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Les utilisateurs suppriment leur avis" ON avis_plats;
CREATE POLICY "Les utilisateurs suppriment leur avis" ON avis_plats FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS on_avis_plats_updated ON avis_plats;
CREATE TRIGGER on_avis_plats_updated
  BEFORE UPDATE ON avis_plats
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Table commandes (achats d'œuvres)
-- ============================================================
CREATE TABLE IF NOT EXISTS commandes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref TEXT UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_nom TEXT NOT NULL,
  oeuvre_id UUID NOT NULL REFERENCES oeuvres(id) ON DELETE RESTRICT,
  oeuvre_titre TEXT NOT NULL,
  artiste_nom TEXT NOT NULL,
  montant INTEGER NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  statut TEXT DEFAULT 'recue' CHECK (statut IN ('recue', 'validee', 'en_cours', 'expediee', 'livree', 'annulee')),
  payment_id TEXT,
  moyen_paiement TEXT DEFAULT 'momo',
  payment_statut TEXT DEFAULT 'en_attente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commandes_client ON commandes(client_id);
CREATE INDEX IF NOT EXISTS idx_commandes_artiste ON commandes(artiste_nom);

ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Client lit ses commandes" ON commandes;
CREATE POLICY "Client lit ses commandes" ON commandes FOR SELECT USING (auth.uid() = client_id);
DROP POLICY IF EXISTS "Client crée une commande" ON commandes;
CREATE POLICY "Client crée une commande" ON commandes FOR INSERT WITH CHECK (auth.uid() = client_id);
DROP POLICY IF EXISTS "Admins gèrent les commandes" ON commandes;
CREATE POLICY "Admins gèrent les commandes" ON commandes FOR ALL USING (public.is_admin());

DROP TRIGGER IF EXISTS on_commandes_updated ON commandes;
CREATE TRIGGER on_commandes_updated
  BEFORE UPDATE ON commandes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Table avis_artistes (avis sur les artistes)
-- ============================================================
CREATE TABLE IF NOT EXISTS avis_artistes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artiste_id UUID NOT NULL REFERENCES artistes(id) ON DELETE CASCADE,
  note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
  commentaire TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, artiste_id)
);

ALTER TABLE avis_artistes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Avis artistes publics" ON avis_artistes;
CREATE POLICY "Avis artistes publics" ON avis_artistes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Utilisateurs créent avis artiste" ON avis_artistes;
CREATE POLICY "Utilisateurs créent avis artiste" ON avis_artistes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Utilisateurs modifient avis artiste" ON avis_artistes;
CREATE POLICY "Utilisateurs modifient avis artiste" ON avis_artistes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Utilisateurs suppriment avis artiste" ON avis_artistes;
CREATE POLICY "Utilisateurs suppriment avis artiste" ON avis_artistes FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS on_avis_artistes_updated ON avis_artistes;
CREATE TRIGGER on_avis_artistes_updated
  BEFORE UPDATE ON avis_artistes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Table favoris (œuvres sauvegardées par les utilisateurs)
-- ============================================================
CREATE TABLE IF NOT EXISTS favoris (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  oeuvre_id UUID NOT NULL REFERENCES oeuvres(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, oeuvre_id)
);

ALTER TABLE favoris ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Utilisateurs lisent leurs favoris" ON favoris;
CREATE POLICY "Utilisateurs lisent leurs favoris" ON favoris FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Utilisateurs ajoutent un favori" ON favoris;
CREATE POLICY "Utilisateurs ajoutent un favori" ON favoris FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Utilisateurs retirent un favori" ON favoris;
CREATE POLICY "Utilisateurs retirent un favori" ON favoris FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Table panier_items (panier par utilisateur)
-- ============================================================
CREATE TABLE IF NOT EXISTS panier_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  oeuvre_id UUID NOT NULL REFERENCES oeuvres(id) ON DELETE CASCADE,
  qte INTEGER NOT NULL DEFAULT 1 CHECK (qte >= 1 AND qte <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, oeuvre_id)
);

ALTER TABLE panier_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Utilisateurs lisent leur panier" ON panier_items;
CREATE POLICY "Utilisateurs lisent leur panier" ON panier_items FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Utilisateurs ajoutent au panier" ON panier_items;
CREATE POLICY "Utilisateurs ajoutent au panier" ON panier_items FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM oeuvres WHERE id = oeuvre_id AND statut = 'publiee')
  );
DROP POLICY IF EXISTS "Utilisateurs modifient leur panier" ON panier_items;
CREATE POLICY "Utilisateurs modifient leur panier" ON panier_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Utilisateurs suppriment de leur panier" ON panier_items;
CREATE POLICY "Utilisateurs suppriment de leur panier" ON panier_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Table contacts (formulaires de contact)
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  sujet TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit contact" ON contacts;
CREATE POLICY "Anyone can submit contact" ON contacts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins lisent les contacts" ON contacts;
CREATE POLICY "Admins lisent les contacts" ON contacts FOR SELECT USING (public.is_admin());

-- ============================================================
-- Table newsletter (abonnés)
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter;
CREATE POLICY "Anyone can subscribe" ON newsletter FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins lisent les abonnés" ON newsletter;
CREATE POLICY "Admins lisent les abonnés" ON newsletter FOR SELECT USING (public.is_admin());

-- ============================================================
-- Table reservations (visites guidées)
-- ============================================================
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES sites(id),
  site_nom TEXT NOT NULL,
  date DATE NOT NULL,
  creneau TEXT NOT NULL,
  personnes INTEGER NOT NULL CHECK (personnes > 0 AND personnes <= 50),
  sous_total INTEGER NOT NULL,
  frais INTEGER NOT NULL,
  montant_total INTEGER NOT NULL,
  nom_contact TEXT NOT NULL,
  email_contact TEXT NOT NULL,
  telephone_contact TEXT NOT NULL,
  statut TEXT DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'confirmee', 'annulee', 'terminee')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_site ON reservations(site_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Client lit ses réservations" ON reservations;
CREATE POLICY "Client lit ses réservations" ON reservations FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Client crée une réservation" ON reservations;
CREATE POLICY "Client crée une réservation" ON reservations FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins gèrent les réservations" ON reservations;
CREATE POLICY "Admins gèrent les réservations" ON reservations FOR ALL USING (public.is_admin());

DROP TRIGGER IF EXISTS on_reservations_updated ON reservations;
CREATE TRIGGER on_reservations_updated
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Table payments (transactions Kkiapay)
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  commande_id UUID REFERENCES commandes(id) ON DELETE CASCADE,
  transaction_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  fees INTEGER DEFAULT 0,
  method TEXT,
  is_success BOOLEAN DEFAULT FALSE,
  partner_id TEXT,
  account TEXT,
  performed_at TIMESTAMPTZ,
  raw_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Client lit ses paiements" ON payments;
CREATE POLICY "Client lit ses paiements" ON payments
  FOR SELECT USING (
    commande_id IN (SELECT id FROM commandes WHERE client_id = auth.uid())
  );
DROP POLICY IF EXISTS "Admins gèrent les paiements" ON payments;
CREATE POLICY "Admins gèrent les paiements" ON payments FOR ALL USING (public.is_admin());

-- ============================================================
-- Table dossiers (articles éditoriaux longs)
-- ============================================================
CREATE TABLE IF NOT EXISTS dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  titre TEXT NOT NULL,
  sous_titre TEXT,
  image_url TEXT,
  resume TEXT,
  categorie TEXT NOT NULL DEFAULT 'patrimoine',
  auteur TEXT,
  date_publication DATE DEFAULT CURRENT_DATE,
  sections JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dossiers_categorie ON dossiers(categorie);
CREATE INDEX IF NOT EXISTS idx_dossiers_date ON dossiers(date_publication);

ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Dossiers publics" ON dossiers;
CREATE POLICY "Dossiers publics" ON dossiers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins gèrent les dossiers" ON dossiers;
CREATE POLICY "Admins gèrent les dossiers" ON dossiers FOR ALL USING (public.is_admin());

DROP TRIGGER IF EXISTS on_dossiers_updated ON dossiers;
CREATE TRIGGER on_dossiers_updated
  BEFORE UPDATE ON dossiers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- PARTIE 2 : STORAGE — Buckets et politiques
-- ============================================================

-- Storage bucket "oeuvres" pour les images d'œuvres
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('oeuvres', 'oeuvres', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage bucket "avatars" pour les photos de profil
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Politiques storage — OEUVRES
DROP POLICY IF EXISTS "Oeuvres lecture publique" ON storage.objects;
CREATE POLICY "Oeuvres lecture publique" ON storage.objects
  FOR SELECT USING (bucket_id = 'oeuvres');

DROP POLICY IF EXISTS "Artistes uploadent oeuvres" ON storage.objects;
CREATE POLICY "Artistes uploadent oeuvres" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'oeuvres'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Artistes suppriment oeuvres" ON storage.objects;
CREATE POLICY "Artistes suppriment oeuvres" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'oeuvres'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Politiques storage — AVATARS
DROP POLICY IF EXISTS "Avatars lecture publique" ON storage.objects;
CREATE POLICY "Avatars lecture publique" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users uploadent avatar" ON storage.objects;
CREATE POLICY "Users uploadent avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users suppriment avatar" ON storage.objects;
CREATE POLICY "Users suppriment avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- ============================================================
-- Vérification de stock — empêcher ajout au panier si vendue
-- ============================================================
DROP TRIGGER IF EXISTS check_oeuvre_stock ON panier_items;

CREATE OR REPLACE FUNCTION check_oeuvre_available()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM oeuvres WHERE id = NEW.oeuvre_id AND statut != 'publiee') THEN
    RAISE EXCEPTION 'Cette œuvre n''est plus disponible';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_oeuvre_stock
  BEFORE INSERT ON panier_items
  FOR EACH ROW
  EXECUTE FUNCTION check_oeuvre_available();

-- ============================================================
-- PARTIE 3 : SEED — Données initiales
-- ============================================================

-- ============================================================
-- Sites touristiques
-- ============================================================
INSERT INTO sites (slug, nom, region, type, note, avis_count, prix, image_url, resume, coords_x, coords_y, virtuel) VALUES
('palais-royaux-abomey', 'Palais royaux d''Abomey', 'Zou', 'Patrimoine UNESCO', 4.9, 812, 5000, '/hero-abomey.jpg', 'Douze palais de terre rouge, bas-reliefs et trônes des rois du DanXomè, inscrits au patrimoine mondial depuis 1985.', 38, 55, true),
('ganvie', 'Ganvié, la cité lacustre', 'Atlantique', 'Village lacustre', 4.7, 634, 7500, '/site-ganvie.jpg', 'Fondée au XVIIIe siècle sur le lac Nokoué, la « Venise de l''Afrique » se visite en pirogue au lever du jour.', 46, 78, true),
('pendjari', 'Parc national de la Pendjari', 'Atacora', 'Réserve naturelle', 4.8, 421, 15000, '/site-pendjari.jpg', 'L''un des derniers sanctuaires d''éléphants et de lions d''Afrique de l''Ouest, au nord du pays.', 30, 16, false),
('porte-du-non-retour', 'Porte du Non-Retour, Ouidah', 'Atlantique', 'Mémoire', 4.6, 559, 3000, '/Porte du non retour_danxomè.jpg', 'Au bout de la Route des Esclaves, un mémorial face à l''Atlantique qui clôt un parcours de 4 km.', 40, 84, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Musées
-- ============================================================
INSERT INTO musees (slug, nom, ville, image_url, resume, horaires) VALUES
('musee-histoire-abomey', 'Musée historique d''Abomey', 'Abomey', '/musée historique d''abomey_danxomè.jpg', 'Installé dans les palais des rois Ghézo et Glélé, il conserve trônes, récades et tentures appliquées.', '["Lun – Sam · 9h – 18h", "Dim · 10h – 16h", "Fermé les jours fériés"]'::jsonb),
('musee-fondation-zinsou', 'Fondation Zinsou, Ouidah', 'Ouidah', '/Fondation zinsou_danxomè.jpg', 'Première fondation d''art contemporain africaine en accès libre, installée dans la villa Ajavon.', '["Mar – Dim · 10h – 19h", "Lundi fermé"]'::jsonb),
('musee-da-silva', 'Musée da Silva, Porto-Novo', 'Porto-Novo', '/Musée daSilva_danxomè.jpg', 'Mémoire des Afro-Brésiliens revenus au Bénin : architecture, objets et costumes.', '["Lun – Sam · 9h – 17h30"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Royaumes
-- ============================================================
INSERT INTO royaumes (slug, nom, periode, image_url, resume, conte, frise, visiter) VALUES
('abomey', 'Royaume d''Abomey', '1620 – 1894', '/musée historique d''abomey_danxomè.jpg',
'Fondé par Dakodonu et porté à son apogée par Gbéhanzin, le DanXomè a conquis un vaste territoire du fleuve Mono au Niger. Ses douze palais de terre rouge, ses bas-reliefs narratifs et ses récades de bronze témoignent d''un art de cour unique. L''armée des Amazones, les Mino, redoutée de tous les voisins, incarne la puissance militaire et l''indépendance de ce royaume qui a résisté à la colonisation française jusqu''en 1894.',
'["Sur le plateau d''Agbomè, la terre est rouge et la mémoire tenace. Trois siècles durant, le DanXomè y a inventé une manière d''État : une cour, une armée, une administration des récoltes, et un art chargé de tenir la chronique.", "Chaque roi devait laisser derrière lui une devise, un animal emblème et un palais. Les bas-reliefs modelés dans la terre des murs racontaient les campagnes, les alliances, les proverbes. On ne lisait pas le royaume dans des livres : on le lisait sur ses façades, sur les tentures appliquées et sur les récades que portaient les messagers.", "« Le trou creusé par le premier roi, ses fils continuent de le creuser. »", "L''ouverture vers la côte, au début du XVIIIe siècle, change tout : le royaume devient acteur d''un commerce atlantique dont Ouidah est le port. Cette histoire, douloureuse, fait aujourd''hui l''objet d''un travail mémoriel porté par les musées béninois et les familles concernées.", "Sous Ghézo, la réorganisation militaire donne naissance au corps féminin des Agodjié, longtemps réduit à un exotisme de récits de voyage, et que les historiennes béninoises replacent aujourd''hui dans une logique d''État : recrutement, hiérarchie, discipline, rituel."]'::jsonb,
'[{"annee": "1620", "texte": "Do-Aklin fonde le lignage d''Abomey sur le plateau d''Agbomè."}, {"annee": "1645", "texte": "Houégbadja délimite le royaume et institue la coutume du palais."}, {"annee": "1708", "texte": "Agadja s''ouvre à l''Atlantique et prend Allada puis Ouidah."}, {"annee": "1818", "texte": "Ghézo réorganise l''armée, y compris le corps des Agodjié."}, {"annee": "1858", "texte": "Glélé bâtit son palais ; les tentures appliquées deviennent chronique d''État."}, {"annee": "1892", "texte": "Gbêhanzin résiste aux colonnes françaises pendant deux campagnes."}, {"annee": "1894", "texte": "Déportation de Gbêhanzin en Martinique ; fin de l''indépendance du royaume."}, {"annee": "1985", "texte": "Les palais royaux d''Abomey sont inscrits au patrimoine mondial de l''UNESCO."}, {"annee": "2021", "texte": "Vingt-six œuvres royales sont restituées par la France."}]'::jsonb,
'[{"titre": "Fiche du site", "slug": "palais-royaux-abomey", "type": "site"}, {"titre": "Visite virtuelle 360°", "slug": "palais-royaux-abomey", "type": "visite"}, {"titre": "Musée historique", "slug": "musee-histoire-abomey", "type": "musee"}]'::jsonb),

('porto-novo', 'Royaume de Hogbonu', '1730 – 1908', '/royaume de hogbonou_danxomè.jpg',
'Établi par des commerçants yoruba venus d''Oyo, le royaume de Hogbonu s''est développé autour du port naturel de l''étang lacustre. Le roi Toffa Ier a ouvert la cité aux marchands afro-brésiliens, créant un syncrétisme architectural et culturel rare : églises coloniales, mosquées et temples vodun coexistent. Capitale politique actuelle du Bénin, Porto-Novo garde l''empreinte de trois héritages — fon, yoruba et afro-brésilien — dans ses rues et ses palais royaux.',
'["Au bord de l''étang lacustre, là où les pirogues glissent entre les mangroves, Hogbonu est née d''une rencontre entre la mer et la forêt. Des marchands yoruba venus du royaume d''Oyo, chassés par les guerres, se sont installés sur ces rives au XVIIIe siècle et y ont bâti un comptoir devenu capitale.", "Le roi Toffa Ier comprit que la richesse de Hogbonu ne viendrait pas de la guerre, mais des échanges. Il accueillit les Afro-Brésiliens — descendants d''esclaves revenus d''Amérique — qui apportèrent leur architecture, leur foi catholique et leur savoir-faire commercial. De cette greffe naquit une ville où un temple vodun, une mosquée et une cathédrale se regardent sans se nuire.", "« La parole du roi est un filet : elle ne laisse rien échapper. »", "Sous la colonisation française, Porto-Novo devint la capitale administrative du Dahomey, éclipsant Abomey. Mais Hogbonu ne s''est jamais éteint : ses familles royales, ses prêtres vodun et ses griots perpétuent une mémoire vivante que les bâtiments coloniaux n''ont jamais recouverte.", "Aujourd''hui, Porto-Novo est à la fois capitale politique du Bénin et carrefour culturel unique en Afrique de l''Ouest. Le musée honoraire Alexandre Adjaré, le palais royal de Hogbonu et le quartier des Tofinu sur l''eau racontent trois siècles de métissage et de résilience."]'::jsonb,
'[{"annee": "vers 1730", "texte": "Des commerçants yoruba venus d''Oyo fondent le comptoir de Hogbonu."}, {"annee": "1810", "texte": "Le roi Toffa Ier accueille les premiers colons afro-brésiliens."}, {"annee": "1863", "texte": "Hogbonu est intégré à la colonie française du Dahomey."}, {"annee": "1883", "texte": "Porto-Novo devient la capitale administrative du territoire du Dahomey."}, {"annee": "1900", "texte": "Construction du palais royal dans le style afro-brésilien caractéristique."}, {"annee": "1960", "texte": "Porto-Novo devient capitale de la République du Dahomey indépendant."}, {"annee": "1975", "texte": "Le pays est rebaptisé République Populaire du Bénin."}, {"annee": "1990", "texte": "Conférence nationale souveraine : Porto-Novo confirmée comme capitale."}, {"annee": "2015", "texte": "Le palais royal de Hogbonu est restauré et ouvert au public."}]'::jsonb,
'[{"titre": "Palais royal de Hogbonu", "slug": "palais-royal-hogbonu", "type": "site"}, {"titre": "Musée honoraire Alexandre Adjaré", "slug": "musee-adjare", "type": "musee"}, {"titre": "Quartier des Tofinu sur l''eau", "slug": "quartier-tofinu", "type": "site"}]'::jsonb),

('nikki', 'Royaume baatonu de Nikki', 'XVe siècle – aujourd''hui', '/royaume baatonu de nikki_danxomè.jpg',
'Au nord-est du Bénin, le royaume baatonu de Nikki est l''un des plus anciens du pays. Ses rois, les Bokonon, ont préservé une tradition équestre sans équivalent : chaque année, la Gaani rassemble des milliers de cavaliers en tenue de parade pour célébrer la paix, la bravoure et la mémoire des ancêtres. Le tchoukoutou, bière de mil brassée par les femmes du palais, accompagne toutes les cérémonies de cette terre de tradition orale et de chevaux de race.',
'["Dans la savane-parsemée de latérites rousses du nord-est béninois, Nikki dresse ses murailles de terre depuis plus de cinq siècles. Cité des cavaliers et des conteurs, elle est la capitale d''un royaume où la parole a la même valeur que l''épée : celle de protéger et de gouverner.", "Les rois Bokonon, dynastie ininterrompue, ont fait de Nikki un carrefour commercial entre le Sahel et la côte. Leurs marchés de bétail attiraient des peuls, des haoussas et des Dendi, tandis que les forgerons et les tisserants produisaient des objets dont la renommée dépassait les frontières du royaume.", "« Le cheval du Bokonon ne dort jamais debout : il veille sur le peuple. »", "La Gaani, grande fête équestre annuelle, est le cœur battant de Nikki. Des milliers de cavaliers, en costume de parade brodé de perles, parcourent la ville au pas. Chaque cheval est choisi pour sa robe, sa robe et son tempérament ; chaque cavalier descend d''une lignée dont la bravoure est consignée dans les chants griotiques.", "Contrairement aux royaumes du sud, le royaume baatonu n''a jamais connu la traite atlantique sur son territoire. Cette distance géographique et militaire a préservé une culture orale d''une richesse exceptionnelle : épopées, généalogies et proverbes constituent une bibliothèque vivante que les anciens transmettent aux jeunes lors des cérémonies du tchoukoutou."]'::jsonb,
'[{"annee": "vers 1450", "texte": "Les premiers Bokonon fondent la cité de Nikki sur un plateau stratégique."}, {"annee": "1600", "texte": "Nikki devient un carrefour commercial majeur entre le Sahel et la côte."}, {"annee": "1741", "texte": "Le royaume résiste aux incursions du royaume d''Oyo."}, {"annee": "1860", "texte": "Les premiers explorateurs européens documentent la tradition équestre de Nikki."}, {"annee": "1897", "texte": "Nikki est intégré au territoire du Dahomey français malgré la résistance des Bokonon."}, {"annee": "1960", "texte": "Indépendance : Nikki reste un centre culturel majeur du nord-est béninois."}, {"annee": "1996", "texte": "La Gaani est reconnue comme patrimoine culturel immatériel du Bénin."}, {"annee": "2010", "texte": "Le musée royal de Nikki ouvre ses portes pour préserver la mémoire baatonu."}, {"annee": "2023", "texte": "La Gaani rassemble plus de dix mille cavaliers et cinquante mille visiteurs."}]'::jsonb,
'[{"titre": "Fiche de la ville", "slug": "nikki", "type": "site"}, {"titre": "Fête de la Gaani", "slug": "gaani", "type": "site"}, {"titre": "Musée royal de Nikki", "slug": "musee-royal-nikki", "type": "musee"}]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Langues
-- ============================================================
INSERT INTO langues (nom, locuteurs, region, salut, sens) VALUES
('Fon', '4,3 M', 'Sud et centre', 'Kudo!', 'Bonjour'),
('Yoruba', '1,2 M', 'Sud-est', 'Ẹ kú àbọ̀', 'Bienvenue'),
('Bariba (Baatonum)', '900 k', 'Nord-est', 'A yaa gia?', 'Comment vas-tu ?'),
('Dendi', '350 k', 'Nord', 'Foforo', 'Salutations'),
('Mina / Gen', '500 k', 'Littoral ouest', 'Ŋdi', 'Bonjour'),
('Ditammari', '220 k', 'Atacora', 'Ni yaa', 'Paix sur toi')
ON CONFLICT (nom) DO NOTHING;

-- ============================================================
-- Artistes
-- ============================================================
INSERT INTO artistes (slug, nom, metier, ville, image_url, bio) VALUES
('kossi-adanou', 'Kossi Adanou', 'Sculpteur sur bois', 'Abomey', '/artisan-sculpteur.jpg', 'Formé dans l''atelier familial des Houngbédji, Kossi taille des masques cérémoniels en iroko et réinterprète les récades royales.'),
('adjoa-gbedo', 'Adjoa Gbédo', 'Tenture appliquée', 'Bohicon', '/artisan-tenturiere.jpg', 'Elle perpétue l''art des tentures d''Abomey, chaque motif racontant un règne, un proverbe ou une victoire.'),
('raphael-tossou', 'Raphaël Tossou', 'Bronzier', 'Porto-Novo', '/artisan-bronzier.jpg', 'Cire perdue et laiton de récupération : Raphaël fond des pièces contemporaines nourries de statuaire vodun.')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Œuvres
-- ============================================================
INSERT INTO oeuvres (slug, titre, artiste_id, categorie, region, prix, image_url, description, statut) VALUES
('recade-gbehanzin', 'Récade de Gbêhanzin', (SELECT id FROM artistes WHERE slug = 'kossi-adanou'), 'Sculpture', 'Zou', 185000, '/Recede de béhanzin_danxomè.jpg', 'Bois d''iroko et laiton martelé, 62 cm. Réinterprétation du sceptre royal, symbole de parole et d''autorité.', 'publiee'),
('tenture-des-douze-rois', 'Tenture des douze rois', (SELECT id FROM artistes WHERE slug = 'adjoa-gbedo'), 'Textile', 'Zou', 240000, '/Tenture des douze rois_danxomè.jpg', 'Coton appliqué, 180 × 120 cm. Douze registres pour douze règnes du DanXomè.', 'publiee'),
('asen-memoire', 'Asen — autel de mémoire', (SELECT id FROM artistes WHERE slug = 'raphael-tossou'), 'Bronze', 'Ouémé', 320000, '/Asen-autel de mémoire_danxomè.jpg', 'Fonte à la cire perdue, 74 cm. Autel portatif dédié aux ancêtres.', 'publiee'),
('masque-gelede', 'Masque Gèlèdé', (SELECT id FROM artistes WHERE slug = 'kossi-adanou'), 'Sculpture', 'Plateau', 145000, '/Masque guèlèdè_danxomè.jpg', 'Bois polychrome, 48 cm. Hommage à la puissance des mères, tradition yoruba-nago.', 'publiee'),
('pagne-adjrado', 'Pagne Adjrado', (SELECT id FROM artistes WHERE slug = 'adjoa-gbedo'), 'Textile', 'Atlantique', 68000, '/pagne adjrado_danxomè.jpg', 'Tissage bandes étroites, indigo naturel, 200 × 110 cm.', 'publiee'),
('statuette-bochio', 'Bochio gardien', (SELECT id FROM artistes WHERE slug = 'raphael-tossou'), 'Bronze', 'Zou', 96000, '/Botchio gardien_danxomè.jpg', 'Laiton patiné, 35 cm. Figure de protection du seuil.', 'publiee')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Événements
-- ============================================================
INSERT INTO evenements (slug, titre, date, jour, mois, lieu, categorie, image_url, resume) VALUES
('vodun-days', 'Vodun Days', '9 – 11 janvier', 9, 'JAN', 'Ouidah', 'Festival', '/vodoun days_danxomè.png', 'Trois jours de cultes, de danses zangbéto et de concerts sur la plage de Ouidah.'),
('gaani', 'La Gaani', '12 – 14 avril', 12, 'AVR', 'Nikki', 'Tradition', '/La gaani_danxomè.jpg', 'Fête équestre baatonu : cavaliers, tambours royaux et cortège du roi de Nikki.'),
('biennale-benin', 'Biennale de Cotonou', '3 mai – 30 juin', 3, 'MAI', 'Cotonou', 'Art contemporain', '/Biennale de cotonou_danxomè.jpg', 'Expositions dans toute la ville, ateliers ouverts et rencontres de commissaires.'),
('nonvitcha', 'Nonvitcha', '18 – 19 mai', 18, 'MAI', 'Grand-Popo', 'Rassemblement', '/Nonvitcha_danxomè.jpg', 'Grande retrouvaille de la communauté xwla, entre mer et lagune.'),
('fete-igname', 'Fête de l''igname', '15 août', 15, 'AOÛ', 'Savalou', 'Tradition', '/Fête de l''igname_danxomè.jpg', 'Bénédiction des nouvelles récoltes par le roi de Savalou.'),
('quintessence', 'Festival Quintessence', '5 – 10 décembre', 5, 'DÉC', 'Ouidah', 'Cinéma', '/Festival de quintesence_danxomè.jpg', 'Compétition de films africains, projections en plein air et masterclasses.'),
('jistna', 'JISTNA', '22 – 23 août', 22, 'AOÛ', 'Ouidah', 'Commémoration', '/JISTNA_danxomè.webp', 'Journée Internationale du Souvenir de la Traite Négrière et de son Abolition. Cérémonies face à l''océan, hommages aux ancêtres et concerts.'),
('weloveya', 'WeLovEya Festival', '26 – 27 décembre', 26, 'DÉC', 'Place de l''Amazone, Cotonou', 'Festival', '/Weloveya_danxomè.jpg', 'Plus grand festival afro-urbain et afrobeat du Bénin. Deux jours de concerts, de culture et de fête à la Place de l''Amazone.')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Plats (gastronomie)
-- ============================================================
INSERT INTO plats (slug, nom, region, categorie, image_url, resume, ingredients, preparation, origine, ou, histoire, curiosite) VALUES
('pate-rouge', 'Pâte rouge (Atassi)', 'Centre', 'Plat principal', '/Atassi_danxomè.jpg',
'Pâte de maïs fermentée, teintée en rouge par le jus de graines de « zomi ». Servie avec une sauce riche à base de tomates, de piment et de viande de boeuf.',
'["Maïs fermenté", "Graines de zomi", "Tomates", "Boeuf", "Piment", "Huile de palme"]'::jsonb,
'Le maïs est fermenté puis pilé pour obtenir une pâte fluide. Le jus de zomi lui donne sa couleur rouge caractéristique. La sauce est préparée séparément avec des tomates concassées, du piment et de la viande mijotée.',
'Région des Collines, Abomey et Bohicon', 'Marchés d''Abomey, restaurants traditionnels de Bohicon',
'La pâte rouge est un plat ancestral du peuple Fon. Sa couleur rouge symbolise le sang versé par les guerriers du royaume du Dahomey. Elle était servie lors des cérémonies d''intronisation des rois et des fêtes guerrières. Le zomi, graines qui lui donne sa teinte, est un arbre sacré dans la culture fon.',
'Selon la tradition, plus la pâte est rouge, plus elle est savoureuse. Les grands-mères transmettent secrètement la recette du zomi de génération en génération.'),

('ablo', 'Ablo', 'Sud', 'Accompagnement', '/Ablo_danxomè.jpg',
'Beignet de riz cuit à la vapeur, moelleux et légèrement sucré. Accompagne les sauces tomate et les poisson grillé du littoral.',
'["Riz", "Levure", "Sucre", "Sel", "Eau"]'::jsonb,
'Le riz est cuit à la vapeur puis écrasé avec de la levure et du sucre. La pâte est laissée à lever puis cuite à la vapeur dans des moules. L''ablo est servie chaud avec de la sauce tomate au poisson.',
'Littoral atlantique, Cotonou et Porto-Novo', 'Streets foods de Cotonou, marchés de Dantokpa',
'L''ablo est né du métissage entre les traditions culinaires africaines et portugaises. Les esclaves libérés revenus du Brésil au XIXe siècle ont apporté la technique de cuisson à la vapeur du riz, qui s''est intégrée aux habitudes du littoral béninois.',
'L''ablo est toujours servie le dimanche matin dans les foyers côtiers. Son nom signifie « pain » en langue mina, un héritage direct du portugais « pão ».'),

('wagashi', 'Wagashi', 'Nord', 'Fromage', '/Wagashi_danxomè.jpg',
'Fromage de lait de vache caillé, pressé et fumé. Aliment de base dans le nord du Bénin, consommé frais ou séché.',
'["Lait de vache frais", "Raisin sauvage (acide)", "Sel"]'::jsonb,
'Le lait est caillé avec le jus de feuilles de « wakri » ou de raisin sauvage. Le caillé est pressé pour en extraire le sérum, puis façonné en boules et séché au soleil ou fumé doucement.',
'Région de Parakou et Nikki', 'Marchés de Parakou, boutiques laitières du nord',
'Le wagashi est le fromage des peuples baatonu et bariba du nord du Bénin. La fabrication du fromage a été introduite par les Pasteurs nomades peuls au cours du XVIIIe siècle, puis adoptée et transformée par les communautés sédentaires. Il fait partie intégrante de l''économie laitière du nord.',
'Le wagashi est offert aux ancêtres lors des cérémonies funéraires. On dit que plus le fromage est fumé, plus il est proche du monde des esprits.'),

('akassa', 'Akassa', 'Sud', 'Accompagnement', '/Akassa_danxomè.jpg',
'Pâte de maïs fermentée, enveloppée dans des feuilles de bananier et cuite à l''eau. Aliment de base du sud, accompagné de sauces variées.',
'["Maïs fermenté", "Feuilles de bananier", "Sel"]'::jsonb,
'Le maïs est fermenté puis pétri en une pâte souple. Divisée en portions, chaque boule est enveloppée dans une feuille de bananier et cuite à l''eau pendant plusieurs heures.',
'Littoral et plateau Adja', 'Marchés côtiers de Ouidah et Grand-Popo',
'L''akassa est l''aliment de base des peuples gun et xwla du sud du Bénin depuis des siècles. La fermentation du maïs, qui peut durer plusieurs jours, est un savoir-faire transmis exclusivement par les femmes. Chaque famille possède sa propre technique de fermentation.',
'L''akassa emballée dans des feuilles de bananier est considérée comme plus authentique. Les feuilles apportent un parfum unique que les Béninois reconnaissent les yeux fermés.'),

('tchoukoutou', 'Tchoukoutou', 'Nord', 'Boisson', '/Tchoukoutou_danxomè.jpg',
'Bière de mil traditionnelle, légèrement acide et rafraîchissante. Boisson de la communauté baatonu, servie lors des cérémonies et du quotidien.',
'["Mil germé", "Levure naturelle", "Eau"]'::jsonb,
'Le mil est malté puis fermenté avec une levure naturelle. La mixture est filtrée et laissée à fermenter quelques jours. Le tchoukoutou est servi frais, souvent dans des calebasses.',
'Région de Nikki et Bassila', 'Cabanes à tchoukoutou de Nikki, marchés du nord',
'Le tchoukoutou est la boisson sacrée du royaume baatonu de Nikki. Brassé depuis des siècles par les femmes, il accompagne toutes les cérémonies : mariages, funérailles, fêtes équestres de la Gaani. La brasserie du mil est un art maîtrisé par les « bieri », les femmes brassent du palais royal.',
'Le tchoukoutou ne se boit jamais seul. Lors de la Gaani, la grande fête équestre, les cavaliers en buvent pour retrouver force et courage avant la compétition.'),

('sauce-arachide', 'Sauce arachide au poulet', 'Centre', 'Plat principal', '/Sauce d''arachide au poulet_danxomè.jpg',
'Sauce onctueuse à base de pâte d''arachide, servie avec du riz blanc et du poulet grillé. Plat familial très apprécié dans tout le pays.',
'["Pâte d''arachide", "Poulet", "Tomates", "Oignons", "Piment", "Huile"]'::jsonb,
'Le poulet est assaisonné et grillé. La sauce est préparée en faisant revenir les oignons, les tomates et la pâte d''arachide diluée. Le tout mijote jusqu''à obtenir une consistance crémeuse.',
'Bassin du Zou et Plateau', 'Tous les restaurants traditionnels du centre',
'La sauce arachide est un plat fédérateur du Bénin, présent dans toutes les régions mais surtout populaire chez les peuples fon et yoruba. L''arachide, introduite par les Portugais au XVIe siècle, s''est naturellement intégrée à la gastronomie béninoise et est devenue un pilier alimentaire.',
'Au Bénin, on dit qu''une sauce arachide ne rate jamais. C''est le plat que les étudiants et les jeunes célibataires apprennent en premier quand ils quittent le foyer familial.'),

('kuli-kuli', 'Kuli-kuli', 'Centre', 'Snack', '/Kuli-kuli_danxomè.jpg',
'Beignet croustillant à base de pâte d''arachide pressée. Snack populaire, vendu sur les marchés et les trottoirs.',
'["Pâte d''arachide", "Sel", "Piment", "Huile d''arachide"]'::jsonb,
'La pâte d''arachide est pressée pour en extraire l''huile, puis pétrie avec du sel et du piment. Elle est façonnée en bâtonnets ou en boules et frite dans l''huile d''arachide jusqu''à croquant.',
'Toutes les régions', 'Vendeurs ambulants, marchés de Cotonou',
'Le kuli-kuli est né du besoin de conserver l''arachide excédentaire. Les femmes peules et haoussa du nord du Nigeria et du Bénin ont mis au point cette technique de pressage et de friture il y a plusieurs siècles. C''est l''un des snacks les plus anciens d''Afrique de l''Ouest.',
'Le kuli-kuli est si populaire qu''il voyage partout : on le trouve même dans les avions comme snack de vol sur certaines compagnies ouest-africaines. Il peut se conserver plusieurs mois sans réfrigération.'),

('dekouinni', 'Dèkouinni', 'Sud', 'Poisson', '/Dèkouinni_danxomè.jpg',
'Poisson fumé du lac Nokoué, cuisiné en sauce avec des légumes. Spécialité de Ganvié et des villages lacustres.',
'["Poisson fumé (capitaine ou carpe)", "Feuilles de manioc", "Tomates", "Piment", "Huile de palme"]'::jsonb,
'Le poisson fumé est dépecé puis cuit lentement dans une sauce de tomates et de feuilles de manioc pilées. L''huile de palme apporte sa couleur orange caractéristique.',
'Lac Nokoué, Ganvié', 'Marché flottant de Ganvié, restaurants sur pilotis',
'Le dèkouinni est le plat emblématique des Tofinu, le peuple lacustre de Ganvié. Vivant sur l''eau depuis le XVIIe siècle pour échapper aux razzias esclavagistes du royaume du Dahomey, les Tofinu ont développé une cuisine unique basée sur le poisson fumé du lac Nokoué, qu''ils pêchent depuis des pirogues.',
'Le fumage du poisson se fait traditionnellement sur des foyers de bois de palétuvier. Ce fumage particulier donne au dèkouinni son goût incomparable que les gourmets béninois qualifient de « goût du lac ».')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Dossiers éditoriaux (version finale avec images quai Branly)
-- ============================================================
INSERT INTO dossiers (slug, titre, sous_titre, image_url, resume, categorie, auteur, date_publication, sections) VALUES
('tresors-restitues-abomey',
 'Les vingt-six trésors restitués',
 'Enquête en trois volets sur le retour des œuvres royales d''Abomey',
 '/musee-du-quai-branly_-79_51634382579_o.jpg',
 'Le retour des trésors royaux du DanXomè marque une étape historique dans la mémoire coloniale de la France et du Bénin. Vingt-six œuvres, dont les trônes royaux et les récades de bronze, ont été restituées en novembre 2021.',
 'patrimoine',
 'Rédaction DanXomè',
 '2025-06-15',
 '[
  {
    "titre": "I. Le contexte : de la spoliation à la revendication",
    "contenu": "En 1892, lors de la conquête du Dahomey, les troupes du colonel Alfred Dodds s''emparèrent du palais d''Abomey et transportèrent à Bordeaux des centaines d''objets : trônes, tentures appliquées, récades de bronze, statues et parures royales. Pendant plus d''un siècle, ces objets驻èrent dans les collections européennes — principalement au musée du quai Branly à Paris — tandis que les familles royales et les conservateurs béninois réclamaient leur restitution.\n\nLa question du butin colonial n''est pas simplement juridique : elle touche à l''identité culturelle, à la mémoire vivante des royaumes, et à la capacité d''un peuple à raconter sa propre histoire. Les objets du DanXomè ne sont pas de simples artefacts : ils sont les instruments du pouvoir, les chroniques visuelles d''un État, les supports d''un art narratif sans équivalent en Afrique de l''Ouest.",
    "image_url": "/musee-du-quai-branly_-86_51633732451_o.jpg"
  },
  {
    "titre": "II. Les œuvres : chronique d''un royaume en bronze et en terre",
    "contenu": "Parmi les vingt-six œuvres restituées figurent des pièces exceptionnelles :\n\n• Le trône de Glélé, en bois sculpté et incrusté de clous de fer, supportait le roi pendant les audiences publiques. Sa forme — un homme porté par quatre esclaves — incarne la puissance et la hiérarchie du royaume.\n\n• Les récades royales, baguettes de bronze finement ciselées, servaient de symboles d''autorité. Chaque roi laissait une récade nouvelle, créant ainsi une chronique métallurgique de la dynastie.\n\n• Les tentures appliquées (« machié ») racontaient en images les campagnes militaires, les alliances et les proverbes du royaume. Utiles à la propagande royale, elles constituent aujourd''hui une source historique de première importance.\n\n• Les statues de bois et de bronze, représentant des rois et des figures mythologiques, servaient aux rituels du palais et étaient exposées lors des cérémonies funéraires.",
    "image_url": "/musee-du-quai-branly_-98_51634382099_o.jpg"
  },
  {
    "titre": "III. La restitution : un geste politique et symbolique",
    "contenu": "Le 9 novembre 2021, le président Emmanuel Macron remit officiellement les vingt-six œuvres à son homologue béninois Patrice Talon, dans une cérémonie au palais présidentiel de Porto-Novo. Ce geste, salué par les milieux culturels internationaux, marque un tournant dans les politiques de restitution du patrimoine colonial.\n\nPour le Bénin, la restitution est bien plus qu''une récupération d''objets : c''est la reconnaissance d''un droit culturel fondamental. Les trésors du DanXomè rejoignent le Musée historique d''Abomey, où les conservateurs ont préparé des salles spéciales pour leur accueil.\n\nLa France, de son côté, reconnaît implicitement que la conservation ne suffit pas à justifier la possession. Le débat sur le butin colonial — qui concerne des dizaines de milliers d''objets dans les musées européens — trouve dans cette restitution un précédent majeur.",
    "image_url": "/musee-du-quai-branly_-103_51633953833_o.jpg"
  },
  {
    "titre": "IV. L''avenir : mémoire, transmission et tourisme culturel",
    "contenu": "Les œuvres restituées ne dorment pas dans des vitrines : elles deviennent le cœur d''un programme culturel ambitieux. Le musée d''Abomey prépare des expositions permanentes, des parcours pédagogiques pour les écoles béninoises et des rencontres internationales sur la restitution du patrimoine.\n\nPour les descendants des familles royales — notamment la famille Amoussou, gardienne de la mémoire du DanXomè — le retour des trésors est une guérison symbolique. Les cérémonies rituelles, interrompues depuis 1892, peuvent reprendre.\n\nEnfin, les trésors deviennent un levier de tourisme culturel durable. Les visiteurs du monde entier viennent désormais voir les objets là où ils ont été créés, dans le contexte de leur histoire originelle — et non dans les salles anonymes des musées européens.",
    "image_url": "/musee-du-quai-branly_-90_51634583945_o.jpg"
  }
 ]'::jsonb),

('langues-vivantes-benin',
 'Les cinquante-cinq langues du Bénin',
 'Un atlas linguistique vivant et sonore',
 '/langues.jpg',
 'Le Bénin compte cinquante-cinq langues vivantes réparties en six grandes familles linguistiques. Chaque langue raconte une histoire, un territoire, un peuple.',
 'langues',
 'Rédaction DanXomè',
 '2025-05-20',
 '[
  {
    "titre": "I. Un pays multilingue au cœur de l''Afrique",
    "contenu": "Situé entre le Nigeria et le Togo, le Bénin est un carrefour linguistique unique. Les six langues nationales — fon, yoruba, bariba, dendi, mina et ditammari — coexistent avec des dizaines de langues régionales, chacune porteuse de traditions orales d''une richesse exceptionnelle.\n\nLa diversité linguistique du Bénin n''est pas un vestige du passé : c''une réalité vivante. Dans les marchés de Cotonou, les kiosques de Porto-Novo et les villages du nord, on entend quotidiennement trois ou quatre langues différentes. Cette mosaïque sonore est la mémoire vivante d''un pays qui a su préserver ses identités malgré les turbulences de l''histoire."
  },
  {
    "titre": "II. Les grandes familles linguistiques",
    "contenu": "Les langues du Bénin appartiennent à six grandes familles :\n\n• Les langues gbe (fon, mina, yoruba) dominent le sud. Le fon, langue des rois du DanXomè, est parlé par près de deux millions de personnes.\n\n• Les langues gur (ditammari, ogu, Nathemba) sont présentes dans le nord-ouest, dans la zone de l''Atacora.\n\n• Les langues songhaï (dendi) s''étendent le long de la vallée du Niger, dans le nord-est.\n\n• Les langues bariba (baatonu) structurent la vie sociale du nord-est, autour de la ville de Nikki.\n\n• Les langues coulango (lamba, waama) sont parlées dans les plateaux de l''Atacora.\n\n• Les langues yoruba (nago) s''étendent le long de la frontière nigériane."
  },
  {
    "titre": "III. Archives sonores et atlas vivant",
    "contenu": "DanXomè collecte et préserve des enregistrements sonores de toutes les langues du Bénin. Proverbes, comptines, récits mythologiques et chants rituels sont enregistrés avec les locuteurs et annotés par des linguistes partenaires.\n\nCes archives constituent une bibliothèque vivante : elles permettent aux générations futures de retrouver les sonorités, les intonations et les rythmes de langues qui, pour certaines, comptent moins de mille locuteurs.\n\nL''atlas sonore de DanXomè est accessible en ligne et dans les médiathèques du pays. Il accompagne les initiatives de préservation linguistique menées par l''Université d''Abomey-Calavi et l''Institut des Langues du Bénin."
  }
 ]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PARTIE 4 : SEED COMMANDES — Données de démo
-- ============================================================

-- Commande 1 — Récade de Gbêhanzin
INSERT INTO commandes (ref, client_id, client_nom, oeuvre_id, oeuvre_titre, artiste_nom, montant, statut, date)
VALUES (
  'DH-4821',
  (SELECT id FROM profiles LIMIT 1),
  'M. Dossou',
  (SELECT id FROM oeuvres WHERE slug = 'recade-gbehanzin'),
  'Récade de Gbêhanzin',
  'Kossi Adanou',
  185000,
  'recue',
  NOW() - INTERVAL '2 days'
);

-- Commande 2 — Masque Gèlèdé
INSERT INTO commandes (ref, client_id, client_nom, oeuvre_id, oeuvre_titre, artiste_nom, montant, statut, date)
VALUES (
  'DH-4809',
  (SELECT id FROM profiles LIMIT 1),
  'Galerie Nokoué',
  (SELECT id FROM oeuvres WHERE slug = 'masque-gelede'),
  'Masque Gèlèdé',
  'Kossi Adanou',
  145000,
  'validee',
  NOW() - INTERVAL '5 days'
);

-- Commande 3 — Bochio gardien
INSERT INTO commandes (ref, client_id, client_nom, oeuvre_id, oeuvre_titre, artiste_nom, montant, statut, date)
VALUES (
  'DH-4776',
  (SELECT id FROM profiles LIMIT 1),
  'L. Ahouandjinou',
  (SELECT id FROM oeuvres WHERE slug = 'statuette-bochio'),
  'Bochio gardien',
  'Raphaël Tossou',
  96000,
  'en_cours',
  NOW() - INTERVAL '10 days'
);

-- Commande 4 — Asen — autel de mémoire
INSERT INTO commandes (ref, client_id, client_nom, oeuvre_id, oeuvre_titre, artiste_nom, montant, statut, date)
VALUES (
  'DH-4752',
  (SELECT id FROM profiles LIMIT 1),
  'M. Kpodo',
  (SELECT id FROM oeuvres WHERE slug = 'asen-memoire'),
  'Asen — autel de mémoire',
  'Raphaël Tossou',
  320000,
  'expediee',
  NOW() - INTERVAL '15 days'
);

-- Commande 5 — Tenture des douze rois
INSERT INTO commandes (ref, client_id, client_nom, oeuvre_id, oeuvre_titre, artiste_nom, montant, statut, date)
VALUES (
  'DH-4701',
  (SELECT id FROM profiles LIMIT 1),
  'Galerie Zannou',
  (SELECT id FROM oeuvres WHERE slug = 'tenture-des-douze-rois'),
  'Tenture des douze rois',
  'Adjoa Gbédo',
  240000,
  'livree',
  NOW() - INTERVAL '20 days'
);

-- ============================================================
-- PARTIE 5 : SEED ARTISTES AUTH — Liaison profils ↔ artistes
-- ============================================================

-- Désactive le trigger de protection du rôle temporairement
ALTER TABLE profiles DISABLE TRIGGER on_profiles_role_change;

-- Met à jour les profils (le trigger les a créés avec profil='visiteur')
UPDATE profiles SET
  prenom = 'Kossi',
  nom = 'Adanou',
  profil = 'artiste'
WHERE email = 'kossi.adanou@danxome.bj';

UPDATE profiles SET
  prenom = 'Adjoa',
  nom = 'Gbédo',
  profil = 'artiste'
WHERE email = 'adjoa.gbedo@danxome.bj';

UPDATE profiles SET
  prenom = 'Raphaël',
  nom = 'Tossou',
  profil = 'artiste'
WHERE email = 'raphael.tossou@danxome.bj';

-- Réactive le trigger
ALTER TABLE profiles ENABLE TRIGGER on_profiles_role_change;

-- Lie les artistes à leurs profils
UPDATE artistes SET user_id = (SELECT id FROM profiles WHERE email = 'kossi.adanou@danxome.bj') WHERE slug = 'kossi-adanou';
UPDATE artistes SET user_id = (SELECT id FROM profiles WHERE email = 'adjoa.gbedo@danxome.bj') WHERE slug = 'adjoa-gbedo';
UPDATE artistes SET user_id = (SELECT id FROM profiles WHERE email = 'raphael.tossou@danxome.bj') WHERE slug = 'raphael-tossou';

-- ============================================================
-- PARTIE 6 : CRÉATION ADMIN — Passer un compte en admin
-- ============================================================

-- Mettre à jour le profil de visiteur vers admin
UPDATE profiles
SET profil = 'admin'
WHERE email = 'danxome229@gmail.com';

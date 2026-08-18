-- ============================================================
-- Schéma de base de données pour DanXomè — Supabase
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

-- ============================================================
-- Fonction : créer un profile automatiquement
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  requested_profil TEXT;
  final_profil TEXT;
BEGIN
  requested_profil := NEW.raw_user_meta_data->>'profil';
  IF requested_profil IN ('artiste', 'artisan') THEN
    final_profil := requested_profil;
  ELSE
    final_profil := 'visiteur';
  END IF;

  INSERT INTO public.profiles (id, email, prenom, nom, profil)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    final_profil
  );
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
  ON profiles FOR SELECT USING (profil IN ('artiste', 'artisan'));

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

-- ============================================================
-- Schéma de base de données pour Dãhomè — Supabase
-- ============================================================

-- Table profiles (liée à auth.users)
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

-- Index pour les recherches par email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_profil ON profiles(profil);

-- ============================================================
-- Fonction trigger : créer un profile automatiquement (Sécurisée)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  requested_profil TEXT;
  final_profil TEXT;
BEGIN
  requested_profil := NEW.raw_user_meta_data->>'profil';
  -- Seuls les profils 'visiteur', 'artiste' et 'artisan' sont autorisés lors de l'inscription.
  -- Le rôle 'admin' ne peut JAMAIS être auto-attribué par les métadonnées client.
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

-- Trigger sur insert dans auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Fonction trigger : empêcher le changement de rôle non autorisé
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le profil change et que l'utilisateur n'est pas admin, annuler ou rejeter la modification
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
-- Fonction trigger : mettre à jour updated_at
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
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Vérifie si l'utilisateur courant est admin.
-- SECURITY DEFINER : la requête interne s'exécute avec les droits du
-- propriétaire de la fonction et échappe à la RLS (évite la récursion).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND profil = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Les utilisateurs peuvent lire leur propre profil
DROP POLICY IF EXISTS "Les utilisateurs lisent leur propre profil" ON profiles;
CREATE POLICY "Les utilisateurs lisent leur propre profil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
DROP POLICY IF EXISTS "Les utilisateurs mettent à jour leur propre profil" ON profiles;
CREATE POLICY "Les utilisateurs mettent à jour leur propre profil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Les utilisateurs authentifiés peuvent lire les profils publics (artistes, artisans)
DROP POLICY IF EXISTS "Profils publics lisibles par tous" ON profiles;
CREATE POLICY "Profils publics lisibles par tous"
  ON profiles FOR SELECT
  USING (profil IN ('artiste', 'artisan'));

-- Les admins peuvent tout lire
DROP POLICY IF EXISTS "Admins lisent tous les profils" ON profiles;
CREATE POLICY "Admins lisent tous les profils"
  ON profiles FOR SELECT
  USING (public.is_admin());

-- Les admins peuvent mettre à jour tous les profils
DROP POLICY IF EXISTS "Admins mettent à jour tous les profils" ON profiles;
CREATE POLICY "Admins mettent à jour tous les profils"
  ON profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Les utilisateurs peuvent supprimer leur propre profil
DROP POLICY IF EXISTS "Les utilisateurs suppriment leur propre profil" ON profiles;
CREATE POLICY "Les utilisateurs suppriment leur propre profil"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- ============================================================
-- Suppression complète du compte (profil + auth.users)
-- ============================================================
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS VOID AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

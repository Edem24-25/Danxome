-- ============================================================
-- Seed artistes auth — Version avec trigger désactivé
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

-- Vérification
SELECT p.email, p.prenom, p.nom, p.profil, a.slug as artiste_slug
FROM profiles p
JOIN artistes a ON a.user_id = p.id
WHERE p.profil = 'artiste';

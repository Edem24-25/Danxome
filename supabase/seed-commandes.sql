-- ============================================================
-- Seed — Commandes de démo
-- Exécuter APRÈS schema.sql et seed.sql
-- ============================================================

-- On crée d'abord un profil client fictif pour les commandes
-- (nécessaire si aucun utilisateur n'existe encore)

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

-- Vérification
SELECT ref, client_nom, oeuvre_titre, artiste_nom, montant, statut, date
FROM commandes
ORDER BY date DESC;

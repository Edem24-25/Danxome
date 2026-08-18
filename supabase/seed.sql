-- ============================================================
-- Seed — Données initiales pour DanXomè
-- Exécuter APRÈS schema.sql
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
('quintessence', 'Festival Quintessence', '5 – 10 décembre', 5, 'DÉC', 'Ouidah', 'Cinéma', '/Festival de quintesence_danxomè.jpg', 'Compétition de films africains, projections en plein air et masterclasses.')
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

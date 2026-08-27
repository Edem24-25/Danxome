# Documentation Complète du Projet DanXomè

Bienvenue dans la documentation officielle et exhaustive de la plateforme **DanXomè**. Ce document offre une vue d'ensemble technique et fonctionnelle du projet, du démarrage jusqu'aux perspectives d'évolution.

---

## 📋 Table des matières

1. [Présentation & Vision du Projet](#1-présentation--vision-du-projet)
2. [Stack Technique & Architecture](#2-stack-technique--architecture)
3. [Guide de Démarrage Pas à Pas](#3-guide-de-démarrage-pas-à-pas)
4. [Fonctionnalités Implémentées (Du début à la fin)](#4-fonctionnalités-implémentées-du-début-à-la-fin)
5. [Dispositifs de Sécurité & Conformité](#5-dispositifs-de-sécurité--conformité)
6. [Roadmap & Fonctionnalités Reste à Implémenter](#6-roadmap--fonctionnalités-reste-à-implémenter)
7. [Structure du Code & Organisation des Fichiers](#7-structure-du-code--organisation-des-fichiers)

---

## 1. Présentation & Vision du Projet

### 1.1 Le Concept
**DanXomè** est une plateforme web full-stack moderne dédiée à la numérisation, la valorisation et la promotion du patrimoine culturel, historique, touristique et artistique du Bénin.

Le nom **DanXomè** (ou Dahomey) rend hommage au royaume historique fondé au XVIIe siècle sur le plateau d'Abomey, célèbre pour sa puissance militaire, son corps armé des Amazones (*Agodjié*), son architecture cérémonielle et son artisanat de cour.

### 1.2 Public Cible
- **Touristes & Voyageurs (Nationaux et Internationaux)** : Découverte des sites classés UNESCO, réservation de visites guidées, parcours de visites virtuelles 360°, découverte culinaire.
- **Artistes & Artisans Béninois** : Vitrine numérique personnelle, vente d'œuvres d'art authentiques (sculptures, bronzes, tentures appliquées, poteries) sans intermédiaire spéculatif.
- **Passionnés de Culture & Chercheurs** : Accès aux contenus patrimoniaux (royaumes, musées, atlas linguistique, dossiers d'histoire).
- **Administrateurs & Modérateurs** : Gestion de la plateforme, validation des profils d'artisans, suivi des ventes et des avis.

---

## 2. Stack Technique & Architecture

### 2.1 Front-End & Rendu (SSR)
- **Framework Principal** : [TanStack Start](https://tanstack.com/start) (Full-stack React SSR).
- **Routage** : [TanStack Router](https://tanstack.com/router) (Routage basé sur le système de fichiers, typé de bout en bout).
- **Bibliothèque UI** : React 19, TypeScript.
- **Styling** : Tailwind CSS v4, Radix UI Primitives, icons Lucide-React, animations CSS sur mesure.
- **Composants d'Interaction** : Embla Carousel (carrousels réactifs), Recharts (tableaux de bord statistiques), Pannellum JS (visionneuse panoramique 360°).

### 2.2 Back-End & Base de Données
- **Fournisseur de Services** : [Supabase](https://supabase.com) (PostgreSQL managé).
- **Authentification** : Supabase Auth (Email/Password, Google OAuth, Apple OAuth).
- **Sécurité Base de Données** : Row Level Security (RLS) sur l'ensemble des tables SQL.
- **Fonctions Serveur** : `createServerFn` de TanStack Start pour les mutations sensibles (génération et calcul des commandes).
- **Stockage de Fichiers** : Supabase Storage (Buckets publics `oeuvres` et `avatars` protégés par RLS).

---

## 3. Guide de Démarrage Pas à Pas

### 3.1 Prérequis Système
- **Node.js** >= 18.x
- **Gestionnaire de paquets** : `npm` ou `bun` (recommandé)
- **Instance Supabase** : Un projet Supabase gratuit ou auto-hébergé

### 3.2 Installation du Projet

1. **Cloner le dépôt et accéder au dossier** :
   ```bash
   git clone <URL_DU_DEPOT>
   cd Danxome
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   # ou avec bun
   bun install
   ```

### 3.3 Configuration des Variables d'Environnement

Créez un fichier `.env` à la racine du projet :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon-supabase
```

Créez un fichier `.env.server` pour le côté serveur :
```env
SUPABASE_SERVICE_ROLE_KEY=votre-cle-service-role-supabase
RESET_ARTIST_PASSWORD=VotreMotDePasseSecurise123!
```

### 3.4 Initialisation de la Base de Données

1. Ouvrez l'éditeur SQL de votre projet Supabase.
2. Exécutez le script complet présent dans [`supabase/database.sql`](file:///c:/wamp64/www/Danx%C3%B2m%C3%A8/supabase/database.sql).
3. Le script crée les tables (`profiles`, `artistes`, `oeuvres`, `sites`, `musees`, `royaumes`, `evenements`, `plats`, `dossiers`, `commandes`, `panier_items`, `favoris`, `reservations`, `contacts`, `newsletter`), configure les déclencheurs (triggers) PL/pgSQL, active le RLS et insère le jeu de données initial (seed).

### 3.5 Lancement de l'Application

Lancer le serveur de développement :
```bash
npm run dev
# ou
bun run dev
```
L'application est disponible à l'adresse `http://localhost:5173`.

---

## 4. Fonctionnalités Implémentées (Du début à la fin)

### 4.1 Authentification & Rôles Utilisateurs
- **Inscription Dynamique** : Inscription multi-étapes. Un utilisateur peut s'inscrire en tant que `visiteur` (accès immédiat) ou en tant qu'`artiste` / `artisan` (profil créé avec statut `en_attente` soumis à modération administrative).
- **Connexion & SSO** : Authentification par email/mot de passe ainsi que support Google et Apple OAuth.
- **Réinitialisation de mot de passe** : Envoi d'email de réinitialisation et page dédiée de mise à jour du mot de passe.
- **Gestion des 4 Rôles** :
  1. **Visiteur** : Navigation, réservations, achats d'œuvres, rédaction d'avis.
  2. **Artiste** : Vitrine d'exposition, publication d'œuvres avec téléversement d'images, suivi des commandes reçues.
  3. **Artisan** : Vente d'artisanat traditionnel, gestion du catalogue d'objets.
  4. **Admin** : Modération des artistes, gestion des utilisateurs, validation des rôles, statistiques globales.

### 4.2 Module Tourisme & Découverte
- **Sites Touristiques** : Catalogue des grands sites (Palais d'Abomey, Cité lacustre de Ganvié, Parc national de la Pendjari, Porte du Non-Retour à Ouidah).
- **Carte Interactive du Bénin** : Visualisation cartographique dynamique des sites par région (Zou, Atlantique, Atacora, Ouémé...).
- **Visite Virtuelle 360°** : Intégration de panoramas immersifs avec Pannellum.js, hotspots explicatifs et navigation interactive.
- **Système de Réservation** : Formulaire de réservation de visites guidées avec choix de la date, du créneau horaire, du nombre de personnes et calcul automatique des sous-totaux et frais.
- **Gastronomie Béninoise** : Fiches recettes détaillées (Pâte rouge, Ablo, Wagashi, Igname pilée), histoire des plats, origine géographique et système d'avis certifiés.

### 4.3 Module Culture & Patrimoine
- **Royaumes Historiques** : Fiches synthétiques sur les grands royaumes (DanXomè/Abomey, Hogbonu/Porto-Novo, Baatonu de Nikki) accompagnées de frises chronologiques interactives et de récits mémoriels.
- **Musées & Collections** : Présentation du Musée historique d'Abomey, de la Fondation Zinsou et du Musée da Silva.
- **Événements Culturels** : Calendrier des grands événements du Bénin (Vodun Days, Fête de la Gaani, festivals d'art).
- **Dossiers Éditoriaux** : Articles de fond illustrés sur le patrimoine immatériel et l'histoire.

### 4.4 Module Art & Artisanat (E-Commerce)
- **Boutique d'Art** : Filtrage multicritère des œuvres (par catégorie, région, tranche de prix, artiste).
- **Panier d'Achat Synchronisé** : Gestion du panier en temps réel stocké dans la table `panier_items` Supabase.
- **Système de Favoris** : Sauvegarde des œuvres préférées dans l'espace utilisateur.
- **Tunnel de Commande (Checkout)** : Processus de finalisation de commande avec validation des disponibilités et choix du moyen de paiement (Mobile Money MTN/Moov, Carte bancaire).
- **Espace Artiste** : Tableau de bord de l'artisan incluant ses statistiques de ventes, la publication de nouvelles œuvres (avec upload sur Supabase Storage) et le suivi des commandes reçues.

### 4.5 Module Administration & Modération
- **Tableau de Bord Administrateur** : Vue d'ensemble des métriques clés (chiffre d'affaires, nombre d'œuvres, profils en attente).
- **Modération des Artistes** : Interface d'approbation ou de rejet des demandes d'inscription d'artisans.
- **Gestion des Commandes & Avis** : Suivi des statuts des commandes (`recue`, `validee`, `en_cours`, `expediee`, `livree`) et modération des avis soumis.

---

## 5. Dispositifs de Sécurité & Conformité

Le projet a fait l'objet d'un audit de sécurité rigoureux pour éliminer les failles courantes :

1. **Sécurisation des Fonctions Serveur** :
   - La fonction `createOrderFromCart` (`src/server-functions/commands.ts`) vérifie le jeton JWT (`auth_token`) de l'utilisateur auprès de Supabase Auth pour garantir que `client_id === auth.uid()`, empêchant toute création de commande frauduleuse ou suppression non autorisée du panier d'un tiers.
2. **Isolation du Stockage Supabase (RLS)** :
   - Les politiques du bucket Storage `oeuvres` exigent que le chemin d'accès d'une image corresponde au sous-dossier de l'utilisateur authentifié : `(storage.foldername(name))[1] = auth.uid()::text`.
3. **Protection contre le Cross-Site Scripting (XSS)** :
   - Élimination intégrale des affectations directes à `.innerHTML` dans la bibliothèque `pannellum.js` au profit d'injections sécurisées via `textContent` et création d'éléments DOM nodaux (`createElement`, `appendChild`).
4. **Assainissement des Requêtes SQL/Supabase** :
   - Fonction d'assainissement `sanitizeParam` appliquée à tous les slugs et identifiants transmis aux hooks de données (`useSite`, `useOeuvre`, etc.).
5. **Gestion des Secrets** :
   - Suppression des mots de passe en dur et exclusion des journaux de logs contenant des informations sensibles.

---

## 6. Roadmap & Fonctionnalités Reste à Implémenter

Bien que l'application soit pleinement fonctionnelle, voici les évolutions prévues pour les prochaines versions :

### 6.1 Intégrations de Paiement Réel
- [ ] **Passerelle Mobile Money** : Intégration de l'API [Kkiapay](https://kkiapay.me) ou [FedaPay](https://fedapay.com) pour le traitement en direct des paiements MTN Mobile Money et Moov Money.
- [ ] **Webhook de Paiement** : Écouteur de notifications IPN/Webhook pour valider automatiquement le statut des commandes dès confirmation bancaire.

### 6.2 Notifications & Communications
- [ ] **Emails Transactionnels** : Intégration de Resend ou SendGrid pour l'envoi d'emails de confirmation de commande, de reçu de réservation et de notification de modération.
- [ ] **Génération de Billets PDF** : Exportation de billets de réservation pour les sites touristiques avec QR Code unique.

### 6.3 Expérience Utilisateur & PWA
- [ ] **Application Web Progressive (PWA)** : Support du mode hors-ligne pour la consultation des fiches touristiques et de la carte sur le terrain.
- [ ] **Internationalisation (i18n)** : Traduction complète de l'interface en Anglais et initiation aux langues locales (Fon, Yoruba).
- [ ] **Modération IA des Images** : Scan automatique des visuels téléversés par les artistes pour filtrer le contenu inappropriate.

---

## 7. Structure du Code & Organisation des Fichiers

```
Danxòmè/
├── public/                        # Assets statiques & bibliothèque Pannellum JS
│   ├── pannellum.js               # Visionneuse 360° (sécurisée contre XSS)
│   ├── pannellum.css
│   └── placeholder.svg
├── scripts/                       # Scripts d'administration & maintenance
│   ├── create-admin.ts            # Script de création d'un administrateur
│   └── reset-artist-passwords.ts  # Script de réinitialisation des mots de passe
├── supabase/
│   └── database.sql               # Schéma SQL master complet (Tables, Triggers, RLS, Storage)
├── src/
│   ├── assets/                    # Photographies et illustrations du patrimoine
│   ├── components/
│   │   ├── site/                  # Composants métier du projet (SiteShell, BeninMap, Header...)
│   │   └── ui/                    # Composants d'interface shadcn/ui (Button, Dialog, Select...)
│   ├── contexts/
│   │   └── auth.tsx               # Contexte global d'authentification Supabase
│   ├── hooks/
│   │   └── use-data.ts            # React Query hooks pour la récupération et mutation de données
│   ├── lib/
│   │   ├── supabase/              # Initialisation du client Supabase
│   │   ├── types/                 # Types TypeScript (User, Profile, Site, Oeuvre...)
│   │   ├── auth-guard.ts          # Middleware de protection des routes par rôle
│   │   ├── validations.ts         # Schémas Zod de validation des formulaires
│   │   └── rate-limit-server.ts   # Limiteur de fréquence de requêtes serveur
│   ├── routes/                    # Système de routes TanStack Router
│   │   ├── index.tsx              # Page d'accueil principale
│   │   ├── tourisme.*.tsx         # Routes de découverte touristique et réservation
│   │   ├── culture.*.tsx          # Routes des royaumes, musées et dossiers
│   │   ├── art.*.tsx              # Boutique, panier et tunnel d'achat
│   │   ├── artiste.*.tsx          # Espace personnel et tableau de bord de l'artiste
│   │   ├── admin.*.tsx            # Espace de modération et d'administration
│   │   ├── profil.*.tsx           # Gestion du compte utilisateur
│   │   └── auth.*.tsx             # Connexion, inscription et réinitialisation
│   ├── server-functions/
│   │   └── commands.ts            # Fonctions serveur sécurisées pour la création de commande
│   └── main.tsx                   # Point d'entrée React
├── .env                           # Variables d'environnement publiques client
├── .env.server                    # Variables d'environnement privées serveur
├── package.json                   # Dépendances et scripts
└── README.md                      # Aperçu rapide du projet
```

---

*Documentation générée pour le projet DanXomè — Tous droits réservés.*

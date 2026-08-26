import { z } from "zod";

export const registerSchema = z.object({
  prenom: z.string().min(1, "Prénom requis").max(50),
  nom: z.string().min(1, "Nom requis").max(50),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  profil: z.enum(["visiteur", "artiste", "artisan"], {
    errorMap: () => ({ message: "Choisissez un type de compte" }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const contactSchema = z.object({
  nom: z.string().min(1, "Nom requis").max(100),
  email: z.string().email("Email invalide"),
  sujet: z.string().min(1, "Sujet requis").max(200),
  message: z
    .string()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères"),
});

export const reservationSchema = z.object({
  siteId: z.string().uuid("Site invalide"),
  date: z.string().min(1, "Date requise"),
  creneau: z.string().min(1, "Créneau requis"),
  personnes: z.number().int().min(1, "Au moins 1 personne").max(50),
  nom: z.string().min(1, "Nom requis").max(100),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(8, "Téléphone invalide").max(20),
});

export const registerStep2Schema = z.object({
  telephone: z.string().min(8, "Téléphone invalide").max(20).optional().or(z.literal("")),
  ville: z.string().min(1, "Ville requise").max(100),
  categorie: z.string().min(1, "Catégorie requise").max(100),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères").max(2000),
  portfolio_url: z.string().url("URL invalide").optional().or(z.literal("")),
});

export const addOeuvreSchema = z.object({
  titre: z.string().min(1, "Titre requis").max(200),
  slug: z
    .string()
    .min(1, "Slug requis")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug doit contenir uniquement lettres minuscules, chiffres et tirets"),
  categorie: z.string().min(1, "Catégorie requise"),
  region: z.string().optional(),
  prix: z.number().int().min(1, "Le prix doit être supérieur à 0"),
  description: z.string().max(5000).optional(),
  image_url: z.string().url("URL invalide").optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterStep2Input = z.infer<typeof registerStep2Schema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ReservationInput = z.infer<typeof reservationSchema>;
export type AddOeuvreInput = z.infer<typeof addOeuvreSchema>;

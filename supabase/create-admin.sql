-- Script pour passer le compte en admin
-- Exécutez ce script dans la console SQL de Supabase

-- Mettre à jour le profil de visiteur vers admin
UPDATE profiles 
SET profil = 'admin' 
WHERE email = 'danxome229@gmail.com';

-- Vérifier
SELECT id, email, profil FROM profiles WHERE email = 'danxome229@gmail.com';

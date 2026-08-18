import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.server" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !supabaseServiceKey || !email || !password) {
  console.error(
    "Variables manquantes. Vérifiez VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL et ADMIN_PASSWORD dans .env.server",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createAdmin() {
  const prenom = "Admin";
  const nom = "DanXomè";

  console.log("Création du compte admin...");

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      prenom,
      nom,
      profil: "admin",
    },
  });

  if (error) {
    if (error.message.includes("already")) {
      console.log("L'utilisateur existe déjà. Mise à jour du profil...");

      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users?.users?.find((u) => u.email === email);

      if (user) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ profil: "admin" })
          .eq("id", user.id);

        if (updateError) {
          console.error("Erreur mise à jour profil:", updateError.message);
        } else {
          console.log("Profil mis à jour avec le rôle admin!");
        }
      }
    } else {
      console.error("Erreur:", error.message);
    }
    return;
  }

  console.log("Utilisateur créé:", data.user?.id);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ profil: "admin" })
    .eq("id", data.user!.id);

  if (profileError) {
    console.error("Erreur profil:", profileError.message);
  } else {
    console.log("Compte admin créé avec succès!");
    console.log("Email:", email);
  }
}

createAdmin();

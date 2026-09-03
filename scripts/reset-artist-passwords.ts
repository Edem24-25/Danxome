import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

function getEnv(file: string, key: string): string {
  const env = readFileSync(file, "utf-8");
  const line = env.split("\n").find((l) => !l.startsWith("#") && l.startsWith(key + "="));
  return line?.split("=").slice(1).join("=") ?? "";
}

const supabaseUrl = getEnv(".env", "VITE_SUPABASE_URL");
const supabaseServiceKey = getEnv(".env.server", "SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Variables manquantes dans .env.server");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const NEW_PASSWORD =
  process.env["RESET_ARTIST_PASSWORD"] ||
  getEnv(".env.server", "RESET_ARTIST_PASSWORD") ||
  getEnv(".env", "RESET_ARTIST_PASSWORD");

if (!NEW_PASSWORD) {
  console.error("Variable d'environnement de réinitialisation requise manquante.");
  process.exit(1);
}

const artistEmails = [
  "kossi.adanou@danxome.bj",
  "adjoa.gbedo@danxome.bj",
  "raphael.tossou@danxome.bj",
];

async function resetPasswords() {
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Erreur lecture utilisateurs:", listError.message);
    process.exit(1);
  }

  for (const email of artistEmails) {
    const user = users.users.find((u) => u.email === email);
    if (!user) {
      console.log(`❌ Utilisateur non trouvé: ${email}`);
      continue;
    }
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: NEW_PASSWORD,
    });
    if (error) {
      console.error(`❌ Erreur ${email}:`, error.message);
    } else {
      console.log(`✅ ${email} → mot de passe mis à jour`);
    }
  }
}

resetPasswords();

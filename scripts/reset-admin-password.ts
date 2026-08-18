import dotenv from "dotenv";

dotenv.config({ path: ".env.server" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Variables manquantes. Assurez-vous que VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies dans .env.server",
  );
  process.exit(1);
}

async function listAll() {
  const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=100`, {
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
    },
  });
  const data = await listRes.json();
  console.log(
    "Utilisateurs auth:",
    data.users?.map((u: any) => ({ id: u.id, email: u.email })),
  );
}

listAll();

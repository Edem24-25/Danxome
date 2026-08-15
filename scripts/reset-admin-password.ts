const supabaseUrl = "https://atmdqjuoixrfxxfwjimj.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0bWRxanVvaXhyZnh4ZndqaW1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjE3MzMxNSwiZXhwIjoyMTAxNzQ5MzE1fQ.LgmRYHn5hRqJNx0Xw0wWtLzB19Kfq-Qq44DXvj6kwgw";

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

/** Beta waitlist — writes straight to Supabase via PostgREST.
 *  The publishable key is safe to ship: the table's RLS only allows
 *  INSERT for anonymous visitors; nobody can read the list from here. */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://mmgexmzjycouzfngmkqm.supabase.co";
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_pmgQFbesN0bmsKeAG5EBHA_Z4-Z-4iU";

export type JoinResult = "ok" | "duplicate" | "error";

export async function joinBeta(email: string, source = "landing"): Promise<JoinResult> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/beta_signups`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ email: email.trim().toLowerCase(), source }),
    });
    if (res.status === 201) return "ok";
    if (res.status === 409) return "duplicate"; // unique(email) — already in
    return "error";
  } catch {
    return "error";
  }
}

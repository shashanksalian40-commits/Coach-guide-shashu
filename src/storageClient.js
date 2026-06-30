// Drop-in replacement for Claude's window.storage, backed by Supabase.
// Same shape: get(key, shared) -> {key, value} | null ; set(key, value, shared) -> {key, value, shared} | null
// "shared" is accepted but ignored — this self-hosted version uses one shared table,
// since there's no per-visitor account system outside Claude's environment.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.error(
    "Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see README)."
  );
}

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

async function get(key, _shared) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/kv_store?key=eq.${encodeURIComponent(key)}&select=value`,
    { headers }
  );
  if (!res.ok) throw new Error(`storage get failed: ${res.status}`);
  const rows = await res.json();
  if (!rows.length) throw new Error("not found");
  return { key, value: rows[0].value, shared: !!_shared };
}

async function set(key, value, _shared) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/kv_store`, {
    method: "POST",
    headers: { ...headers, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) throw new Error(`storage set failed: ${res.status}`);
  return { key, value, shared: !!_shared };
}

async function del(key, _shared) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/kv_store?key=eq.${encodeURIComponent(key)}`,
    { method: "DELETE", headers }
  );
  if (!res.ok) throw new Error(`storage delete failed: ${res.status}`);
  return { key, deleted: true, shared: !!_shared };
}

async function list(prefix = "", _shared) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/kv_store?key=like.${encodeURIComponent(prefix)}*&select=key`,
    { headers }
  );
  if (!res.ok) throw new Error(`storage list failed: ${res.status}`);
  const rows = await res.json();
  return { keys: rows.map((r) => r.key), prefix, shared: !!_shared };
}

const storageClient = { get, set, delete: del, list };
export default storageClient;

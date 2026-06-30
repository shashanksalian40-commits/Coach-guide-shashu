-- Run this once in your Supabase project's SQL Editor (Dashboard > SQL Editor > New query)

create table if not exists kv_store (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

-- Keep updated_at fresh on every write
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists kv_store_updated_at on kv_store;
create trigger kv_store_updated_at
before update on kv_store
for each row execute function set_updated_at();

-- Row Level Security: this app has no login system, so we open read/write
-- to anyone with your Supabase anon key (which is public in the deployed frontend
-- anyway). This is fine for a small coaching tool, but means anyone who finds
-- your anon key could read/write the table directly via the API.
alter table kv_store enable row level security;

drop policy if exists "public read/write" on kv_store;
create policy "public read/write" on kv_store
  for all
  using (true)
  with check (true);

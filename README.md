# CoachOS — self-hosted setup

This is the same CoachOS app, rewired to use **Supabase** (free database) instead of
Claude's built-in storage, so it can run outside Claude on its own public URL.

## What you'll end up with
- A permanent public link (e.g. `coachos-yourname.vercel.app`) you can send to clients
- A free Supabase database storing all check-ins, clients, workouts, and recipes
- Full control: edit, redeploy, and update whenever you want, same link stays alive

Total setup time: roughly 15–25 minutes the first time.

---

## Step 1 — Create your free Supabase project

1. Go to https://supabase.com and sign up (free, no credit card needed).
2. Click **New Project**. Pick any name (e.g. "coachos"), set a database password
   (save it somewhere), choose the region closest to you, and create the project.
   Wait ~2 minutes for it to spin up.
3. Once it's ready, go to **SQL Editor** (left sidebar) → **New query**.
4. Open the file `supabase_setup.sql` from this project, copy all of it, paste it
   into the SQL editor, and click **Run**. This creates the table CoachOS needs.
5. Go to **Project Settings** (gear icon) → **API**.
   - Copy the **Project URL** (looks like `https://xxxxx.supabase.co`)
   - Copy the **anon public** key (a long string starting with `eyJ...`)
   - You'll need both in Step 3.

---

## Step 2 — Get the code onto GitHub (so Vercel can deploy it)

1. Go to https://github.com and sign up if you don't have an account (free).
2. Create a **new repository** (e.g. "coachos"), keep it private if you like.
3. Upload all the files from this project folder into that repo. The easiest way
   if you're not familiar with git: on the repo page, click **Add file → Upload
   files**, then drag in everything (`package.json`, `vite.config.js`,
   `index.html`, the `src/` folder, etc.) and commit.

---

## Step 3 — Deploy on Vercel (free hosting)

1. Go to https://vercel.com and sign up using your GitHub account (free, no card
   needed for this).
2. Click **Add New → Project**, then **Import** the GitHub repo you just created.
3. Vercel will detect it's a Vite project automatically. Before deploying, open
   **Environment Variables** and add these two:
   - `VITE_SUPABASE_URL` → paste your Supabase Project URL from Step 1
   - `VITE_SUPABASE_ANON_KEY` → paste your Supabase anon public key from Step 1
4. Click **Deploy**. Wait ~1 minute.
5. You'll get a live URL like `https://coachos-yourname.vercel.app` — that's your
   permanent client-facing link.

---

## Updating the app later

Whenever you want a change (new feature, fix, tweak):
1. Come back and ask for the change — you'll get an updated file.
2. Replace the old file in your GitHub repo with the new one (Upload files again,
   or edit directly on GitHub — it'll ask to commit the change).
3. Vercel automatically redeploys within ~30 seconds of any commit to the repo.
4. Your link stays exactly the same. Clients don't need a new URL, and their
   existing check-in data in Supabase is untouched.

---

## Setting your coach PIN

Open your deployed link, tap **"Coach login,"** then on the PIN screen tap
**"Set a custom PIN"** and choose your own 4-digit code. It's stored in your
Supabase table, so it persists across visits and devices.

## A note on privacy/security

This app has no real login system — anyone with your link lands on the
client check-in form, and only your 4-digit PIN protects the coach dashboard.
That's a reasonable bar for a small coaching business, but it's not
bank-grade security: someone with your Supabase anon key (which is visible in
your deployed site's code) could theoretically read or write the database
directly via Supabase's API, bypassing your PIN. For most freelance coaching
use cases this is an acceptable tradeoff, but don't store anything you
wouldn't want exposed if your link were leaked.

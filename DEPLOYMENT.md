# Deployment Checklist: Multi-Shop Rollout

Everything the code needs from Supabase, Vercel, and your domain to actually go live. Follow in order — each section depends on the one before it.


## 1. Supabase

### 1a. Run the schema migration (if not already done)

Open **Supabase Dashboard → SQL Editor**, paste in `MULTI_TENANT_MIGRATION.sql`, and run it. It:
- adds a `slug` to `companies` and creates a default company ("My Shop", slug `main`) if none exists yet
- adds `company_id` to every business table and backfills existing rows to that default company
- creates `user_companies` (who can access which shop)
- replaces every RLS policy with one scoped to `company_id`

Safe to re-run — every step is idempotent.

> If your login page already shows a shop name instead of "Shop not found," this step is done.

### 1a-2. Run the team/roles migration

Same place, paste in `TEAM_AND_ROLES_MIGRATION.sql`, run it. It makes the `role` on each team member actually mean something — until this runs, every role (including "Viewer") can write data; after, only `owner`/`admin`/`staff` can, `viewer` is truly read-only. Also lets `owner`/`admin` edit their shop's name/accounting year from Settings.

### 1b. Create your first login (Supabase Auth)

The app now uses Supabase's own auth instead of the old custom table, so a real email + password account needs to exist:

1. **Dashboard → Authentication → Users → Add user.** Set an email and password. (Auto-confirm the email, or use the confirmation link it sends.)
2. Copy that user's UUID from the users list.
3. **SQL Editor**, link them to a shop:
   ```sql
   insert into saree.user_companies (user_id, company_id, role)
   values ('<paste-user-uuid>', 1, 'owner');
   ```
   (`1` assumes the default "My Shop" — check `select * from saree.companies` if you've already added others.)

Without step 3, login succeeds but the app shows "No access to this shop."

This is also the *only* time you need SQL for team members — once one owner account exists, they can invite everyone else from **Settings → Team Members** in the app itself (see section 4).

### 1c. Adding each new shop later

Still needs one SQL insert (there's no self-serve "create a shop" UI yet — see the note at the end of this doc):
```sql
insert into saree.companies (name, slug, accounting_year)
values ('Shop B', 'shopb', '2026-2027');
```
`slug` is what has to match the subdomain (`shopb` -> `shopb.yourdomain.com`). No DNS or Vercel work needed — the wildcard from section 2b already covers it.

That new shop still needs its *first* owner linked by hand (same as 1b step 3, with the new `company_id`) — a shop with zero members has no one who could send an invite. Every member after that first owner can be added straight from Settings.

## 2. Vercel

### 2a. Environment variables

**Project → Settings → Environment Variables** (Production, Preview, and Development):

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | from `.env.local` / Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same place |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → **service_role** key (secret) |

The first two were already required. `SUPABASE_SERVICE_ROLE_KEY` is new — it powers team invites in Settings and is only ever read server-side (`app/api/settings/*`). **Never** prefix it with `NEXT_PUBLIC_` or reference it from a `'use client'` file — that would ship it to every visitor's browser.

### 2b. Wildcard domain

**Project → Settings → Domains** → add both:
- `yourdomain.com`
- `*.yourdomain.com`

Wildcard domains need a **Vercel Pro plan** — Hobby doesn't support them.

### 2c. Redeploy

Push to `main` (or trigger a redeploy) after 1a/1b are done. The `packageManager` pin and lockfile fix from earlier already keep the build itself deterministic — this step is just "ship the code in this PR."

## 3. Domain / DNS (Hostinger)

In **hPanel → Domains → [your domain] → DNS Zone Editor**, add (don't remove existing MX/email records):

| Type | Name | Points to |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `*` | `cname.vercel-dns.com` |

Propagation is usually fast; Vercel auto-issues SSL once it resolves. Once `shopa.yourdomain.com` loads and shows a valid cert, you're done — every future shop just needs the `companies` row from 1c, nothing here.

## 4. What actually changes for anyone using the app today

- **Login changes.** The old `mps` / `mps@1234` demo login no longer exists — it was a custom table, now replaced by Supabase Auth. See 1b to create a real account.
- **Every shop's data is now isolated by `company_id`,** enforced by Postgres RLS, not just app code.
- **Barcodes, bill numbers, and item IDs are now unique per shop**, not globally — two shops can both have a product barcoded `1234`.
- **The two API routes** (`/api/sales`, `/api/invoice-items`) were removed — nothing in the app called them, and they predated the auth/RLS model, so keeping them would have meant either leaving a bypass around RLS or maintaining a second, parallel auth path for no user.
- **Two previously-static "Reports" buttons** (Sales Outstanding / Purchase Outstanding) now open a real report instead of doing nothing.
- **New: Settings tab** (owner/admin only, in the nav). Two things live there:
  - **Shop Profile** — edit the shop's name and accounting year.
  - **Team Members** — invite people by email with a role (`Owner`/`Admin`/`Staff`/`Viewer`), change anyone's role, or remove them. Inviting sends them a real Supabase Auth invite email; if that email already has an account elsewhere, it just grants them access to this shop instead of erroring.
- **Roles are now enforced, not cosmetic.** After running `TEAM_AND_ROLES_MIGRATION.sql`, `viewer` can see everything but can't create or edit anything — enforced by RLS (so it holds even if the UI has a bug), and the UI itself replaces write-only screens (Retail Sale, Party Sale, and the entry forms on Sales/Purchase/Payment) with a "view-only" notice for that role instead of showing a form that would just fail.
- **Not built yet:** self-serve "create a new shop" signup. Every new shop's *first* owner still needs one manual SQL insert (1c) — after that, everyone else on that shop can be invited from the UI. Worth building if you expect shops to sign themselves up rather than you provisioning them.

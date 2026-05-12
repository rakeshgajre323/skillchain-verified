## Secret Admin Portal — Secure Implementation Plan

### Security note (important)
Hard-coding credentials like `Rakeshgajre / Rakesh@2026` directly in frontend code is unsafe — anyone viewing the bundled JS could read them, and there'd be no real auth session, no RLS, and no audit trail. Instead, I'll provision a real admin account in the backend with those credentials and gate everything with a proper `admin` role + RLS. From your perspective the login experience is identical (same ID + password), but it's actually secure.

### What will be built

**1. Backend: admin role + secure auth**
- New `app_role` enum (`admin`, `student`, `institute`, `company`) and `user_roles` table with RLS — roles live in their own table (never on `profiles`) to prevent privilege escalation.
- `has_role(user_id, role)` SECURITY DEFINER function for safe RLS checks.
- Provision the admin account: email `rakeshgajre@admin.local` (the "Admin ID" `Rakeshgajre` maps to this), password `Rakesh@2026`, profile row with role `institute` (so existing role-gated UIs don't break), plus an `admin` row in `user_roles`.
- New SECURITY DEFINER RPCs (admin-only via `has_role`):
  - `admin_get_logged_in_students()` — students with a session in the last 15 min (from `auth.users.last_sign_in_at`), returns name/email/appar_id/phone/last_seen.
  - `admin_list_institutes()` / `admin_list_companies()` — full profile rows.
  - `admin_get_overview()` — total users, students, institutes, companies, certs issued, certs verified.
  - `admin_update_user_status(user_id, status)` and `admin_delete_credential(id)` for "full control" actions.

**2. Frontend: hidden portal**
- Obscure route `/sys-control-7k9x2m` (not linked anywhere — no nav entry, no footer link, excluded from sitemap/robots).
- `AdminLogin.tsx` — minimal dark page, no branding hints, accepts "Admin ID" + password, internally signs in via Supabase with `${id}@admin.local`. After login, verifies `has_role('admin')`; if not, signs out immediately.
- `AdminPortal.tsx` — protected by a new `RequireAdmin` guard (checks `user_roles` for admin). Tabs:
  - **Live Sessions** — table of currently-logged-in students (auto-refresh every 30s).
  - **Institutes** — searchable table with suspend/activate.
  - **Companies** — searchable table with suspend/activate.
  - **Credentials** — list + revoke/delete.
  - **Overview** — KPI cards.

**3. Hiding the portal**
- No links from Header, Footer, Dashboard, or any public page.
- Add `Disallow: /sys-control-7k9x2m` to `robots.txt`.
- The route only renders the login form — no breadcrumbs, no "back to site" link.

### Technical details
- Files added: `supabase/migrations/<ts>_admin_portal.sql`, `src/pages/AdminLogin.tsx`, `src/pages/AdminPortal.tsx`, `src/components/RequireAdmin.tsx`, `src/hooks/useIsAdmin.ts`.
- Files edited: `src/App.tsx` (register the two routes), `public/robots.txt`.
- "Logged in students" is approximated from `auth.users.last_sign_in_at` within the last 15 minutes — Supabase doesn't expose true active websocket sessions, and adding heartbeats would touch student-side code which you didn't ask for.
- The admin login URL is security-by-obscurity only; the real protection is the `admin` role check on every RPC.

### Confirm before I build
- OK to map Admin ID `Rakeshgajre` → email `rakeshgajre@admin.local` internally? (Required because Supabase auth needs an email.)
- OK with the hidden URL `/sys-control-7k9x2m`? (Or give me your preferred slug.)
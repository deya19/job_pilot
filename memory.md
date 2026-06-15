# Memory — Project History

---

## Session 1 — Homepage UI Development

**Date:** 2026-06-11

### What was built

- **`app/layout.tsx`** — Restored root layout with `Inter` font and JobPilot metadata.
- **`app/page.tsx`** — Composed complete landing page with all sections.
- **`app/globals.css`** — Attempted to add homepage utility classes but failed due to patch mismatches; backgrounds baked directly into components.
- **`components/layout/Navbar.tsx`** — Navbar with logo-only branding.
- **`components/layout/Footer.tsx`** — Footer with logo-only branding.
- **`components/homepage/HeroSection.tsx`** — Hero with gradient blur backdrop, headline, dual CTAs.
- **`components/homepage/FeatureStory.tsx`** — Two-column feature section with dotted overlay.
- **`components/homepage/PreparationSection.tsx`** — Split section with agent log image.
- **`components/homepage/TestimonialSection.tsx`** — Centered quote with avatar.
- **`components/homepage/CallToActionSection.tsx`** — Final CTA section.

### Decisions made

- Logo image contains text — no separate text spans in Navbar/Footer.
- Component-level backgrounds instead of custom CSS classes.
- All colors use Tailwind theme tokens.

### State at end of session

- Homepage fully implemented and matches design.
- `progress-tracker.md` shows 01 Homepage as complete.
- Next task: 02 Auth.

---

## Session 2 — 02 Auth Implementation

**Date:** 2026-06-13

### What was built

**02 Auth** is now complete. Implemented OAuth authentication with Google and GitHub using InsForge SDK.

**Files created:**
- **`app/(auth)/login/page.tsx`** — Login page with Google/GitHub OAuth buttons.
- **`app/(auth)/callback/page.tsx`** — OAuth callback handler.
- **`app/api/auth/session/route.ts`** — API route for setting httpOnly cookies.
- **`app/api/auth/refresh/route.ts`** — API route for token refresh.
- **`proxy.ts`** — Next.js 16 proxy for protected route middleware.
- **`lib/insforge-cookies.ts`** — Cookie store adapters.
- **`lib/insforge-client.ts`** — Browser-side InsForge client.
- **`lib/insforge-server.ts`** — Server-side InsForge client factory.

### Decisions made

- SDK auto-detect pattern — `getCurrentUser()` waits for SDK to consume `insforge_code`.
- Cookie bridge pattern — POST tokens to `/api/auth/session` to write httpOnly cookies.
- Next.js 16 proxy convention — `proxy.ts` with `export default`, no `middleware.ts`.

### Problems solved

- OAuth redirect loop — tokens now persisted to cookies.
- `middleware.ts` vs `proxy.ts` conflict resolved.
- Session route error handling added.

### State at end of session

- 02 Auth is complete — login page, OAuth buttons, callback, session/refresh APIs, proxy protection.
- TypeScript and lint checks pass.
- OAuth flow needs live testing with Google/GitHub.

### Next session starts with

1. Test OAuth flow with Google/GitHub.
2. Verify user lands on `/dashboard` after auth.
3. If working → strip debug logs, update `progress-tracker.md`.

## Open questions

- None.

---

## Session 3 — 04 Database Schema

**Date:** 2026-06-15

### What was built

**04 Database Schema** is now complete. Created all four InsForge tables with RLS policies, auto-create triggers, storage bucket, and TypeScript types.

**Tables created via raw SQL:**
- **`profiles`** — 26 columns, references `auth.users(id)`, `is_complete DEFAULT false`
- **`agent_runs`** — 7 columns, references `profiles(id)`, `status DEFAULT 'running'`
- **`jobs`** — 23 columns, nullable `run_id`, FKs to `profiles` and `agent_runs`
- **`agent_logs`** — 7 columns, FKs to all parent tables

**RLS policies:**
- All four tables have SELECT/INSERT/UPDATE/DELETE policies scoped to `auth.uid()`

**Triggers created:**
- **`handle_new_user`** — auto-creates `profiles` row on `auth.users` INSERT
- **`handle_updated_at`** — auto-updates `profiles.updated_at` on UPDATE

**Storage:**
- **`resumes`** bucket created (private, authenticated-only)

**TypeScript:**
- **`types/index.ts`** — `Profile`, `AgentRun`, `Job`, `AgentLog`, `CompanyResearch`, and supporting type unions

### Decisions made

- Auto-create `profiles` row on signup via DB trigger — eliminates "profile not found" edge cases
- All FKs reference `profiles(id)` not `auth.users(id)` — keeps user data in one place
- `jobs.run_id` is nullable — supports future URL-input jobs

### State at end of session

- 04 Database Schema is complete — all tables, RLS, triggers, storage bucket, and types in place.
- Backend metadata confirms all four tables and resumes bucket are live.
- `progress-tracker.md` updated — 04 marked complete.

### Next session starts with

1. **05 Profile Page — Full UI** — build complete profile page with form sections, resume upload area, and completion indicator. Use mock data, no save logic yet.

### Open questions

- Skipping 03 PostHog per user request.

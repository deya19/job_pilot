# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Profile Page
**Last completed:** 04 Database Schema
**Next:** 05 Profile Page — Full UI

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization — skipped per user request
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [ ] 05 Profile Page — Full UI
- [ ] 06 Profile Save Logic
- [ ] 07 AI Profile Extraction from Resume
- [ ] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [ ] 09 Find Jobs Page — Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

- 02 Auth uses `@insforge/sdk/ssr` from the installed `@insforge/sdk` package for browser, server, refresh-route, and proxy session helpers.
- Next.js 16 route protection is implemented with root `proxy.ts` instead of legacy `middleware.ts`, following the installed Next.js docs.
- 04 Database Schema: Four InsForge tables created with RLS policies scoped to `auth.uid()`. `handle_new_user` trigger auto-creates `profiles` row on signup. `handle_updated_at` trigger auto-updates `profiles.updated_at`.

---

## Notes

- Auth added a minimal `/dashboard` placeholder only so the required post-login redirect has a valid target. Full dashboard UI remains Phase 5.

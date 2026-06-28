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

---

## Session 4 — 05 Profile Page Full UI

**Date:** 2026-06-15

### What was built

**05 Profile Page — Full UI** is now complete. Built with mock data, no save logic yet.

**Files created:**
- **`app/profile/page.tsx`** — Server component. Composes Navbar + ProfileAttentionBanner + ResumeSection + ProfileForm + Footer. Page background `bg-background`, content constrained to `max-w-360 px-6 py-8`.
- **`components/profile/ProfileAttentionBanner.tsx`** — Completion banner card. SVG ring (44×44 viewBox, r=18, stroke-width=4) showing 70% with `var(--color-error)` fill and `var(--color-border)` track, rotated -90°. Missing field tags in `bg-warning/10 text-warning`. Static mock data only.
- **`components/profile/ResumeSection.tsx`** — Client component. Drag-and-drop PDF upload zone with active state (`border-accent bg-accent-muted`). Select Resume (secondary button). Generate Resume from Profile (primary button with `Wand2` icon). File state managed via `useState`.
- **`components/profile/TagInput.tsx`** — Reusable client component. Text input + Add button inline. Tags render as `rounded-full bg-accent-muted text-accent` pills with X dismiss. Enter key also adds tags. Used for Skills, Industries, Preferred Locations.
- **`components/profile/WorkExperienceSection.tsx`** — Client component. Up to 3 roles. Each role in `rounded-xl border border-border p-4` card with company, title, start date, end date, "Currently working here" checkbox (disables end date), and responsibilities textarea.
- **`components/profile/ProfileForm.tsx`** — Main client form. Five sections separated by `h-px bg-border`: Personal Info, Professional Info, Work Experience, Education, Job Preferences. Full `useState` form state with mock data pre-filled. Save Profile button (`w-full rounded-lg bg-accent`). `handleSubmit` is a no-op placeholder — save logic comes in Feature 06.

### Decisions made

- Form is a real `<form>` element (not a `<div>`) so Feature 06 can wire a Server Action directly to it.
- Read-only email field uses `bg-surface-secondary text-text-muted` — visually distinct, no focus ring.
- Select elements use identical classes to text inputs for visual consistency.
- `TagInput` accepts tags as controlled prop — parent owns state, component is pure UI.
- `WorkExperienceSection` capped at 3 roles by design (matches build plan).
- Mock data pre-filled matches the design screenshot values (Tamara, Vercel, etc.).

### Problems solved

- TypeScript strict mode passes clean — all form field handlers are explicitly typed.
- `WorkExperience` type imported from `@/types` — no duplication.

### State at end of session

- 05 Profile Page UI is complete — all sections match the design, TypeScript passes, `/imprint` run and `ui-registry.md` updated with structured table entries for all 5 new components.
- `progress-tracker.md` still shows 05 as `[ ]` — needs to be marked complete next session.

### Next session starts with

1. Mark **05 Profile Page — Full UI** as `[x]` in `context/progress-tracker.md`.
2. Build **06 Profile Save Logic** — Server Action in `actions/profile.ts`, wire form to InsForge DB, resume PDF upload to `resumes/{user_id}/resume.pdf`, `is_complete` calculation, `revalidatePath('/profile')`.

### Open questions

- None.

---

## Session 5 — 06 Profile Save Logic + Bug Fixes

**Date:** 2026-06-16

### What was built

**06 Profile Save Logic** is complete and working end-to-end.

**Files created:**
- **`actions/profile.ts`** — `"use server"` action. Accepts `ProfileFormData`, calls `getCurrentUser()`, calculates `completionPercent` + `is_complete` (10 required fields), upserts to `profiles` with `email` from auth token, calls `revalidatePath('/profile')`.
- **`app/api/resume/upload/route.ts`** — POST route. Validates PDF + 10MB, uploads to `resumes/{userId}/resume.pdf` via InsForge Storage, returns `{ success, url }`.

**Files modified:**
- **`app/profile/page.tsx`** — Async server component. Fetches profile from DB, calculates completion, passes props to banner and form. Redirects to `/login` if unauthenticated.
- **`components/profile/ProfileAttentionBanner.tsx`** — Accepts `{ completionPercent, missingFields }` props. Dynamic ring + missing field tags. Mock data removed.
- **`components/profile/ProfileForm.tsx`** — Accepts `profile: Profile | null`. `profileToFormState()` maps DB row to form state. Calls `saveProfile()` on submit. Save button has loading/success/error states.
- **`components/profile/ResumeSection.tsx`** — Accepts `{ existingUrl, onUpload }`. On load with existing URL: shows "View current resume" link + "Select Resume" button. After fresh upload: `setCurrentUrl` updates immediately. Calls `/api/resume/upload` on file select/drop.
- **`lib/insforge-server.ts`** — Fixed `get` to return `cookieStore.get(name)?.value` (plain string).
- **`lib/insforge-cookies.ts`** — Fixed both request and response `get` to return `?.value`.
- **`proxy.ts`** — Fixed both request and response `get` to return `?.value`.

### Decisions made

- Resume upload split from form save (API route on file select, Server Action for text fields) — avoids 4MB body limit.
- `.upsert({ id, email, ... })` instead of `.update().eq()` — resilient if profile row is missing.
- `email` sourced from `userData.user.email` in upsert — satisfies NOT NULL constraint.
- `resumes` storage bucket set to **public** — so "View current resume" links open directly in browser without auth.
- All cookie `get` helpers must return `string | undefined`, not the full `{ name, value }` object — applies to `insforge-server.ts`, `insforge-cookies.ts`, and `proxy.ts`.

### Problems solved

- **`handle_new_user` trigger missing** — profiles table was empty for all users. Created trigger + function, backfilled existing users.
- **Cookie object bug** — `cookieStore.get(name)` returns `{ name, value }`, SDK needs plain string. Fixed with `?.value` in all three cookie helper files.
- **Upsert email NOT NULL violation** — `email` not in `ProfileFormData`, sent as `undefined`. Fixed by passing `userData.user.email`.
- **Resume upload "Not authenticated"** — same cookie bug affecting the upload API route via `createInsforgeServer`.
- **"View current resume" 401** — `resumes` bucket was private. Recreated as public bucket.

### Current state

- 05 and 06 fully complete and working end-to-end.
- Profile saves to DB, resume uploads to storage, page pre-fills on reload.
- Completion banner is dynamic. TypeScript passes clean.
- `progress-tracker.md` updated with all decisions.

### Next session starts with

1. **07 AI Profile Extraction from Resume** — when user uploads a PDF, extract profile fields using AI and auto-fill the form. Check `context/build-plan.md` for requirements before starting.

### Open questions

- None.

---

## Session 6 — 07 AI Profile Extraction from Resume

**Date:** 2026-06-17

### What was built

**07 AI Profile Extraction from Resume** is complete and working end-to-end.

**Files created:**
- **`app/api/resume/extract/route.ts`** — POST route. Derives storage path from `resumeUrl` (splits on `/objects/`, URL-decodes), downloads PDF from InsForge Storage, uploads to OpenAI Files API (`purpose: "user_data"`), calls OpenAI Responses API with GPT-4o for structured JSON extraction, deletes the file from OpenAI after extraction, returns typed `ExtractedProfileData`.

**Files modified:**
- **`app/api/resume/upload/route.ts`** — Reads `fileName` from `FormData`, saves file as `resumes/{userId}/{originalFilename}` instead of hardcoded `resume.pdf`. Returns `{ success, url, fileName }`.
- **`components/profile/ResumeSection.tsx`** — Appends `fileName: file.name` to upload `FormData`. Shows `CheckCircle2`/`XCircle` upload and extraction status states with `text-success`/`text-error` colours.
- **`components/profile/ProfileForm.tsx`** — `handleExtract` calls `/api/resume/extract` with `{ resumeUrl }`, merges returned data into form state (preserves `email` and `resume_pdf_url`), manages `extractSuccess`/`extractError` states passed to `ResumeSection`.
- **`context/progress-tracker.md`** — 07 marked complete with full decision notes.
- **`context/ui-registry.md`** — ResumeSection entry updated with upload/extraction status state patterns.

### Decisions made

- OpenAI Files API + Responses API used for PDF extraction — GPT-4o natively reads PDF content without local parsing.
- Storage path derived from `resumeUrl` by splitting on `/objects/` and URL-decoding — handles any filename.
- Original filename used in storage path (`resumes/{userId}/{originalFilename}`) — user sees their own filename in InsForge Storage dashboard.
- InsForge SDK `upload()` takes only 2 arguments — no `{ upsert: true }` options object.

### Problems solved

- **`pdf-parse` crashes on import** — `index.js` runs a test harness that opens `test/data/05-versions-space.pdf` at module eval time. Fixed by importing `pdf-parse/lib/pdf-parse.js` directly; later abandoned entirely in favour of OpenAI Files API.
- **Hallucinated Homer Simpson data** — root cause was the wrong file being downloaded. Storage path was hardcoded to `resume.pdf` but uploaded file had the original filename. Fixed by using `fileName` in upload route and deriving path from URL in extract route.
- **Storage path derivation wrong** — initial split on `/resumes/` returned `objects/resumes%2F...` (404). Fixed to split on `/objects/` and `decodeURIComponent`.

### Current state

- 07 fully complete and working. Upload saves with original filename. Extract correctly downloads the right file and returns real CV data.
- TypeScript and lint pass clean. Debug logs removed.
- `progress-tracker.md` and `ui-registry.md` updated.

### Next session starts with

1. **08 Resume PDF Generation from Profile** — generate a downloadable PDF from the profile form data using `@react-pdf/renderer`. Check `context/build-plan.md` for requirements before starting.

### Open questions

- None.

---

## Session 7 — 08 Resume PDF Generation + Post-review Fixes

**Date:** 2026-06-20

### What was built

**08 Resume PDF Generation from Profile** is complete, reviewed, and hardened.

**Files created:**
- **`app/api/resume/generate/route.ts`** — POST route. Auth-checks via `createInsforgeServer()`. Fetches user's saved profile from DB (returns 400 with human-readable message if missing). Sends profile JSON to GPT-4o Chat Completions (`json_object` mode, temp 0.4) with a structured system prompt to produce `{ summary, workExperience, skills, education }`. Renders a single-column A4 PDF using `@react-pdf/renderer` (`renderToBuffer()`) — pure `React.createElement` calls (no JSX), `StyleSheet.create` with all absolute values. Deletes old resume from storage before uploading. Uploads buffer to `resumes/{userId}/resume.pdf`. Patches `profiles.resume_pdf_url`. Returns `{ success, url }`.
- **`app/api/resume/download/route.ts`** — GET route. Auth-checks via `createInsforgeServer()`. Reads `resume_pdf_url` from DB. Derives storage key by splitting URL on `/objects/` + `decodeURIComponent`. Downloads blob via `insforge.storage.download()`. Streams back PDF with `Content-Disposition: attachment` header. No query params — always fetches the current user's resume.

**Files modified:**
- **`app/api/resume/upload/route.ts`** — Now deletes old file from storage (derives key from current `profiles.resume_pdf_url`) before uploading new file. Also persists `resume_pdf_url` to profiles table immediately after upload.
- **`components/profile/ResumeSection.tsx`** — Added Generate card (always visible, matches Extract card pattern). Added Download Resume button (visible only when `currentUrl` is set, sits between upload zone and extract card, calls `GET /api/resume/download` then triggers browser download via object URL). Removed all direct public `href` links to storage URLs. `currentUrl` is now a derived value (`existingUrl ?? localUrl`) — no `useEffect`, no cascading renders.
- **`components/profile/ProfileForm.tsx`** — Added `handleGenerate` (mirrors `handleExtract` — POST `/api/resume/generate`, updates `form.resume_pdf_url` on success). Passes `onGenerate`, `isGenerating`, `generateError`, `generateSuccess` to `ResumeSection`. Replaced `job_titles_seeking` plain `<input>` with `TagInput`.
- **`components/profile/TagInput.tsx`** — Added `onBlur={addTag}` so pending typed text is auto-committed when focus leaves the field (prevents silent data loss when user clicks Save without pressing Enter).
- **`context/progress-tracker.md`** — 08 marked complete, all decisions and post-review fixes recorded.
- **`context/ui-registry.md`** — `ResumeSection` and `TagInput` entries updated (last updated: 2026-06-20).

### Decisions made

- GPT-4o via Chat Completions (not Files/Responses API) — profile data is JSON text, no PDF input needed.
- `@react-pdf/renderer` must run in Node.js API route (default runtime) — not Edge.
- Generated resume always lands at canonical path `resumes/{userId}/resume.pdf` — overwrites previous.
- Old file deleted from storage before every new upload or generation — prevents orphaned files.
- Upload route now persists `resume_pdf_url` to DB immediately — decouples resume URL from profile form save.
- All resume access goes through `GET /api/resume/download` (authenticated) — no direct public storage URLs exposed in UI.
- `currentUrl` in `ResumeSection` is derived (`existingUrl ?? localUrl`), not state — eliminates `useEffect` + cascading renders.
- `TagInput.onBlur` auto-commits pending input — prevents silent tag loss on form submit.
- All multi-value string array fields use `TagInput` — plain `<input>` with join/split is forbidden for these fields.

### Problems solved

- **Generate success — no download link shown** — `currentUrl` state was only initialised from `existingUrl` at mount, never updated when prop changed after generate. Fixed by making `currentUrl` a derived value.
- **Old files accumulating in storage** — upload and generate routes had no deletion logic. Fixed by deriving old key from `resume_pdf_url` and calling `insforge.storage.remove()` before writing new file.
- **`resume_pdf_url` not saved after upload** — upload route only returned URL to client; DB was only updated via the profile form save action. Fixed by adding `profiles.update({ resume_pdf_url })` to the upload route.
- **`job_titles_seeking` ignoring spaces** — plain `<input>` round-tripped through `join(", ")` / `split(",")` / `.trim()`, eating spaces mid-word. Fixed by replacing with `TagInput`.
- **Tags saving as `[]`** — user typed a tag but clicked Save without pressing Enter; pending input was not in the array. Fixed by `onBlur={addTag}` on `TagInput`.

### Current state

- 08 complete and hardened. All post-review fixes applied. TypeScript passes clean.
- `progress-tracker.md` and `ui-registry.md` fully up to date.
- Next feature: **09 Find Jobs Page — Full UI**.

### Next session starts with

1. Read `context/build-plan.md` Feature 09 before writing any code.
2. Check `context/ui-registry.md` for existing patterns to reuse.
3. Build **09 Find Jobs Page — Full UI**.

### Open questions

- None.

---

## Session 8 — 09 Find Jobs Page + UI Improvements

**Date:** 2026-06-20

### What was built

**09 Find Jobs Page — Full UI** is complete with working filtering and improved layout.

**Files created:**
- **`app/find-jobs/page.tsx`** — Server component with Navbar + FindJobsPage + Footer.
- **`components/find-jobs/SearchControls.tsx`** — Job title/location inputs, Find Jobs button, success banner.
- **`components/find-jobs/FilterBar.tsx`** — Text search, All Matches dropdown, Match Score sort dropdown.
- **`components/find-jobs/JobTable.tsx`** — Table with COMPANY, ROLE, MATCH SCORE progress bars, SALARY EST., SOURCE badges, DATE FOUND, chevron navigation. Exports `mockJobs` for reuse.
- **`components/find-jobs/Pagination.tsx`** — Results count, Previous/Next buttons, page numbers.
- **`components/find-jobs/FindJobsPage.tsx`** — Main composer with filtering state management.

**Files modified:**
- **`context/progress-tracker.md`** — 09 marked complete, updated to Phase 3 status.
- **`context/ui-registry.md`** — Added comprehensive entries for all 5 Find Jobs components with patterns and classes.

### Decisions made

- Filtering logic centralized in `FindJobsPage` with `useMemo` for performance.
- `FilterBar` accepts props for controlled state management.
- `JobTable` accepts filtered jobs as prop instead of hardcoded data.
- `mockJobs` exported from `JobTable` to avoid duplication and type issues.
- SearchControls layout changed from 2-column to 12-column grid for inline button placement.
- All input fields have `autoComplete="off"` and `spellCheck="false"` to prevent browser interference.

### Problems solved

- **Filtering not working** — FilterBar had no state connection. Fixed by adding props and state management in FindJobsPage.
- **TypeScript errors** — `mockJobs` type warning fixed by exporting from JobTable and importing in FindJobsPage.
- **Import errors** — Module resolution issues resolved by proper exports and imports.
- **CSS inline style warning** — Replaced inline `style={{ width: ${job.matchScore}% }}` with Tailwind classes using `getMatchScoreWidth()` helper.
- **Spell check red squiggles** — Added `spellCheck="false"` to all search inputs.
- **Button placement** — Moved Find Jobs button from below inputs to inline next to LOCATION field using 12-column grid system.

### Current state

- 09 Find Jobs Page complete with fully functional filtering (text search, match filter, sorting).
- All lint errors resolved, TypeScript passes clean.
- Layout optimized with inline Find Jobs button as requested.
- Filtering works in real-time: text search by company/role, match score filtering (High/Low), sorting options.

### Next session starts with

1. **10 Adzuna Job Discovery** — Connect real job search API to replace mock data.
2. Implement POST `/api/agent/find` with Adzuna API integration.
3. Add GPT-4o job scoring against user profile.
4. Save results to `jobs` table and update `agent_runs`.

### Open questions

- None.

---

## Session 9 — 10 Adzuna Job Discovery + Static Data Removal

**Date:** 2026-06-20

### What was built

**10 Adzuna Job Discovery** is complete and wired end-to-end.

**Files created:**
- **`lib/utils.ts`** — `export const MATCH_THRESHOLD = 70`
- **`lib/adzuna.ts`** — `searchJobs(jobTitle, location, country?)` with country auto-detection (keyword match on location string → gb/au/ca/us fallback)
- **`app/api/agent/find/route.ts`** — POST handler: auth → profile completeness check → `agent_runs` INSERT → Adzuna search → sequential GPT-4o scoring (json_object, temp 0.3, max 300 tokens) → `jobs` INSERT per result → `agent_runs` UPDATE to completed/failed
- **`app/api/jobs/route.ts`** — GET handler returning all user jobs ordered by `found_at DESC`

**Files modified:**
- **`components/find-jobs/SearchControls.tsx`** — Calls real `POST /api/agent/find`. Shows success message, "complete your profile" warning banner (with link to `/profile`), or generic error banner.
- **`components/find-jobs/FindJobsPage.tsx`** — Fetches real `Job[]` from `GET /api/jobs` after search completes. Static mock data removed entirely — table starts empty.
- **`components/find-jobs/JobTable.tsx`** — Accepts `Job[]` from `types/index.ts`. `mockJobs` export updated to satisfy `Job[]` type (no longer used as default display). Empty state row shows "No jobs found. Search above to find matching positions."
- **`components/find-jobs/Pagination.tsx`** — Accepts `total/currentPage/totalPages/onPageChange` props instead of hardcoded values. Live page count and results count driven by filtered job array.
- **`context/progress-tracker.md`** — 10 marked complete.

### Decisions made

- **Incomplete profile → block search.** Route returns `{ error: "complete_profile_required" }` with 400. `SearchControls` shows a warning banner with a link to `/profile`.
- **Sequential GPT-4o scoring** — jobs scored one at a time in the loop to avoid rate limits.
- **`agent_runs` created before Adzuna call** — marked `'running'`, updated to `'completed'` or `'failed'` after.
- **`category=it-jobs` always set** — no user override.
- **`MATCH_THRESHOLD = 70`** used for `savedCount` in success message and for High/Low Match filtering.
- **No PostHog events** — 03 was skipped; no `job_search_started`/`job_found` emitted.
- **Static mock data removed** — `FindJobsPage` starts with an empty `Job[]` state; no data shown until a real search succeeds.
- **InsForge SDK pattern** — `insforge.auth.getCurrentUser()` (not `getUser()`), `insforge.database.from()` (not `insforge.from()`).

### Problems solved

- **SDK method mismatch** — `auth.getUser()` and `insforge.from()` don't exist; corrected to `auth.getCurrentUser()` and `insforge.database.from()` following existing route patterns.

### Current state

- 10 fully complete. Search → Adzuna → GPT-4o scoring → DB save → frontend refresh is wired end-to-end.
- Table starts empty; populates with real scored jobs after search.
- `progress-tracker.md` updated. TypeScript lint passes clean.
- **Prerequisite:** `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` must be in `.env.local`.

### Next session starts with

1. **11 Filter + Sort + Pagination** — Wire filter tabs, sort dropdown, text search, and pagination to real DB data per `build-plan.md` spec. Note: client-side filtering is already implemented in `FindJobsPage`; Feature 11 may only require verifying the `MATCH_THRESHOLD` boundary and confirming sort/pagination behaviour against real data.

### Open questions

- None.

---

## Session 10 — 11 Filter + Sort + Pagination

**Date:** 2026-06-20

### What was built

**11 Filter + Sort + Pagination** is complete.

**Files modified:**
- **`components/find-jobs/FindJobsPage.tsx`** — Jobs now load on page mount via `useEffect` + shared `fetchJobs` callback. `handleSearchComplete` reuses `fetchJobs` and resets to page 1. Added `isLoading` state. `RESULTS_PER_PAGE` changed from 10 → 20 per spec.
- **`components/find-jobs/JobTable.tsx`** — Added optional `isLoading?: boolean` prop. Shows "Loading jobs..." row during initial fetch, then transitions to empty state or real data.
- **`components/find-jobs/Pagination.tsx`** — `RESULTS_PER_PAGE` changed from 10 → 20. Added `getPageNumbers()` helper that produces smart truncated page list with `…` ellipsis for sets > 7 pages (e.g. `1 … 4 5 6 … 12`).
- **`context/progress-tracker.md`** — 11 marked complete.

### Decisions made

- `fetchJobs` extracted as a `useCallback` shared between `useEffect` (mount load) and `handleSearchComplete` (post-search refresh) — no duplication.
- `useEffect` uses an inner `async function load()` to avoid calling `setState` directly in the effect body (ESLint rule compliance).
- `isLoading` stays in `FindJobsPage` and is passed as a prop to `JobTable` — keeps loading state ownership at the composer level.
- Page number truncation kicks in at > 7 total pages — shows first, last, and a window of ±1 around the current page.

### Problems solved

- **Jobs not shown on page load** — `FindJobsPage` previously only fetched after `onSearchComplete`. Added `useEffect` mount fetch so previously found jobs are visible immediately.
- **ESLint `setState` in effect warning** — wrapped fetch + `setIsLoading(false)` in an inner `async function load()` inside the effect.
- **TypeScript error on `isLoading` prop** — `JobTable` prop interface was missing `isLoading`; added as optional with default `false`.

### Current state

- 11 complete. Filter (text, High/Low Match), sort (Match Score/Newest/Oldest), and pagination (20 per page, truncated page numbers) all working against real DB data.
- Jobs load on page mount — no search needed to see existing results.
- TypeScript and lint pass clean.
- `progress-tracker.md` updated.

### Next session starts with

1. Read `context/build-plan.md` Feature 12 before writing any code.
2. Check `context/designs/job-details.png` for the design reference.
3. Build **12 Job Details Page — Full UI** — back link, job header, info cards, AI match reasoning, skills badges, description, company research empty state, Apply Now button.

### Open questions

- None.

---

## Session 11 — 12 Job Details Page + Post-build Fixes

**Date:** 2026-06-20

### What was built

**12 Job Details Page — Full UI** is complete, reviewed, and hardened.

**Files created:**
- **`app/api/jobs/[id]/route.ts`** — `GET` route. Auth-checks via `createInsforgeServer()`. Fetches single job by ID scoped to `user_id`. Returns 404 if not found.
- **`app/find-jobs/[id]/page.tsx`** — Server component. Auth-guards (redirects to `/login`), 404-guards (redirects to `/find-jobs`). Fetches job from DB, passes to `JobDetailsPage`.
- **`components/find-jobs/JobDetailsPage.tsx`** — Full client component with all sections matching the design: Back to Jobs link, job header card (building icon placeholder, title, company, dynamic match score badge, View Job Post button), 4 info cards row (Salary Est./Location/Job Type/Date Found each with themed icon container), AI Match Reasoning (Sparkles + paragraph), Required Skills vs Your Profile (green CheckCircle2 matched badges + purple XCircle gap badges), `JobDescriptionCard` (full text + conditional "View full job description" link), `CompanyResearchCard` (empty state + Research Company button wired to `POST /api/agent/research` + full 9-field dossier render), Apply Now full-width accent button.

**Files modified:**
- **`components/find-jobs/JobTable.tsx`** — Added `Link` import. Chevron cell now wraps `Link href="/find-jobs/${job.id}"` so every row is navigable to the details page.
- **`context/progress-tracker.md`** — 12 marked complete, decisions recorded.
- **`context/ui-registry.md`** — `JobDetailsPage` entry added (then updated after post-build fix).

### Decisions made

- `JobDescriptionCard` sub-component (not exported) — full description always visible, never clamped. If `description.length > 300` (Adzuna truncation threshold), shows `ExternalLink` "View full job description" link to `external_apply_url ?? source_url` opening in new tab. No expand/collapse toggle.
- `CompanyResearchCard` sub-component (not exported) — manages its own `isResearching`/`error` state. Calls `POST /api/agent/research` with `{ jobId }`. On success, lifts result to `JobDetailsPage` via `onResearchComplete` callback and renders full 9-field dossier.
- Match score badge uses dynamic bg+text pair: `text-success bg-success-lightest` (≥80), `text-warning bg-warning/10` (≥60), `text-error bg-error/10` (<60).
- Info card icon containers use themed backgrounds per card type: `bg-success-lightest` (salary), `bg-info-lightest` (location), `bg-accent-muted` (job type), `bg-surface-secondary` (date).
- Apply Now button always uses `external_apply_url ?? source_url` — same fallback as View Job Post.
- `applyUrl` computed once at the top of `JobDetailsPage` and reused in header + Apply Now + `JobDescriptionCard`.

### Problems solved

- **Job description cut off mid-sentence** — Adzuna API truncates `about_role` server-side. Added `JobDescriptionCard` with "View full job description" link to the source posting whenever `description.length > 300`. Full text already rendered — link just gives users a route to the original.
- **Show more / Show less first attempt** — Initially built expand/collapse toggle. Replaced by user request with direct link to source website instead.

### Current state

- 12 complete and hardened. All sections match the design. TypeScript and lint pass clean.
- `JobTable` rows link to `/find-jobs/[id]`.
- `progress-tracker.md` updated to Phase 4. `ui-registry.md` updated with `JobDetailsPage` entry (final pattern).
- Next feature: **13 Company Research Agent**.

### Next session starts with

1. Read `context/build-plan.md` Feature 13 before writing any code.
2. Build **13 Company Research Agent** — `POST /api/agent/research` route using Stagehand + Browserbase to browse company homepage and sub-pages, GPT-4o synthesis, save dossier to `jobs.company_research` jsonb.
3. The Research Company button in `JobDetailsPage` already calls `POST /api/agent/research` with `{ jobId }` and expects `{ research: CompanyResearch }` in the response — the API contract is already wired from the frontend side.

### Open questions

- Browserbase and Stagehand credentials (`BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID`) will need to be in `.env.local` for Feature 13.

---

## Session 12 — 13 Company Research Agent

**Date:** 2026-06-26

### What was built

**13 Company Research Agent** is complete.

**Files created:**
- **`lib/browserbase.ts`** — `createBrowserbaseSession()` creates a Browserbase session (timeout 120 s). `createStagehand(browserbaseSessionID)` returns a configured `Stagehand` V3 instance (`env: "BROWSERBASE"`, model `openai/gpt-4o`, `disablePino: true`).
- **`app/api/agent/research/route.ts`** — `POST` handler. Auth → fetch job + profile from DB → derive company homepage (follow Adzuna `redirect_url` with `fetch(..., { redirect: 'follow' })`, strip subdomain via `getRootDomain()`, construct `https://{rootDomain}`; fallback to `https://www.{company}.com` if resolution stays on adzuna.com or throws) → create Browserbase session → `stagehand.init()` → `page.goto()` homepage → `stagehand.extract(instruction, homepageSchema, { page })` → if `oneLiner`/`productSummary` empty skip browser extraction → else navigate up to 3 preferred sub-pages (`about`, `blog`, `engineering`, `product`) each with `stagehand.extract(instruction, subPageSchema, { page })` wrapped in try/catch → `stagehand.close()` in `finally` → GPT-4o Chat Completions synthesis (`json_object`, temp 0.4, max 800 tokens) → `jobs.update({ company_research })` → insert `agent_logs` success row → return `{ research: CompanyResearch }`.

**Packages installed:** `@browserbasehq/sdk`, `@browserbasehq/stagehand`, `zod`.

### Decisions made

- **Stagehand extract API** — V3 uses the 3-argument form `extract(instruction, schema, { page })` where `page` is `stagehand.context.activePage()`. The 1-argument object form `{ instruction, schema }` is not supported in V3.
- **PostHog skipped** — Feature 03 remains deferred; no `company_researched` event emitted.
- **`agent_logs` row inserted** (not `agent_runs`) — lightweight activity record sufficient for dashboard Feature 16 without expanding scope.
- **Browser failure is non-fatal** — whole browser block is wrapped in outer try/catch; if it throws, synthesis still runs using job + profile data only; `sources` array will be empty.
- **Sub-page selection** — prefers `about`, `blog`, `engineering`, `product`, `team` over `careers`/`other`; deduplicated by URL; max 3.
- **Homepage URL derivation** — handles two-part TLDs (`co.uk`, `com.au`, etc.) in `getRootDomain()`.

### Problems solved

- **Stagehand V3 extract overload mismatch** — IDE flagged `{ instruction, schema }` object form as invalid. Inspected `node_modules/@browserbasehq/stagehand/dist/esm/lib/v3/v3.d.ts` to confirm correct overload is `extract(instruction, schema, options?)` with `page` in `options`.

### Current state

- 13 complete. TypeScript (`npx tsc --noEmit`) and lint (`npm run lint`) both pass clean.
- `context/progress-tracker.md` updated — Phase 5 / Feature 14 next.
- `context/ui-registry.md` updated — Browserbase + Stagehand factory pattern documented.
- **Prerequisite:** `BROWSERBASE_API_KEY` and `BROWSERBASE_PROJECT_ID` must be added to `.env.local` before testing.

### Next session starts with

1. Read `context/build-plan.md` Feature 14 before writing any code.
2. Build **14 Dashboard Page — Full UI** — stats bar, recent activity feed, analytics charts placeholder.

### Open questions

- None.

---

## Session 13 — 14 Dashboard Page — Full UI

**Date:** 2026-06-27

### What was built

**14 Dashboard Page — Full UI** is complete.

**Files created:**
- **`components/dashboard/StatsCard.tsx`** — Stat card with label, value, optional trend badge (`TrendingUp` icon), and subtitle.
- **`components/dashboard/RecentActivity.tsx`** — 5 mock activity entries with green dot for `job_found` and blue dot for `researched`.
- **`components/dashboard/CompanyResearchChart.tsx`** — Recharts `BarChart` with `#61A8FF` bars and 7-day mock data.
- **`components/dashboard/JobsFoundChart.tsx`** — Recharts `AreaChart` with `#7C5CFC` stroke and gradient fill, smooth monotone curve, 7-day mock data.
- **`components/dashboard/MatchScoreChart.tsx`** — Recharts `BarChart` with `#10B981` bars and 5 score-range mock distribution.
- **`components/dashboard/DashboardPage.tsx`** — Composer with incomplete-profile banner, 4-column stat grid, and two 2-column chart rows.

**Files modified:**
- **`app/dashboard/page.tsx`** — Replaced placeholder with async server component; auth-guards via `insforge.auth.getCurrentUser()`, fetches `profiles.is_complete`, passes to `DashboardPage`.
- **`context/progress-tracker.md`** — 14 marked complete; next is 15.
- **`context/ui-registry.md`** — Added Dashboard section with all 5 new components.
- **`package.json`** — Added `recharts`.

### Decisions made

- Stat cards, recent activity, and charts use mock data in this feature; real data wiring is Features 15–17.
- Trend badges kept as static design elements (no prior-period comparison yet).
- Recharts charts live in client components; `DashboardPage` remains a server component.
- Profile completeness fetched server-side and passed as `profileComplete` prop.

### Problems solved

- **InsForge SDK method mismatch** — page uses `auth.getCurrentUser()` and `database.from()` to match existing route patterns.

### Current state

- 14 complete. TypeScript and lint pass clean.
- `progress-tracker.md` and `ui-registry.md` updated.
- Next feature: **15 Stats Bar — Real Data** (in progress — `actions/dashboard.ts` not yet created).

### Next session starts with

1. Create `actions/dashboard.ts` with `getDashboardStats()` returning real totals/averages from DB.
2. Update `app/dashboard/page.tsx` to fetch real stats and pass to `DashboardPage`.
3. Update `DashboardPage` and `StatsCard` to render real values.

### Open questions

- None.

---

## Session 14 — 15 Stats Bar + 16 Recent Activity (Real Data)

**Date:** 2026-06-27

### What was built

**15 Stats Bar — Real Data** and **16 Recent Activity — Real Data** are complete.

**Files created:**
- **`actions/dashboard.ts`** — Server Action with two functions:
  - `getDashboardStats()` returns `totalJobs`, `averageMatchRate`, `companiesResearched`, `jobsThisWeek` from InsForge DB scoped to current user.
  - `getRecentActivity()` returns merged `ActivityEntry[]` from `agent_runs` and `jobs` tables.
- `formatRelativeTime()` helper for human-readable timestamps.

**Files modified:**
- **`app/dashboard/page.tsx`** — fetches both `getDashboardStats()` and `getRecentActivity()` and passes results to `DashboardPage`.
- **`components/dashboard/DashboardPage.tsx`** — accepts `stats` and `activities` props; forwards `activities` to `RecentActivity`.
- **`components/dashboard/RecentActivity.tsx`** — accepts `activities?: ActivityEntry[]` prop, renders real entries, shows empty state "No recent activity yet." when none.
- **`context/progress-tracker.md`** — 15 and 16 marked complete; next is 17.
- **`context/ui-registry.md`** — Updated `Dashboard Stats Action`, `DashboardPage`, and `RecentActivity` entries with real-data patterns.

### Decisions made

- Read-only dashboard data fetched via Server Actions rather than inline in the page, keeping data logic reusable and consistent with `actions/profile.ts`.
- Trend badges on stat cards remain static design elements (no prior-period comparison yet).
- Recent activity merges two sources (`agent_runs` and `jobs`) and sorts by raw timestamp before taking the most recent 5.
- Empty state added to `RecentActivity` for users with no activity yet.

### Problems solved

- **Console error in `getRecentActivity`** — `jobs` query failed because it referenced `created_at`, which does not exist on the `jobs` table. Fixed by querying `found_at` instead (the actual timestamp column). Verified schema via `get-table-schema` MCP tool.

### Current state

- 15 and 16 complete. TypeScript and lint were passing before the dashboard page was tested.
- Next feature: **17 Analytics Charts — PostHog Data**.

### Next session starts with

1. Read `context/build-plan.md` Feature 17 before writing any code.
2. Decide whether to query PostHog directly (requires PostHog project key) or fall back to DB-derived analytics for the three charts.

### Open questions

- None.

---

## Session 15 — 17 Analytics Charts — PostHog Data (DB-Derived)

**Date:** 2026-06-28

### What was built

**17 Analytics Charts — PostHog Data** is complete. PostHog was skipped; all three charts now use real data from the InsForge DB.

**Files created / modified:**
- **`actions/dashboard.ts`** — Added `ChartDayPoint`, `MatchScoreBucket`, `DashboardCharts` types and `getDashboardChartData()` Server Action. Computes `jobsFound` (last 30 days), `companyResearch` (last 30 days after UX review), and `matchScores` (all-time 5 buckets) for the current user.
- **`app/dashboard/page.tsx`** — Fetches chart data and passes it to `DashboardPage`.
- **`components/dashboard/DashboardPage.tsx`** — Accepts `charts?: DashboardCharts` prop and forwards to the three chart components.
- **`components/dashboard/JobsFoundChart.tsx`** — Accepts `data?: ChartDayPoint[]`, renders empty state, uses dynamic Y-axis (`domain={[0, "auto"]}`), and converts colors to `var(--color-accent)` tokens.
- **`components/dashboard/CompanyResearchChart.tsx`** — Accepts `data?: ChartDayPoint[]`, renders empty state, uses dynamic Y-axis, and converts colors to `var(--color-info)` tokens.
- **`components/dashboard/MatchScoreChart.tsx`** — Accepts `data?: MatchScoreBucket[]`, renders empty state, uses dynamic Y-axis, and converts colors to `var(--color-success)` tokens.
- **`context/progress-tracker.md`** — Marked 17 complete; added decision note about DB-derived data and 30-day company research window.
- **`context/ui-registry.md`** — Updated all chart entries, `DashboardPage`, and `Dashboard Stats Action` with real-data patterns and token colors.
- **`C:\Users\deyas\.windsurf\plans\feature-17-dashboard-charts-9e7fa1.md`** — Implementation plan saved before building.

### Decisions made

- PostHog skipped entirely; charts derive from the existing `jobs` table.
- `getDashboardChartData()` returns all three datasets in a single Server Action.
- Chart colors converted to design tokens (`var(--color-accent)`, `var(--color-info)`, `var(--color-success)`); axis labels use `var(--color-text-muted)`.
- Y-axes are dynamic (`domain={[0, "auto"]}`) instead of the mock 0–100 scale.
- Each chart has its own "No data yet" empty state.
- Company research window expanded from 7 to 30 days after user testing showed the existing 3 research records fell outside the 7-day window, making the chart appear empty.

### Problems solved

- **Company Research Activity showed "No data yet" despite existing research records** — root cause was the 7-day window. Changed to 30 days so the Jun 20 research records appear on the chart.
- **Hardcoded chart colors** — converted to CSS design tokens per project rules.
- **Mock data still rendered in charts** — replaced with real DB-derived data.

### Current state

- 17 complete. TypeScript (`npx tsc --noEmit`) and lint (`npx eslint .`) both pass clean.
- All dashboard charts now render real data, empty states, and design-token colors.
- `progress-tracker.md` and `ui-registry.md` fully up to date.

### Next session starts with

1. No next feature defined yet — all 17 features in the build plan are complete.

### Open questions

- None.

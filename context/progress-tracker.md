# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 5 — Dashboard
**Last completed:** 16 Recent Activity — Real Data
**Next:** 17 Analytics Charts — PostHog Data

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization — skipped per user request
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [x] 06 Profile Save Logic
- [x] 07 AI Profile Extraction from Resume
- [x] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [x] 09 Find Jobs Page — Full UI
- [x] 10 Adzuna Job Discovery
- [x] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [x] 12 Job Details Page — Full UI
- [x] 13 Company Research Agent

### Phase 5 — Dashboard

- [x] 14 Dashboard Page — Full UI
- [x] 15 Stats Bar — Real Data
- [x] 16 Recent Activity — Real Data
- [x] 17 Analytics Charts — PostHog Data (DB-derived; company research window expanded to 30 days to match real usage)

---

## Decisions Made During Build

- 02 Auth uses `@insforge/sdk/ssr` from the installed `@insforge/sdk` package for browser, server, refresh-route, and proxy session helpers.
- Next.js 16 route protection is implemented with root `proxy.ts` instead of legacy `middleware.ts`, following the installed Next.js docs.
- 04 Database Schema: Four InsForge tables created with RLS policies scoped to `auth.uid()`. `handle_new_user` trigger auto-creates `profiles` row on signup. `handle_updated_at` trigger auto-updates `profiles.updated_at`.
- 05 Profile Page UI: All five form sections (Personal Info, Professional Info, Work Experience, Education, Job Preferences) built with mock data. ProfileAttentionBanner, ResumeSection, TagInput, WorkExperienceSection all extracted as separate components.
- 06 Profile Save Logic: Server Action in `actions/profile.ts` handles DB upsert with completion calculation. Resume PDF upload split to `app/api/resume/upload/route.ts` (triggered on file select). Profile page is now a server component that pre-fills from DB. Banner completion is dynamic.
- 06 Bug fixes (post-review): (1) `handle_new_user` DB trigger was missing — created it and backfilled existing users into `profiles`. (2) `createInsforgeServer` was passing the full cookie object instead of `.value` — fixed to `cookieStore.get(name)?.value`. (3) Upsert was sending `email: undefined` causing NOT NULL violation — fixed by sourcing email from `userData.user.email`.
- 07 AI Profile Extraction: New API route `app/api/resume/extract/route.ts` downloads PDF from storage using a path derived from the stored `resumeUrl` (splits on `/objects/` + URL-decodes), sends it to OpenAI Files API + Responses API (GPT-4o) for structured JSON extraction, and returns typed `ExtractedProfileData`. Upload route (`app/api/resume/upload/route.ts`) now saves files under `resumes/{userId}/{originalFilename}` using the filename sent from the client. ResumeSection appends `fileName` to the upload `FormData` and shows upload/extraction success and error states. ProfileForm merges extracted data into form state, preserving `email` and `resume_pdf_url`. Bug fixes: (1) `pdf-parse` index.js runs test harness on import — fixed by importing from `pdf-parse/lib/pdf-parse.js` directly. (2) Storage path was hardcoded to `resume.pdf` — fixed to use original filename. (3) Path extraction from URL was splitting on `/resumes/` — fixed to split on `/objects/` and URL-decode.
- 08 Resume PDF Generation: New API route `app/api/resume/generate/route.ts` reads user's saved profile from DB, sends to GPT-4o Chat Completions (json_object mode, temp 0.4) to produce polished summary + work experience bullets + skills + education string, renders PDF buffer with `@react-pdf/renderer` (`renderToBuffer()`), uploads to InsForge Storage at canonical path `resumes/{userId}/resume.pdf` (upsert), and patches `profiles.resume_pdf_url`. ResumeSection now shows a "Generate Resume from Profile" card (always visible, same pattern as extract card) with loading/success/error states. ProfileForm wires `handleGenerate` which calls the route and updates `form.resume_pdf_url` on success so the View link refreshes immediately. `@react-pdf/renderer` added to dependencies.
- 08 Post-review fixes: (1) Download button — new `GET /api/resume/download` route authenticates via `createInsforgeServer()`, derives storage key from `resume_pdf_url` (splits on `/objects/`), downloads blob via `insforge.storage.download()`, streams back with `Content-Disposition: attachment`. ResumeSection shows "Download Resume" button (visible only when `currentUrl` exists) between upload zone and extract card. (2) Old file deletion — upload route and generate route both derive the old storage key from `profiles.resume_pdf_url` and call `insforge.storage.remove()` before writing the new file. Upload route also now persists `resume_pdf_url` to the profiles table immediately after upload. (3) Direct public URL links removed — `ResumeSection` no longer exposes direct `href` to storage URLs; all access goes through the authenticated download route. (4) `currentUrl` derived pattern — `existingUrl ?? localUrl` eliminates `useState` + `useEffect` cycle; `existingUrl` is the prop controlled by `ProfileForm`, `localUrl` only tracks a fresh upload before parent state catches up. (5) `job_titles_seeking` bug fix — field was a plain `<input>` that round-tripped through `join(", ")` / `split(",")` / `.trim()`, eating spaces mid-word. Replaced with `TagInput` matching the pattern used by skills, industries, and preferred_locations. (6) `TagInput` `onBlur` fix — added `onBlur={addTag}` so pending typed text is committed as a tag when focus leaves the field (e.g. clicking Save Profile without pressing Enter), preventing silent loss of partially typed values.
- 09 Find Jobs Page — Full UI: Complete Find Jobs page UI with mock data. Created `app/find-jobs/page.tsx` server component with Navbar + FindJobsPage + Footer. Built 5 client components: `SearchControls` (job title/location inputs, Find Jobs button, success banner), `FilterBar` (text search, All Matches dropdown, Match Score sort dropdown), `JobTable` (table with COMPANY, ROLE, MATCH SCORE progress bars, SALARY EST., SOURCE badges, DATE FOUND, chevron navigation), `Pagination` (results count, Previous/Next buttons, page numbers), and `FindJobsPage` (main composer). All components use existing UI patterns from ui-registry.md, proper Tailwind tokens, and match the design exactly. Mock data shows 6 jobs with realistic company names, roles, match scores, and salary ranges.
- 10 Adzuna Job Discovery: `POST /api/agent/find` route — auth-checks user, blocks if `profile.is_complete` is false (returns `complete_profile_required`), creates `agent_runs` row, calls Adzuna API (`category=it-jobs`, country auto-detected from location string), scores each result sequentially with GPT-4o (json_object mode, temp 0.3, max 300 tokens), inserts into `jobs` table, updates `agent_runs` to completed/failed. `GET /api/jobs` returns all user jobs ordered by `found_at DESC`. `lib/adzuna.ts` encapsulates Adzuna search with country detection. `lib/utils.ts` exports `MATCH_THRESHOLD = 70`. `SearchControls` now calls real API, shows success/complete-profile/error banners. `FindJobsPage` fetches real jobs after search and replaces mock data. `JobTable` accepts real `Job[]` from types/index.ts. `Pagination` accepts total/currentPage/totalPages/onPageChange props. mockJobs updated to satisfy `Job[]` type for empty-state UI.
- 11 Filter + Sort + Pagination: All filtering/sorting/pagination wired to real DB data. `FindJobsPage` now fetches all user jobs on page mount (via `useEffect` + `fetchJobs`) so previously found jobs appear immediately without needing a new search. `handleSearchComplete` reuses `fetchJobs` and resets to page 1. `RESULTS_PER_PAGE` changed to 20 per spec in both `FindJobsPage` and `Pagination`. `JobTable` accepts optional `isLoading` prop — shows "Loading jobs..." row during initial fetch. `Pagination` gets smart page number truncation with ellipsis for sets > 7 pages. `MATCH_THRESHOLD = 70` boundary used for High/Low Match filter (already in place from Feature 10).
- 12 Job Details Page — Full UI: New dynamic route `app/find-jobs/[id]/page.tsx` — server component, fetches job from DB via `createInsforgeServer()`, redirects to `/login` if unauthenticated, redirects to `/find-jobs` if job not found. New `GET /api/jobs/[id]` route returns single job by ID scoped to current user. New `components/find-jobs/JobDetailsPage.tsx` client component renders: Back to Jobs link, job header card (company placeholder icon, title, company, match score badge, View Job Post button), 4 info cards row (Salary Est., Location, Job Type, Date Found), AI Match Reasoning section (sparkle icon + paragraph), Required Skills vs Your Profile (green `CheckCircle2` matched skill badges, purple `XCircle` gap skill badges), Job Description section, Company Research card (empty state with Research Company button wired to `POST /api/agent/research` — shows full dossier with all 9 fields once research is done), Apply Now button. `JobTable` rows now link to `/find-jobs/[id]` via `Link` on the chevron cell.
- 16 Recent Activity — Real Data: Extended `actions/dashboard.ts` with `getRecentActivity()` and `ActivityEntry` type. Queries `agent_runs` (completed, scoped to user) and `jobs` (where `company_research` is not null), formats timestamps with relative-time helper (`Just now`, `X mins ago`, `X hours ago`, `Yesterday`, `X days ago`, or date), merges both sources by raw `createdAt`/`completed_at`, and returns the most recent 5 entries. `RecentActivity` component now accepts `activities?: ActivityEntry[]` prop, renders real entries, and shows an empty state when none exist. `app/dashboard/page.tsx` fetches both stats and activities in parallel (sequential await calls). `DashboardPage` passes `activities` to `RecentActivity`.
- 17 Analytics Charts — PostHog Data (DB-derived): Added `getDashboardChartData()` to `actions/dashboard.ts` returning `jobsFound` (last 30 days), `companyResearch` (last 30 days after UX review), and `matchScores` (all-time buckets). Wired through `app/dashboard/page.tsx` → `DashboardPage` → the three chart components. Charts now accept data props, render per-chart "No data yet" empty states, and use dynamic Y-axes (`domain={[0, "auto"]}`). All chart colors converted to design tokens (`var(--color-accent)`, `var(--color-info)`, `var(--color-success)`). PostHog skipped; no new dependency added. Initial plan used 7 days for company research, but user testing showed research data falls outside a 7-day window, so expanded to 30 days to keep the chart useful.
- 15 Stats Bar — Real Data: New `actions/dashboard.ts` with `getDashboardStats()` Server Action. Fetches current user, then computes four real stats from InsForge DB: `totalJobs` (COUNT of jobs scoped to user), `averageMatchRate` (AVG of `match_score` rounded to integer), `companiesResearched` (COUNT where `company_research IS NOT NULL`), `jobsThisWeek` (COUNT where `found_at >= 7 days ago`). All queries use `user_id` filter. `app/dashboard/page.tsx` now calls `getDashboardStats()` and passes the result to `DashboardPage`. `DashboardPage` renders real values in `StatsCard`, falling back to `0` if stats are unavailable. Trend badges remain static design elements (no prior-period comparison yet).
- 14 Dashboard Page — Full UI: New `components/dashboard/DashboardPage.tsx` composer (server-rendered profile completeness check → passes `profileComplete` prop). Five new client components: `StatsCard` (label, value, optional trend badge with `TrendingUp` icon, subtitle), `RecentActivity` (5 mock entries, green dot for job_found, blue dot for researched), `CompanyResearchChart` (Recharts `BarChart`, `#61A8FF` bars, mock 7-day data), `JobsFoundChart` (Recharts `AreaChart`, `#7C5CFC` stroke + gradient fill, mock 7-day data), `MatchScoreChart` (Recharts `BarChart`, `#10B981` bars, mock 5-range distribution). All charts use `ResponsiveContainer`, `CartesianGrid` with `strokeDasharray`, token-based `Tooltip`. `app/dashboard/page.tsx` replaced — now async server component, auth-guards via `insforge.auth.getCurrentUser()`, fetches `profiles.is_complete` and passes to `DashboardPage`. Incomplete profile banner at top when `is_complete` is false. `recharts` installed.
- 13 Company Research Agent: New `POST /api/agent/research` route — auth-checks via `createInsforgeServer()`, fetches job + profile from DB, derives company homepage by following Adzuna `redirect_url` with `fetch(..., { redirect: 'follow' })`, stripping subdomain, and constructing `https://{rootDomain}` (fallback to `https://www.{company}.com`). Single Browserbase session created via `lib/browserbase.ts` (`createBrowserbaseSession()` + `createStagehand()`). Stagehand `extract()` uses the 3-argument form `extract(instruction, schema, { page })` with the active V3 page. Homepage extraction uses the schema from `context/library-docs.md`; if `oneLiner` and `productSummary` are empty, browser is skipped and synthesis runs from job + profile only. Up to 3 sub-pages are extracted (preferring `about`, `blog`, `engineering`, `product`), with each wrapped in try/catch so partial failures do not abort the whole run. Session is closed in a `finally` block. GPT-4o synthesis uses Chat Completions (`json_object`, temp 0.4, max 800 tokens) with the system prompt from `context/library-docs.md`. Resulting 9-field `CompanyResearch` dossier is saved to `jobs.company_research` via `update().eq('id', jobId).eq('user_id', user.id)`. A success `agent_logs` row is inserted for dashboard activity. `PostHog` event was skipped because Feature 03 is still deferred. Installed `@browserbasehq/sdk`, `@browserbasehq/stagehand`, and `zod`.

---

## Notes

- Auth added a minimal `/dashboard` placeholder only so the required post-login redirect has a valid target. Full dashboard UI remains Phase 5.

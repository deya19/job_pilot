# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Layout

**Navbar** — `components/layout/Navbar.tsx`
- Full-width white header with `border-b border-border`
- Container: `mx-auto flex h-16 max-w-360 items-center justify-between px-6`
- Logo row: 36x36 logo + `text-[19px] font-bold text-text-darkest`
- Nav links: `text-sm font-medium text-text-dark hover:text-accent`
- CTA: dark pill `bg-overlay text-surface rounded-md px-4 py-2`
- Auth-aware client navbar using the same dark pill style for both `Start for free` and `Sign out`

**Footer** — `components/layout/Footer.tsx`
- White footer with `border-t border-border`
- Container: `mx-auto flex max-w-360 items-center justify-between gap-6 px-6 py-8`
- Compact logo row with 28x28 icon
- Inline footer links: `text-sm font-medium text-text-secondary hover:text-text-primary`

### Auth

**LoginPage** — `app/(auth)/login/page.tsx`
- Centered auth card on `bg-background`
- Card: `max-w-md rounded-2xl border border-border bg-surface p-6 shadow-sm`
- Logo centered at `h-9 w-auto`
- Eyebrow uses uppercase accent text with wide tracking
- OAuth buttons use full-width `rounded-md px-4 py-3 text-sm font-medium`
- Google button uses bordered white secondary style; GitHub button uses dark overlay primary style

**CallbackPage** — `app/(auth)/callback/page.tsx`
- Centered status card matching login card dimensions and surface treatment
- Loading state uses `Loader2` with `text-accent`
- Error state keeps copy human-readable and routes back to `/login`

**DashboardPage Placeholder** — `app/dashboard/page.tsx`
- Temporary protected landing card matching auth card/page surface tokens
- Uses dark primary CTA and bordered secondary CTA
- Only exists to support auth redirect until Phase 5 dashboard UI is built

### Homepage

**HeroSection** — `components/homepage/HeroSection.tsx`
- Soft tinted hero panel with layered blurred accent/info circles over `bg-surface-secondary`
- Headline: `text-[40px] md:text-[56px] font-semibold tracking-[-0.03em]`
- Dual CTA row with dark primary and bordered secondary buttons
- Dashboard screenshot wrapped in elevated preview card under hero panel

**FeatureStory** — `components/homepage/FeatureStory.tsx`
- Two-column alternating section layout: `grid max-w-360 md:grid-cols-2`
- Dotted background overlay using token-based radial pattern
- Eyebrow label in uppercase accent text
- Supporting copy + optional bullet list with accent dots
- Image card: rounded bordered white surface with soft shadow

**PreparationSection** — `components/homepage/PreparationSection.tsx`
- Split section with image left and stacked copy right
- Uses `border-y border-border/70` to create the editorial divider seen in the design
- Right column content organized with `divide-y divide-border`

**TestimonialSection** — `components/homepage/TestimonialSection.tsx`
- Centered testimonial over dotted background overlay
- Quote block with medium weight large type
- User row with circular avatar and two-line attribution

**CallToActionSection** — `components/homepage/CallToActionSection.tsx`
- Reuses the hero-style tinted panel with centered headline and two CTAs
- Keeps final section visually lighter than a dark footer CTA

### Profile

#### ProfileAttentionBanner

File: `components/profile/ProfileAttentionBanner.tsx`
Last updated: 2026-06-15

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-surface`                                       |
| Border           | `border border-border`                             |
| Border radius    | `rounded-2xl`                                      |
| Text — primary   | `text-sm font-semibold text-text-primary`          |
| Text — secondary | `text-xs leading-5 text-text-secondary`            |
| Spacing          | `p-6`, `gap-2` (inner column), `gap-4` (row)       |
| Shadow           | `shadow-sm`                                        |
| Accent usage     | `text-warning` (icon + tags), `bg-warning/10` (tag bg) |

**Pattern notes:**
- SVG ring: `viewBox="0 0 44 44"` rendered at `56×56px`, `r=18`, `strokeWidth=4`, track stroke `var(--color-border)`, fill stroke `var(--color-error)`, rotated `-rotate-90`
- Completion % label: `absolute inset-0 flex items-center justify-center text-xs font-semibold text-text-primary`
- Missing field tags: `rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning`

---

#### ResumeSection

File: `components/profile/ResumeSection.tsx`
Last updated: 2026-06-20

| Property         | Class                                                         |
| ---------------- | ------------------------------------------------------------- |
| Background       | `bg-surface` (card), `bg-surface-secondary` (action panels)  |
| Border           | `border border-border`                                        |
| Border radius    | `rounded-2xl` (card), `rounded-lg` (action panels), `rounded-md` (buttons) |
| Text — primary   | `text-base font-semibold text-text-primary` (heading), `text-sm font-medium text-text-primary` (panel title) |
| Text — secondary | `text-xs text-text-secondary`                                 |
| Text — muted     | `text-xs text-text-muted` (drop zone hint)                    |
| Spacing          | `p-6`, `mt-4`, `p-4` (action panels), `mt-3` (download row)  |
| Shadow           | `shadow-sm`                                                   |
| Hover state      | `hover:bg-surface-secondary` (secondary btns), `hover:bg-accent-dark` (primary btns) |
| Accent usage     | `bg-accent text-accent-foreground` (Extract + Generate buttons), `text-accent` (icons) |

**Pattern notes:**
- Drop zone idle: `rounded-xl border-2 border-dashed border-border bg-surface-secondary`
- Drop zone active (dragging): `border-accent bg-accent-muted`
- Secondary button (Select Resume / Download): `rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary`
- Download button (smaller): `rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary` + `Download` icon at `h-3.5 w-3.5`; visible only when `currentUrl` is set
- Download button row: `mt-3 flex justify-end` — sits between the upload zone and the extract panel
- Primary button (Extract / Generate): `rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground` + `Wand2` icon at `h-4 w-4`
- Action panel (Extract / Generate): `rounded-lg border border-border bg-surface-secondary p-4`; border changes to `border-success` on success, `border-error` on error
- Action panel layout: `flex items-center gap-3` with `flex-1` for text block and `shrink-0` button
- Loading state: `Loader2 animate-spin` with contextual text ("Extracting..." / "Generating..." / "Downloading...")
- `currentUrl` is derived: `existingUrl ?? localUrl` — never uses `useEffect` to sync; `existingUrl` is the controlled prop, `localUrl` only tracks a just-uploaded file before parent state catches up
- No direct public `href` links to storage URLs — all resume access goes through `GET /api/resume/download` (authenticated)

---

#### TagInput

File: `components/profile/TagInput.tsx`
Last updated: 2026-06-20

| Property         | Class                                                              |
| ---------------- | ------------------------------------------------------------------ |
| Background       | `bg-surface` (input + Add button)                                  |
| Border           | `border border-border`                                             |
| Border radius    | `rounded-md` (input/button), `rounded-full` (tag pill)             |
| Text — primary   | `text-sm text-text-primary`                                        |
| Text — muted     | `placeholder:text-text-muted`                                      |
| Spacing          | `px-3 py-2` (input), `px-3 py-2` (button), `px-2.5 py-0.5` (tag) |
| Focus state      | `focus:outline-none focus:ring-1 focus:ring-accent`                |
| Hover state      | `hover:bg-surface-secondary` (Add button), `hover:text-accent-dark` (X) |
| Accent usage     | `bg-accent-muted text-accent` (tag pill), `focus:ring-accent`      |

**Pattern notes:**
- Tags: `inline-flex items-center gap-1 rounded-full bg-accent-muted px-2.5 py-0.5 text-xs font-medium text-accent`
- X button on tag: `ml-0.5 hover:text-accent-dark` with `X` icon at `h-3 w-3`
- Add button icon: `Plus` at `h-4 w-4`; Add button is always secondary style
- Confirm on Enter (`e.preventDefault()` + `addTag()`) and on `onBlur` — pending input is auto-committed when focus leaves the field, preventing silent loss on form submit
- Used for: `skills`, `industries`, `preferred_locations`, `job_titles_seeking` — all multi-value string array fields use `TagInput`, never a plain `<input>` with join/split

---

#### WorkExperienceSection

File: `components/profile/WorkExperienceSection.tsx`
Last updated: 2026-06-15

| Property         | Class                                                            |
| ---------------- | ---------------------------------------------------------------- |
| Background       | `bg-surface` (inputs)                                            |
| Border           | `border border-border` (role card + inputs)                      |
| Border radius    | `rounded-xl` (role card), `rounded-md` (inputs/textarea)         |
| Text — primary   | `text-sm font-semibold text-text-primary` (section heading)      |
| Text — secondary | `text-xs font-medium text-text-secondary` (labels)               |
| Spacing          | `p-4` (role card), `gap-3` (field rows), `gap-4` (between roles) |
| Focus state      | `focus:outline-none focus:ring-1 focus:ring-accent`              |
| Hover state      | `hover:border-accent hover:text-accent` (empty state add button) |
| Accent usage     | `text-accent hover:text-accent-dark` (Add Role link), `accent-accent` (checkbox) |

**Pattern notes:**
- Role card: `flex flex-col gap-3 rounded-xl border border-border p-4`
- Disabled input (end date when isCurrent): `disabled:bg-surface-secondary disabled:text-text-muted`
- Checkbox: `h-3.5 w-3.5 rounded border-border accent-accent` inline with label `text-xs text-text-secondary`
- Empty state button: `rounded-xl border border-dashed border-border py-6 text-sm font-medium text-text-muted`
- Add Role link (inline): `text-xs font-medium text-accent hover:text-accent-dark` with `Plus h-3.5 w-3.5`

---

#### ProfileForm

File: `components/profile/ProfileForm.tsx`
Last updated: 2026-06-15

| Property         | Class                                                                |
| ---------------- | -------------------------------------------------------------------- |
| Background       | `bg-surface`                                                         |
| Border           | `border border-border`                                               |
| Border radius    | `rounded-2xl` (form card), `rounded-md` (inputs/selects)             |
| Text — primary   | `text-base font-semibold text-text-primary` (card heading)           |
| Text — secondary | `text-xs text-text-secondary` (card subtitle)                        |
| Text — labels    | `text-xs font-medium uppercase tracking-wide text-text-secondary`    |
| Spacing          | `p-6` (each section), `gap-3` (field rows), `gap-1` (label→input)   |
| Section divider  | `h-px bg-border`                                                     |
| Focus state      | `focus:outline-none focus:ring-1 focus:ring-accent`                  |
| Shadow           | `shadow-sm`                                                          |
| Accent usage     | `bg-accent hover:bg-accent-dark text-accent-foreground` (Save button) |

**Pattern notes:**
- Section headings inside the form: `text-sm font-semibold text-text-primary mb-4`
- Read-only email input: `bg-surface-secondary text-text-muted` (no focus ring, no border change)
- Save Profile button: `w-full rounded-lg bg-accent py-3 text-sm font-medium text-accent-foreground`
- Form is a `<form>` element, not a `<div>` — all interactive fields are proper form controls
- Select elements use identical classes to text inputs for visual consistency

---

### Find Jobs

#### SearchControls

File: `components/find-jobs/SearchControls.tsx`
Last updated: 2026-06-20

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-surface` (card), `bg-success/5` (success banner) |
| Border           | `border border-border` (card), `border-success/20` (success banner) |
| Border radius    | `rounded-2xl` (card), `rounded-lg` (success banner) |
| Text — primary   | `text-sm font-medium text-success` (success message) |
| Text — labels    | `text-xs font-medium uppercase tracking-wide text-text-secondary` |
| Spacing          | `p-6` (card), `px-4 py-3` (success banner), `gap-4` (grid), `mt-6` (button), `mt-4` (banner) |
| Shadow           | `shadow-sm`                                        |
| Focus state      | `focus:outline-none focus:ring-1 focus:ring-accent` |
| Hover state      | `hover:bg-accent-dark` (button)                    |
| Accent usage     | `bg-accent` (button), `text-accent-foreground` (button text) |

**Pattern notes:**
- Search inputs have `Search` icon positioned `absolute left-3 top-1/2 -translate-y-1/2`
- Input padding: `px-10 py-2` to accommodate left icon
- Success banner: `rounded-lg border border-success/20 bg-success/5` with `text-success` text
- Button: `flex items-center gap-2` with `Search` icon at `h-4 w-4`

---

#### FilterBar

File: `components/find-jobs/FilterBar.tsx`
Last updated: 2026-06-20

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-surface`                                       |
| Border           | `border border-border`                             |
| Border radius    | `rounded-xl`                                       |
| Spacing          | `p-4` (container), `gap-4` (flex), `min-w-40` (dropdowns) |
| Focus state      | `focus:outline-none focus:ring-1 focus:ring-accent` |
| Hover state      | `hover:bg-surface-secondary`                       |

**Pattern notes:**
- Responsive layout: `flex-col md:flex-row md:items-center`
- Text search has `Search` icon positioned like in SearchControls
- Select dropdowns use identical styling to text inputs for consistency
- All selects have `min-w-40` to prevent cramped layouts

---

#### JobTable

File: `components/find-jobs/JobTable.tsx`
Last updated: 2026-06-20

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-surface` (table), `bg-surface-secondary` (header) |
| Border           | `border border-border` (table), `border-b` (header/divider) |
| Border radius    | `rounded-xl` (table)                               |
| Text — header    | `text-xs font-medium uppercase tracking-wide text-text-secondary` |
| Text — primary   | `text-sm font-medium text-text-primary` (company/role) |
| Text — secondary | `text-sm text-text-primary` (salary/date)         |
| Spacing          | `px-6 py-3` (header), `px-6 py-4` (cells), `gap-2` (progress bar) |
| Hover state      | `hover:bg-surface-secondary` (table rows)          |
| Accent usage     | `bg-accent-muted text-accent` (source badges)      |

**Pattern notes:**
- Match score progress bar: `h-2 w-16 overflow-hidden rounded-full bg-surface-secondary` with colored fill
- Progress bar colors: `bg-success` (80+), `bg-warning` (60-79), `bg-error` (<60)
- Match score text colors match progress bar: `text-success`, `text-warning`, `text-error`
- Source badges: `inline-flex rounded-full bg-accent-muted px-2.5 py-0.5 text-xs font-medium text-accent`
- Chevron icon: `ChevronRight` at `h-4 w-4` with `text-text-muted`

---

#### JobDetailsPage

File: `components/find-jobs/JobDetailsPage.tsx`
Last updated: 2026-06-20 (updated)

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-surface` (all cards), `bg-background` (page)  |
| Border           | `border border-border`                             |
| Border radius    | `rounded-2xl` (cards), `rounded-xl` (info cards, apply btn), `rounded-full` (skill badges), `rounded-md` (buttons) |
| Text — primary   | `text-base font-semibold text-text-primary` (section headings), `text-xl font-semibold text-text-primary` (job title) |
| Text — secondary | `text-sm text-text-secondary` (company, labels, body) |
| Text — muted     | `text-xs text-text-muted uppercase tracking-wide` (info card labels) |
| Spacing          | `p-6` (cards), `px-4 py-4` (info cards), `gap-4` (info cards grid), `gap-3` (icon+text) |
| Shadow           | `shadow-sm`                                        |
| Hover state      | `hover:bg-surface-secondary` (secondary buttons, back link), `hover:bg-accent-dark` (primary buttons) |
| Accent usage     | `bg-accent text-accent-foreground` (Research Company btn, Apply Now btn) |

**Pattern notes:**
- Back link: `inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary` with `ArrowLeft h-4 w-4`
- Job header: company placeholder icon in `h-12 w-12 rounded-xl border border-border bg-surface-secondary` + `Building2 h-6 w-6 text-text-muted`
- Match score badge: `rounded-full px-2.5 py-0.5 text-sm font-medium` with dynamic color — `text-success bg-success-lightest` (80+), `text-warning bg-warning/10` (60-79), `text-error bg-error/10` (<60)
- View Job Post button: secondary style with `ExternalLink h-4 w-4`; opens in new tab
- Info cards: 2-col mobile / 4-col desktop grid; each has an icon container `h-8 w-8 rounded-lg` with themed bg (`bg-success-lightest`, `bg-info-lightest`, `bg-accent-muted`, `bg-surface-secondary`) + icon + label + muted uppercase caption
- AI Match Reasoning: `Sparkles h-4 w-4 text-accent` icon + `text-xs font-medium uppercase tracking-wide text-text-secondary` label
- Matched skill badges: `bg-success-lightest text-success-foreground` with `CheckCircle2 h-3 w-3`
- Gap skill badges: `bg-accent-muted text-accent` with `XCircle h-3 w-3`
- Job Description (`JobDescriptionCard`): `FileText h-4 w-4 text-text-secondary` icon in `h-9 w-9 rounded-lg bg-surface-secondary`; full text always visible (`whitespace-pre-line`); if `description.length > 300` (Adzuna truncation threshold), shows `ExternalLink h-3.5 w-3.5` link "View full job description" in `text-xs font-medium text-accent hover:text-accent-dark` opening source URL in new tab — never hides text, never uses expand/collapse toggle
- Company Research empty state: `Building2 h-10 w-10 text-text-muted` centered + subtitle text
- Company Research dossier: 9 sections divided by `h-px bg-border`; arrays render as bullet lists with `h-1.5 w-1.5 rounded-full` dots (color-coded: accent, warning, info) or `CheckCircle2` icons; tech stack as `bg-accent-muted text-accent` tag pills
- Apply Now: `w-full rounded-xl bg-accent py-4 text-sm font-medium text-accent-foreground` — always links to `external_apply_url ?? source_url`; opens in new tab
- `CompanyResearchCard` is a sub-component within the file (not exported separately) — manages its own `isResearching`/`error` state, calls `POST /api/agent/research`

---

#### Pagination

File: `components/find-jobs/Pagination.tsx`
Last updated: 2026-06-20

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Text — secondary | `text-sm text-text-secondary` (results count)      |
| Spacing          | `gap-2` (pagination controls), `gap-1` (page numbers) |
| Border           | `border border-border` (buttons)                   |
| Border radius    | `rounded-md` (buttons)                             |
| Background       | `bg-surface` (buttons)                             |
| Focus state      | `focus:outline-none focus:ring-1 focus:ring-accent` |
| Hover state      | `hover:bg-surface-secondary` (secondary buttons)   |
| Accent usage     | `bg-accent text-accent-foreground` (active page)   |
| Disabled state   | `disabled:opacity-50 disabled:cursor-not-allowed`  |

**Pattern notes:**
- Layout: `flex-col md:flex-row md:justify-between` with `gap-4`
- Previous/Next buttons: `flex items-center gap-1` with chevron icons at `h-4 w-4`
- Page numbers: `min-w-8` for consistent width, active page uses accent styling
- Disabled buttons use opacity and cursor changes

---

### Dashboard

#### StatsCard

File: `components/dashboard/StatsCard.tsx`
Last updated: 2026-06-26

| Property         | Class                                                    |
| ---------------- | -------------------------------------------------------- |
| Background       | `bg-surface`                                             |
| Border           | `border border-border`                                   |
| Border radius    | `rounded-2xl`                                            |
| Text — label     | `text-sm font-medium text-text-secondary`                |
| Text — value     | `text-[30px] font-semibold leading-9 text-text-primary`  |
| Text — subtitle  | `text-xs text-text-muted`                                |
| Spacing          | `p-6`, `mt-2`                                            |
| Shadow           | `shadow-sm`                                              |

**Pattern notes:**
- Trend badge: `inline-flex items-center gap-1 rounded-sm bg-success-lightest px-2 py-0.5 text-xs font-medium text-success-darker` with `TrendingUp h-3 w-3`
- `trend` + `trendLabel` props render the badge; `subtitle` renders plain muted text (no badge)

---

#### RecentActivity

File: `components/dashboard/RecentActivity.tsx`
Last updated: 2026-06-27

| Property         | Class                                              |
| ---------------- | -------------------------------------------------- |
| Background       | `bg-surface`                                       |
| Border           | `border border-border`                             |
| Border radius    | `rounded-2xl`                                      |
| Text — heading   | `text-base font-semibold text-text-primary`        |
| Text — entry     | `text-sm font-medium text-text-primary`            |
| Text — timestamp | `text-xs text-text-muted`                          |
| Spacing          | `p-6`, `gap-4` (list), `gap-3` (entry row)         |
| Shadow           | `shadow-sm`                                        |

**Pattern notes:**
- Accepts `activities?: ActivityEntry[]` prop from `actions/dashboard.ts`
- `job_found` dot: `h-4 w-4 rounded-full bg-success-light` outer ring + `h-2 w-2 rounded-full bg-success-alt` inner
- `researched` dot: `h-4 w-4 rounded-full bg-info-light` outer ring + `h-2 w-2 rounded-full bg-info` inner
- Empty state: `text-sm text-text-muted` — "No recent activity yet."

---

#### CompanyResearchChart

File: `components/dashboard/CompanyResearchChart.tsx`
Last updated: 2026-06-28

**Pattern notes:**
- Accepts `data?: ChartDayPoint[]` from `actions/dashboard.ts`
- Recharts `BarChart` inside `ResponsiveContainer width="100%" height={220}`
- Bar fill: `var(--color-info)` (info token), `barSize={28}`, `radius={[4,4,0,0]}`
- `CartesianGrid`: `vertical={false}`, `strokeDasharray="4 4"`, `stroke="var(--color-border)"`
- Axes: `axisLine={false}`, `tickLine={false}`, `fill: "var(--color-text-muted)"`, `fontSize: 12`
- Y-axis: `domain={[0, "auto"]}`, `allowDecimals={false}`
- `Tooltip`: surface bg, border-border, `borderRadius: 8`, `fontSize: 12`
- Empty state: `h-55` flex center with `text-sm text-text-muted` — "No data yet"
- Real data is last 30 days, labels use `"Jun 20"` month/day format, zero-filled

---

#### JobsFoundChart

File: `components/dashboard/JobsFoundChart.tsx`
Last updated: 2026-06-28

**Pattern notes:**
- Accepts `data?: ChartDayPoint[]` from `actions/dashboard.ts`
- Recharts `AreaChart` inside `ResponsiveContainer width="100%" height={220}`
- `Area`: `stroke="var(--color-accent)"`, `strokeWidth={3}`, `fill="url(#jobsGradient)"`, `dot={false}`, `type="monotone"`
- Gradient: `linearGradient id="jobsGradient"`, `stopColor="var(--color-accent)"` from 20% opacity → 0%
- `CartesianGrid`, axis, tooltip identical to `CompanyResearchChart`
- Y-axis: `domain={[0, "auto"]}`, `allowDecimals={false}`
- Empty state: `h-55` flex center with `text-sm text-text-muted` — "No data yet"
- Real data is last 30 days, labels use `"Jun 20"` month/day format, zero-filled

---

#### MatchScoreChart

File: `components/dashboard/MatchScoreChart.tsx`
Last updated: 2026-06-28

**Pattern notes:**
- Accepts `data?: MatchScoreBucket[]` from `actions/dashboard.ts`
- Recharts `BarChart`, bar fill `var(--color-success)` (success token), `barSize={32}`, `radius={[4,4,0,0]}`
- X-axis labels: 5 score ranges (`50-60%`, `60-70%`, `70-80%`, `80-90%`, `90-100%`), `fontSize: 11`
- Y-axis: `domain={[0, "auto"]}`, `allowDecimals={false}`
- Empty state: `h-55` flex center with `text-sm text-text-muted` — "No data yet"
- Real data is all user jobs with `match_score`, bucketed into 5 ranges

---

#### DashboardPage

File: `components/dashboard/DashboardPage.tsx`
Last updated: 2026-06-28

**Pattern notes:**
- Not `"use client"` — server component; charts inside it are client components
- Top-level `flex flex-col gap-6` container
- Incomplete profile banner: `rounded-xl border border-warning/30 bg-warning/5 px-5 py-4` with `AlertCircle h-5 w-5 text-warning`; link to `/profile` uses `font-semibold text-accent hover:underline`
- Stat cards: `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4`
- Real stat values passed via `stats?: DashboardStats` from `actions/dashboard.ts`; render as `String(stats?.totalJobs ?? 0)` and `${stats?.averageMatchRate ?? 0}%`
- Real activities passed via `activities?: ActivityEntry[]` from `actions/dashboard.ts`; forwarded to `RecentActivity`
- Real chart data passed via `charts?: DashboardCharts` from `actions/dashboard.ts`; forwarded to `CompanyResearchChart`, `JobsFoundChart`, and `MatchScoreChart`
- Middle row (Recent Activity + Company Research): `grid grid-cols-1 gap-6 lg:grid-cols-2`
- Bottom row (Jobs Found + Match Score): `grid grid-cols-1 gap-6 lg:grid-cols-2`

---

#### Dashboard Stats Action

File: `actions/dashboard.ts`
Last updated: 2026-06-28

**Pattern notes:**
- `"use server"` action with three functions:
  - `getDashboardStats()` returning `{ success, stats?: DashboardStats, error? }`
  - `getRecentActivity()` returning `{ success, activities?: ActivityEntry[], error? }`
  - `getDashboardChartData()` returning `{ success, charts?: DashboardCharts, error? }`
- Fetches `user_id` via `insforge.auth.getCurrentUser()`
- `getDashboardStats` queries:
  - `totalJobs` — `from("jobs").select("*", { count: "exact", head: true }).eq("user_id", userId)`
  - `averageMatchRate` — selects `match_score` array, filters numeric values, computes rounded average
  - `companiesResearched` — `count: "exact"` with `.not("company_research", "is", null)`
  - `jobsThisWeek` — `count: "exact"` with `.gte("found_at", sevenDaysAgo.toISOString())`
- `getRecentActivity` merges `agent_runs` (completed, `job_title_searched` + `jobs_found` + `completed_at`) and `jobs` (with `company_research`, `company` + `found_at`), formats relative timestamps, sorts by raw date, and returns the most recent 5 entries
- `getDashboardChartData` computes three datasets from the `jobs` table:
  - `jobsFound` — last 30 days, grouped by day, zero-filled
  - `companyResearch` — last 30 days, grouped by day, zero-filled
  - `matchScores` — all-time distribution into 5 score buckets
- All failures return a human-readable error and log with `[actions/dashboard]` prefix

---

### Agents / Backend Library Patterns

#### Browserbase + Stagehand Factory

File: `lib/browserbase.ts`
Last updated: 2026-06-23

**Pattern notes:**
- `createBrowserbaseSession()` returns a Browserbase session configured with `projectId` and `timeout: 120` (2 minutes, enough for homepage + 3 sub-pages).
- `createStagehand(browserbaseSessionID)` returns a `Stagehand` instance configured for `env: "BROWSERBASE"`, model `openai/gpt-4o`, and `disablePino: true`.
- API routes use `await stagehand.init()`, get the active page via `stagehand.context.activePage()`, navigate with `page.goto(url, { waitUntil: 'domcontentloaded' })`, and call `stagehand.extract(instruction, schema, { page })` using the 3-argument form.
- Always wrap `act()` / `extract()` in try/catch and close the session in a `finally` block with `await stagehand.close()`.
- For typed extraction, pass a Zod object schema (e.g., `homepageSchema`, `subPageSchema`) and infer the result with `z.infer<typeof schema>`.

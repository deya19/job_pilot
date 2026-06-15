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

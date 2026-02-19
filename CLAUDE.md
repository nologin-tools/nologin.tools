# nologin.tools

A curated directory of privacy-friendly tools that work without login.

## Tech Stack

- **Framework**: Astro (SSR mode)
- **Hosting**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite) via Drizzle ORM
- **Styling**: Tailwind CSS v4
- **Package Manager**: pnpm
- **Cron**: Separate Cloudflare Worker (`workers/cron/`)

## Project Structure

```
src/
├── db/schema.ts          # Drizzle tables: tools, tags, health_checks, badge_displays, edit_suggestions
├── db/index.ts           # getDb(d1) helper
├── lib/                  # Utilities: api, archive, badge, health, tags, utils
├── layouts/Layout.astro  # Base layout with SEO meta
├── components/           # Header, Footer, ToolCard, HealthBadge, TagPicker
├── pages/
│   ├── index.astro       # Homepage: search, filter, sort, tool grid
│   ├── submit.astro      # Submission form
│   ├── submit/success.astro
│   ├── tool/[slug].astro # Tool detail with health timeline
│   ├── badge/index.astro # "What is NoLogin Verified?"
│   ├── badge/[slug].astro
│   ├── admin/index.astro # Review queue (secret-protected)
│   ├── about.astro
│   ├── 404.astro
│   ├── sitemap.xml.ts
│   └── api/              # submit, review, edit, resubmit, tools/[slug]
workers/cron/             # Health checks, badge detection, data export
```

## Key Conventions

- **Slug**: Generated from tool URL — `urlToSlug("https://excalidraw.com")` → `"excalidraw-com"`
- **Tags**: Key:Value format — `category:Design`, `source:Open Source`, `pricing:Free`
  - 8 tag dimensions: `category` (single-select, first in TAG_DEFINITIONS), `source`, `data`, `privacy`, `type`, `hosting`, `offline`, `pricing`
  - `category` tags use blue chip styling (`.chip-category`), displayed value-only (no `category:` prefix)
- **Status flow**: `pending` → `approved` (= NoLogin Verified) or `rejected`
  - Rejected tools can be resubmitted via `POST /api/resubmit` — resets to `pending`, clears `rejectionReason`
- **Badge navigation**: Tool detail "NoLogin Verified" label links to `/badge/{slug}`; verified tools show a CTA to get embed code
- **Badge styles**: 13 badge variants defined in `src/lib/badge.ts` (`BADGE_STYLES` + `ORIGINAL_BADGE`), organized in `BADGE_GROUPS`:
  - **Standard** (4): `flat` (default), `flat-square`, `plastic`, `for-the-badge` — left `#555` + right `#4c1`
  - **Social** (1): `social` — pill shape, light left `#fafafa` + green right, border stroke
  - **Dark** (4): `flat-dark`, `flat-square-dark`, `plastic-dark`, `for-the-badge-dark` — left `#2d2d2d` + right `#3fb950`
  - **Color** (3): `flat-blue` (`#07c`), `flat-purple` (`#8957e5`), `flat-orange` (`#fe7d37`) — left `#555` + colored right
  - **Original** (1): `/badge.svg` (160×28, white bg, legacy) — not in `BADGE_GROUPS`, shown as secondary option
  - `/badge.svg` is kept for backward compatibility; new embeds default to `flat`
- **API responses**: `{ ok: true, data: ... }` or `{ ok: false, error: "...", details: {...} }`
- **Badge page tabs**: `/badge/[slug]` has two tabs — "Verification" (default) and "Embed Code" (`#embed` hash). Tab switching is client-side vanilla JS with `hidden` class toggle. Embed tab includes a grouped style selector (Standard/Social/Dark/Color) for badge variants. Dark cards use `bg-neutral-800` preview background.
- **Admin auth**: Query param `?secret=ADMIN_SECRET`
- **Health check on submit**: Tools are health-checked on submission/resubmission (fire-and-forget). Results stored in `health_checks` table, displayed on admin review page.

## Commands

```bash
pnpm dev                  # Start dev server
pnpm build                # Build for production
pnpm db:generate          # Generate Drizzle migration
pnpm db:migrate:local     # Apply migrations locally
pnpm db:migrate:remote    # Apply migrations to production D1
pnpm deploy               # Build + deploy to Cloudflare
pnpm deploy:cron          # Deploy cron worker
```

## Environment Variables

| Variable | Purpose | Setup |
|----------|---------|-------|
| `SITE_URL` | Site URL | wrangler.jsonc vars |
| `ADMIN_SECRET` | Admin dashboard access | `wrangler secret put` |
| `GITHUB_TOKEN` | Data export to GitHub | `wrangler secret put` |
| `ARCHIVE_ORG_ACCESS_KEY` | web.archive.org auth | `wrangler secret put` |
| `ARCHIVE_ORG_SECRET_KEY` | web.archive.org auth | `wrangler secret put` |

## Database Schema

5 tables: `tools` (main), `tags` (key:value), `health_checks` (periodic), `badge_displays` (detection results), `edit_suggestions` (wiki mode).

- `tools.submitter_email`: Optional contact email from the submitter. Only displayed on the admin review page (not public). Validated as a proper email format (max 254 chars) when provided.

## Recommendation Score

```
score = badge_weight (0/5/10) + freshness (1/3/5) + health (0/1/3)
```

## Design System

- Colors: white bg, neutral-950 text, green-500 verified, red-500 offline, amber-500 pending
- Font: system font stack
- Max width: 6xl (1152px), card grid 1/2/3 columns responsive
- **Chip variants**: `.chip` (base), `.chip-default` / `.chip-active` (states), `.chip-category` (blue), `.chip-toggle` (interactive form variant with check icon, used in TagPicker)
- **TagPicker**: Uses checkboxes for all dimensions; single-select enforced via JS (allows deselect). Wrapper has `.tag-picker-container` for multi-instance isolation. Labels carry `data-tag-group` and `data-multi-select` attributes.

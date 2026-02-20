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
├── db/schema.ts          # Drizzle tables: tools, tags, health_checks, badge_displays, edit_suggestions, data_exports
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
│   ├── admin/index.astro # Full admin dashboard (tab-based, secret-protected)
│   ├── about.astro
│   ├── 404.astro
│   ├── sitemap.xml.ts
│   └── api/              # submit, review, edit, resubmit, tools/[slug], admin/*
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
  - **Standard** (4): `flat` (default, 118×20), `flat-square` (118×20), `plastic` (116×18), `for-the-badge` (191×28) — left `#555` + right `#4c1`
  - **Social** (1): `social` (142×20) — pill shape, light left `#fafafa` + green right, border stroke
  - **Dark** (4): `flat-dark` (118×20), `flat-square-dark` (118×20), `plastic-dark` (116×18), `for-the-badge-dark` (191×28) — left `#2d2d2d` + right `#3fb950`
  - **Color** (3): `flat-blue` (118×20, `#07c`), `flat-purple` (118×20, `#8957e5`), `flat-orange` (118×20, `#fe7d37`) — left `#555` + colored right
  - **Original** (1): `/badge.svg` (160×28, white bg, legacy) — not in `BADGE_GROUPS`, shown as secondary option
  - `/badge.svg` is kept for backward compatibility; new embeds default to `flat`
  - **Shield icon**: All 12 badge variants (not original) include a shield+checkmark icon on the left side before "nologin" text, for brand recognition and verification authority:
    - 12×12 base size shield path with checkmark stroke, scaled per badge height (0.833× for plastic, 1× for flat/social, 1.333× for for-the-badge)
    - Dark backgrounds: white shield (`fill="#fff" fill-opacity="0.9"`) + background-colored checkmark stroke
    - Social (light `#fafafa` bg): green shield (`fill="#22c55e"`) + white checkmark stroke
  - All SVG badges have `<title>Verified by nologin.tools</title>` and `aria-label="Verified by nologin.tools"` for hover tooltip and accessibility
  - Embed code `<img>` tags include `title="Verified by nologin.tools"` for native browser hover tooltip
- **API responses**: `{ ok: true, data: ... }` or `{ ok: false, error: "...", details: {...} }`
- **Badge page tabs**: `/badge/[slug]` has two tabs — "Verification" (default) and "Embed Code" (`#embed` hash). Tab switching is client-side vanilla JS with `hidden` class toggle. Embed tab includes a grouped style selector (Standard/Social/Dark/Color) for badge variants. Dark cards use `bg-neutral-800` preview background.
- **Admin auth**: Query param `?secret=ADMIN_SECRET`
- **Admin dashboard**: Tab-based SPA at `/admin?secret=...` with URL hash navigation (`#dashboard` / `#tools` / `#edits` / `#health` / `#export`):
  - **Dashboard**: Stats overview (total/approved/pending/offline) + recent submissions table
  - **Tools**: Full CRUD — status filter chips, search, pagination via `POST /api/admin/tools`; inline edit/reject forms; approve/reject/edit/delete/health-check actions
  - **Edits**: Pending edit suggestions review (approve & apply / reject)
  - **Health**: Health monitoring table for approved tools with manual "Run Check" button
  - **Export**: Manual "Export Now" button + export history table (time, source cron/manual, tool count, files updated, status)
  - Toast notifications (success/error, 3s auto-dismiss), loading states on buttons, `confirm()` for destructive actions
- **Admin API endpoints** (all POST, require `secret`):
  - `POST /api/admin/tools` — list tools with status filter, search, pagination (20/page)
  - `POST /api/admin/tool-update` — edit tool fields and tags
  - `POST /api/admin/tool-delete` — delete tool (cascade cleans associations)
  - `POST /api/admin/health-check` — manually trigger health check for a tool
  - `POST /api/admin/data-export` — manually trigger data export to GitHub (pushes tools.json + README.md with change detection), records to `data_exports` table
  - `POST /api/admin/export-history` — query recent export history (last 20 entries)
- **Health check on submit**: Tools are health-checked on submission/resubmission (fire-and-forget). Results stored in `health_checks` table, displayed on admin review page.
- **Health check self-reference detection**: Cloudflare Workers cannot `fetch()` their own hostname (causes 522). `checkHealth(url, siteUrl?)` compares hostnames — if they match, it short-circuits with `{ isOnline: true, httpStatus: 200, responseTimeMs: 0 }`. All call sites pass `SITE_URL`. The cron worker has equivalent inline logic.

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
| `RATE_LIMIT_MAX_SUBMISSIONS` | Max submissions per IP per window (default: 3) | wrangler.jsonc vars |
| `RATE_LIMIT_WINDOW_HOURS` | Rate limit window in hours (default: 24) | wrangler.jsonc vars |

## Database Schema

6 tables: `tools` (main), `tags` (key:value), `health_checks` (periodic), `badge_displays` (detection results), `edit_suggestions` (wiki mode), `data_exports` (export history).

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
- **Admin styles**: `.admin-tab` / `.admin-tab-active` / `.admin-tab-inactive` (tab navigation), `.status-badge` + `.status-approved` / `.status-pending` / `.status-rejected` (pill badges), `.admin-table` (data tables)

## CI/CD

- **Workflow**: `.github/workflows/deploy.yml`
- **Triggers**: push to `main` → deploy | PR to `main` → build check only | manual `workflow_dispatch` → deploy
- **Jobs** (main branch): `migrate` → `deploy-app` + `deploy-cron` (parallel after migration)
- **Jobs** (PR): `build-check` only (pnpm install + pnpm build)
- **D1 database_id**: Real ID stored directly in `wrangler.jsonc` and `workers/cron/wrangler.jsonc` (not sensitive — access requires API token)
- **GitHub Secrets required**: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- **Concurrency**: Same workflow + branch combo cancels in-progress runs

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
│   └── api/              # submit, review, edit, tools/[slug]
workers/cron/             # Health checks, badge detection, data export
```

## Key Conventions

- **Slug**: Generated from tool URL — `urlToSlug("https://excalidraw.com")` → `"excalidraw-com"`
- **Tags**: Key:Value format — `source:Open Source`, `pricing:Free`
- **Status flow**: `pending` → `approved` (= NoLogin Verified) or `rejected`
- **API responses**: `{ ok: true, data: ... }` or `{ ok: false, error: "...", details: {...} }`
- **Admin auth**: Query param `?secret=ADMIN_SECRET`

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

## Recommendation Score

```
score = badge_weight (0/5/10) + freshness (1/3/5) + health (0/1/3)
```

## Design System

- Colors: white bg, neutral-950 text, green-500 verified, red-500 offline, amber-500 pending
- Font: system font stack
- Max width: 6xl (1152px), card grid 1/2/3 columns responsive

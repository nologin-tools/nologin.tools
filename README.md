# nologin.tools

[![Deploy](https://github.com/nologin-tools/nologin.tools/actions/workflows/deploy.yml/badge.svg)](https://github.com/nologin-tools/nologin.tools/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fnologin.tools)](https://nologin.tools)
[![Built with Astro](https://img.shields.io/badge/Astro-bc52ee?logo=astro&logoColor=white)](https://astro.build)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)

<a href="https://nologin.tools/badge/nologin-tools">
  <img src="https://nologin.tools/badges/for-the-badge.svg" alt="NoLogin Verified" title="Verified by nologin.tools" />
</a>

A curated directory of privacy-friendly tools that work without login. Built to help users discover software that respects their time and privacy — no account required.

**Live site:** [nologin.tools](https://nologin.tools)

## Features

- **Tool Directory** — Browse, search, and filter verified no-login tools
- **NoLogin Verified Badge** — Trust signal for tools that pass manual review
- **Wiki Mode** — Community-driven edit suggestions to keep data accurate
- **Health Monitoring** — Automated uptime checks every 6 hours with 14-day history
- **Web Archive Integration** — Automatic archival via web.archive.org for offline tools
- **Data Export** — Daily export to an [awesome-list](https://github.com/nologin-tools/awesome-nologin-tools) on GitHub
- **Badge Display Detection** — Detect and reward tools that display the NoLogin Verified badge

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Astro](https://astro.build) (SSR) |
| Hosting | Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) |
| Styling | [Tailwind CSS](https://tailwindcss.com) v4 |
| Cron | Cloudflare Workers (scheduled) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [pnpm](https://pnpm.io) 9+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (installed as dev dependency)

### Setup

```bash
# Install dependencies
pnpm install

# Create the D1 database
npx wrangler d1 create nologin-tools-db
# Copy the database_id into wrangler.jsonc

# Run database migrations
pnpm db:migrate:local

# Set up local secrets (create .dev.vars)
echo "ADMIN_SECRET=your-secret-here" > .dev.vars

# Start the dev server
pnpm dev
```

### Commands

```bash
pnpm dev                 # Start dev server
pnpm build               # Build for production
pnpm preview             # Preview production build locally
pnpm db:generate         # Generate new Drizzle migration
pnpm db:migrate:local    # Apply migrations to local D1
pnpm db:migrate:remote   # Apply migrations to production D1
pnpm deploy              # Build and deploy to Cloudflare
pnpm deploy:cron         # Deploy the cron worker
```

## Project Structure

```
nologin.tools/
├── src/
│   ├── db/
│   │   ├── schema.ts            # Drizzle table definitions
│   │   └── index.ts             # DB connection helper
│   ├── lib/
│   │   ├── api.ts               # Standardized API responses
│   │   ├── archive.ts           # web.archive.org integration
│   │   ├── badge.ts             # Badge embed code generation
│   │   ├── health.ts            # Health check logic
│   │   ├── tags.ts              # Tag category definitions
│   │   └── utils.ts             # Slug generation, IP hashing, etc.
│   ├── layouts/
│   │   └── Layout.astro         # Base HTML layout with SEO
│   ├── components/
│   │   ├── Header.astro         # Navigation with mobile menu
│   │   ├── Footer.astro
│   │   ├── ToolCard.astro       # Tool card with health indicator
│   │   ├── HealthBadge.astro    # Online/offline status dot
│   │   └── TagPicker.astro      # Tag selection for submission
│   ├── pages/
│   │   ├── index.astro          # Homepage with search, filters, grid
│   │   ├── submit.astro         # Tool submission form
│   │   ├── submit/success.astro # Post-submission badge guide
│   │   ├── tool/[slug].astro    # Tool detail page
│   │   ├── badge/index.astro    # "What is NoLogin Verified?"
│   │   ├── badge/[slug].astro   # Per-tool badge page
│   │   ├── admin/index.astro    # Review queue (secret-protected)
│   │   ├── about.astro
│   │   ├── 404.astro
│   │   ├── sitemap.xml.ts       # Dynamic sitemap
│   │   └── api/                 # REST endpoints
│   │       ├── submit.ts        # POST — submit a tool
│   │       ├── review.ts        # POST — approve/reject (admin)
│   │       ├── edit.ts          # POST — suggest an edit
│   │       └── tools/           # GET — list & detail
│   └── styles/
│       └── global.css           # Tailwind + component classes
├── workers/cron/                # Scheduled worker
│   └── src/index.ts             # Health checks, badge detection, export
├── migrations/                  # Drizzle-generated SQL
├── public/
│   ├── badge.svg                # NoLogin Verified badge
│   └── favicon.svg
├── wrangler.jsonc               # Cloudflare Workers config
├── drizzle.config.ts
└── astro.config.mjs
```

## How It Works

```
Submit tool → Pending review → Admin approves → NoLogin Verified
                                    │
                                    ├── Appears in public directory
                                    ├── Searchable & filterable
                                    ├── Health monitoring begins
                                    └── Badge embed code available
```

### Recommendation Score

Tools in the directory are ranked by a composite score:

| Signal | Points |
|--------|--------|
| Badge displayed (SVG) | +10 |
| Badge displayed (meta/link) | +5 |
| Approved within 30 days | +5 |
| Approved within 90 days | +3 |
| Currently online | +3 |

### Tag System

Tools are categorized with key:value tags across 7 dimensions:

- **source** — Open Source, Closed Source
- **data** — Client-Side Only, Server-Side
- **privacy** — No Trackers, Privacy Focused
- **type** — PWA, Web App, CLI, Desktop App, Browser Extension
- **hosting** — Self-Hostable, Cloud Only
- **offline** — Works Offline, Online Only
- **pricing** — Free, Freemium, Ad-Supported

## Environment Variables

| Variable | Purpose | Setup |
|----------|---------|-------|
| `SITE_URL` | Canonical site URL | `wrangler.jsonc` vars |
| `ADMIN_SECRET` | Admin dashboard access key | `wrangler secret put` |
| `GITHUB_TOKEN` | Data export to GitHub repo | `wrangler secret put` |
| `ARCHIVE_ORG_ACCESS_KEY` | web.archive.org API auth | `wrangler secret put` |
| `ARCHIVE_ORG_SECRET_KEY` | web.archive.org API auth | `wrangler secret put` |

## Cron Jobs

The `workers/cron/` worker runs three scheduled tasks:

| Schedule | Task |
|----------|------|
| Every 6 hours | Health checks for all approved tools |
| Daily 03:00 UTC | Export tools to GitHub awesome-list |
| Daily 04:00 UTC | Badge display detection on tool websites |

## License

[MIT](LICENSE)

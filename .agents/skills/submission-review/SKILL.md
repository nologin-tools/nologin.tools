---
name: submission-review
description: >-
  Review pending nologin.tools submissions and edit suggestions. Applies domain and
  spam gates, delegates hands-on testing to tool-evaluation, prepares metadata,
  taxonomy, full 8-locale editorial and seven-locale translations, then performs an
  atomic approval through the canonical review API.
---

# Submission Review

Read [`../tool-evaluation/SKILL.md`](../tool-evaluation/SKILL.md) before evaluating any ungated candidate. Browser work is sequential; clean browser spaces before and after a batch.

## Invariants

- Never delete tools.
- Reject spam or non-compliant submissions with a specific reason; do not use `unstable` as a tool status.
- A pending tool remains pending until metadata, taxonomy, editorial, and translations are prepared and verified.
- Approve evaluated tools with the atomic `approve_evaluated` API action. Do not update metadata, tags, and status through separate remote statements.
- Use only values from `src/lib/tags.ts`. Every dimension is required; single-select dimensions require exactly one value, while `privacy` may contain multiple valid values. `source:Open Source` is derived from `repoUrl`.

## Queue and hard gates

Query pending records read-only. Reject temporary tunnels, preview deployments, direct undeployed repositories, extension/store download pages, paid storefronts, tracking-polluted campaign URLs, obvious automated spam, duplicate slices of one hosted app, and tools whose core task requires login.

Check shared hosting subdomains for duplicate hostnames before browser work. A GitHub Pages deployment may be fast-tracked only after its repository and live tool are verified.

Use the review API for rejection:

```json
{"secret":"<ADMIN_SECRET>","action":"reject","toolId":123,"reason":"specific evidence-backed reason"}
```

## Empirical gate

For every candidate that survives hard gates, execute the complete `tool-evaluation` workflow. Approval requires:

- core task completed without mandatory login;
- no bait-and-switch export wall or forced commercial watermark;
- grounded 8-locale evaluation synchronized successfully;
- score at least 70.

Do not infer local-only processing solely from a run with no captured payload request.

## Prepare metadata and taxonomy

Use objective English metadata and current taxonomy values:

- category: `AI`, `Design`, `Writing`, `Development`, `Productivity`, `Media`, `Privacy`, `Data`, `Communication`, `Education`, or `Finance`;
- data: `Client-Side Only` or `Server-Side`;
- privacy: `No Trackers` or `Privacy Focused`;
- type: `PWA`, `Web App`, `CLI`, `Desktop App`, or `Browser Extension`;
- hosting: `Self-Hostable` or `Cloud Only`;
- offline: `Works Offline` or `Online Only`;
- pricing: `Free`, `Freemium`, or `Ad-Supported`.

## Prepare translations before approval

Generate all seven locale records (`zh`, `ja`, `ko`, `es`, `fr`, `de`, `pt`) with the exact English source embedded as `_source`, allowing pending tools that are not in build data yet:

```json
{
  "example-com": {
    "_source": {
      "description": "Objective English description.",
      "coreTask": "Concrete English core task."
    },
    "zh": {"description": "...", "coreTask": "..."},
    "ja": {"description": "...", "coreTask": "..."},
    "ko": {"description": "...", "coreTask": "..."},
    "es": {"description": "...", "coreTask": "..."},
    "fr": {"description": "...", "coreTask": "..."},
    "de": {"description": "...", "coreTask": "..."},
    "pt": {"description": "...", "coreTask": "..."}
  }
}
```

Apply it and verify the changed locale files:

```bash
node scripts/sync-tool-translations.mjs --apply /tmp/translations-<slug>.json
```

Do not use the global `--status` backlog as proof for a single pending record; inspect that slug in all seven files.

## Atomic approval

After editorial and translations are present, call `POST /api/review`:

```json
{
  "secret": "<ADMIN_SECRET>",
  "action": "approve_evaluated",
  "toolId": 123,
  "metadata": {
    "name": "Example",
    "description": "Objective English description.",
    "coreTask": "Concrete English core task.",
    "repoUrl": "https://github.com/example/example"
  },
  "tags": [
    {"key":"category","value":"Development"},
    {"key":"data","value":"Client-Side Only"},
    {"key":"privacy","value":"No Trackers"},
    {"key":"type","value":"Web App"},
    {"key":"hosting","value":"Self-Hostable"},
    {"key":"offline","value":"Works Offline"},
    {"key":"pricing","value":"Free"}
  ]
}
```

The endpoint validates current pending state and writes metadata, tags, and final approval in one D1 batch. Treat any non-success response as unapproved.

## Edit suggestions

Verify the proposed value first, then use `approve_edit` or `reject_edit` on `/api/review`. The approved edit and suggestion status transition are batched atomically. If description or core task changes, prepare and apply all seven translations before approval. If URL changes, verify identity and collision behavior; community edits intentionally update the slug through the endpoint.

## Output

Report processed IDs, approved and rejected slugs with reasons, product scores, translation files changed, edit outcomes, API failures, and remaining pending records. Never report approval before the atomic endpoint succeeds.

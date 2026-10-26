---
name: submission-review
description: >-
  Review pending nologin.tools submissions and edit suggestions. Applies shared hard
  gates, runs lightweight triage, confirms and rejects Tier C through the review API,
  feeds the persistent evaluation queue, prepares metadata, taxonomy, bilingual (EN/ZH)
  editorial and zh translations for evaluated tools, then performs an atomic
  approval through the canonical review API.
---

# Submission Review

Read [`../tool-evaluation/SKILL.md`](../tool-evaluation/SKILL.md) before evaluating any candidate. Browser work is sequential; clean browser spaces before and after a batch.

## Invariants

- Never delete tools.
- **All writes go through the review API** via `scripts/lib/admin-api.mjs` (needs `ADMIN_SECRET` in `.env.local`). Never compose SQL `UPDATE tools ...` statements. If `node scripts/lib/admin-api.mjs ping` fails, stop and report the blocker; do not fall back to SQL.
- Reject spam or non-compliant submissions with a specific, evidence-backed reason; do not use `unstable` as a tool status.
- Approve only after a completed `tool-evaluation` session, using the atomic `approve_evaluated` action.
- Use only values from `src/lib/tags.ts`. Every dimension is required; single-select dimensions require exactly one value, while `privacy` may contain multiple valid values. `source:Open Source` is derived from `repoUrl`.
- **Honest status language**: a candidate is either *evaluated* (a `dogfood-session` was finished for it) or *not evaluated*. Never describe an unevaluated candidate as "did not pass", "not yet through the gate", or similar.

## 1. Hard gates (deterministic)

Intake already blocks tracking-param duplicates, same-site slices, tunnels/previews, repository URLs, store listings, and blocked submitters (`src/lib/submission-gates-core.mjs`, used by `/api/submit` and `/api/resubmit`). For the existing queue:

```bash
node scripts/batch-reject-pending.mjs --dry-run      # review the list
node scripts/batch-reject-pending.mjs --execute      # rejects via POST /api/review
```

## 2. Triage (no browser)

```bash
node scripts/triage-pending.mjs                       # new pending items only
```

Outputs `reports/triage/triage-<ts>.md|json` and merges Tier A/B into `reports/evaluation-queue.json`.

Triage is an ordering tool, not a verdict (calibration: static HTML cannot see post-interaction login walls or thin wrappers, and long SEO copy can hide JS-rendered calculators).

- **Tier C** (unreachable, parked, cross-host redirect, login wall, entertainment, directory, static article): open the evidence. When the signal is not self-evident from the triage row, take one screenshot with ego-browser and view it. Then reject only the IDs you confirmed:

  ```bash
  node scripts/triage-pending.mjs --reject-ids 1801,1805
  ```

  A Tier C item you could not confirm stays pending and is re-triaged with `--ids`.
- **Tier A/B**: never rejected or approved from triage alone. They go to the evaluation queue (`reports/evaluation-queue.json`), where submissions with a verified visible SVG badge (`hasExplicitBadge: true` / `badgeDisplayType === 'explicit'`) are automatically prioritized ahead of standard Tier A/B items.

## 3. Deep evaluation (daily quota)

Run by the [`daily-evaluation`](../daily-evaluation/SKILL.md) skill: at least **10** queue items per day via the full `tool-evaluation` protocol. Approval requires:

- core task completed without mandatory login;
- no bait-and-switch export wall or forced commercial watermark;
- grounded EN/ZH evaluation synchronized successfully (`finish --sync` passes the depth gate);
- score at least 70;
- strict Anti-Inflation scoring: Editor's Choice ($\ge 90$) is reserved for verified workstations with Functional Depth $\ge 22$ and empirical architecture proof; standard single-task utilities belong in `capable-utility` (70–79) or `highly-recommended` (80–89).

Do not infer local-only processing solely from a run with no captured payload request.

Record every queue outcome:

```bash
node scripts/lab/evaluation-queue.mjs done <id> --outcome <approved|rejected|deferred> --note "<evidence>"
```

`deferred` is only for operational blockers (site down during test, browser failure) and must name the blocker.

## 4. Prepare metadata and taxonomy

Use objective English metadata and current taxonomy values:

- category: `AI`, `Design`, `Writing`, `Development`, `Productivity`, `Media`, `Privacy`, `Data`, `Communication`, `Education`, or `Finance`;
- data: `Client-Side Only` or `Server-Side`;
- privacy: `No Trackers` or `Privacy Focused`;
- type: `PWA`, `Web App`, `CLI`, `Desktop App`, or `Browser Extension`;
- hosting: `Self-Hostable` or `Cloud Only`;
- offline: `Works Offline` or `Online Only`;
- pricing: `Free`, `Freemium`, or `Ad-Supported`.

## 5. Prepare translations before approval

The site is bilingual (`en` + `zh`). Generate the `zh` locale record (English is the source) with the exact English source embedded as `_source`, allowing pending tools that are not in build data yet:

```json
{
  "example-com": {
    "_source": {
      "description": "Objective English description.",
      "coreTask": "Concrete English core task."
    },
    "zh": {"description": "...", "coreTask": "..."}
  }
}
```

Apply it and verify the changed locale files:

```bash
node scripts/sync-tool-translations.mjs --apply /tmp/translations-<slug>.json
```

Do not use the global `--status` backlog as proof for a single pending record; inspect that slug in `src/data/translations/zh.json`.

## 6. Atomic approval

Write the payload to `/tmp/approve-<slug>.json` and submit:

```bash
node scripts/lib/admin-api.mjs approve-evaluated /tmp/approve-<slug>.json
```

```json
{
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

Verify the proposed value first, then `node scripts/lib/admin-api.mjs approve-edit <id>` or `reject-edit <id> "<reason>"`. The approved edit and suggestion status transition are batched atomically. If description or core task changes, prepare and apply the zh translation before approval. If URL changes, verify identity and collision behavior; community edits intentionally update the slug through the endpoint.

## Output

Report, with exact numbers:

- `hard_gate_rejected`, `triaged` (A/B/C), `tier_c_confirmed_rejected`, `tier_c_left_pending` (with why);
- `evaluated` (distinct slugs with a finished session today — from `node scripts/lab/evaluation-queue.mjs report`), `approved`, `rejected_after_evaluation`, `deferred` (with blockers);
- product scores, translation files changed, edit outcomes, API failures, queue remaining by tier, pending total.

Never report approval before the atomic endpoint succeeds.

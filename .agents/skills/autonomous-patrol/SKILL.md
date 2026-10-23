---
name: autonomous-patrol
description: >-
  Autonomous daily operations orchestrator for nologin.tools. Coordinates intake hard
  gates and triage, health anomaly review, rolling CADES regression scanning, badge and
  GitHub refresh, and the daily SEO audit, then produces one evidence-backed operations
  briefing with coverage metrics. Deep evaluation runs separately in daily-evaluation.
---

# Autonomous Daily Operations Patrol

Use this skill only as the coordinator. Read and follow each delegated skill before executing that phase; do not duplicate or weaken its gates:

- [`../submission-review/SKILL.md`](../submission-review/SKILL.md)
- [`../health-patrol/SKILL.md`](../health-patrol/SKILL.md)
- [`../tool-evaluation/SKILL.md`](../tool-evaluation/SKILL.md)
- [`../daily-seo-audit/SKILL.md`](../daily-seo-audit/SKILL.md)

## Division of labor

| Work | Owner |
|---|---|
| Full-catalog liveness checks | GitHub Actions `health-check.yml` (01:00 + 13:00 UTC) |
| Data export | GitHub Actions `data-export.yml` |
| Deep evaluation of pending submissions + high regression anomalies (quota 10/day) | [`daily-evaluation`](../daily-evaluation/SKILL.md) (separate session) |
| Hard gates, triage, Tier C confirmation, health anomaly review, rolling regression scan, badges, GitHub metadata, SEO | **this skill** |

## Safety invariants

- Never delete a tool record.
- `tools.status` is only `pending`, `approved`, or `rejected`. Liveness is derived from `health_checks`; never write `unstable` into `tools.status`.
- All tool writes go through `scripts/lib/admin-api.mjs`. Run `node scripts/lib/admin-api.mjs ping` at pre-flight; if it fails, report the blocker and skip every write phase instead of using SQL.
- Browser work is sequential. Run `node scripts/clean-browser-spaces.mjs` before and after browser phases.
- Report observed evidence separately from inference. “No payload egress observed” is not proof of local-only processing.

## Daily workflow

1. Pre-flight: browser cleanup, `admin-api.mjs ping`.
2. Submission intake (submission-review §1–§2): `batch-reject-pending.mjs --execute`, `triage-pending.mjs`, confirm and reject Tier C. Do **not** deep-evaluate here.
3. Health (health-patrol): read the latest `health-check.yml` run report; review offline/unstable tools and cross-host redirects.
4. Rolling regression scan:

   ```bash
   node scripts/inspect-tool-dogfood.mjs --rolling 20
   ```

   Rotation comes from `src/data/regression-ledger.json` and always advances. The scan never syncs scores; it records only hard signals into the anomaly queue, which `daily-evaluation` consumes.
5. Badges and GitHub metadata (health-patrol).
6. Daily SEO audit; submit IndexNow only if the audit passes.
7. Post-flight cleanup; commit `src/data/regression-ledger.json` if it changed.
8. Produce one briefing.

## Briefing contract

Each phase is labelled `executed`, `partial (n/m)`, or `skipped (reason)`. Required numbers:

- **Intake**: pending at start, hard-gate rejected, triaged (A/B/C), Tier C confirmed + rejected, Tier C left pending, pending at end, evaluation queue size.
- **Deep evaluation**: copy yesterday's `node scripts/lab/evaluation-queue.mjs report --date <yesterday>`; flag `quota_met: false` prominently.
- **Edit suggestions**: approved, rejected, remaining.
- **Health**: latest workflow run time, tools with fresh (<48h) status / total approved, effective online/unstable/offline, redirects reviewed.
- **Regression**: scanned today, flagged, `regression-ledger.mjs status` output (coverage within 21 days, open high/medium).
- **Ecosystem**: explicit/implicit badges and GitHub refresh results. Explicit badge boost is `+4`; implicit is `+2`.
- **SEO**: pages audited, canonical/schema/internal-link failures, cache coverage, discovery resources, IndexNow endpoint results.

Never describe an unexecuted phase as successful, and never describe unevaluated candidates as having failed a gate.

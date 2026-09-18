---
name: autonomous-patrol
description: >-
  Autonomous daily operations orchestrator for nologin.tools. Coordinates pending
  submission review, health checks, CADES regression triage, badge and GitHub refresh,
  and the daily SEO audit, then produces one evidence-backed operations briefing.
---

# Autonomous Daily Operations Patrol

Use this skill only as the coordinator. Read and follow each delegated skill before executing that phase; do not duplicate or weaken its gates:

- [`../submission-review/SKILL.md`](../submission-review/SKILL.md)
- [`../health-patrol/SKILL.md`](../health-patrol/SKILL.md)
- [`../tool-evaluation/SKILL.md`](../tool-evaluation/SKILL.md)
- [`../daily-seo-audit/SKILL.md`](../daily-seo-audit/SKILL.md)

## Safety invariants

- Never delete a tool record.
- `tools.status` is only `pending`, `approved`, or `rejected`. Liveness is derived from `health_checks`; never write `unstable` into `tools.status`.
- Browser work is sequential. Run `node scripts/clean-browser-spaces.mjs` before and after browser phases.
- Remote writes must use the project APIs or the exact atomic workflow documented by the delegated skill. Do not compose ad-hoc multi-step D1 mutations.
- Report observed evidence separately from inference. “No payload egress observed” is not proof of local-only processing.

## Daily workflow

1. Run the pre-flight browser cleanup.
2. Execute `submission-review` for pending submissions and edit suggestions.
3. Execute `health-patrol` for liveness, redirect, badge, and GitHub metadata maintenance.
4. Run the auxiliary rolling regression scan:

   ```bash
   node scripts/inspect-tool-dogfood.mjs --rolling 20
   ```

   This scan never synchronizes scores. Escalate each anomaly through `tool-evaluation` before changing editorial data or rejecting a previously approved tool.
5. Execute `daily-seo-audit`. Submit IndexNow only if the audit passes.
6. Run the post-flight browser cleanup.
7. Produce one briefing containing exact counts, affected slugs, evidence paths, successful writes, failures, and work left untouched.

## Briefing contract

Include these sections:

- Pending submissions: approved, rejected, remaining, translations synchronized.
- Edit suggestions: approved, rejected, remaining.
- Health: checks recorded, effective online/unstable/offline counts, redirects reviewed, anomalies escalated.
- CADES: auxiliary scans, deep evaluations, regressions, editorial syncs.
- Ecosystem: explicit/implicit badges and GitHub refresh results. Explicit badge boost is `+4`; implicit is `+2`.
- SEO: pages audited, canonical/schema/internal-link failures, cache coverage, discovery resources, and IndexNow endpoint results.

Never describe an unexecuted phase as successful.

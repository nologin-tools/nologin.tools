---
name: health-patrol
description: >-
  Rolling health, redirect, badge, and repository metadata maintenance for
  nologin.tools. Use for recording liveness checks, deriving effective health,
  reviewing permanent redirects, escalating CADES regressions, verifying badges,
  and refreshing GitHub metadata without corrupting tool approval state.
---

# Health Patrol

## Invariants

- Never delete tools and never write `tools.status = 'unstable'`. Approval state and effective health are separate domains.
- Record every liveness result in `health_checks`. Derive `online`, `unstable`, or `offline` with `resolveEffectiveStatus()` semantics: five recent checks, 48-hour freshness, immediate recovery on a fresh successful result.
- Treat every HTTP response except `404` and `410` as reachable. DNS failure, timeout, and connection refusal are offline observations.
- Use `NoLoginTools-HealthChecker/1.0`. Browser work remains sequential.
- One bad observation is evidence, not authorization to reject a tool.

## Liveness checks

Full-catalog checks run in GitHub Actions (`.github/workflows/health-check.yml`, 01:00 and 13:00 UTC) via `scripts/run-health-checks.mjs`, which records every approved tool into `health_checks` and uploads a report artifact with offline tools and cross-host redirects. This keeps every approved tool inside the 48h freshness window; the previous 30-tools-per-day agent patrol covered only ~19%.

Agent responsibilities:

1. Confirm the latest workflow run succeeded (`gh run list --workflow health-check.yml --limit 2`). If it failed or is older than 14h, run it locally:

   ```bash
   node scripts/run-health-checks.mjs --report reports/tmp/health-approved.json
   ```

2. Review each offline/unstable tool and cross-host redirect in the report. Re-check individually with the canonical endpoint when needed:

   ```bash
   node scripts/lib/admin-api.mjs health-check <toolId>
   ```

   The response contains both raw `isOnline` and derived `effectiveStatus`. Preserve both in the patrol report.

Do not mutate `tools.status` for liveness.

## Redirect review

For a permanent redirect:

1. Verify the final destination belongs to the same service and is reachable.
2. Check for URL collision.
3. Update through `POST /api/admin/tool-update` with `preserveSlug: true` so established detail URLs remain stable:

   ```json
   {"secret":"<ADMIN_SECRET>","toolId":123,"url":"https://new.example/","preserveSlug":true}
   ```

4. Record old URL, new URL, final status, and whether the change succeeded.

Do not rewrite the slug during an automatic redirect repair.

## CADES regression triage

Run the rolling detector without synchronization:

```bash
node scripts/inspect-tool-dogfood.mjs --rolling 40
```

Rotation is driven by `src/data/regression-ledger.json` (least recently scanned first) and advances every run; ~8 days per full catalog cycle at 40 per day. The scan records only hard signals (auth wall, export auth bait, watermark, login-to-continue copy, paywall/trial copy, cross-host redirect, lost interactive surface, title identity change, unreachable) into the ledger's anomaly queue. It does not emit core-task rewrite suggestions.

Escalation is done by [`daily-evaluation`](../daily-evaluation/SKILL.md), which re-evaluates 3 approved tools per day (open anomalies first, then the stalest evaluations) and deep-evaluates the queue head via [`../tool-evaluation/SKILL.md`](../tool-evaluation/SKILL.md) and resolves the ledger entry. Only a completed deep evaluation may update editorial data. A confirmed policy violation may be rejected through the review API with the evidence-linked reason; a liveness failure alone must not change approval state.

```bash
node scripts/lab/regression-ledger.mjs status
node scripts/lab/regression-ledger.mjs queue
```

## Badge verification

Use the canonical endpoint, which checks both the primary website and GitHub README and upserts `badge_displays`:

```http
POST /api/badge-verify
{"slug":"example-com"}
```

Respect its cooldown. `explicit` earns `+4`, `implicit` earns `+2`, and `none` earns `0` recommendation points.

## GitHub metadata

Use `POST /api/admin/github-fetch` with `secret` and `toolId`. This keeps repository parsing, authenticated rate limits, and database fields aligned with the application.

## Output

Report latest health workflow run time and coverage (approved tools with a check <48h / total), effective health counts, affected slugs, redirects applied or declined, regression scan count and ledger status, badge classifications, GitHub refresh results, and every failure. Never call an anomalous tool “rejected” unless the review action actually succeeded.

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

Select approved tools only, prioritizing missing or old checks and recent anomalies. Prefer the deployed admin health endpoint so the canonical checker and tolerance logic are used:

```http
POST /api/admin/health-check
{"secret":"<ADMIN_SECRET>","toolId":123}
```

The response contains both raw `isOnline` and derived `effectiveStatus`. Preserve both in the patrol report.

If direct remote maintenance is unavoidable, insert the observation into `health_checks` and query the latest five rows; do not mutate `tools.status`.

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

Run the auxiliary detector without synchronization:

```bash
node scripts/inspect-tool-dogfood.mjs --rolling 20
```

It only finds candidates. For auth traps, watermarks, or major drift, follow [`../tool-evaluation/SKILL.md`](../tool-evaluation/SKILL.md). Only a completed deep evaluation may update editorial data. A confirmed policy violation may be rejected through the review API with the evidence-linked reason; a liveness failure alone must not change approval state.

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

Report raw check counts, effective health counts, affected slugs, redirects applied or declined, CADES escalations, badge classifications, GitHub refresh results, and every failure. Never call an anomalous tool “rejected” unless the review action actually succeeded.

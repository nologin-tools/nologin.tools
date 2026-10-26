---
name: daily-evaluation
description: >-
  Daily deep-evaluation run for nologin.tools. Works through the persistent evaluation
  queue (pending submissions) and re-evaluates approved tools (open regression anomalies
  first, then the stalest evaluations) using the full CADES tool-evaluation protocol, with
  a hard daily quota and evidence-based reporting. Runs as its own scheduled session, separate from autonomous-patrol.
---

# Daily Evaluation

This skill exists because deep evaluation was repeatedly crowded out of the combined patrol: from 2026-10-10 to 2026-10-23 zero evaluations ran while the pending queue grew from ~300 to 559. The quota below is the primary deliverable of this session; nothing else should consume its time.

Read and follow:

- [`../tool-evaluation/SKILL.md`](../tool-evaluation/SKILL.md) — the evaluation protocol
- [`../submission-review/SKILL.md`](../submission-review/SKILL.md) — approval, rejection, translations

## Quota

| Work | Daily minimum |
|---|---|
| Pending submissions (evaluation queue) | **10** (or the whole queue if smaller) |
| Re-evaluation of already-approved tools | **3** |

The quota counts **distinct slugs with a finished, depth-qualified `dogfood-session`** today, as recorded in `reports/evaluations/<date>.jsonl`. Starting and aborting does not count, and neither does a session that fails the depth gate (see [tool-evaluation](../tool-evaluation/SKILL.md): a real input, the core task actually run, exports tried, and depth scores backed by interactions). `node scripts/lab/evaluation-queue.mjs report` splits the count into `pendingEvaluated` and `retested`.

The 3 re-evaluations are chosen by `regression-ledger.mjs retest`: open `high` anomalies first, then open `medium` anomalies, then the approved tools whose last deep evaluation is oldest. Anomalies therefore always jump the line, and when there are none the catalog is still re-verified on a rotation instead of being left untouched.

## Workflow

1. **Pre-flight**
   ```bash
   node scripts/lib/admin-api.mjs ping          # must succeed; otherwise stop and report
   node scripts/clean-browser-spaces.mjs
   node scripts/triage-pending.mjs              # triage new submissions, refresh queue
   ```
   Confirm and reject Tier C items per submission-review §2 (quick; do not let this exceed ~15 minutes).

2. **Re-evaluate approved tools first (3)**
   ```bash
   node scripts/lab/regression-ledger.mjs retest --limit 3
   ```
   Run the full tool-evaluation on each returned tool; `reason` says why it was chosen (`high_anomaly`, `medium_anomaly`, `stale_evaluation`) and `anomalies` lists the evidence the rolling scan recorded. Treat that evidence as a lead, not a verdict: verify it yourself in the browser.
   - Before acting on any verdict, run `node scripts/lab/evaluation-queue.mjs verify <slug> --decision <approve|reject|clear>`. If it fails, keep testing; do not decide on a shallow session.
   - Confirmed policy violation → `node scripts/lib/admin-api.mjs reject <id> "<evidence>"`, then
     `node scripts/lab/regression-ledger.mjs resolve <slug> --outcome rejected --note "<evidence>"`.
   - Still compliant → `finish --sync` updates editorial, refreshes `lastDeepEvalAt`, and auto-resolves open anomalies. If you did not sync, run
     `resolve <slug> --outcome cleared --note "<what you verified>"` (this also records `lastDeepEvalAt`, so the tool moves to the back of the rotation).
   - Score or tier changed noticeably → sync the new evaluation; do not leave stale editorial in place.

3. **Pending queue**
   ```bash
   node scripts/lab/evaluation-queue.mjs next --limit 10
   ```
   For each item, in order:
   - `dogfood-session start` → give a real input → run the core task → `export` when the tool has export → view every screenshot. A login/credit/paywall verdict requires hitting the gate (run the task, try the download), not reading "sign in to download" on the page.
   - Decide:
     - **approve**: `verify <slug> --decision approve` → eval JSON → `finish --eval ... --sync` (the depth gate runs here too) → translations → `admin-api.mjs approve-evaluated` → `evaluation-queue.mjs done <id> --outcome approved --note "score N, tier"`
     - **reject**: `finish` (no sync) → `verify <slug> --decision reject` → `admin-api.mjs reject <id> "<observed evidence>"` → `done <id> --outcome rejected --note "..."`
     - **defer** (operational blocker only): `abort` → `done <id> --outcome deferred --note "<blocker>"`
   - Keep going until 10 distinct slugs are finished or the queue is empty.

4. **Commit editorial/translation/ledger changes**
   Stage only `src/data/tool-editorial.json`, `src/data/translations/*.json`, `src/data/regression-ledger.json`. Commit with a message listing approved/rejected slugs. Do not commit `reports/`.

5. **Post-flight**
   ```bash
   node scripts/clean-browser-spaces.mjs
   node scripts/lab/evaluation-queue.mjs report
   node scripts/lab/regression-ledger.mjs status
   ```

## Briefing contract

Paste the `report` JSON and add:

- `quota_met`: the `quotaMet.pending` and `quotaMet.retest` flags from the report, plus `depthQualifiedSessions` and every entry of `unqualifiedSessions` with what was missing. If either is false, list the concrete blocker for each missing slot (e.g. "browser crashed at item 6, restarted twice"). "Time ran out" is not an acceptable blocker unless the elapsed time per evaluation is listed.
- Approved: slug, score, tier.
- Rejected: slug, evidence sentence.
- Deferred: slug, blocker.
- Re-evaluated tools (3): slug, why it was chosen, resolution (cleared / rejected / editorial updated), and any score or tier change.
- Queue remaining (A/B) and pending total.

Every phase is reported as `executed`, `partial (n/m)`, or `skipped (reason)`. Never describe unevaluated candidates as having failed a gate.

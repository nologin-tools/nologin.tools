---
name: daily-evaluation
description: >-
  Daily deep-evaluation run for nologin.tools. Works through the persistent evaluation
  queue (pending submissions) and the regression anomaly queue (approved tools) using the
  full CADES tool-evaluation protocol, with a hard daily quota and evidence-based
  reporting. Runs as its own scheduled session, separate from autonomous-patrol.
---

# Daily Evaluation

This skill exists because deep evaluation was repeatedly crowded out of the combined patrol: from 2026-10-10 to 2026-10-23 zero evaluations ran while the pending queue grew from ~300 to 559. The quota below is the primary deliverable of this session; nothing else should consume its time.

Read and follow:

- [`../tool-evaluation/SKILL.md`](../tool-evaluation/SKILL.md) — the evaluation protocol
- [`../submission-review/SKILL.md`](../submission-review/SKILL.md) — approval, rejection, translations

## Quota

| Queue | Daily minimum |
|---|---|
| Regression anomalies (`high`) | all open `high` items, max 3 |
| Pending submissions (evaluation queue) | **10** (or the whole queue if smaller) |

The quota counts **distinct slugs with a finished `dogfood-session`** today, as recorded in `reports/evaluations/<date>.jsonl`. Starting a session and aborting it does not count.

## Workflow

1. **Pre-flight**
   ```bash
   node scripts/lib/admin-api.mjs ping          # must succeed; otherwise stop and report
   node scripts/clean-browser-spaces.mjs
   node scripts/triage-pending.mjs              # triage new submissions, refresh queue
   ```
   Confirm and reject Tier C items per submission-review §2 (quick; do not let this exceed ~15 minutes).

2. **Regression anomalies first**
   ```bash
   node scripts/lab/regression-ledger.mjs queue --limit 5
   ```
   For each `high` item (max 3), and `medium` items if time allows: run the full tool-evaluation on the approved tool.
   - Confirmed policy violation → `node scripts/lib/admin-api.mjs reject <id> "<evidence>"`, then
     `node scripts/lab/regression-ledger.mjs resolve <slug> --outcome rejected --note "<evidence>"`.
   - Still compliant → `finish --sync` updates editorial and auto-resolves the ledger; if you did not sync, run
     `resolve <slug> --outcome cleared --note "<what you verified>"`.

3. **Pending queue**
   ```bash
   node scripts/lab/evaluation-queue.mjs next --limit 10
   ```
   For each item, in order:
   - `dogfood-session start` → at least one successful `act` → `export` when the tool has export → view every screenshot.
   - Decide:
     - **approve**: eval JSON → `finish --eval ... --sync` → translations → `admin-api.mjs approve-evaluated` → `evaluation-queue.mjs done <id> --outcome approved --note "score N, tier"`
     - **reject**: `finish` (no sync) → `admin-api.mjs reject <id> "<observed evidence>"` → `done <id> --outcome rejected --note "..."`
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

- `quota_met`: true/false. If false, list the concrete blocker for each missing slot (e.g. "browser crashed at item 6, restarted twice"). "Time ran out" is not an acceptable blocker unless the elapsed time per evaluation is listed.
- Approved: slug, score, tier.
- Rejected: slug, evidence sentence.
- Deferred: slug, blocker.
- Regression: escalated slugs and their resolution.
- Queue remaining (A/B) and pending total.

Every phase is reported as `executed`, `partial (n/m)`, or `skipped (reason)`. Never describe unevaluated candidates as having failed a gate.

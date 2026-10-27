---
name: tool-evaluation
description: >-
  Agent-led CADES 2.0 evaluation for nologin.tools. Use to operate a tool through
  a stateful browser session, inspect screenshots, exercise real fixtures, verify
  export artifacts, assess observed data flow, calibrate the 5D score, and sync a
  grounded bilingual (EN/ZH) editorial record.
---

# Tool Evaluation

Follow [`../../../docs/CADES-2.0-ROUTE-A-SPEC.md`](../../../docs/CADES-2.0-ROUTE-A-SPEC.md). The scripts collect evidence; the Agent remains responsible for visual inspection and judgment.

## Guardrails

- Run browser evaluations sequentially and clean browser spaces before and after a batch.
- A successful `act` or `export` is mandatory. Failed selectors and failed exports do not count.
- **Depth gate (enforced by the tooling, not optional).** A session only backs a decision, and only counts toward the daily quota, when it shows the tool was actually run:
  - **D1** a real input was given (fill, or upload a fixture);
  - **D2** the core task was run after that input: click the run/process/generate/download control, press a key, or run `export`. For a live-updating tool with no run button, read the result after typing. A login wall, credit wall, or paywall must be **observed by hitting it** (run the task, try the download), never inferred from page copy such as "sign in to download";
  - **D3** (approve) if export-like controls are visible, run `export` and inspect the artifact; a failed export attempt still counts as having looked;
  - **D4** (approve) the functional-depth score must be backed by interactions: depth ≥ 13 needs ≥ 3 interactions, depth ≥ 18 needs ≥ 5 (input, trigger, export each count; DOM reads do not). Otherwise exercise more features or lower the score.

  `finish --sync` refuses to synchronize when the gate fails and leaves the session open: keep testing, then run `finish` again. Check any decision before acting on it:

  ```bash
  node scripts/lab/evaluation-queue.mjs verify "<slug>" --decision approve   # or reject / clear
  ```

  `--allow-shallow` never satisfies the gate for an approval or rejection.
- Use `view_image` (or `read_file`) on every screenshot used as evidence **before** calling `finish` or making a reject/approve decision. Never finish or reject a tool without inspecting the post-action screenshots (`dogfood-<slug>-step<N>-action.png`).
- **Sub-route & interactive workbench discovery before rejection**: Many utility platforms host their interactive comparators, client-side file inspectors, playgrounds, or companion browser extensions on primary sub-routes (e.g., `/compare/`, `/benchmark/`, `/inspector/`, `/playground/`, `/extension/`). Before rejecting any site as a "pure directory" or "static article", inspect the top-level navigation links and test at least one interactive sub-route if present. Interactive alternative finders, empirical benchmark comparators, client-side artifact inspectors, and browser extension platforms (e.g., `realtest.org`, `privacytests.org`, `bundlephobia.com`) are valid utilities—not static link directories.
- Network hooks observe traffic after navigation and during tested actions. “No payload egress observed” only describes that bounded observation; it does not prove local-only architecture, offline support, lack of server processing, or data-retention policy. Always inspect the `Sample Endpoints` printed by `dogfood-session.mjs status` and `finish`: if any outgoing payloads (`POST /api/...`, analytics/RUM beacons like `googletagmanager`, `clarity`, `umami`, `/cdn-cgi/rum`) were captured, `privacyVerdict` and `privacyVerdictZh` must name or accurately characterize those observed requests—never claim "zero outgoing network payloads" when `Outgoing Payloads > 0`.
- Do not synchronize heuristic output from the auxiliary rolling probe.
- `finish --sync` requires a valid evaluation baseline (EN/ZH), which is the full editorial record for the site's two active locales (`en`, `zh`). `verdictTier` must strictly match `productScore.overall` (`>= 90` `editors-choice`, `80–89` `highly-recommended`, `70–79` `capable-utility`, `< 70` `emergency-only`). If validation or the depth gate fails, leave the session open, correct the payload or keep testing, and retry.

## Stateful protocol

Start:

```bash
node scripts/lab/dogfood-session.mjs start "<URL>" --slug "<slug>"
```

Inspect `/tmp/dogfood-<slug>-step1-initial.png` with `view_image`.

Exercise the real workflow with one or more successful actions:

```bash
node scripts/lab/dogfood-session.mjs act "<slug>" --upload svg
node scripts/lab/dogfood-session.mjs act "<slug>" --fill "textarea" "grounded test input" --click "Process"
```

Action screenshots are `/tmp/dogfood-<slug>-step<N>-action.png`. Inspect them before scoring.

If export exists, test it. `--trigger` accepts either a case-insensitive text regex or one exact CSS selector prefixed with `css=`:

```bash
node scripts/lab/dogfood-session.mjs export "<slug>" --trigger "Download|Export|Save"
node scripts/lab/dogfood-session.mjs export "<slug>" --trigger "css=button[data-action='export']"
```

Inspect `/tmp/dogfood-<slug>-step-export.png` and the artifact report. Downloads are stored as `/tmp/dogfood-dl-<slug>-<timestamp>.artifact` before format inspection.

The session state is `/tmp/cades-session-<slug>.json`. `status <slug>` prints recorded evidence; `abort <slug>` closes and discards a session.

## Score and editorial payload

Score dimensions must sum exactly to `overall`:

- Frictionless UX: 0–20
- Functional Depth & Fidelity: 0–25 (8–12: single-task scripts; 13–17: configurable utilities; 18–21: light suites; 22–25: elite workstations)
- Export Freedom & Integrity: 0–20
- Privacy & Data Sovereignty: 0–20
- Stability & Visual Polish: 0–15

Use concrete observations. Never award local-only or offline credit from absence of captured requests alone. Auth-gated core tasks, decoy downloads, and forced export watermarks are rejection-level findings.

### Anti-Inflation & High-Score Defense Gate
- **High-Score Defense**: Any score $\ge 90$ (`editors-choice`) requires `depth >= 22` AND documented workstation proof in `benchmarkNotes` or `pros` (e.g. `canvas`, `wasm`, `ast`, `compiler`, `indexeddb`, `multi-layer`, `waveform`).
- Single-purpose utilities and text scripts belong in `capable-utility` (70–79).
- Advanced configurable utilities without workstation architecture belong in `highly-recommended` (80–89).
- The validator strictly blocks any payload attempting to award $\ge 90$ without meeting the High-Score Defense gate.

Create `/tmp/eval-<slug>.json` with at least:

```json
{
  "productScore": {
    "overall": 82,
    "frictionless": 18,
    "depth": 20,
    "exportFreedom": 17,
    "privacy": 14,
    "polish": 13
  },
  "verdictTier": "highly-recommended",
  "bestFor": "A concrete English use case of at least ten characters.",
  "pros": ["Observed technical strength one", "Observed technical strength two"],
  "cons": ["Observed limitation"],
  "privacyVerdict": "A bounded description of the observed network and processing evidence.",
  "benchmarkNotes": "Processed a 180 KB SVG through the visible Optimize button in 65 ms.",
  "bestForZh": "具体的中文适用场景。",
  "prosZh": ["实测技术优点一", "实测技术优点二"],
  "consZh": ["实测限制"],
  "privacyVerdictZh": "对本次测试范围内网络与处理证据的审慎说明。",
  "benchmarkNotesZh": "通过可见的优化按钮在 65ms 内处理 180KB SVG。"
}
```

Allowed tiers are `editors-choice`, `highly-recommended`, `capable-utility`, and `emergency-only`. The linter rejects vague marketing language and ungrounded notes.

Finalize and synchronize:

```bash
node scripts/lab/dogfood-session.mjs finish "<slug>" --eval "/tmp/eval-<slug>.json" --sync
```

Confirm the command succeeds and `src/data/tool-editorial.json` contains the synchronized `en` and `zh` records. A contradictory privacy verdict is rejected.

Every `finish` (with or without `--sync`) appends a line to `reports/evaluations/<date>.jsonl`; that file is the evidence for the daily evaluation quota, including the interaction metrics the depth gate judged. A successful `--sync` also resolves any open anomalies for the slug in `src/data/regression-ledger.json`.

## Auxiliary regression scan

`inspect-tool-dogfood.mjs --rolling` is evidence collection only:

```bash
node scripts/inspect-tool-dogfood.mjs --rolling 40
node scripts/inspect-tool-dogfood.mjs "<URL>" --slug "<slug>" --packet-file "/tmp/packet-<slug>.json"
```

Rolling selection is least-recently-scanned first from `src/data/regression-ledger.json`. It records hard signals only (no core-task rewrite suggestions) into the ledger's anomaly queue (`node scripts/lab/regression-ledger.mjs queue`), which `daily-evaluation` escalates through this protocol.

`--rolling --sync` is forbidden. A single-tool sync additionally requires `--eval-file`; prefer the stateful protocol above for canonical reviews.

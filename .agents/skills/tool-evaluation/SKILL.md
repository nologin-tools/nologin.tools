---
name: tool-evaluation
description: >-
  Agent-led CADES 2.0 evaluation for nologin.tools. Use to operate a tool through
  a stateful browser session, inspect screenshots, exercise real fixtures, verify
  export artifacts, assess observed data flow, calibrate the 5D score, and sync a
  grounded 8-locale editorial record.
---

# Tool Evaluation

Follow [`../../../docs/CADES-2.0-ROUTE-A-SPEC.md`](../../../docs/CADES-2.0-ROUTE-A-SPEC.md). The scripts collect evidence; the Agent remains responsible for visual inspection and judgment.

## Guardrails

- Run browser evaluations sequentially and clean browser spaces before and after a batch.
- A successful `act` or `export` is mandatory. Failed selectors and failed exports do not count.
- Use `view_image` on every screenshot used as evidence.
- Network hooks observe traffic after navigation and during tested actions. “No payload egress observed” only describes that bounded observation; it does not prove local-only architecture, offline support, lack of server processing, or data-retention policy.
- Do not synchronize heuristic output from the auxiliary rolling probe.
- `finish --sync` requires a valid evaluation baseline (EN/ZH), which the system automatically expands and validates across all 8 supported locales (`en`, `zh`, `ja`, `ko`, `es`, `fr`, `de`, `pt`). If validation fails, leave the session open, correct the payload, and retry.

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

Confirm the command succeeds and `src/data/tool-editorial.json` contains synchronized records across all 8 supported locales (`en`, `zh`, `ja`, `ko`, `es`, `fr`, `de`, `pt`). A contradictory privacy verdict is rejected.

## Auxiliary regression scan

`inspect-tool-dogfood.mjs` is triage only:

```bash
node scripts/inspect-tool-dogfood.mjs --rolling 20
node scripts/inspect-tool-dogfood.mjs "<URL>" --slug "<slug>" --packet-file "/tmp/packet-<slug>.json"
```

`--rolling --sync` is forbidden. A single-tool sync additionally requires `--eval-file`; prefer the stateful protocol above for canonical reviews.

---
name: tool-evaluation
description: >-
  Comprehensive CADES 2.0 evaluation and NoLogin Lab product benchmark protocol for nologin.tools.
  Use this skill to conduct hands-on dogfooding of any tool, drive ego-browser interactions,
  test grounded fixtures and file export integrity, inspect visual renderings and watermarks,
  calculate 5D anti-inflation product scores, and generate bilingual qualitative editorial reviews for tool-editorial.json.
---

# Tool Evaluation & NoLogin Lab Benchmark (`tool-evaluation`)

This skill defines the **empirical vetting and dogfooding standard** for `nologin.tools`, based on the **CADES 2.0 Route A Specification** (`docs/CADES-2.0-ROUTE-A-SPEC.md`).

It acts as the single source of truth for:
1. Evaluating candidate tools during review (Gatekeeper).
2. Performing rolling quality audits and anomaly escalation during daily health patrols.
3. Conducting ad-hoc deep dogfooding of any tool upon direct user request.

---

## 1. Operating Principles & Anti-Inflation Philosophy

1. **Empirical Truth Over Marketing Claims**: Never trust homepage hero text or vendor marketing slogans. Every tool must be personally operated in a live browser, fed real test fixtures, and tested for export integrity.
2. **Zero-Tolerance Anti-Bait-Trap**: Tools that appear free but trigger a mandatory login/paywall modal upon clicking "Export", "Download", or "Save" are hard-rejected or immediately marked unstable.
3. **Anti-Inflation 5D Calibration**: Scores are calibrated strictly against a 0–100 scale:
   - **Editor's Choice ($\ge 90$)**: Top 12–15% elite web apps (zero-egress, Wasm/Canvas, aesthetic polish, instant frictionless export).
   - **Highly Recommended (80–89)**: Robust, production-grade tools with zero friction and high utility.
   - **Capable Utility (70–79)**: Simple single-purpose utilities (e.g. text counter, Base64 encoder) with basic UI.
   - **Sub-Standard / Reject ($< 70$)**: Clunky UX, deceptive ads, stealth paywalls, or commercial watermarks.
4. **Strict Concurrency Guardrail**:
   - All browser operations (`ego-browser`, `inspect-tool-dogfood.mjs`, `dogfood-session.mjs`, `benchmark.mjs`) **MUST run sequentially (`concurrency = 1`)**.
   - Never spawn parallel subagents running `ego-browser` simultaneously.
   - Always close browser sessions upon completion via `await task.finish({ keep: [] })`.
   - Run `node scripts/clean-browser-spaces.mjs` before and after evaluation batches.

---

## 2. Execution Paths

The Agent can evaluate a tool using either of two paths depending on the depth required:

### Path A: Deterministic Baseline Harness (Fast / Batch / Rolling)
Use this path for quick gatekeeper checks, batch rolling audits, or baseline packet synthesis:

```bash
# Evaluate a single URL and write cognitive packet
node scripts/inspect-tool-dogfood.mjs "<URL>" --slug "<slug>" --packet-file "/tmp/packet-<slug>.json"

# Rolling audit across oldest-tested tools
node scripts/inspect-tool-dogfood.mjs --rolling 20 --sync
```

If the site is blocked by login walls or fails export with bait traps, the script exits with non-zero or failure indicators. Otherwise, it generates `/tmp/packet-<slug>.json` containing visual snapshot paths, DOM accessibility tree summary, network payload logs, and artifact forensic findings.

---

### Path B: Stateful Multi-Turn Agent Dogfooding (Interactive / Deep)
Use this path for in-depth testing, complex canvas/editor tools, or when investigating suspicious behaviors across multiple interaction turns:

#### Turn 1: Start Session & Capture Landing Snapshot
```bash
node scripts/lab/dogfood-session.mjs start "<URL>" --slug "<slug>"
```
- Outputs session status and initial screenshot path: `/tmp/cades-<slug>-initial.png`.
- **Agent Visual Eye-Check**: Use `view_file` on the screenshot to inspect:
  - Modern layout, responsive design, absence of deceptive "Download" ad banners.
  - Zero overlay banners forcing login or newsletter subscription.

#### Turn 2: Act & Inject Realistic Fixture
Operate the interface by selecting inputs, typing data, or uploading fixtures:
```bash
# Upload a standard fixture (available in scripts/lab/fixtures/: sample.png, sample.svg, sample.json, sample.md)
node scripts/lab/dogfood-session.mjs act "<slug>" --action upload --fixture sample.png --selector "input[type=file]"

# Or perform targeted typing / clicking
node scripts/lab/dogfood-session.mjs act "<slug>" --action type --selector "textarea.editor" --text "Hello NoLogin"
node scripts/lab/dogfood-session.mjs act "<slug>" --action click --selector "button#process"
```

#### Turn 3: Trigger Export & Audit Artifact
```bash
node scripts/lab/dogfood-session.mjs export "<slug>" --selector "button#export, a[download]"
```
- Triggers browser download and captures outcome screenshot: `/tmp/cades-<slug>-outcome.png`.
- Runs forensic analysis via `scripts/lab/inspectors/output-inspector.mjs`:
  - **Magic Bytes Validation**: Verifies exported file matches expected MIME type header (not an HTML error/login page saved as `.png`).
  - **Watermark & Anti-Bait Check**: Scans for burned-in watermark signatures or post-action paywall modals.
  - **Zero-Egress Interception**: Audits network log to determine if user data left the browser (100% Client-Side vs Cloud Processed).

#### Turn 4: Visual Confirmation & Multi-Turn Assessment
- **Agent Visual Eye-Check**: Use `view_file` on `/tmp/cades-<slug>-outcome.png` to ensure:
  - The rendered output rendered with high fidelity.
  - No corner stamps, watermark overlays, or disabled feature locks.

---

## 3. Anti-Inflation 5D Calibration & Score Synthesis

Evaluate the tool across the 5 canonical dimensions (0–100 total):

| Dimension | Max Pts | Criteria & Deductions |
| :--- | :---: | :--- |
| **1. Frictionless UX** | **20** | Full score (20) if usable in <3s, zero modal interruptions. Deduct 3–5 for cookie consent spam or non-obstructive newsletter nags. |
| **2. Functional Depth & Fidelity** | **25** | Full score (23–25) for high-precision, feature-rich tools (Wasm/Canvas/complex parser). Deduct 5–10 for trivial single-field wrappers. |
| **3. Export Freedom & Integrity** | **20** | Full score (20) for instant, full-resolution export with valid Magic Bytes. Deduct 10 for forced delay/countdowns. Score **0 & Fail** for paywalls or watermarks. |
| **4. Privacy & Data Sovereignty** | **20** | Full score (20) for zero-egress purely client-side tools (WebAssembly, Web Crypto, HTML5 Canvas). Deduct 5–8 if payload is sent to cloud backend without tracking; deduct 15 if third-party trackers are attached. |
| **5. Stability & Visual Polish** | **15** | Full score (15) for pristine modern typography, dark mode support, fluid responsiveness. Deduct 3–6 for dated layout, broken styles, or console errors. |

---

## 4. Grounded Editorial Synthesis & Sync

Synthesize authentic, human-like editorial reviews in `/tmp/eval-<slug>.json` without boilerplate templates:

```json
{
  "slug": "<slug>",
  "testedAt": "<ISO-8601-TIMESTAMP>",
  "productScore": 88,
  "tier": "highly-recommended",
  "scores": {
    "frictionlessUx": 19,
    "functionalDepth": 22,
    "exportFreedom": 20,
    "privacySovereignty": 18,
    "stabilityPolish": 14
  },
  "en": {
    "bestFor": "Target persona and exact workflow scenario (e.g. Frontend developers needing zero-latency SVG path minification).",
    "pros": [
      "100% client-side WebAssembly execution with zero server egress.",
      "Real-time visual diff preview with side-by-side node inspection.",
      "Instant copy-to-clipboard and SVG download without watermarks."
    ],
    "cons": [
      "Lacks batch processing for multiple files at once.",
      "Heavy files (>5MB) may stutter on low-memory mobile browsers."
    ],
    "privacyVerdict": "Architectural verdict: All calculations occur in-memory via client-side Wasm. No telemetry or analytics endpoints were contacted.",
    "alternativeTo": "SVGO CLI, CloudConvert"
  },
  "zh": {
    "bestFor": "目标用户人群与具体使用工作流（例如：需要零延迟优化矢量图标的前端与 UI 设计师）。",
    "pros": [
      "纯客户端 WebAssembly 执行，计算全本地无云端外发。",
      "支持节点级实时视觉差异比对与路径高精度微调。",
      "一键复制与无水印原生 SVG 导出，无强制下载等待。"
    ],
    "cons": [
      "目前暂不支持多文件批量拖拽压缩。",
      "超过 5MB 的超大复杂矢量图在移动端可能出现轻微卡顿。"
    ],
    "privacyVerdict": "数据主权架构鉴定：全流程内存处理，网络拦截确认未产生任何非必要遥测或第三方追踪请求。",
    "alternativeTo": "SVGO 命令行工具、各类在线云转换网盘"
  }
}
```

### Sync to `src/data/tool-editorial.json`:
```bash
node scripts/inspect-tool-dogfood.mjs "<URL>" --slug "<slug>" --eval-file "/tmp/eval-<slug>.json" --sync
```

---

## 5. Output Verification & Summary Contract

When `tool-evaluation` completes, report:
1. **Tool Name & URL**: Canonical slug.
2. **Product Score & Tier**: e.g., `⚡ 88 / 100 (Highly Recommended)`.
3. **5D Breakdown**: UX / Depth / Export / Privacy / Polish.
4. **Artifact Forensics**: Magic Bytes result, Watermark check (`CLEAN` / `WATERMARKED`), Zero-egress status (`LOCAL` / `CLOUD`).
5. **Key Editorial Takeaway**: 1-line summary of `bestFor`.

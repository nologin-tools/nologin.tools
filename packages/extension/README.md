# NoLogin Quick Switcher v2.0 — Browser Extension

> The privacy-first browser companion that surfaces CADES 2.0 lab scores & 100% client-side badges on search engine results, detects paywalls and forced-login SaaS across 55+ domains, and switches you to verified zero-signup alternatives in one click.

## Core Interaction Model (Non-Intrusive by Design)

1. **Search Engine Results Pages (Google, Bing, DuckDuckGo, Baidu, Yahoo, Brave, Startpage, Ecosia, Kagi, Yandex, Sogou, 360 Search)**:
   - `content.js` runs strictly on SERPs (with redirect unwrapping, ad/sitelink skipping, and Google `scaleY(-1)` wrapper protection) to render a single, low-noise inline badge strip per matched domain:
     - **Verified Tools (`.nl-serp-verified`)**: Displays `🛡️ NoLogin Verified · ⚡ 95/100 (Editor's Choice) · 🔒 100% Local · Lab Report ↗` plus direct `vs` comparison links;
     - **Paywalled / Signup-Gated SaaS (`.nl-serp-paywall`)**: Warns `⚡ Signup Wall · Free No-Login Switch:` with 1-click links to verified replacements (e.g., `Photopea ⚡95`, `Excalidraw ⚡96`) before you click into a signup wall;
     - **Top SERP Multi-Tool Comparison Bar (`#nl-serp-summary-bar`)**: Appears at the top of the search results column whenever ≥ 2 verified tools or alternatives match on the page.
2. **Tool & SaaS Websites (Zero DOM Injection)**:
   - The extension **never injects floating cards, banners, or CSS** into tool websites, ensuring zero interference with canvases, editors, or export buttons.
   - Instead, `background.js` updates the **browser toolbar icon badge**:
     - Shows the **CADES 2.0 integer score** (e.g., `95` in emerald `#059669`) when visiting one of the 320+ NoLogin Verified tools;
     - Shows the **available alternative count** (e.g., `4` in amber `#d97706`) when visiting a closed or paywalled SaaS platform (Canva, Figma, Smallpdf, Notion, WeTransfer, etc.).
   - Clicking the toolbar icon opens the **bilingual (EN / 中文) Popup HUD** (`popup/popup.html`) featuring:
     - **Verified Tool 5D Lab Card**: CADES 2.0 overall score (`/100`), 5D sub-scores (`UX`, `Depth`, `Export`, `Privacy`, `Polish`), capability pills (`100% Local`, `Offline`, `Open Source`), lab verdict, 1-click `vs` comparison, and top category peers;
     - **Paywall Switcher Banner**: 1-click launch for verified zero-login replacements and link to the full `/alternative/[slug]` matrix;
     - **1-Click Unlisted Tool Nomination**: Pre-fills `https://nologin.tools/submit?url=...` when visiting an unindexed website;
     - **Spotlight-Style Mini-Finder**: Instant search across 320+ tools with Scenario Presets (`⚡ Top Scored`, `🔒 100% Local`, `★ Editor's Choice`, `🐙 Open Source`), category pills, and keyboard navigation (`↑` / `↓` / `Enter` / `Esc`).
3. **24-Hour Silent Remote Sync**:
   - Ships with bundled offline snapshots (`src/extension-index.{en,zh}.json`) for 0ms lookup, and refreshes every 24 hours from `https://nologin.tools/api/extension-index.json` (and `/zh/api/extension-index.json`).

## How to Install (Developer Mode / Unpacked)

### Google Chrome / Brave / Microsoft Edge / Ego
1. Run `pnpm run build:extension` from the repository root.
2. Open `chrome://extensions` (or `brave://extensions`, `edge://extensions`).
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select `packages/extension`.

### Build / Package Distribution
```bash
node scripts/build-extension.mjs
```
Outputs dual distribution packages to `dist-extension/` and `public/downloads/`:
- `nologin-quick-switcher-chrome.zip` (Chrome / Edge / Brave MV3)
- `nologin-quick-switcher-firefox.zip` (Firefox MV3 with Gecko ID)

## License
CC0-1.0 Universal / MIT

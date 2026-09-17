# NoLogin Quick Switcher - Browser Extension

> The privacy-friendly browser extension that automatically detects paywalls and forced logins, recommending verified zero-signup alternatives in one click.

## Features

- **Contextual Alternative Detection**: Identifies when you are visiting restrictive, closed, or paywalled web tools and recommends verified zero-signup alternatives upon opening the extension.
- **Instant Mini-Finder**: Search, filter, and discover 180+ verified zero-login web tools without leaving your current tab.
- **100% Client-Side Privacy**: Zero tracking, zero analytics, minimal declarative permission (`activeTab`). Bundled offline database.

## How to Install (Developer Mode / Unpacked)

### Google Chrome / Brave / Microsoft Edge
1. Open `chrome://extensions` (or `brave://extensions`, `edge://extensions`).
2. Enable **Developer mode** toggle in the top-right corner.
3. Click **Load unpacked**.
4. Select the `packages/extension` directory from this repository.
5. The NoLogin Tools shield icon will appear in your browser toolbar!

### Build / Package Distribution
To package a distribution `.zip` for the Chrome Web Store or Firefox Add-ons:
```bash
node scripts/build-extension.mjs
```
The output zip will be placed at `dist-extension/nologin-quick-switcher-chrome.zip`.

## License
CC0-1.0 Universal

# Chrome Web Store Listing Submission Kit (v2.0)

## 1. Store Metadata

- **Extension Name**: NoLogin Tools - Zero-Signup Switcher
  *(37 / 45 characters)*
- **Short Description**:
  Spot CADES-verified zero-login tools & 100% local badges on search results, bypass SaaS signup walls, and switch in one click.
  *(126 / 132 characters)*
- **Extension ID**: `hblmlbgnglelpkogmadngkjepiapnnon`
- **Store URL**: https://chromewebstore.google.com/detail/hblmlbgnglelpkogmadngkjepiapnnon
- **Reviews URL**: https://chromewebstore.google.com/detail/hblmlbgnglelpkogmadngkjepiapnnon/reviews
- **Category**: Productivity
- **Primary Language**: English (with built-in English & Chinese bilingual UI)
- **Website**: https://nologin.tools/extension
- **Support URL**: https://github.com/nologin-tools/nologin.tools/issues
- **Privacy Policy URL**: https://nologin.tools/privacy

---

## 2. Detailed Description (Paste into Chrome Developer Dashboard)

NoLogin Tools (v2.0) is a zero-telemetry browser companion powered by the NoLogin Lab CADES 2.0 benchmark. It surfaces verified zero-login scores right on search engine result pages and lets you switch from restrictive, signup-walled web services to 100% client-side, account-free web utilities in one click.

### 🌟 Key Features in v2.0

1. **Search Engine Result Badges & Signup Wall Alerts**:
   Directly on search engine result pages, view single-line `🛡️ NoLogin Verified · ⚡ 95/100 · 🔒 100% Local` badges next to verified tools, plus `⚡ Signup Wall · Free No-Login Switch` links beneath signup-walled results before you even click.

2. **Non-Intrusive Toolbar Score Badge & 5D Lab HUD**:
   Zero floating overlays or DOM clutter on tool websites. The toolbar icon displays the CADES 2.0 integer score (such as `95`) on 320+ verified tools or the available alternative count (such as `4`) when visiting restrictive commercial web applications. Open the panel to inspect five-dimensional sub-scores (`UX`, `Depth`, `Export`, `Privacy`, `Polish`) alongside head-to-head comparisons.

3. **Instant Spotlight Mini-Finder with Scenario Presets**:
   Browse and search 320+ verified zero-login web applications with full keyboard navigation (`↑` / `↓` / `Enter`) and 1-click scenario chips (`⚡ Top Scored`, `🔒 100% Local`, `★ Editor's Choice ≥90`, `🐙 Open Source`).

4. **24-Hour Silent Index Sync & Bilingual UI (EN / 中文)**:
   Works instantaneously offline from its bundled index and refreshes every 24 hours from `https://nologin.tools/api/extension-index.json`.

---

### 🔒 Privacy-First Architecture & Permission Justifications

In strict accordance with the Chrome Web Store Minimum Permissions Policy:

- `activeTab` & `tabs`: Used strictly locally inside your browser to match the active tab's hostname against the local benchmark index so the toolbar icon badge (e.g. `95` or `4`) and popup panel stay in sync. Tab URLs never leave your device.
- `storage`: Used exclusively to cache the public benchmark index snapshot (`extension-index.json`) and language preference in `chrome.storage.local` for instant offline lookup.
- `host_permissions` (`https://nologin.tools/*`): Used solely to perform a read-only GET request once every 24 hours to `https://nologin.tools/api/extension-index.json` to refresh the public benchmark snapshot, without sending any user identifiers or browsing context.
- Search Engine Content Scripts: Runs strictly on search result pages to render read-only score badges and alternative links. Zero content scripts or CSS are injected into third-party tool websites.

**Zero Telemetry & Transparency Disclosures**:
- No tracking scripts, analytics beacons, or browsing history collection.
- Dedicated Privacy Policy: https://nologin.tools/privacy
- Fully Open Source and publicly audited: https://github.com/nologin-tools/nologin.tools

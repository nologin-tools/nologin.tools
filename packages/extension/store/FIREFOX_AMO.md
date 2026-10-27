# Mozilla Add-ons (AMO) Submission Kit (v2.0)

## 1. Add-on Listing Information

- **Add-on Name**: NoLogin Tools - Zero-Signup Switcher
- **Summary**:
  Spot CADES-verified zero-login tools & 100% local badges on search results, bypass SaaS signup walls, and switch in one click. Telemetry-free.
  *(142 / 250 characters)*
- **Add-on ID**: `extension@nologin.tools`
- **Homepage**: https://nologin.tools/extension
- **Support Email / URL**: https://github.com/nologin-tools/nologin.tools/issues
- **Privacy Policy**: https://nologin.tools/privacy
- **License**: MIT License

---

## 2. Description (For AMO Reviewer & Users)

Break free from mandatory account creation, email verification gates, and subscription traps.

NoLogin Tools (v2.0) is a lightweight, privacy-focused extension powered by the NoLogin Lab CADES 2.0 benchmark. It surfaces verified zero-login scores on search results, detects when you are visiting restrictive commercial web services, and recommends vetted, client-side, zero-login alternatives.

### ✨ Features
- **Search Engine (SERP) Badges & Signup Wall Switcher**: Displays single-line CADES 2.0 score strips and no-login alternative links directly on search engine result pages.
- **Toolbar Score Badge & 5D Lab HUD**: Shows the CADES 2.0 integer score (`95`) on 320+ verified tools or available alternative counts (`4`) when visiting restrictive commercial web services, with zero DOM injection on tool websites.
- **Offline Tool Directory & 24h Sync**: Instantly search 320+ verified tools in English or Chinese, with scenario presets (`100% Local`, `Editor's Choice`, `Open Source`) and daily silent index updates.
- **Pure Client-Side Execution**: All search and matching logic executes locally in Firefox with zero telemetry.

### 🛡️ Permissions Disclosures
- `activeTab` & `tabs`: Examines only the active tab's hostname locally in Firefox to update the toolbar badge and match relevant alternatives. Never transmits browsing history.
- `storage`: Caches the public `extension-index.json` snapshot locally.
- `host_permissions` (`https://nologin.tools/*`): Refreshes the public benchmark index once every 24 hours via a read-only GET request.

### 📦 Source Code & Build Instructions
This add-on is completely open source:
Repository: https://github.com/nologin-tools/nologin.tools
Subdirectory: `packages/extension/`
Build command: `node scripts/build-extension.mjs`
Zero minified dependencies or obfuscated code.
Dedicated Privacy Policy: https://nologin.tools/privacy

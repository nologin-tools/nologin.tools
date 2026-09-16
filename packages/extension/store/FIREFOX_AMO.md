# Mozilla Add-ons (AMO) Submission Kit

## 1. Add-on Listing Information

- **Add-on Name**: NoLogin Tools - Zero-Signup Switcher
- **Summary**:
  Instantly discover verified zero-login, private in-browser alternatives when browsing closed or paywalled web tools. 100% offline and telemetry-free.
  *(150 / 250 characters)*
- **Add-on ID**: `extension@nologin.tools`
- **Homepage**: https://nologin.tools
- **Support Email / URL**: https://github.com/nologin-tools/nologin.tools/issues
- **Privacy Policy**: https://nologin.tools/about
- **License**: MIT License

---

## 2. Description (For AMO Reviewer & Users)

Break free from mandatory account creation, email verification gates, and subscription traps.

NoLogin Tools is a lightweight, privacy-focused extension that detects when you are visiting restrictive commercial SaaS services (like Canva, Miro, Grammarly, WeTransfer, or Photoshop) and recommends vetted, client-side, zero-login alternatives (like Photopea, Excalidraw, LanguageTool, Wormhole, and Squoosh).

### ✨ Features
- **Smart Domain Detection**: Automatically matches your current active tab against an offline database of privacy alternatives.
- **Offline Tool Directory**: Instantly search 180+ verified tools with zero remote network requests.
- **Privacy Audit Grades**: Displays independent privacy scorecard badges (A+, A, B+) and sandbox isolation indicators.
- **Pure Client-Side Execution**: All search and matching logic executes locally in Firefox with zero telemetry.

### 🛡️ Permissions Disclosures
- `activeTab`: Examines only the active tab's hostname upon clicking the toolbar icon to match relevant alternatives. Never monitors background browsing or accesses sensitive DOM data.
- `storage`: Preserves your saved tools and UI settings locally.

### 📦 Source Code & Build Instructions
This add-on is completely open source:
Repository: https://github.com/nologin-tools/nologin.tools
Subdirectory: `packages/extension/`
Build command: `node scripts/build-extension.mjs`
Zero minified dependencies or obfuscated code.

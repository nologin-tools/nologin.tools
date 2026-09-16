# Chrome Web Store Listing Submission Kit

## 1. Store Metadata

- **Extension Name**: NoLogin Tools - Zero-Signup Switcher
  *(37 / 45 characters)*
- **Short Description**:
  Instantly discover verified zero-login, private in-browser alternatives when browsing closed or paywalled web tools.
  *(116 / 132 characters)*
- **Category**: Productivity
- **Primary Language**: English
- **Website**: https://nologin.tools
- **Support URL**: https://github.com/nologin-tools/nologin.tools/issues
- **Privacy Policy URL**: https://nologin.tools/about

---

## 2. Detailed Description (Paste into Chrome Developer Dashboard)

Tired of mandatory signup walls, "Sign in with Google" prompts, and credit card traps just to edit a PDF, convert an image, or inspect a JSON payload?

NoLogin Tools is a lightweight, zero-telemetry browser companion that instantly suggests verified, privacy-respecting in-browser alternatives that work immediately with zero account registration.

### 🌟 Key Features

1. **Contextual Alternative Detection**:
   Visiting Canva, Photoshop, Grammarly, WeTransfer, Loom, or Miro? Click the NoLogin extension to instantly see vetted in-browser alternatives (like Photopea, Excalidraw, Squoosh, Wormhole, and LanguageTool) that execute locally on your device without signing up.

2. **Instant Offline Tool Search**:
   Search 180+ verified no-login web applications directly from your browser toolbar. Filter by category, client-side execution, offline PWA capability, and open-source license.

3. **Privacy & Sandbox Audit Signals**:
   Quickly see whether a tool runs 100% in local WebAssembly memory, its verified privacy audit grade (A+, A, B+), and uptime health signals verified by NoLoginTools.org.

4. **1-Click Launch**:
   Open clean, distraction-free tools immediately with zero onboarding friction.

---

### 🔒 Privacy-First Architecture & Permission Justifications

In strict accordance with the Chrome Web Store Minimum Permissions Policy:

- `activeTab`: Used exclusively when you click the extension popup to check the current domain (e.g., `canva.com` or `miro.com`) to match relevant no-login alternatives. The extension CANNOT read page content, forms, passwords, keystrokes, or browsing history.
- `storage`: Used solely to store your favorite tools and local search preferences on your device.

**Zero Telemetry Guarantee**:
- No Google Analytics, no tracking scripts, no telemetry beacons.
- Works 100% offline using bundled local metadata.
- Open Source and audited: https://github.com/nologin-tools/nologin.tools

---

### 🏷️ Recommended Tags & Keywords
`privacy`, `no login`, `free tools`, `pdf editor`, `image converter`, `json formatter`, `open source`, `productivity`, `offline tools`

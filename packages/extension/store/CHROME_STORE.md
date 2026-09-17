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
- **Privacy Policy URL**: https://nologin.tools/privacy

---

## 2. Detailed Description (Paste into Chrome Developer Dashboard)

Tired of mandatory signup walls, "Sign in with Google" prompts, and credit card traps just to edit a PDF, convert an image, or inspect a JSON payload?

NoLogin Tools is a lightweight, zero-telemetry browser companion that instantly suggests verified, privacy-respecting in-browser alternatives that work immediately with zero account registration.

### 🌟 Key Features

1. **Contextual Alternative Detection**:
   Browsing paywalled, closed, or restrictive web applications (such as graphics editors, diagram whiteboards, grammar checkers, document converters, or file sharing services)? Click the NoLogin extension to instantly discover vetted in-browser alternatives that execute locally on your device without signing up.

2. **Instant Offline Tool Search**:
   Search 180+ verified no-login web applications directly from your browser toolbar. Filter by category, client-side execution, offline PWA capability, and open-source license.

3. **Privacy & Sandbox Audit Signals**:
   Quickly see whether a tool runs 100% in local WebAssembly memory, its verified privacy audit grade (A+, A, B+), and uptime health signals verified by NoLoginTools.org.

4. **1-Click Launch**:
   Open clean, distraction-free tools immediately with zero onboarding friction.

---

### 🔒 Privacy-First Architecture & Permission Justifications

In strict accordance with the Chrome Web Store Minimum Permissions Policy:

- `activeTab`: Used exclusively when you explicitly click the extension popup to inspect the active tab's domain name (such as matching a web application domain) to suggest relevant no-login alternatives from an offline database. The extension CANNOT and DOES NOT read page content, forms, passwords, keystrokes, background navigation, or browsing history.

**Zero Telemetry & Transparency Disclosures**:
- Bundled Database: All tool directories and alternative mappings execute 100% locally from bundled metadata.
- Asset Disclosure: To display visual website icons in the tool list, public domain hostnames are retrieved via Google Favicon Service. Zero user identifiers, personal information, or browsing habits are transmitted.
- No tracking scripts, analytics beacons, or remote code execution.
- Dedicated Privacy Policy: https://nologin.tools/privacy
- Fully Open Source and publicly audited: https://github.com/nologin-tools/nologin.tools

---

### 🏷️ Recommended Tags & Keywords
`privacy`, `no login`, `free tools`, `pdf editor`, `image converter`, `json formatter`, `open source`, `productivity`, `offline tools`

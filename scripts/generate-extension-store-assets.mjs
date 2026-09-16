import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const storeDir = resolve(ROOT, 'packages/extension/store');

mkdirSync(storeDir, { recursive: true });

// 1. Small Promo Tile (440 x 280)
const smallPromoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="280" viewBox="0 0 440 280" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#022c22" />
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="440" height="280" fill="url(#bgGrad)" />

  <!-- Subtle grid lines -->
  <path d="M0 70 H440 M0 140 H440 M0 210 H440 M110 0 V280 M220 0 V280 M330 0 V280" stroke="#ffffff" stroke-opacity="0.04" stroke-width="1" />

  <!-- Ambient Glow -->
  <circle cx="220" cy="90" r="70" fill="#10b981" fill-opacity="0.15" filter="url(#glow)" />

  <!-- Shield Icon -->
  <g transform="translate(196, 50)">
    <rect width="48" height="48" rx="14" fill="url(#shieldGrad)" />
    <path d="M24 11 L35 15.5 V23.5 C35 30.5 29.5 35 24 37 C18.5 35 13 30.5 13 23.5 V15.5 Z" fill="#ffffff" fill-opacity="0.95" />
    <path d="M19.5 23.5 L22.5 27 L28.5 20.5" stroke="#047857" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <!-- Title & Tagline -->
  <text x="220" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle" letter-spacing="-0.5">
    NoLogin Tools
  </text>
  <text x="220" y="156" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="13" fill="#10b981" text-anchor="middle" letter-spacing="0.5">
    ZERO-SIGNUP SWITCHER
  </text>
  <text x="220" y="184" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="12" fill="#94a3b8" text-anchor="middle">
    Instant In-Browser Privacy Alternatives
  </text>

  <!-- Feature Pills -->
  <g transform="translate(55, 218)">
    <rect x="0" y="0" width="100" height="26" rx="13" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.12" />
    <text x="50" y="17" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="10.5" fill="#e2e8f0" text-anchor="middle">⚡ 0 Accounts</text>

    <rect x="115" y="0" width="100" height="26" rx="13" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.12" />
    <text x="165" y="17" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="10.5" fill="#e2e8f0" text-anchor="middle">🔒 100% Local</text>

    <rect x="230" y="0" width="100" height="26" rx="13" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.12" />
    <text x="280" y="17" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="10.5" fill="#e2e8f0" text-anchor="middle">🛡️ Zero Telemetry</text>
  </g>
</svg>`;

// 2. Large Marquee Tile (1400 x 560)
const marqueeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="560" viewBox="0 0 1400 560" fill="none">
  <defs>
    <linearGradient id="mqBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#030712" />
      <stop offset="50%" stop-color="#091428" />
      <stop offset="100%" stop-color="#022c22" />
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.95" />
    </linearGradient>
    <filter id="mqGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="40" result="blur" />
    </filter>
  </defs>

  <rect width="1400" height="560" fill="url(#mqBg)" />

  <!-- Ambient Glow -->
  <circle cx="1050" cy="280" r="220" fill="#10b981" fill-opacity="0.2" filter="url(#mqGlow)" />

  <!-- Left Side: Copy & Headlines -->
  <g transform="translate(100, 140)">
    <rect x="0" y="0" width="180" height="34" rx="17" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-opacity="0.4" />
    <text x="90" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="13" fill="#34d399" text-anchor="middle" letter-spacing="1">OFFICIAL EXTENSION</text>

    <text x="0" y="90" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="54" fill="#ffffff" letter-spacing="-1.5">
      NoLogin Tools
    </text>
    <text x="0" y="145" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="28" fill="#10b981" letter-spacing="-0.5">
      Zero-Signup Switcher &amp; Privacy HUD
    </text>
    <text x="0" y="195" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="18" fill="#94a3b8">
      Browse closed, paywalled web tools? Instantly get 100% free,
    </text>
    <text x="0" y="225" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="18" fill="#94a3b8">
      client-side in-browser alternatives with zero account creation.
    </text>

    <!-- Stats row -->
    <g transform="translate(0, 275)">
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="26" fill="#ffffff">180+</text>
      <text x="0" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="13" fill="#64748b">Verified Tools</text>

      <text x="140" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="26" fill="#10b981">0</text>
      <text x="140" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="13" fill="#64748b">Accounts Needed</text>

      <text x="310" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="26" fill="#38bdf8">100%</text>
      <text x="310" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="13" fill="#64748b">Local Memory Execution</text>
    </g>
  </g>

  <!-- Right Side: Graphic UI Preview Card -->
  <g transform="translate(860, 65)">
    <!-- Browser Mockup Window -->
    <rect width="440" height="430" rx="20" fill="url(#cardGrad)" stroke="#334155" stroke-width="2" />
    <!-- Window Controls -->
    <circle cx="28" cy="24" r="6" fill="#ef4444" />
    <circle cx="48" cy="24" r="6" fill="#f59e0b" />
    <circle cx="68" cy="24" r="6" fill="#10b981" />
    <rect x="110" y="14" width="220" height="20" rx="10" fill="#0f172a" />
    <text x="220" y="28" font-family="monospace" font-size="10" fill="#64748b" text-anchor="middle">canva.com/design/...</text>

    <!-- Alternative Alert Banner -->
    <g transform="translate(24, 52)">
      <rect width="392" height="74" rx="12" fill="#064e3b" stroke="#10b981" stroke-width="1.5" />
      <text x="16" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="13" fill="#34d399">💡 No-Login Alternatives for Canva</text>
      <text x="16" y="46" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="11" fill="#a7f3d0">Edit graphics &amp; diagrams instantly in local browser RAM</text>
    </g>

    <!-- Tool Items -->
    <!-- Tool 1: Photopea -->
    <g transform="translate(24, 140)">
      <rect width="392" height="72" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1" />
      <text x="20" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="15" fill="#ffffff">Photopea</text>
      <rect x="95" y="14" width="60" height="18" rx="9" fill="#10b981" fill-opacity="0.2" />
      <text x="125" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="9" fill="#34d399" text-anchor="middle">GRADE A+</text>
      <text x="20" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="11" fill="#94a3b8">Advanced PSD &amp; raster editing · WebGL WASM</text>
      <rect x="310" y="20" width="66" height="28" rx="8" fill="#10b981" />
      <text x="343" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="11" fill="#ffffff" text-anchor="middle">Launch</text>
    </g>

    <!-- Tool 2: Excalidraw -->
    <g transform="translate(24, 224)">
      <rect width="392" height="72" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1" />
      <text x="20" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="15" fill="#ffffff">Excalidraw</text>
      <rect x="105" y="14" width="60" height="18" rx="9" fill="#10b981" fill-opacity="0.2" />
      <text x="135" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="9" fill="#34d399" text-anchor="middle">GRADE A+</text>
      <text x="20" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="11" fill="#94a3b8">Hand-drawn whiteboard &amp; diagrams · E2EE</text>
      <rect x="310" y="20" width="66" height="28" rx="8" fill="#10b981" />
      <text x="343" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="11" fill="#ffffff" text-anchor="middle">Launch</text>
    </g>

    <!-- Tool 3: Squoosh -->
    <g transform="translate(24, 308)">
      <rect width="392" height="72" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1" />
      <text x="20" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="15" fill="#ffffff">Squoosh</text>
      <rect x="88" y="14" width="60" height="18" rx="9" fill="#10b981" fill-opacity="0.2" />
      <text x="118" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="9" fill="#34d399" text-anchor="middle">GRADE A+</text>
      <text x="20" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="11" fill="#94a3b8">WebAssembly image codec with visual diffing</text>
      <rect x="310" y="20" width="66" height="28" rx="8" fill="#10b981" />
      <text x="343" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="11" fill="#ffffff" text-anchor="middle">Launch</text>
    </g>
  </g>
</svg>`;

// 3. Screenshot Preview (1280 x 800)
const screenshotSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800" fill="none">
  <defs>
    <linearGradient id="scBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
  </defs>

  <!-- Desktop Browser Canvas -->
  <rect width="1280" height="800" fill="url(#scBg)" />

  <!-- Window Header -->
  <rect x="40" y="30" width="1200" height="740" rx="16" fill="#ffffff" />
  <rect x="40" y="30" width="1200" height="46" rx="16" fill="#f1f5f9" />
  <circle cx="68" cy="53" r="6" fill="#ef4444" />
  <circle cx="88" cy="53" r="6" fill="#f59e0b" />
  <circle cx="108" cy="53" r="6" fill="#10b981" />

  <!-- Address Bar with Extension Button -->
  <rect x="180" y="40" width="700" height="26" rx="13" fill="#ffffff" stroke="#cbd5e1" />
  <text x="210" y="57" font-family="monospace" font-size="12" fill="#475569">https://www.canva.com/pricing</text>
  <circle cx="920" cy="53" r="14" fill="#047857" />
  <text x="920" y="58" font-family="-apple-system, sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle">n</text>

  <!-- Webpage Background Simulation (Canva Paywall) -->
  <g transform="translate(100, 130)">
    <text x="0" y="30" font-family="-apple-system, sans-serif" font-weight="900" font-size="32" fill="#1e293b">Choose your Canva plan</text>
    <text x="0" y="60" font-family="-apple-system, sans-serif" font-weight="500" font-size="16" fill="#64748b">Mandatory account creation and monthly billing required to continue.</text>

    <!-- Paywall fake cards -->
    <rect x="0" y="90" width="220" height="280" rx="12" fill="#f8fafc" stroke="#e2e8f0" />
    <rect x="250" y="90" width="220" height="280" rx="12" fill="#f8fafc" stroke="#e2e8f0" />
  </g>

  <!-- Open Extension Popover (Right Overlay) -->
  <g transform="translate(740, 70)">
    <rect width="460" height="660" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" filter="drop-shadow(0 20px 25px rgba(0,0,0,0.25))" />

    <!-- Popover Header -->
    <rect width="460" height="64" rx="16" fill="#0f172a" />
    <rect y="48" width="460" height="16" fill="#0f172a" />
    <text x="24" y="38" font-family="-apple-system, sans-serif" font-weight="900" font-size="18" fill="#ffffff">nologin.tools</text>
    <rect x="150" y="24" width="76" height="20" rx="10" fill="#10b981" fill-opacity="0.2" />
    <text x="188" y="38" font-family="-apple-system, sans-serif" font-weight="800" font-size="10" fill="#34d399" text-anchor="middle">SWITCHER</text>

    <!-- Search Input -->
    <g transform="translate(24, 80)">
      <rect width="412" height="40" rx="10" fill="#f8fafc" stroke="#cbd5e1" />
      <text x="14" y="25" font-family="-apple-system, sans-serif" font-size="13" fill="#94a3b8">Search 180+ verified privacy tools...</text>
    </g>

    <!-- Contextual Suggestion Banner -->
    <g transform="translate(24, 134)">
      <rect width="412" height="68" rx="12" fill="#ecfdf5" stroke="#10b981" />
      <text x="16" y="24" font-family="-apple-system, sans-serif" font-weight="800" font-size="13" fill="#065f46">Detected: Canva</text>
      <text x="16" y="44" font-family="-apple-system, sans-serif" font-weight="500" font-size="11" fill="#047857">Switch to verified zero-account in-browser alternatives:</text>
    </g>

    <!-- Tool Card 1 -->
    <g transform="translate(24, 216)">
      <rect width="412" height="110" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
      <text x="16" y="30" font-family="-apple-system, sans-serif" font-weight="800" font-size="16" fill="#0f172a">Photopea</text>
      <rect x="100" y="16" width="64" height="20" rx="6" fill="#10b981" />
      <text x="132" y="30" font-family="-apple-system, sans-serif" font-weight="800" font-size="10" fill="#ffffff" text-anchor="middle">GRADE A+</text>
      <text x="16" y="56" font-family="-apple-system, sans-serif" font-size="12" fill="#475569">Advanced image &amp; raster graphics editor. Supports PSD, XCF.</text>
      <text x="16" y="86" font-family="-apple-system, sans-serif" font-weight="700" font-size="11" fill="#059669">✓ 100% In-Browser  ✓ Zero Accounts</text>
      <rect x="320" y="36" width="76" height="34" rx="8" fill="#0f172a" />
      <text x="358" y="58" font-family="-apple-system, sans-serif" font-weight="700" font-size="12" fill="#ffffff" text-anchor="middle">Launch &rarr;</text>
    </g>

    <!-- Tool Card 2 -->
    <g transform="translate(24, 340)">
      <rect width="412" height="110" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
      <text x="16" y="30" font-family="-apple-system, sans-serif" font-weight="800" font-size="16" fill="#0f172a">Excalidraw</text>
      <rect x="110" y="16" width="64" height="20" rx="6" fill="#10b981" />
      <text x="142" y="30" font-family="-apple-system, sans-serif" font-weight="800" font-size="10" fill="#ffffff" text-anchor="middle">GRADE A+</text>
      <text x="16" y="56" font-family="-apple-system, sans-serif" font-size="12" fill="#475569">Virtual whiteboard for sketching hand-drawn diagrams.</text>
      <text x="16" y="86" font-family="-apple-system, sans-serif" font-weight="700" font-size="11" fill="#059669">✓ E2E Encrypted  ✓ Collaborative</text>
      <rect x="320" y="36" width="76" height="34" rx="8" fill="#0f172a" />
      <text x="358" y="58" font-family="-apple-system, sans-serif" font-weight="700" font-size="12" fill="#ffffff" text-anchor="middle">Launch &rarr;</text>
    </g>

    <!-- Tool Card 3 -->
    <g transform="translate(24, 464)">
      <rect width="412" height="110" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
      <text x="16" y="30" font-family="-apple-system, sans-serif" font-weight="800" font-size="16" fill="#0f172a">Squoosh</text>
      <rect x="90" y="16" width="64" height="20" rx="6" fill="#10b981" />
      <text x="122" y="30" font-family="-apple-system, sans-serif" font-weight="800" font-size="10" fill="#ffffff" text-anchor="middle">GRADE A+</text>
      <text x="16" y="56" font-family="-apple-system, sans-serif" font-size="12" fill="#475569">WebAssembly image compression with real-time diffing.</text>
      <text x="16" y="86" font-family="-apple-system, sans-serif" font-weight="700" font-size="11" fill="#059669">✓ Client-Side Only  ✓ No Server Logs</text>
      <rect x="320" y="36" width="76" height="34" rx="8" fill="#0f172a" />
      <text x="358" y="58" font-family="-apple-system, sans-serif" font-weight="700" font-size="12" fill="#ffffff" text-anchor="middle">Launch &rarr;</text>
    </g>

    <!-- Footer link -->
    <text x="230" y="620" font-family="-apple-system, sans-serif" font-weight="600" font-size="11" fill="#94a3b8" text-anchor="middle">Verified by NoLoginTools.org · 100% Free &amp; Open Source</text>
  </g>
</svg>`;

writeFileSync(resolve(storeDir, 'promo-small-440x280.svg'), smallPromoSvg, 'utf8');
writeFileSync(resolve(storeDir, 'marquee-1400x560.svg'), marqueeSvg, 'utf8');
writeFileSync(resolve(storeDir, 'screenshot-1280x800.svg'), screenshotSvg, 'utf8');

console.log('Generated extension store artwork assets:');
console.log(' - promo-small-440x280.svg');
console.log(' - marquee-1400x560.svg');
console.log(' - screenshot-1280x800.svg');

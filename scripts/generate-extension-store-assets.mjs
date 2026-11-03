import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const storeDir = resolve(ROOT, 'packages/extension/store');

mkdirSync(storeDir, { recursive: true });

// ---------------------------------------------------------------------------
// 1. Small Promo Tile (440 x 280) — Chrome Web Store Small Tile
// ---------------------------------------------------------------------------
const smallPromoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="280" viewBox="0 0 440 280" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#071118" />
      <stop offset="55%" stop-color="#0b1f28" />
      <stop offset="100%" stop-color="#063730" />
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#08695d" />
    </linearGradient>
    <filter id="glow" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="440" height="280" fill="url(#bgGrad)" />

  <!-- Subtle architectural grid -->
  <path d="M0 56 H440 M0 112 H440 M0 168 H440 M0 224 H440 M88 0 V280 M176 0 V280 M264 0 V280 M352 0 V280" stroke="#ffffff" stroke-opacity="0.035" stroke-width="1" />

  <!-- Ambient Glow -->
  <circle cx="220" cy="72" r="64" fill="#10b981" fill-opacity="0.16" filter="url(#glow)" />

  <!-- Top Brand Header Pill -->
  <g transform="translate(80, 18)">
    <rect width="280" height="24" rx="12" fill="#08695d" fill-opacity="0.35" stroke="#10b981" stroke-opacity="0.45" />
    <text x="140" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="10.5" fill="#6ee7b7" text-anchor="middle" letter-spacing="0.8">CADES 2.0 PRIVACY &amp; LAB BENCHMARK</text>
  </g>

  <!-- Shield Icon + Toolbar Score Badge Preview -->
  <g transform="translate(184, 52)">
    <rect width="46" height="46" rx="12" fill="url(#shieldGrad)" stroke="#34d399" stroke-opacity="0.4" />
    <path d="M23 10 L34 14.5 V22.5 C34 29.5 28.5 34 23 36 C17.5 34 12 29.5 12 22.5 V14.5 Z" fill="#ffffff" fill-opacity="0.96" />
    <path d="M18.5 22.5 L21.5 26 L27.5 19.5" stroke="#08695d" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
    <!-- Live Toolbar Score Badge "95" -->
    <rect x="34" y="28" width="28" height="18" rx="5" fill="#08695d" stroke="#ffffff" stroke-width="1.5" />
    <text x="48" y="40.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="11" fill="#ffffff" text-anchor="middle">95</text>
  </g>

  <!-- Title & Core Selling Points -->
  <text x="220" y="124" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="23" fill="#ffffff" text-anchor="middle" letter-spacing="-0.5">
    NoLogin Tools v2.0
  </text>
  <text x="220" y="146" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="12" fill="#34d399" text-anchor="middle" letter-spacing="0.4">
    SERP TRUTH BADGES · PAYWALL SWITCHER · 5D HUD
  </text>

  <!-- Live SERP Badge Strip Preview -->
  <g transform="translate(22, 162)">
    <rect width="396" height="32" rx="6" fill="#f5f9f8" stroke="#10b981" stroke-width="1.2" />
    <text x="12" y="20.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="11" fill="#08695d">✓ NoLogin Verified</text>
    <rect x="118" y="7" width="42" height="18" rx="3.5" fill="#08695d" />
    <text x="139" y="19.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="10" fill="#ffffff" text-anchor="middle">95/100</text>
    <text x="168" y="20.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="10.5" fill="#17694c">· Editor&apos;s Choice · 100% Local</text>
    <text x="384" y="20.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="10.5" fill="#08695d" text-anchor="end">Report ↗</text>
  </g>

  <!-- 4 Key Metric Pills -->
  <g transform="translate(22, 212)">
    <rect x="0" y="0" width="94" height="44" rx="8" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.14" />
    <text x="47" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="14" fill="#ffffff" text-anchor="middle">320+</text>
    <text x="47" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="9.5" fill="#94a3b8" text-anchor="middle">Verified Tools</text>

    <rect x="101" y="0" width="94" height="44" rx="8" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.14" />
    <text x="148" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="14" fill="#fbbf24" text-anchor="middle">55+</text>
    <text x="148" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="9.5" fill="#94a3b8" text-anchor="middle">SaaS Switchers</text>

    <rect x="202" y="0" width="94" height="44" rx="8" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.14" />
    <text x="249" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="14" fill="#34d399" text-anchor="middle">30+</text>
    <text x="249" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="9.5" fill="#94a3b8" text-anchor="middle">Search &amp; AI SERPs</text>

    <rect x="303" y="0" width="93" height="44" rx="8" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.14" />
    <text x="349.5" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="14" fill="#38bdf8" text-anchor="middle">0 DOM</text>
    <text x="349.5" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="9.5" fill="#94a3b8" text-anchor="middle">Canvas Clutter</text>
  </g>
</svg>`;

// ---------------------------------------------------------------------------
// 2. Large Marquee Tile (1400 x 560) — Chrome Web Store Marquee Banner
// ---------------------------------------------------------------------------
const marqueeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="560" viewBox="0 0 1400 560" fill="none">
  <defs>
    <linearGradient id="mqBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050b14" />
      <stop offset="50%" stop-color="#0a1929" />
      <stop offset="100%" stop-color="#042f28" />
    </linearGradient>
    <filter id="mqGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="45" result="blur" />
    </filter>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.4" />
    </filter>
  </defs>

  <rect width="1400" height="560" fill="url(#mqBg)" />
  <path d="M0 112 H1400 M0 224 H1400 M0 336 H1400 M0 448 H1400 M280 0 V560 M560 0 V560 M840 0 V560 M1120 0 V560" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1" />

  <!-- Ambient Glow -->
  <circle cx="1020" cy="280" r="240" fill="#10b981" fill-opacity="0.18" filter="url(#mqGlow)" />

  <!-- Left Side: Copy & Value Proposition -->
  <g transform="translate(80, 96)">
    <rect x="0" y="0" width="330" height="34" rx="17" fill="#08695d" fill-opacity="0.3" stroke="#10b981" stroke-opacity="0.5" />
    <text x="165" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="12" fill="#6ee7b7" text-anchor="middle" letter-spacing="0.8">OFFICIAL V2.0 · CADES 2.0 LAB BENCHMARK</text>

    <text x="0" y="92" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="54" fill="#ffffff" letter-spacing="-1.5">
      NoLogin Tools
    </text>
    <text x="0" y="142" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="24" fill="#34d399" letter-spacing="-0.3">
      SERP Truth Badges · Paywall Switcher · 5D Lab HUD
    </text>
    <text x="0" y="188" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="17" fill="#cbd5e1">
      Spot CADES 2.0 lab scores &amp; signup-wall alerts on 30+ Search &amp; AI engines.
    </text>
    <text x="0" y="216" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="17" fill="#cbd5e1">
      Switch from 55+ signup-walled SaaS apps to 320+ zero-login tools in 1 click.
    </text>

    <!-- 4-Pillar Stats Row -->
    <g transform="translate(0, 260)">
      <rect x="0" y="0" width="136" height="74" rx="10" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.12" />
      <text x="18" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="26" fill="#ffffff">320+</text>
      <text x="18" y="56" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="12" fill="#94a3b8">CADES Verified</text>

      <rect x="150" y="0" width="136" height="74" rx="10" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.12" />
      <text x="168" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="26" fill="#fbbf24">55+</text>
      <text x="168" y="56" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="12" fill="#94a3b8">SaaS Switchers</text>

      <rect x="300" y="0" width="136" height="74" rx="10" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.12" />
      <text x="318" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="26" fill="#34d399">30+</text>
      <text x="318" y="56" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="12" fill="#94a3b8">Search &amp; AI SERPs</text>

      <rect x="450" y="0" width="136" height="74" rx="10" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.12" />
      <text x="468" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="26" fill="#38bdf8">0 DOM</text>
      <text x="468" y="56" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="12" fill="#94a3b8">Canvas Clutter</text>
    </g>
  </g>

  <!-- Right Side: Dual-Layer Live UI Showcase (SERP Annotations + v2.0 5D HUD) -->
  <g transform="translate(715, 44)">
    <!-- Card 1: Realistic Google Search SERP Card -->
    <g filter="url(#cardShadow)">
      <rect width="615" height="260" rx="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
      <rect width="615" height="34" rx="14" fill="#f1f3f4" />
      <rect y="20" width="615" height="14" fill="#f1f3f4" />
      <circle cx="18" cy="17" r="4.5" fill="#ea4335" />
      <circle cx="32" cy="17" r="4.5" fill="#fbbc05" />
      <circle cx="46" cy="17" r="4.5" fill="#34a853" />
      <rect x="66" y="6" width="390" height="22" rx="11" fill="#ffffff" stroke="#dadce0" />
      <text x="80" y="20.5" font-family="Arial, sans-serif" font-size="10.5" fill="#202124">https://www.google.com/search?q=photo+editor+no+signup</text>
      <rect x="470" y="6" width="128" height="22" rx="6" fill="#e6f4f1" stroke="#b8dcd4" />
      <text x="534" y="20.5" font-family="-apple-system, sans-serif" font-weight="800" font-size="10" fill="#08695d" text-anchor="middle">🌐 30+ SERPs Ready</text>

      <!-- Mini Google Header Strip -->
      <g transform="translate(18, 42)">
        <text x="0" y="18" font-family="Arial, sans-serif" font-weight="700" font-size="18" letter-spacing="-0.5">
          <tspan fill="#4285F4">G</tspan><tspan fill="#EA4335">o</tspan><tspan fill="#FBBC05">o</tspan><tspan fill="#4285F4">g</tspan><tspan fill="#34A853">l</tspan><tspan fill="#EA4335">e</tspan>
        </text>
        <rect x="72" y="2" width="360" height="22" rx="11" fill="#ffffff" stroke="#dfe1e5" />
        <text x="86" y="16.5" font-family="Arial, sans-serif" font-size="10.5" fill="#202124">online photo editor no signup</text>
        <line x1="0" y1="28" x2="579" y2="28" stroke="#ebebeb" stroke-width="1" />
      </g>

      <!-- Result 1: Verified (Google Style) -->
      <g transform="translate(18, 78)">
        <circle cx="9" cy="9" r="9" fill="#e6f4f1" />
        <text x="9" y="12.5" font-family="Arial, sans-serif" font-weight="800" font-size="9.5" fill="#08695d" text-anchor="middle">P</text>
        <text x="24" y="8" font-family="Arial, sans-serif" font-size="10" fill="#202124">Photopea</text>
        <text x="24" y="18" font-family="Arial, sans-serif" font-size="9" fill="#4d5156">https://www.photopea.com  ⋮</text>
        <text x="0" y="34" font-family="Arial, sans-serif" font-size="14" fill="#1a0dab">Photopea | Online Photo Editor — PSD, AI, XD, Sketch</text>
        <rect x="0" y="40" width="560" height="22" rx="4" fill="#f5f9f8" stroke="#cfe3de" />
        <text x="8" y="54.5" font-family="-apple-system, sans-serif" font-weight="700" font-size="10.5" fill="#08695d">✓ NoLogin Verified</text>
        <rect x="114" y="43.5" width="38" height="15" rx="3" fill="#08695d" />
        <text x="133" y="54" font-family="-apple-system, sans-serif" font-weight="800" font-size="9.5" fill="#ffffff" text-anchor="middle">95/100</text>
        <text x="158" y="54.5" font-family="-apple-system, sans-serif" font-weight="600" font-size="10" fill="#17694c">· Editor&apos;s Choice · 100% Local · Offline</text>
        <text x="550" y="54.5" font-family="-apple-system, sans-serif" font-weight="700" font-size="10" fill="#08695d" text-anchor="end">Lab Report ↗ · vs Canva ↗</text>
      </g>

      <!-- Result 2: Paywall Switch (Google Style) -->
      <g transform="translate(18, 152)">
        <circle cx="9" cy="9" r="9" fill="#e0f2fe" />
        <text x="9" y="12.5" font-family="Arial, sans-serif" font-weight="800" font-size="9.5" fill="#0284c7" text-anchor="middle">C</text>
        <text x="24" y="8" font-family="Arial, sans-serif" font-size="10" fill="#202124">Canva</text>
        <text x="24" y="18" font-family="Arial, sans-serif" font-size="9" fill="#4d5156">https://www.canva.com › photo-editor  ⋮</text>
        <text x="0" y="34" font-family="Arial, sans-serif" font-size="14" fill="#1a0dab">Free Online Photo Editor: Free &amp; easy image editing - Canva</text>
        <rect x="0" y="40" width="560" height="22" rx="4" fill="#fff9ed" stroke="#eadcbe" />
        <text x="8" y="54.5" font-family="-apple-system, sans-serif" font-weight="700" font-size="10.5" fill="#996112">⚡ Signup Wall · No-Login Switch:</text>
        <rect x="194" y="43" width="78" height="16" rx="3" fill="#f0f7f5" stroke="#cfe3de" />
        <text x="200" y="54" font-family="-apple-system, sans-serif" font-weight="700" font-size="9.5" fill="#08695d">Photopea</text>
        <rect x="248" y="44" width="18" height="14" rx="2" fill="#08695d" />
        <text x="257" y="53.5" font-family="-apple-system, sans-serif" font-weight="800" font-size="9" fill="#ffffff" text-anchor="middle">95</text>
        <rect x="278" y="43" width="84" height="16" rx="3" fill="#f0f7f5" stroke="#cfe3de" />
        <text x="284" y="54" font-family="-apple-system, sans-serif" font-weight="700" font-size="9.5" fill="#08695d">Excalidraw</text>
        <rect x="338" y="44" width="18" height="14" rx="2" fill="#08695d" />
        <text x="347" y="53.5" font-family="-apple-system, sans-serif" font-weight="800" font-size="9" fill="#ffffff" text-anchor="middle">96</text>
        <text x="550" y="54.5" font-family="-apple-system, sans-serif" font-weight="700" font-size="10" fill="#996112" text-anchor="end">Compare All (4) ↗</text>
      </g>
    </g>

    <!-- Card 2: v2.0 5D Lab HUD & Toolbar Score Badge (Overlapping Bottom Card) -->
    <g transform="translate(55, 252)" filter="url(#cardShadow)">
      <rect width="560" height="224" rx="14" fill="#f6f8f9" stroke="#08695d" stroke-width="2" />
      <!-- Header -->
      <g transform="translate(16, 12)">
        <rect width="22" height="22" rx="5" fill="#08695d" />
        <path d="M7 11 L10 14 L15.5 8.5" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
        <text x="30" y="16" font-family="-apple-system, sans-serif" font-weight="800" font-size="14" fill="#08695d">nologin.tools</text>
        <rect x="122" y="3" width="32" height="16" rx="3" fill="#e6f4f1" stroke="#b8dcd4" />
        <text x="138" y="14" font-family="-apple-system, sans-serif" font-weight="700" font-size="9.5" fill="#08695d" text-anchor="middle">v2.0</text>
        <text x="164" y="15" font-family="-apple-system, sans-serif" font-weight="500" font-size="10.5" fill="#5c6b73">Zero Signup · CADES 2.0 Lab HUD</text>
        <rect x="444" y="1" width="84" height="20" rx="4" fill="#08695d" />
        <text x="486" y="14.5" font-family="-apple-system, sans-serif" font-weight="800" font-size="10" fill="#ffffff" text-anchor="middle">Badge: 95</text>
      </g>

      <!-- Inner Verified 5D Card -->
      <g transform="translate(16, 42)">
        <rect width="528" height="166" rx="8" fill="#ffffff" stroke="#b8dcd4" stroke-width="1.5" />
        <rect width="4" height="166" rx="2" fill="#08695d" />
        <circle cx="18" cy="20" r="4" fill="#08695d" />
        <text x="28" y="24" font-family="-apple-system, sans-serif" font-weight="700" font-size="11.5" fill="#08695d">✓ NoLogin Verified</text>
        <rect x="142" y="11" width="86" height="18" rx="3" fill="#f0f7f5" stroke="#cfe3de" />
        <text x="185" y="23" font-family="-apple-system, sans-serif" font-weight="700" font-size="10" fill="#17694c" text-anchor="middle">Editor&apos;s Choice</text>
        <rect x="454" y="10" width="58" height="22" rx="4" fill="#08695d" />
        <text x="483" y="25" font-family="-apple-system, sans-serif" font-weight="800" font-size="12" fill="#ffffff" text-anchor="middle">95/100</text>

        <text x="16" y="48" font-family="-apple-system, sans-serif" font-weight="800" font-size="14" fill="#18252c">Photopea (photopea.com)</text>
        <text x="200" y="48" font-family="-apple-system, sans-serif" font-weight="600" font-size="11" fill="#17694c">· 100% Client-Side · Works Offline · Free</text>

        <!-- 5D Progress Grid -->
        <g transform="translate(16, 58)">
          <rect width="496" height="44" rx="5" fill="#f4f9f8" stroke="#dce9e6" />
          <!-- UX -->
          <g transform="translate(10, 8)">
            <text x="0" y="10" font-family="-apple-system, sans-serif" font-weight="600" font-size="10" fill="#5c6b73">UX</text>
            <text x="82" y="10" font-family="monospace" font-weight="800" font-size="10" fill="#08695d" text-anchor="end">19/20</text>
            <rect x="0" y="17" width="82" height="5" rx="2.5" fill="#dce9e6" />
            <rect x="0" y="17" width="78" height="5" rx="2.5" fill="#08695d" />
          </g>
          <!-- Depth -->
          <g transform="translate(108, 8)">
            <text x="0" y="10" font-family="-apple-system, sans-serif" font-weight="600" font-size="10" fill="#5c6b73">Depth</text>
            <text x="82" y="10" font-family="monospace" font-weight="800" font-size="10" fill="#08695d" text-anchor="end">24/25</text>
            <rect x="0" y="17" width="82" height="5" rx="2.5" fill="#dce9e6" />
            <rect x="0" y="17" width="79" height="5" rx="2.5" fill="#08695d" />
          </g>
          <!-- Export -->
          <g transform="translate(206, 8)">
            <text x="0" y="10" font-family="-apple-system, sans-serif" font-weight="600" font-size="10" fill="#5c6b73">Export</text>
            <text x="82" y="10" font-family="monospace" font-weight="800" font-size="10" fill="#08695d" text-anchor="end">19/20</text>
            <rect x="0" y="17" width="82" height="5" rx="2.5" fill="#dce9e6" />
            <rect x="0" y="17" width="78" height="5" rx="2.5" fill="#08695d" />
          </g>
          <!-- Privacy -->
          <g transform="translate(304, 8)">
            <text x="0" y="10" font-family="-apple-system, sans-serif" font-weight="600" font-size="10" fill="#5c6b73">Privacy</text>
            <text x="82" y="10" font-family="monospace" font-weight="800" font-size="10" fill="#08695d" text-anchor="end">19/20</text>
            <rect x="0" y="17" width="82" height="5" rx="2.5" fill="#dce9e6" />
            <rect x="0" y="17" width="78" height="5" rx="2.5" fill="#08695d" />
          </g>
          <!-- Polish -->
          <g transform="translate(402, 8)">
            <text x="0" y="10" font-family="-apple-system, sans-serif" font-weight="600" font-size="10" fill="#5c6b73">Polish</text>
            <text x="82" y="10" font-family="monospace" font-weight="800" font-size="10" fill="#08695d" text-anchor="end">14/15</text>
            <rect x="0" y="17" width="82" height="5" rx="2.5" fill="#dce9e6" />
            <rect x="0" y="17" width="76" height="5" rx="2.5" fill="#08695d" />
          </g>
        </g>

        <!-- Action Buttons + Peers -->
        <g transform="translate(16, 114)">
          <rect x="0" y="0" width="210" height="32" rx="5" fill="#08695d" />
          <text x="105" y="20" font-family="-apple-system, sans-serif" font-weight="700" font-size="11.5" fill="#ffffff" text-anchor="middle">Lab Report &amp; Details ↗</text>

          <rect x="220" y="0" width="130" height="32" rx="5" fill="#f0f7f5" stroke="#99cbc0" />
          <text x="285" y="20" font-family="-apple-system, sans-serif" font-weight="700" font-size="11.5" fill="#08695d" text-anchor="middle">vs Canva ↗</text>

          <rect x="360" y="0" width="136" height="32" rx="5" fill="#f6faf9" stroke="#cfe3de" />
          <text x="428" y="20" font-family="-apple-system, sans-serif" font-weight="700" font-size="11" fill="#08695d" text-anchor="middle">EN / 中文 Bilingual</text>
        </g>
      </g>
    </g>
  </g>
</svg>`;

// ---------------------------------------------------------------------------
// 3. Screenshot 1 (1280 x 800): Realistic Google Search (SERP) + Floating Dark Callout Card
// ---------------------------------------------------------------------------
const screenshotSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800" fill="none">
  <defs>
    <linearGradient id="sc1Bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06101a" />
      <stop offset="55%" stop-color="#0d2130" />
      <stop offset="100%" stop-color="#05332b" />
    </linearGradient>
    <linearGradient id="floatHudBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b1926" />
      <stop offset="100%" stop-color="#072925" />
    </linearGradient>
    <filter id="scShadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="20" stdDeviation="24" flood-color="#000000" flood-opacity="0.48" />
    </filter>
    <filter id="floatShadow" x="-12%" y="-10%" width="128%" height="128%">
      <feDropShadow dx="-6" dy="22" stdDeviation="22" flood-color="#000000" flood-opacity="0.62" />
    </filter>
    <filter id="googleBarShadow" x="-4%" y="-15%" width="108%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3.5" flood-color="#3c4043" flood-opacity="0.18" />
    </filter>
  </defs>

  <rect width="1280" height="800" fill="url(#sc1Bg)" />

  <!-- Top Feature Banner Header -->
  <g transform="translate(46, 26)">
    <rect x="0" y="0" width="236" height="28" rx="14" fill="#10b981" fill-opacity="0.18" stroke="#10b981" stroke-opacity="0.5" />
    <text x="118" y="18.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="800" font-size="11.5" fill="#6ee7b7" text-anchor="middle" letter-spacing="0.8">1 · SEARCH ENGINE SERP RADAR</text>

    <text x="252" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="900" font-size="21" fill="#ffffff" letter-spacing="-0.4">
      Spot CADES 2.0 Scores &amp; Signup-Wall Warnings Directly on Google
    </text>

    <g transform="translate(994, 0)">
      <rect width="194" height="28" rx="14" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.18" />
      <text x="97" y="18.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="700" font-size="11.5" fill="#e2e8f0" text-anchor="middle">🌐 30+ Search &amp; AI SERPs</text>
    </g>
  </g>

  <!-- ===================================================================== -->
  <!-- REALISTIC CHROME WINDOW SHOWING PURE GOOGLE SEARCH (Left/Main Canvas) -->
  <!-- ===================================================================== -->
  <g transform="translate(46, 68)" filter="url(#scShadow)">
    <rect width="896" height="702" rx="14" fill="#ffffff" stroke="#334155" stroke-width="1" />

    <!-- Chrome Browser Top Frame & Address Bar -->
    <rect width="896" height="44" rx="14" fill="#dfe3e8" />
    <rect y="28" width="896" height="16" fill="#dfe3e8" />
    <line x1="0" y1="44" x2="896" y2="44" stroke="#c8cdd4" stroke-width="1" />
    <circle cx="22" cy="22" r="6" fill="#ff5f56" />
    <circle cx="42" cy="22" r="6" fill="#ffbd2e" />
    <circle cx="62" cy="22" r="6" fill="#27c93f" />

    <!-- Navigation Back/Forward/Reload Icons -->
    <path d="M92 22 H104 M92 22 L96 18 M92 22 L96 26" stroke="#5f6368" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M126 22 H114 M126 22 L122 18 M126 22 L122 26" stroke="#9aa0a6" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M148 17 A5.5 5.5 0 1 1 143 22.5" stroke="#5f6368" stroke-width="1.6" stroke-linecap="round" fill="none" />

    <!-- Chrome Omnibox Pill -->
    <rect x="170" y="7" width="572" height="30" rx="15" fill="#ffffff" />
    <circle cx="188" cy="22" r="7" fill="#f1f3f4" />
    <path d="M185 20.5 H191 M185 23.5 H191" stroke="#5f6368" stroke-width="1.3" stroke-linecap="round" />
    <text x="204" y="26.5" font-family="Arial, -apple-system, sans-serif" font-size="13" fill="#202124">google.com<tspan fill="#5f6368">/search?q=online+photo+editor+no+signup</tspan></text>

    <!-- Pinned NoLogin Tools Extension Icon in Chrome Toolbar -->
    <g transform="translate(756, 7)">
      <rect width="124" height="30" rx="15" fill="#e8f5f1" stroke="#a7dcd0" />
      <rect x="8" y="5" width="20" height="20" rx="5" fill="#08695d" />
      <path d="M13.5 15 L16.5 18 L22 12.5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <text x="35" y="19" font-family="-apple-system, sans-serif" font-weight="800" font-size="11" fill="#08695d">NoLogin</text>
      <rect x="84" y="7" width="32" height="16" rx="4" fill="#08695d" />
      <text x="100" y="18.5" font-family="ui-monospace, monospace" font-weight="800" font-size="10" fill="#ffffff" text-anchor="middle">ON</text>
    </g>

    <!-- =================================================================== -->
    <!-- GOOGLE SEARCH PAGE HEADER (y = 44 to 148)                           -->
    <!-- =================================================================== -->
    <g transform="translate(0, 44)">
      <rect width="896" height="104" fill="#ffffff" />
      <line x1="0" y1="104" x2="896" y2="104" stroke="#ebebeb" stroke-width="1" />

      <!-- Iconic 6-Color Google Wordmark -->
      <text x="28" y="45" font-family="'Product Sans', 'Google Sans', Arial, sans-serif" font-weight="700" font-size="30" letter-spacing="-1">
        <tspan fill="#4285F4">G</tspan><tspan fill="#EA4335">o</tspan><tspan fill="#FBBC05">o</tspan><tspan fill="#4285F4">g</tspan><tspan fill="#34A853">l</tspan><tspan fill="#EA4335">e</tspan>
      </text>

      <!-- Google Pill Search Box -->
      <g transform="translate(148, 14)" filter="url(#googleBarShadow)">
        <rect width="632" height="44" rx="22" fill="#ffffff" stroke="#dfe1e5" stroke-width="1" />
        <text x="22" y="27.5" font-family="Arial, sans-serif" font-size="16" fill="#202124">online photo editor no signup</text>

        <!-- Clear X Button -->
        <path d="M490 17 L500 27 M500 17 L490 27" stroke="#70757a" stroke-width="1.8" stroke-linecap="round" />
        <line x1="514" y1="10" x2="514" y2="34" stroke="#dadce0" stroke-width="1" />

        <!-- Google 4-Color Microphone Icon -->
        <g transform="translate(530, 12)">
          <rect x="5" y="1" width="6" height="11" rx="3" fill="#4285f4" />
          <path d="M2 10 A6 6 0 0 0 8 16" stroke="#fbbc05" stroke-width="1.8" fill="none" stroke-linecap="round" />
          <path d="M14 10 A6 6 0 0 1 8 16" stroke="#ea4335" stroke-width="1.8" fill="none" stroke-linecap="round" />
          <line x1="8" y1="16" x2="8" y2="20" stroke="#34a853" stroke-width="1.8" stroke-linecap="round" />
        </g>

        <!-- Google 4-Color Lens Icon -->
        <g transform="translate(562, 13)">
          <path d="M3 6 V4 A2 2 0 0 1 5 2 H7" stroke="#4285f4" stroke-width="1.8" fill="none" stroke-linecap="round" />
          <path d="M11 2 H13 A2 2 0 0 1 15 4 V6" stroke="#ea4335" stroke-width="1.8" fill="none" stroke-linecap="round" />
          <path d="M3 12 V14 A2 2 0 0 0 5 16 H7" stroke="#fbbc05" stroke-width="1.8" fill="none" stroke-linecap="round" />
          <circle cx="9" cy="9" r="2.6" fill="#4285f4" />
          <circle cx="13.5" cy="14.5" r="1.8" fill="#34a853" />
        </g>

        <!-- Google Blue Magnifying Glass -->
        <g transform="translate(594, 13)">
          <circle cx="7.5" cy="7.5" r="5.5" stroke="#4285f4" stroke-width="2" fill="none" />
          <line x1="11.5" y1="11.5" x2="16" y2="16" stroke="#4285f4" stroke-width="2" stroke-linecap="round" />
        </g>
      </g>

      <!-- Right-side Google Header Controls (9-Dot Apps, Avatar) -->
      <g transform="translate(796, 22)">
        <g fill="#5f6368">
          <circle cx="16" cy="8" r="1.8" /><circle cx="22" cy="8" r="1.8" /><circle cx="28" cy="8" r="1.8" />
          <circle cx="16" cy="14" r="1.8" /><circle cx="22" cy="14" r="1.8" /><circle cx="28" cy="14" r="1.8" />
          <circle cx="16" cy="20" r="1.8" /><circle cx="22" cy="20" r="1.8" /><circle cx="28" cy="20" r="1.8" />
        </g>
        <circle cx="56" cy="14" r="15" fill="#1a73e8" />
        <text x="56" y="19" font-family="Arial, sans-serif" font-weight="600" font-size="14" fill="#ffffff" text-anchor="middle">L</text>
      </g>

      <!-- Google Navigation Filter Tabs (All, Images, Videos, Forums, Web, Shopping, More) -->
      <g transform="translate(148, 72)" font-family="Arial, sans-serif" font-size="13.5">
        <text x="6" y="18" font-weight="600" fill="#1f1f1f">All</text>
        <rect x="0" y="29" width="28" height="3" rx="1.5" fill="#1a73e8" />

        <text x="50" y="18" fill="#5f6368">Images</text>
        <text x="116" y="18" fill="#5f6368">Videos</text>
        <text x="178" y="18" fill="#5f6368">Forums</text>
        <text x="246" y="18" fill="#5f6368">Web</text>
        <text x="296" y="18" fill="#5f6368">Shopping</text>
        <text x="376" y="18" fill="#5f6368">⋮ More</text>
        <text x="596" y="18" fill="#5f6368">Tools</text>
      </g>
    </g>

    <!-- =================================================================== -->
    <!-- GOOGLE MAIN RESULTS COLUMN (#center_col at x = 148, width = 652)    -->
    <!-- =================================================================== -->
    <g transform="translate(148, 158)">
      <!-- Classic Google Search Result Count & Latency -->
      <text x="0" y="14" font-family="Arial, sans-serif" font-size="12.5" fill="#70757a">
        About 48,200,000 results (0.24 seconds)
      </text>

      <!-- ① Injected #nl-serp-summary-bar (Matches packages/extension/content.css) -->
      <g transform="translate(0, 26)">
        <rect width="652" height="34" rx="6" fill="#f4f9f8" stroke="#c5dfd9" stroke-width="1.2" />
        <text x="12" y="21.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="700" font-size="12" fill="#08695d">✓ nologin.tools:</text>
        <text x="114" y="21.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="500" font-size="12" fill="#1e2f36">3 tools matched (Photopea 95 · Excalidraw 96 · Squoosh 95)</text>
        <text x="640" y="21.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="700" font-size="11.5" fill="#08695d" text-anchor="end">⚔️ vs TinyPNG ↗  ·  Finder ↗</text>
      </g>

      <!-- ================================================================= -->
      <!-- ORGANIC RESULT 1: Photopea (Pure Google DOM — No Card Border!)    -->
      <!-- ================================================================= -->
      <g transform="translate(0, 78)">
        <!-- Google Site Favicon Circle + Stacked Site Name & Breadcrumb -->
        <circle cx="14" cy="14" r="14" fill="#f1f3f4" stroke="#dadce0" stroke-width="0.6" />
        <rect x="6" y="6" width="16" height="16" rx="3.5" fill="#08695d" />
        <text x="14" y="18" font-family="Arial, sans-serif" font-weight="800" font-size="11" fill="#ffffff" text-anchor="middle">P</text>

        <text x="38" y="12" font-family="Arial, sans-serif" font-size="14" fill="#202124">Photopea</text>
        <text x="38" y="27" font-family="Arial, sans-serif" font-size="12" fill="#4d5156">https://www.photopea.com</text>
        <text x="192" y="27" font-family="Arial, sans-serif" font-size="13" fill="#4d5156">⋮</text>

        <!-- Google <h3> Blue Title Link -->
        <text x="0" y="53" font-family="Arial, sans-serif" font-size="20" fill="#1a0dab">
          Photopea | Online Photo Editor
        </text>

        <!-- ② Injected .nl-serp-badge.nl-serp-verified (Directly under <h3>) -->
        <g transform="translate(0, 62)">
          <rect width="632" height="27" rx="5" fill="#f5f9f8" stroke="#cfe3de" stroke-width="1.2" />
          <text x="10" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="700" font-size="12" fill="#08695d">✓ NoLogin Verified</text>
          <rect x="132" y="5" width="44" height="17" rx="3" fill="#08695d" />
          <text x="154" y="17" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="700" font-size="11" fill="#ffffff" text-anchor="middle">95/100</text>
          <text x="184" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="600" font-size="12" fill="#17694c">·  ★ Editor&apos;s Choice  ·  100% Local  ·  Works Offline</text>
          <text x="622" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="600" font-size="12" fill="#08695d" text-anchor="end">Lab Report ↗  ·  vs Canva ↗</text>
        </g>

        <!-- Google Organic Snippet with Bolded Query Keywords -->
        <text x="0" y="109" font-family="Arial, sans-serif" font-size="14" fill="#4d5156">
          Photopea <tspan font-weight="700" fill="#3c4043">Online Photo Editor</tspan> lets you edit photos, apply effects, filters, add text, crop or resize
        </text>
        <text x="0" y="129" font-family="Arial, sans-serif" font-size="14" fill="#4d5156">
          pictures. Open PSD, XCF, Sketch, XD and RAW files in your browser for free — <tspan font-weight="700" fill="#3c4043">no signup</tspan> required.
        </text>
      </g>

      <!-- ================================================================= -->
      <!-- ORGANIC RESULT 2: Canva (Paywalled SaaS with Instant Switcher)    -->
      <!-- ================================================================= -->
      <g transform="translate(0, 236)">
        <!-- Google Site Favicon Circle + Stacked Site Name & Breadcrumb -->
        <circle cx="14" cy="14" r="14" fill="#f1f3f4" stroke="#dadce0" stroke-width="0.6" />
        <circle cx="14" cy="14" r="9" fill="#00c4cc" />
        <text x="14" y="18" font-family="Arial, sans-serif" font-weight="800" font-size="10.5" fill="#ffffff" text-anchor="middle">C</text>

        <text x="38" y="12" font-family="Arial, sans-serif" font-size="14" fill="#202124">Canva</text>
        <text x="38" y="27" font-family="Arial, sans-serif" font-size="12" fill="#4d5156">https://www.canva.com › photo-editor</text>
        <text x="252" y="27" font-family="Arial, sans-serif" font-size="13" fill="#4d5156">⋮</text>

        <!-- Google <h3> Blue Title Link -->
        <text x="0" y="53" font-family="Arial, sans-serif" font-size="20" fill="#1a0dab">
          Free Online Photo Editor: Free &amp; easy image editing - Canva
        </text>

        <!-- ③ Injected .nl-serp-badge.nl-serp-paywall (Directly under <h3>) -->
        <g transform="translate(0, 62)">
          <rect width="652" height="27" rx="5" fill="#fff9ed" stroke="#eadcbe" stroke-width="1.2" />
          <text x="10" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="700" font-size="12" fill="#996112">⚡ Signup Wall · No-Login Switch:</text>

          <!-- Alt Pill 1 -->
          <g transform="translate(220, 4.5)">
            <rect width="94" height="18" rx="3" fill="#f0f7f5" stroke="#cfe3de" />
            <text x="6" y="13" font-family="-apple-system, sans-serif" font-weight="600" font-size="11.5" fill="#08695d">Photopea</text>
            <rect x="61" y="2" width="20" height="14" rx="2.5" fill="#08695d" />
            <text x="71" y="12.5" font-family="-apple-system, sans-serif" font-weight="700" font-size="10" fill="#ffffff" text-anchor="middle">95</text>
            <text x="84" y="13" font-family="-apple-system, sans-serif" font-weight="600" font-size="10.5" fill="#08695d">↗</text>
          </g>

          <!-- Alt Pill 2 -->
          <g transform="translate(320, 4.5)">
            <rect width="102" height="18" rx="3" fill="#f0f7f5" stroke="#cfe3de" />
            <text x="6" y="13" font-family="-apple-system, sans-serif" font-weight="600" font-size="11.5" fill="#08695d">Excalidraw</text>
            <rect x="69" y="2" width="20" height="14" rx="2.5" fill="#08695d" />
            <text x="79" y="12.5" font-family="-apple-system, sans-serif" font-weight="700" font-size="10" fill="#ffffff" text-anchor="middle">96</text>
            <text x="92" y="13" font-family="-apple-system, sans-serif" font-weight="600" font-size="10.5" fill="#08695d">↗</text>
          </g>

          <!-- Alt Pill 3 -->
          <g transform="translate(428, 4.5)">
            <rect width="88" height="18" rx="3" fill="#f0f7f5" stroke="#cfe3de" />
            <text x="6" y="13" font-family="-apple-system, sans-serif" font-weight="600" font-size="11.5" fill="#08695d">Squoosh</text>
            <rect x="55" y="2" width="20" height="14" rx="2.5" fill="#08695d" />
            <text x="65" y="12.5" font-family="-apple-system, sans-serif" font-weight="700" font-size="10" fill="#ffffff" text-anchor="middle">95</text>
            <text x="78" y="13" font-family="-apple-system, sans-serif" font-weight="600" font-size="10.5" fill="#08695d">↗</text>
          </g>

          <text x="642" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="600" font-size="11.5" fill="#996112" text-anchor="end">Compare All (4) ↗</text>
        </g>

        <!-- Google Organic Snippet -->
        <text x="0" y="109" font-family="Arial, sans-serif" font-size="14" fill="#4d5156">
          Take your photos from meh to amazing with Canva&apos;s <tspan font-weight="700" fill="#3c4043">free online photo editor</tspan>. Sign up for a free
        </text>
        <text x="0" y="129" font-family="Arial, sans-serif" font-size="14" fill="#4d5156">
          account to upload photos, add effects, and remove backgrounds in one click.
        </text>
      </g>

      <!-- ================================================================= -->
      <!-- ORGANIC RESULT 3: Excalidraw (Verified Open-Source Tool)          -->
      <!-- ================================================================= -->
      <g transform="translate(0, 394)">
        <circle cx="14" cy="14" r="14" fill="#f1f3f4" stroke="#dadce0" stroke-width="0.6" />
        <rect x="6" y="6" width="16" height="16" rx="3.5" fill="#6965db" />
        <text x="14" y="18" font-family="Arial, sans-serif" font-weight="800" font-size="11" fill="#ffffff" text-anchor="middle">E</text>

        <text x="38" y="12" font-family="Arial, sans-serif" font-size="14" fill="#202124">Excalidraw</text>
        <text x="38" y="27" font-family="Arial, sans-serif" font-size="12" fill="#4d5156">https://excalidraw.com</text>
        <text x="174" y="27" font-family="Arial, sans-serif" font-size="13" fill="#4d5156">⋮</text>

        <text x="0" y="53" font-family="Arial, sans-serif" font-size="20" fill="#1a0dab">
          Excalidraw — Collaborative whiteboarding made easy
        </text>

        <g transform="translate(0, 62)">
          <rect width="632" height="27" rx="5" fill="#f5f9f8" stroke="#cfe3de" stroke-width="1.2" />
          <text x="10" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="700" font-size="12" fill="#08695d">✓ NoLogin Verified</text>
          <rect x="132" y="5" width="44" height="17" rx="3" fill="#08695d" />
          <text x="154" y="17" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="700" font-size="11" fill="#ffffff" text-anchor="middle">96/100</text>
          <text x="184" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="600" font-size="12" fill="#17694c">·  ★ Editor&apos;s Choice  ·  100% Local  ·  Open Source</text>
          <text x="622" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="600" font-size="12" fill="#08695d" text-anchor="end">Lab Report ↗  ·  vs Miro ↗</text>
        </g>

        <text x="0" y="109" font-family="Arial, sans-serif" font-size="14" fill="#4d5156">
          Excalidraw is a virtual collaborative whiteboard tool that lets you easily sketch diagrams with a
        </text>
        <text x="0" y="129" font-family="Arial, sans-serif" font-size="14" fill="#4d5156">
          hand-drawn feel. Runs locally in your browser with <tspan font-weight="700" fill="#3c4043">no login</tspan> or account required.
        </text>
      </g>
    </g>
  </g>

  <!-- ===================================================================== -->
  <!-- FLOATING DARK HUD CALLOUT WINDOW (Outside/Overlapping Browser Frame)  -->
  <!-- ===================================================================== -->
  <g transform="translate(894, 184)" filter="url(#floatShadow)">
    <!-- Connector Pointer Lines from Google SERP Strips to Floating HUD -->
    <path d="M-48 86 H0" stroke="#10b981" stroke-width="2" stroke-dasharray="4 4" />
    <circle cx="-48" cy="86" r="4" fill="#10b981" />

    <path d="M-48 178 H0" stroke="#34d399" stroke-width="2" stroke-dasharray="4 4" />
    <circle cx="-48" cy="178" r="4" fill="#34d399" />

    <path d="M-48 336 H0" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 4" />
    <circle cx="-48" cy="336" r="4" fill="#f59e0b" />

    <!-- Dark Glass Floating Window -->
    <rect width="340" height="534" rx="16" fill="url(#floatHudBg)" stroke="#10b981" stroke-width="1.8" />

    <!-- Floating Window Titlebar -->
    <rect width="340" height="42" rx="16" fill="#06131d" />
    <rect y="26" width="340" height="16" fill="#06131d" />
    <line x1="0" y1="42" x2="340" y2="42" stroke="#1e3a4c" stroke-width="1" />
    <circle cx="20" cy="21" r="4.5" fill="#10b981" />
    <text x="34" y="25" font-family="-apple-system, sans-serif" font-weight="800" font-size="11.5" fill="#6ee7b7" letter-spacing="0.6">SERP LOW-NOISE ANNOTATIONS</text>
    <rect x="258" y="11" width="66" height="20" rx="10" fill="#08695d" fill-opacity="0.45" stroke="#10b981" stroke-opacity="0.5" />
    <text x="291" y="24.5" font-family="ui-monospace, monospace" font-weight="800" font-size="9.5" fill="#a7f3d0" text-anchor="middle">1-LINE UI</text>

    <!-- Callout 1: Top Summary Bar -->
    <g transform="translate(20, 62)">
      <rect width="300" height="84" rx="10" fill="#ffffff" fill-opacity="0.05" stroke="#10b981" stroke-opacity="0.3" />
      <circle cx="24" cy="24" r="12" fill="#08695d" stroke="#34d399" stroke-width="1.2" />
      <text x="24" y="28" font-family="-apple-system, sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle">1</text>
      <text x="44" y="27" font-family="-apple-system, sans-serif" font-weight="800" font-size="13.5" fill="#ffffff">Top SERP Summary Bar</text>
      <text x="20" y="50" font-family="-apple-system, sans-serif" font-size="11.5" fill="#cbd5e1">Appears only when 2+ tools match —</text>
      <text x="20" y="67" font-family="-apple-system, sans-serif" font-size="11.5" fill="#cbd5e1">compare scores &amp; open VS matrix in 1 click.</text>
    </g>

    <!-- Callout 2: Verified CADES 2.0 Badge -->
    <g transform="translate(20, 158)">
      <rect width="300" height="84" rx="10" fill="#ffffff" fill-opacity="0.05" stroke="#34d399" stroke-opacity="0.35" />
      <circle cx="24" cy="24" r="12" fill="#059669" stroke="#6ee7b7" stroke-width="1.2" />
      <text x="24" y="28" font-family="-apple-system, sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle">2</text>
      <text x="44" y="27" font-family="-apple-system, sans-serif" font-weight="800" font-size="13.5" fill="#6ee7b7">Single-Line Verified Strip</text>
      <text x="20" y="50" font-family="-apple-system, sans-serif" font-size="11.5" fill="#cbd5e1">Displays CADES 2.0 score (95/100),</text>
      <text x="20" y="67" font-family="-apple-system, sans-serif" font-size="11.5" fill="#cbd5e1">100% Local &amp; Offline tags below the title.</text>
    </g>

    <!-- Callout 3: Signup-Wall Auto-Switcher -->
    <g transform="translate(20, 254)">
      <rect width="300" height="84" rx="10" fill="#f59e0b" fill-opacity="0.08" stroke="#f59e0b" stroke-opacity="0.45" />
      <circle cx="24" cy="24" r="12" fill="#d97706" stroke="#fcd34d" stroke-width="1.2" />
      <text x="24" y="28" font-family="-apple-system, sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle">3</text>
      <text x="44" y="27" font-family="-apple-system, sans-serif" font-weight="800" font-size="13.5" fill="#fcd34d">Signup-Wall Auto-Switcher</text>
      <text x="20" y="50" font-family="-apple-system, sans-serif" font-size="11.5" fill="#fde68a">Flags 55+ signup-walled SaaS results &amp;</text>
      <text x="20" y="67" font-family="-apple-system, sans-serif" font-size="11.5" fill="#fde68a">links directly to zero-login alternatives.</text>
    </g>

    <!-- Supported Engines Grid inside Floating Window -->
    <g transform="translate(20, 356)">
      <text x="0" y="14" font-family="-apple-system, sans-serif" font-weight="800" font-size="11" fill="#94a3b8" letter-spacing="0.6">SUPPORTED ACROSS 30+ SEARCH &amp; AI SERPS</text>

      <g transform="translate(0, 26)" font-family="-apple-system, sans-serif" font-weight="700" font-size="11" fill="#e2e8f0">
        <rect x="0" y="0" width="94" height="26" rx="6" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.15" />
        <text x="47" y="17" text-anchor="middle">Google</text>
        <rect x="103" y="0" width="94" height="26" rx="6" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.15" />
        <text x="150" y="17" text-anchor="middle">Bing</text>
        <rect x="206" y="0" width="94" height="26" rx="6" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.15" />
        <text x="253" y="17" text-anchor="middle">DuckDuckGo</text>

        <rect x="0" y="34" width="94" height="26" rx="6" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.15" />
        <text x="47" y="51" text-anchor="middle">Brave</text>
        <rect x="103" y="34" width="94" height="26" rx="6" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.15" />
        <text x="150" y="51" text-anchor="middle">Kagi</text>
        <rect x="206" y="34" width="94" height="26" rx="6" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.15" />
        <text x="253" y="51" text-anchor="middle">Perplexity</text>

        <rect x="0" y="68" width="94" height="26" rx="6" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.15" />
        <text x="47" y="85" text-anchor="middle">Startpage</text>
        <rect x="103" y="68" width="94" height="26" rx="6" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.15" />
        <text x="150" y="85" text-anchor="middle">Ecosia</text>
        <rect x="206" y="68" width="94" height="26" rx="6" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.15" />
        <text x="253" y="85" text-anchor="middle">Phind &amp; You</text>

        <rect x="0" y="104" width="300" height="28" rx="6" fill="#08695d" fill-opacity="0.35" stroke="#10b981" stroke-opacity="0.45" />
        <text x="150" y="122" fill="#6ee7b7" font-weight="700" text-anchor="middle">+ Baidu · Yahoo · Yandex · Qwant · SearXNG</text>
      </g>
    </g>
  </g>
</svg>`;

// ---------------------------------------------------------------------------
// 4. Screenshot 2 (1280 x 800): Paywall Switcher + Spotlight Mini-Finder (v2.0 Popup)
// ---------------------------------------------------------------------------
const screenshot2Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800" fill="none">
  <defs>
    <linearGradient id="sc2Bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#04261f" />
      <stop offset="50%" stop-color="#0b1928" />
      <stop offset="100%" stop-color="#070d16" />
    </linearGradient>
    <filter id="popShadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="22" stdDeviation="24" flood-color="#000000" flood-opacity="0.5" />
    </filter>
  </defs>

  <rect width="1280" height="800" fill="url(#sc2Bg)" />

  <!-- Left Side: Context & Paywall Detection Story -->
  <g transform="translate(68, 76)">
    <rect x="0" y="0" width="286" height="30" rx="15" fill="#f59e0b" fill-opacity="0.18" stroke="#f59e0b" stroke-opacity="0.55" />
    <text x="143" y="19.5" font-family="-apple-system, sans-serif" font-weight="800" font-size="11.5" fill="#fcd34d" text-anchor="middle" letter-spacing="0.8">2 · PAYWALL SWITCHER &amp; MINI-FINDER</text>

    <text x="0" y="78" font-family="-apple-system, sans-serif" font-weight="900" font-size="40" fill="#ffffff" letter-spacing="-1">
      Hit a Signup Wall?
    </text>
    <text x="0" y="124" font-family="-apple-system, sans-serif" font-weight="900" font-size="40" fill="#34d399" letter-spacing="-1">
      Switch in One Click.
    </text>

    <text x="0" y="168" font-family="-apple-system, sans-serif" font-weight="500" font-size="15.5" fill="#cbd5e1">
      Visiting any of 55+ restrictive SaaS domains lights up your toolbar
    </text>
    <text x="0" y="192" font-family="-apple-system, sans-serif" font-weight="500" font-size="15.5" fill="#cbd5e1">
      badge with verified zero-login replacements — with 0 DOM clutter.
    </text>

    <!-- Simulated Paywalled Browser Tab Card -->
    <g transform="translate(0, 224)">
      <rect width="540" height="248" rx="14" fill="#0f172a" stroke="#334155" stroke-width="1.5" />
      <rect width="540" height="42" rx="14" fill="#1e293b" />
      <rect y="28" width="540" height="14" fill="#1e293b" />
      <circle cx="20" cy="21" r="5" fill="#ef4444" />
      <circle cx="36" cy="21" r="5" fill="#f59e0b" />
      <circle cx="52" cy="21" r="5" fill="#10b981" />
      <rect x="74" y="10" width="320" height="22" rx="6" fill="#0f172a" stroke="#475569" />
      <text x="88" y="25" font-family="ui-monospace, monospace" font-size="11" fill="#94a3b8">https://www.canva.com/design/export</text>

      <!-- Amber Toolbar Badge "4" Callout -->
      <rect x="408" y="8" width="118" height="26" rx="6" fill="#78350f" stroke="#f59e0b" />
      <text x="420" y="25" font-family="-apple-system, sans-serif" font-weight="800" font-size="11" fill="#fde68a">🛡️ Badge:</text>
      <rect x="484" y="12" width="32" height="18" rx="4" fill="#d97706" />
      <text x="500" y="24.5" font-family="-apple-system, sans-serif" font-weight="900" font-size="11" fill="#ffffff" text-anchor="middle">4</text>

      <!-- Blocked SaaS Modal Simulation -->
      <g transform="translate(32, 62)">
        <rect width="476" height="162" rx="10" fill="#1e293b" stroke="#475569" stroke-dasharray="4 4" />
        <text x="238" y="36" font-family="-apple-system, sans-serif" font-weight="800" font-size="12" fill="#fbbf24" text-anchor="middle" letter-spacing="0.6">FORCED ACCOUNT / PAYWALL DETECTED · ZERO DOM INJECTION</text>
        <text x="238" y="68" font-family="-apple-system, sans-serif" font-weight="800" font-size="18" fill="#ffffff" text-anchor="middle">&quot;Create an account to download your file&quot;</text>
        <text x="238" y="94" font-family="-apple-system, sans-serif" font-size="12.5" fill="#94a3b8" text-anchor="middle">No floating popups injected into the page. Click the toolbar badge [4] →</text>
        <rect x="148" y="112" width="180" height="32" rx="6" fill="#334155" />
        <text x="238" y="132" font-family="-apple-system, sans-serif" font-weight="700" font-size="12" fill="#94a3b8" text-anchor="middle">Sign up with Email / Google</text>
      </g>
    </g>

    <!-- Feature Callout Chips Below -->
    <g transform="translate(0, 500)">
      <rect x="0" y="0" width="170" height="58" rx="10" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.14" />
      <text x="16" y="24" font-family="-apple-system, sans-serif" font-weight="800" font-size="12.5" fill="#34d399">⚡ Scenario Presets</text>
      <text x="16" y="43" font-family="-apple-system, sans-serif" font-size="10.5" fill="#94a3b8">100% Local · Top 90+</text>

      <rect x="184" y="0" width="170" height="58" rx="10" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.14" />
      <text x="200" y="24" font-family="-apple-system, sans-serif" font-weight="800" font-size="12.5" fill="#fbbf24">⌨️ Keyboard First</text>
      <text x="200" y="43" font-family="-apple-system, sans-serif" font-size="10.5" fill="#94a3b8">↑ / ↓ / Enter Spotlight UI</text>

      <rect x="368" y="0" width="172" height="58" rx="10" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.14" />
      <text x="384" y="24" font-family="-apple-system, sans-serif" font-weight="800" font-size="12.5" fill="#38bdf8">🌐 EN / 中文 Switch</text>
      <text x="384" y="43" font-family="-apple-system, sans-serif" font-size="10.5" fill="#94a3b8">1-Click Bilingual Index</text>
    </g>
  </g>

  <!-- Right Side: Authentic v2.0 Popup Mockup (Paywall Banner + Mini-Finder) -->
  <g transform="translate(668, 42)" filter="url(#popShadow)">
    <rect width="544" height="716" rx="16" fill="#f6f8f9" stroke="#cbd5e1" stroke-width="2" />

    <!-- Popup Header -->
    <g transform="translate(20, 16)">
      <rect width="28" height="28" rx="6" fill="#08695d" />
      <path d="M9 14 L12.5 17.5 L19.5 10.5" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <text x="38" y="16" font-family="-apple-system, sans-serif" font-weight="800" font-size="16" fill="#08695d">nologin.tools</text>
      <rect x="142" y="3" width="36" height="17" rx="4" fill="#e6f4f1" stroke="#b8dcd4" />
      <text x="160" y="15" font-family="-apple-system, sans-serif" font-weight="700" font-size="10.5" fill="#08695d" text-anchor="middle">v2.0</text>
      <text x="38" y="31" font-family="-apple-system, sans-serif" font-size="11" fill="#5c6b73">Zero Signup · CADES 2.0 Lab Verified</text>

      <!-- Bilingual Toggle + Home Link -->
      <rect x="434" y="2" width="40" height="26" rx="5" fill="#e6f4f1" stroke="#b8dcd4" />
      <text x="454" y="19" font-family="-apple-system, sans-serif" font-weight="700" font-size="11.5" fill="#08695d" text-anchor="middle">中文</text>
      <rect x="480" y="2" width="26" height="26" rx="5" fill="#ffffff" stroke="#cfd8dc" />
      <text x="493" y="19" font-family="-apple-system, sans-serif" font-weight="700" font-size="12" fill="#2c3e47" text-anchor="middle">↗</text>
    </g>
    <line x1="20" y1="56" x2="524" y2="56" stroke="#dce3e6" stroke-width="1" />

    <!-- 1. Paywall / Forced-Login Switcher Banner (#alternative-banner) -->
    <g transform="translate(20, 68)">
      <rect width="504" height="202" rx="8" fill="#ffffff" stroke="#eadcbe" stroke-width="1.5" />
      <rect width="4" height="202" rx="2" fill="#d97706" />
      <circle cx="18" cy="20" r="4" fill="#d97706" />
      <text x="28" y="24" font-family="-apple-system, sans-serif" font-weight="800" font-size="13" fill="#996112">Visiting Canva? No-Login Switch</text>
      <text x="18" y="44" font-family="-apple-system, sans-serif" font-size="11.5" fill="#5c4018">Skip mandatory signups. Switch to a verified, no-signup alternative:</text>

      <!-- Alternative Row 1: Photopea -->
      <g transform="translate(16, 56)">
        <rect width="472" height="36" rx="5" fill="#f6faf9" stroke="#dce9e6" />
        <text x="14" y="23" font-family="-apple-system, sans-serif" font-weight="700" font-size="13" fill="#18252c">Photopea</text>
        <rect x="82" y="9" width="28" height="18" rx="3" fill="#08695d" />
        <text x="96" y="22" font-family="-apple-system, sans-serif" font-weight="700" font-size="10.5" fill="#ffffff" text-anchor="middle">95</text>
        <rect x="116" y="9" width="44" height="18" rx="3" fill="#e6f4f1" stroke="#cfe3de" />
        <text x="138" y="21.5" font-family="-apple-system, sans-serif" font-weight="600" font-size="10" fill="#17694c" text-anchor="middle">Local</text>
        <text x="348" y="22.5" font-family="-apple-system, sans-serif" font-weight="600" font-size="11" fill="#5c6b73">Report</text>
        <rect x="392" y="6" width="72" height="24" rx="4" fill="#08695d" />
        <text x="428" y="22" font-family="-apple-system, sans-serif" font-weight="700" font-size="11" fill="#ffffff" text-anchor="middle">Launch ↗</text>
      </g>

      <!-- Alternative Row 2: Excalidraw -->
      <g transform="translate(16, 98)">
        <rect width="472" height="36" rx="5" fill="#f6faf9" stroke="#dce9e6" />
        <text x="14" y="23" font-family="-apple-system, sans-serif" font-weight="700" font-size="13" fill="#18252c">Excalidraw</text>
        <rect x="90" y="9" width="28" height="18" rx="3" fill="#08695d" />
        <text x="104" y="22" font-family="-apple-system, sans-serif" font-weight="700" font-size="10.5" fill="#ffffff" text-anchor="middle">96</text>
        <rect x="124" y="9" width="44" height="18" rx="3" fill="#e6f4f1" stroke="#cfe3de" />
        <text x="146" y="21.5" font-family="-apple-system, sans-serif" font-weight="600" font-size="10" fill="#17694c" text-anchor="middle">Local</text>
        <text x="348" y="22.5" font-family="-apple-system, sans-serif" font-weight="600" font-size="11" fill="#5c6b73">Report</text>
        <rect x="392" y="6" width="72" height="24" rx="4" fill="#08695d" />
        <text x="428" y="22" font-family="-apple-system, sans-serif" font-weight="700" font-size="11" fill="#ffffff" text-anchor="middle">Launch ↗</text>
      </g>

      <!-- Alternative Row 3: Squoosh -->
      <g transform="translate(16, 140)">
        <rect width="472" height="34" rx="5" fill="#f6faf9" stroke="#dce9e6" />
        <text x="14" y="22" font-family="-apple-system, sans-serif" font-weight="700" font-size="13" fill="#18252c">Squoosh</text>
        <rect x="78" y="8" width="28" height="18" rx="3" fill="#08695d" />
        <text x="92" y="21" font-family="-apple-system, sans-serif" font-weight="700" font-size="10.5" fill="#ffffff" text-anchor="middle">95</text>
        <rect x="112" y="8" width="44" height="18" rx="3" fill="#e6f4f1" stroke="#cfe3de" />
        <text x="134" y="20.5" font-family="-apple-system, sans-serif" font-weight="600" font-size="10" fill="#17694c" text-anchor="middle">Local</text>
        <text x="348" y="21.5" font-family="-apple-system, sans-serif" font-weight="600" font-size="11" fill="#5c6b73">Report</text>
        <rect x="392" y="5" width="72" height="24" rx="4" fill="#08695d" />
        <text x="428" y="21" font-family="-apple-system, sans-serif" font-weight="700" font-size="11" fill="#ffffff" text-anchor="middle">Launch ↗</text>
      </g>

      <text x="16" y="192" font-family="-apple-system, sans-serif" font-weight="700" font-size="11" fill="#08695d">Full Canva No-Login Comparison Matrix →</text>
    </g>

    <!-- 2. Search Bar -->
    <g transform="translate(20, 282)">
      <rect width="504" height="36" rx="6" fill="#ffffff" stroke="#08695d" stroke-width="1.5" />
      <text x="14" y="23" font-family="-apple-system, sans-serif" font-size="12.5" fill="#18252c">🔍  Search 320+ zero-login tools or SaaS to replace...</text>
    </g>

    <!-- 3. Scenario Preset Chips (#preset-chips) -->
    <g transform="translate(20, 328)">
      <rect x="0" y="0" width="90" height="24" rx="12" fill="#08695d" />
      <text x="45" y="16" font-family="-apple-system, sans-serif" font-weight="600" font-size="11" fill="#ffffff" text-anchor="middle">Top Scored</text>

      <rect x="98" y="0" width="88" height="24" rx="12" fill="#ffffff" stroke="#c5d3d8" />
      <text x="142" y="16" font-family="-apple-system, sans-serif" font-weight="600" font-size="11" fill="#2c3e47" text-anchor="middle">100% Local</text>

      <rect x="194" y="0" width="106" height="24" rx="12" fill="#ffffff" stroke="#c5d3d8" />
      <text x="247" y="16" font-family="-apple-system, sans-serif" font-weight="600" font-size="11" fill="#2c3e47" text-anchor="middle">Editor&apos;s Choice</text>

      <rect x="308" y="0" width="94" height="24" rx="12" fill="#ffffff" stroke="#c5d3d8" />
      <text x="355" y="16" font-family="-apple-system, sans-serif" font-weight="600" font-size="11" fill="#2c3e47" text-anchor="middle">Open Source</text>
    </g>

    <!-- 4. Category Pills (#category-pills) -->
    <g transform="translate(20, 360)">
      <rect x="0" y="0" width="38" height="22" rx="4" fill="#18252c" />
      <text x="19" y="15" font-family="-apple-system, sans-serif" font-weight="600" font-size="10.5" fill="#ffffff" text-anchor="middle">All</text>

      <rect x="44" y="0" width="36" height="22" rx="4" fill="#ffffff" stroke="#dce3e6" />
      <text x="62" y="15" font-family="-apple-system, sans-serif" font-weight="600" font-size="10.5" fill="#5c6b73" text-anchor="middle">AI</text>

      <rect x="86" y="0" width="54" height="22" rx="4" fill="#ffffff" stroke="#dce3e6" />
      <text x="113" y="15" font-family="-apple-system, sans-serif" font-weight="600" font-size="10.5" fill="#5c6b73" text-anchor="middle">Design</text>

      <rect x="146" y="0" width="84" height="22" rx="4" fill="#ffffff" stroke="#dce3e6" />
      <text x="188" y="15" font-family="-apple-system, sans-serif" font-weight="600" font-size="10.5" fill="#5c6b73" text-anchor="middle">PDF &amp; Office</text>

      <rect x="236" y="0" width="44" height="22" rx="4" fill="#ffffff" stroke="#dce3e6" />
      <text x="258" y="15" font-family="-apple-system, sans-serif" font-weight="600" font-size="10.5" fill="#5c6b73" text-anchor="middle">Dev</text>

      <rect x="286" y="0" width="52" height="22" rx="4" fill="#ffffff" stroke="#dce3e6" />
      <text x="312" y="15" font-family="-apple-system, sans-serif" font-weight="600" font-size="10.5" fill="#5c6b73" text-anchor="middle">Media</text>

      <rect x="344" y="0" width="56" height="22" rx="4" fill="#ffffff" stroke="#dce3e6" />
      <text x="372" y="15" font-family="-apple-system, sans-serif" font-weight="600" font-size="10.5" fill="#5c6b73" text-anchor="middle">Privacy</text>
    </g>

    <!-- Stats Row -->
    <g transform="translate(20, 392)">
      <text x="0" y="12" font-family="-apple-system, sans-serif" font-size="11" fill="#5c6b73">320 verified tools</text>
      <text x="504" y="12" font-family="ui-monospace, monospace" font-size="10.5" fill="#78909c" text-anchor="end">↑↓ Enter · Esc</text>
      <line x1="0" y1="18" x2="504" y2="18" stroke="#dce3e6" />
    </g>

    <!-- 5. Tool Results List (Clean Layout, Zero Overlap) -->
    <!-- Row 1: PDF24 Tools -->
    <g transform="translate(20, 418)">
      <rect width="504" height="54" rx="6" fill="#f0f7f5" stroke="#08695d" stroke-width="1.2" />
      <text x="14" y="22" font-family="-apple-system, sans-serif" font-weight="700" font-size="13" fill="#18252c">PDF24 Tools</text>
      <rect x="98" y="9" width="28" height="17" rx="3" fill="#08695d" />
      <text x="112" y="21" font-family="-apple-system, sans-serif" font-weight="700" font-size="10.5" fill="#ffffff" text-anchor="middle">94</text>
      <rect x="132" y="9" width="76" height="17" rx="3" fill="#f4f6f7" stroke="#dce3e6" />
      <text x="170" y="21" font-family="-apple-system, sans-serif" font-weight="600" font-size="9.5" fill="#5c6b73" text-anchor="middle">Productivity</text>
      <text x="14" y="41" font-family="-apple-system, sans-serif" font-size="11" fill="#5c6b73">Merge, split, compress, and convert PDFs with zero limits</text>
      <text x="394" y="31" font-family="-apple-system, sans-serif" font-weight="600" font-size="11" fill="#5c6b73">Info</text>
      <rect x="428" y="15" width="64" height="24" rx="4" fill="#08695d" />
      <text x="460" y="31" font-family="-apple-system, sans-serif" font-weight="700" font-size="11" fill="#ffffff" text-anchor="middle">Open ↗</text>
    </g>

    <!-- Row 2: PairDrop -->
    <g transform="translate(20, 480)">
      <rect width="504" height="54" rx="6" fill="#ffffff" stroke="#dce3e6" />
      <text x="14" y="22" font-family="-apple-system, sans-serif" font-weight="700" font-size="13" fill="#18252c">PairDrop</text>
      <rect x="76" y="9" width="28" height="17" rx="3" fill="#08695d" />
      <text x="90" y="21" font-family="-apple-system, sans-serif" font-weight="700" font-size="10.5" fill="#ffffff" text-anchor="middle">94</text>
      <rect x="110" y="9" width="84" height="17" rx="3" fill="#f4f6f7" stroke="#dce3e6" />
      <text x="152" y="21" font-family="-apple-system, sans-serif" font-weight="600" font-size="9.5" fill="#5c6b73" text-anchor="middle">Communication</text>
      <rect x="200" y="9" width="40" height="17" rx="3" fill="#f0f7f5" stroke="#cfe3de" />
      <text x="220" y="21" font-family="-apple-system, sans-serif" font-weight="600" font-size="9.5" fill="#17694c" text-anchor="middle">Local</text>
      <text x="14" y="41" font-family="-apple-system, sans-serif" font-size="11" fill="#5c6b73">Encrypted P2P file sharing across devices via WebRTC</text>
      <text x="394" y="31" font-family="-apple-system, sans-serif" font-weight="600" font-size="11" fill="#5c6b73">Info</text>
      <rect x="428" y="15" width="64" height="24" rx="4" fill="#f0f7f5" stroke="#99cbc0" />
      <text x="460" y="31" font-family="-apple-system, sans-serif" font-weight="700" font-size="11" fill="#08695d" text-anchor="middle">Open ↗</text>
    </g>

    <!-- Row 3: CyberChef -->
    <g transform="translate(20, 542)">
      <rect width="504" height="54" rx="6" fill="#ffffff" stroke="#dce3e6" />
      <text x="14" y="22" font-family="-apple-system, sans-serif" font-weight="700" font-size="13" fill="#18252c">CyberChef</text>
      <rect x="86" y="9" width="28" height="17" rx="3" fill="#08695d" />
      <text x="100" y="21" font-family="-apple-system, sans-serif" font-weight="700" font-size="10.5" fill="#ffffff" text-anchor="middle">96</text>
      <rect x="120" y="9" width="76" height="17" rx="3" fill="#f4f6f7" stroke="#dce3e6" />
      <text x="158" y="21" font-family="-apple-system, sans-serif" font-weight="600" font-size="9.5" fill="#5c6b73" text-anchor="middle">Development</text>
      <rect x="202" y="9" width="40" height="17" rx="3" fill="#f0f7f5" stroke="#cfe3de" />
      <text x="222" y="21" font-family="-apple-system, sans-serif" font-weight="600" font-size="9.5" fill="#17694c" text-anchor="middle">Local</text>
      <text x="14" y="41" font-family="-apple-system, sans-serif" font-size="11" fill="#5c6b73">Client-side data decoding, encryption, and byte analysis</text>
      <text x="394" y="31" font-family="-apple-system, sans-serif" font-weight="600" font-size="11" fill="#5c6b73">Info</text>
      <rect x="428" y="15" width="64" height="24" rx="4" fill="#f0f7f5" stroke="#99cbc0" />
      <text x="460" y="31" font-family="-apple-system, sans-serif" font-weight="700" font-size="11" fill="#08695d" text-anchor="middle">Open ↗</text>
    </g>

    <!-- Row 4: SVGOMG -->
    <g transform="translate(20, 604)">
      <rect width="504" height="54" rx="6" fill="#ffffff" stroke="#dce3e6" />
      <text x="14" y="22" font-family="-apple-system, sans-serif" font-weight="700" font-size="13" fill="#18252c">SVGOMG</text>
      <rect x="78" y="9" width="28" height="17" rx="3" fill="#08695d" />
      <text x="92" y="21" font-family="-apple-system, sans-serif" font-weight="700" font-size="10.5" fill="#ffffff" text-anchor="middle">92</text>
      <rect x="112" y="9" width="52" height="17" rx="3" fill="#f4f6f7" stroke="#dce3e6" />
      <text x="138" y="21" font-family="-apple-system, sans-serif" font-weight="600" font-size="9.5" fill="#5c6b73" text-anchor="middle">Design</text>
      <rect x="170" y="9" width="40" height="17" rx="3" fill="#f0f7f5" stroke="#cfe3de" />
      <text x="190" y="21" font-family="-apple-system, sans-serif" font-weight="600" font-size="9.5" fill="#17694c" text-anchor="middle">Local</text>
      <text x="14" y="41" font-family="-apple-system, sans-serif" font-size="11" fill="#5c6b73">SVGO visual vector optimization and cleanup in browser</text>
      <text x="394" y="31" font-family="-apple-system, sans-serif" font-weight="600" font-size="11" fill="#5c6b73">Info</text>
      <rect x="428" y="15" width="64" height="24" rx="4" fill="#f0f7f5" stroke="#99cbc0" />
      <text x="460" y="31" font-family="-apple-system, sans-serif" font-weight="700" font-size="11" fill="#08695d" text-anchor="middle">Open ↗</text>
    </g>

    <!-- Popup Footer -->
    <g transform="translate(20, 676)">
      <line x1="0" y1="0" x2="504" y2="0" stroke="#dce3e6" />
      <text x="0" y="22" font-family="-apple-system, sans-serif" font-size="11" fill="#5c6b73">Verified by <tspan font-weight="700" fill="#08695d">NoLoginTools.org</tspan></text>
      <text x="504" y="22" font-family="-apple-system, sans-serif" font-weight="600" font-size="11" fill="#5c6b73" text-anchor="end">Lab  ·  Finder  ·  Privacy  ·  Submit</text>
    </g>
  </g>
</svg>`;

// ---------------------------------------------------------------------------
// 5. Screenshot 3 (1280 x 800): Verified Tool 5D Lab HUD & Zero-DOM Privacy Architecture
// ---------------------------------------------------------------------------
const screenshot3Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800" fill="none">
  <defs>
    <linearGradient id="sc3Bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070d17" />
      <stop offset="50%" stop-color="#0d1e2d" />
      <stop offset="100%" stop-color="#042f28" />
    </linearGradient>
    <filter id="hudShadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="22" stdDeviation="24" flood-color="#000000" flood-opacity="0.5" />
    </filter>
  </defs>

  <rect width="1280" height="800" fill="url(#sc3Bg)" />

  <!-- Left Side: 5D Lab HUD + Zero-DOM Privacy Guarantee -->
  <g transform="translate(68, 66)">
    <rect x="0" y="0" width="320" height="30" rx="15" fill="#10b981" fill-opacity="0.18" stroke="#10b981" stroke-opacity="0.5" />
    <text x="160" y="19.5" font-family="-apple-system, sans-serif" font-weight="800" font-size="11" fill="#6ee7b7" text-anchor="middle" letter-spacing="0.8">3 · CADES 2.0 5D HUD &amp; ZERO-DOM PRIVACY</text>

    <text x="0" y="76" font-family="-apple-system, sans-serif" font-weight="900" font-size="38" fill="#ffffff" letter-spacing="-0.8">
      5D Lab Scorecard in Toolbar.
    </text>
    <text x="0" y="120" font-family="-apple-system, sans-serif" font-weight="900" font-size="38" fill="#34d399" letter-spacing="-0.8">
      Zero Clutter on Your Canvas.
    </text>

    <text x="0" y="162" font-family="-apple-system, sans-serif" font-weight="500" font-size="14.5" fill="#cbd5e1">
      When working inside any of the 320+ verified tools, the toolbar badge shows
    </text>
    <text x="0" y="184" font-family="-apple-system, sans-serif" font-weight="500" font-size="14.5" fill="#cbd5e1">
      the live CADES 2.0 score (e.g. 95) without injecting a single node into the page.
    </text>

    <!-- 3 Architecture & Privacy Pillars -->
    <!-- Pillar 1 -->
    <g transform="translate(0, 218)">
      <rect width="540" height="122" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
      <rect x="20" y="22" width="48" height="48" rx="10" fill="#08695d" fill-opacity="0.25" stroke="#10b981" stroke-opacity="0.5" />
      <text x="44" y="51" font-family="ui-monospace, monospace" font-weight="900" font-size="13.5" fill="#34d399" text-anchor="middle">0 DOM</text>
      <text x="84" y="38" font-family="-apple-system, sans-serif" font-weight="800" font-size="16" fill="#ffffff">Zero Tool-Website DOM Injection</text>
      <text x="84" y="62" font-family="-apple-system, sans-serif" font-size="12.5" fill="#94a3b8">Never injects floating banners, overlays, or CSS into third-party tool</text>
      <text x="84" y="82" font-family="-apple-system, sans-serif" font-size="12.5" fill="#94a3b8">workspaces. Your editors, canvases, and export buttons stay 100% pure.</text>
      <rect x="84" y="92" width="168" height="20" rx="4" fill="#064e3b" />
      <text x="168" y="105.5" font-family="-apple-system, sans-serif" font-weight="700" font-size="10.5" fill="#6ee7b7" text-anchor="middle">✓ SERP-Only Content Script</text>
    </g>

    <!-- Pillar 2 -->
    <g transform="translate(0, 356)">
      <rect width="540" height="122" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
      <rect x="20" y="22" width="48" height="48" rx="10" fill="#0284c7" fill-opacity="0.22" stroke="#38bdf8" stroke-opacity="0.5" />
      <text x="44" y="51" font-family="ui-monospace, monospace" font-weight="900" font-size="13.5" fill="#38bdf8" text-anchor="middle">LOCAL</text>
      <text x="84" y="38" font-family="-apple-system, sans-serif" font-weight="800" font-size="16" fill="#ffffff">100% Local Tab Matching &amp; Zero Telemetry</text>
      <text x="84" y="62" font-family="-apple-system, sans-serif" font-size="12.5" fill="#94a3b8">Active tab hostnames are matched strictly locally in browser memory</text>
      <text x="84" y="82" font-family="-apple-system, sans-serif" font-size="12.5" fill="#94a3b8">against the cached public index. Browsing history never leaves your device.</text>
      <rect x="84" y="92" width="196" height="20" rx="4" fill="#0c4a6e" />
      <text x="182" y="105.5" font-family="-apple-system, sans-serif" font-weight="700" font-size="10.5" fill="#7dd3fc" text-anchor="middle">✓ 24h Read-Only Public JSON Sync</text>
    </g>

    <!-- Pillar 3 -->
    <g transform="translate(0, 494)">
      <rect width="540" height="122" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
      <rect x="20" y="22" width="48" height="48" rx="10" fill="#d97706" fill-opacity="0.2" stroke="#fbbf24" stroke-opacity="0.5" />
      <text x="44" y="51" font-family="ui-monospace, monospace" font-weight="900" font-size="14" fill="#fbbf24" text-anchor="middle">5D</text>
      <text x="84" y="38" font-family="-apple-system, sans-serif" font-weight="800" font-size="16" fill="#ffffff">Empirical CADES 2.0 Lab Verification</text>
      <text x="84" y="62" font-family="-apple-system, sans-serif" font-size="12.5" fill="#94a3b8">Every tool is dogfooded in Chromium across 5 dimensions: Frictionless UX,</text>
      <text x="84" y="82" font-family="-apple-system, sans-serif" font-size="12.5" fill="#94a3b8">Functional Depth, Export Freedom, Privacy Sovereignty, and Stability.</text>
      <rect x="84" y="92" width="184" height="20" rx="4" fill="#78350f" />
      <text x="176" y="105.5" font-family="-apple-system, sans-serif" font-weight="700" font-size="10.5" fill="#fde68a" text-anchor="middle">✓ Open Source &amp; CWS Verified</text>
    </g>
  </g>

  <!-- Right Side: Authentic v2.0 Verified Tool 5D HUD + Nomination Bar -->
  <g transform="translate(668, 42)" filter="url(#hudShadow)">
    <rect width="544" height="716" rx="16" fill="#f6f8f9" stroke="#cbd5e1" stroke-width="2" />

    <!-- Browser Toolbar Preview Strip at Top of Card -->
    <rect width="544" height="46" rx="16" fill="#0f172a" />
    <rect y="30" width="544" height="16" fill="#0f172a" />
    <rect x="18" y="10" width="330" height="26" rx="6" fill="#1e293b" stroke="#334155" />
    <text x="32" y="27" font-family="ui-monospace, monospace" font-size="11.5" fill="#e2e8f0">https://www.photopea.com</text>
    <g transform="translate(364, 9)">
      <rect width="162" height="28" rx="6" fill="#064e3b" stroke="#10b981" />
      <text x="12" y="18.5" font-family="-apple-system, sans-serif" font-weight="700" font-size="11" fill="#a7f3d0">🛡️ Toolbar Badge:</text>
      <rect x="118" y="4" width="34" height="20" rx="4" fill="#08695d" />
      <text x="135" y="18" font-family="-apple-system, sans-serif" font-weight="900" font-size="11.5" fill="#ffffff" text-anchor="middle">95</text>
    </g>

    <!-- Popup Header -->
    <g transform="translate(20, 60)">
      <rect width="26" height="26" rx="6" fill="#08695d" />
      <path d="M8 13 L11.5 16.5 L18.5 9.5" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
      <text x="36" y="15" font-family="-apple-system, sans-serif" font-weight="800" font-size="15.5" fill="#08695d">nologin.tools</text>
      <rect x="136" y="2" width="34" height="16" rx="3" fill="#e6f4f1" stroke="#b8dcd4" />
      <text x="153" y="13.5" font-family="-apple-system, sans-serif" font-weight="700" font-size="10" fill="#08695d" text-anchor="middle">v2.0</text>
      <text x="36" y="29" font-family="-apple-system, sans-serif" font-size="10.5" fill="#5c6b73">Zero Signup · CADES 2.0 Lab Verified</text>

      <rect x="434" y="2" width="40" height="24" rx="5" fill="#e6f4f1" stroke="#b8dcd4" />
      <text x="454" y="18" font-family="-apple-system, sans-serif" font-weight="700" font-size="11" fill="#08695d" text-anchor="middle">中文</text>
      <rect x="480" y="2" width="24" height="24" rx="5" fill="#ffffff" stroke="#cfd8dc" />
      <text x="492" y="18" font-family="-apple-system, sans-serif" font-weight="700" font-size="11.5" fill="#2c3e47" text-anchor="middle">↗</text>
    </g>
    <line x1="20" y1="98" x2="524" y2="98" stroke="#dce3e6" stroke-width="1" />

    <!-- 1. Verified Tool 5D Lab HUD Banner (#verified-banner) -->
    <g transform="translate(20, 110)">
      <rect width="504" height="310" rx="8" fill="#ffffff" stroke="#b8dcd4" stroke-width="1.5" />
      <rect width="4" height="310" rx="2" fill="#08695d" />

      <!-- Top Row -->
      <circle cx="20" cy="22" r="4" fill="#08695d" />
      <text x="32" y="26" font-family="-apple-system, sans-serif" font-weight="700" font-size="12" fill="#08695d">✓ NoLogin Verified</text>
      <rect x="152" y="12" width="88" height="19" rx="3" fill="#f0f7f5" stroke="#cfe3de" />
      <text x="196" y="25" font-family="-apple-system, sans-serif" font-weight="700" font-size="10.5" fill="#17694c" text-anchor="middle">Editor&apos;s Choice</text>

      <rect x="426" y="10" width="62" height="24" rx="4" fill="#08695d" />
      <text x="457" y="26" font-family="-apple-system, sans-serif" font-weight="800" font-size="12.5" fill="#ffffff" text-anchor="middle">95/100</text>

      <!-- Tool Title -->
      <text x="18" y="54" font-family="-apple-system, sans-serif" font-weight="800" font-size="16" fill="#18252c">Photopea (photopea.com)</text>

      <!-- 5-Column Mini Progress Grid (#verified-5d-bar) -->
      <g transform="translate(18, 66)">
        <rect width="468" height="48" rx="6" fill="#f4f9f8" stroke="#dce9e6" />
        <!-- UX -->
        <g transform="translate(10, 9)">
          <text x="0" y="11" font-family="-apple-system, sans-serif" font-weight="600" font-size="10" fill="#5c6b73">UX</text>
          <text x="78" y="11" font-family="ui-monospace, monospace" font-weight="800" font-size="10" fill="#08695d" text-anchor="end">19/20</text>
          <rect x="0" y="19" width="78" height="5" rx="2.5" fill="#dce9e6" />
          <rect x="0" y="19" width="74" height="5" rx="2.5" fill="#08695d" />
        </g>
        <!-- Depth -->
        <g transform="translate(102, 9)">
          <text x="0" y="11" font-family="-apple-system, sans-serif" font-weight="600" font-size="10" fill="#5c6b73">Depth</text>
          <text x="78" y="11" font-family="ui-monospace, monospace" font-weight="800" font-size="10" fill="#08695d" text-anchor="end">24/25</text>
          <rect x="0" y="19" width="78" height="5" rx="2.5" fill="#dce9e6" />
          <rect x="0" y="19" width="75" height="5" rx="2.5" fill="#08695d" />
        </g>
        <!-- Export -->
        <g transform="translate(194, 9)">
          <text x="0" y="11" font-family="-apple-system, sans-serif" font-weight="600" font-size="10" fill="#5c6b73">Export</text>
          <text x="78" y="11" font-family="ui-monospace, monospace" font-weight="800" font-size="10" fill="#08695d" text-anchor="end">19/20</text>
          <rect x="0" y="19" width="78" height="5" rx="2.5" fill="#dce9e6" />
          <rect x="0" y="19" width="74" height="5" rx="2.5" fill="#08695d" />
        </g>
        <!-- Privacy -->
        <g transform="translate(286, 9)">
          <text x="0" y="11" font-family="-apple-system, sans-serif" font-weight="600" font-size="10" fill="#5c6b73">Privacy</text>
          <text x="78" y="11" font-family="ui-monospace, monospace" font-weight="800" font-size="10" fill="#08695d" text-anchor="end">19/20</text>
          <rect x="0" y="19" width="78" height="5" rx="2.5" fill="#dce9e6" />
          <rect x="0" y="19" width="74" height="5" rx="2.5" fill="#08695d" />
        </g>
        <!-- Polish -->
        <g transform="translate(378, 9)">
          <text x="0" y="11" font-family="-apple-system, sans-serif" font-weight="600" font-size="10" fill="#5c6b73">Polish</text>
          <text x="78" y="11" font-family="ui-monospace, monospace" font-weight="800" font-size="10" fill="#08695d" text-anchor="end">14/15</text>
          <rect x="0" y="19" width="78" height="5" rx="2.5" fill="#dce9e6" />
          <rect x="0" y="19" width="73" height="5" rx="2.5" fill="#08695d" />
        </g>
      </g>

      <!-- Capability Pills -->
      <g transform="translate(18, 126)">
        <rect x="0" y="0" width="102" height="22" rx="4" fill="#f0f7f5" stroke="#cfe3de" />
        <text x="51" y="15" font-family="-apple-system, sans-serif" font-weight="600" font-size="10.5" fill="#17694c" text-anchor="middle">100% Client-Side</text>

        <rect x="110" y="0" width="84" height="22" rx="4" fill="#f0f7f5" stroke="#cfe3de" />
        <text x="152" y="15" font-family="-apple-system, sans-serif" font-weight="600" font-size="10.5" fill="#17694c" text-anchor="middle">Works Offline</text>

        <rect x="202" y="0" width="52" height="22" rx="4" fill="#f0f7f5" stroke="#cfe3de" />
        <text x="228" y="15" font-family="-apple-system, sans-serif" font-weight="600" font-size="10.5" fill="#17694c" text-anchor="middle">Free</text>
      </g>

      <!-- Verdict Text -->
      <text x="18" y="170" font-family="-apple-system, sans-serif" font-size="12" fill="#364954">
        Multi-layer PSD, XCF, and RAW raster image editing directly in browser RAM
      </text>
      <text x="18" y="188" font-family="-apple-system, sans-serif" font-size="12" fill="#364954">
        with zero server uploads or mandatory account creation.
      </text>

      <!-- Primary & Secondary Action Buttons -->
      <g transform="translate(18, 202)">
        <rect x="0" y="0" width="248" height="32" rx="5" fill="#08695d" />
        <text x="124" y="20.5" font-family="-apple-system, sans-serif" font-weight="700" font-size="12" fill="#ffffff" text-anchor="middle">Lab Report &amp; Details ↗</text>

        <rect x="258" y="0" width="210" height="32" rx="5" fill="#f0f7f5" stroke="#99cbc0" />
        <text x="363" y="20.5" font-family="-apple-system, sans-serif" font-weight="700" font-size="12" fill="#08695d" text-anchor="middle">vs Canva Comparison ↗</text>
      </g>

      <!-- Same-Category High-Score Peers (#verified-peers) -->
      <line x1="18" y1="248" x2="486" y2="248" stroke="#e6ecee" />
      <text x="18" y="266" font-family="-apple-system, sans-serif" font-size="11" fill="#5c6b73">Top verified peers in this category:</text>
      <g transform="translate(18, 274)">
        <rect x="0" y="0" width="114" height="24" rx="4" fill="#f6faf9" stroke="#cfe3de" />
        <text x="10" y="16" font-family="-apple-system, sans-serif" font-weight="600" font-size="11" fill="#08695d">Excalidraw</text>
        <rect x="74" y="4" width="22" height="16" rx="2.5" fill="#08695d" />
        <text x="85" y="15.5" font-family="-apple-system, sans-serif" font-weight="700" font-size="10" fill="#ffffff" text-anchor="middle">96</text>
        <text x="100" y="16" font-family="-apple-system, sans-serif" font-weight="10.5" fill="#08695d">↗</text>

        <rect x="122" y="0" width="102" height="24" rx="4" fill="#f6faf9" stroke="#cfe3de" />
        <text x="132" y="16" font-family="-apple-system, sans-serif" font-weight="600" font-size="11" fill="#08695d">Squoosh</text>
        <rect x="184" y="4" width="22" height="16" rx="2.5" fill="#08695d" />
        <text x="195" y="15.5" font-family="-apple-system, sans-serif" font-weight="700" font-size="10" fill="#ffffff" text-anchor="middle">95</text>
        <text x="210" y="16" font-family="-apple-system, sans-serif" font-weight="10.5" fill="#08695d">↗</text>

        <rect x="232" y="0" width="102" height="24" rx="4" fill="#f6faf9" stroke="#cfe3de" />
        <text x="242" y="16" font-family="-apple-system, sans-serif" font-weight="600" font-size="11" fill="#08695d">SVGOMG</text>
        <rect x="294" y="4" width="22" height="16" rx="2.5" fill="#08695d" />
        <text x="305" y="15.5" font-family="-apple-system, sans-serif" font-weight="700" font-size="10" fill="#ffffff" text-anchor="middle">92</text>
        <text x="320" y="16" font-family="-apple-system, sans-serif" font-weight="10.5" fill="#08695d">↗</text>
      </g>
    </g>

    <!-- 2. Unlisted Website 1-Click Nomination Bar Preview (#nominate-banner) -->
    <g transform="translate(20, 434)">
      <text x="0" y="14" font-family="-apple-system, sans-serif" font-weight="700" font-size="11" fill="#5c6b73" letter-spacing="0.4">BONUS · VISITING AN UNINDEXED ZERO-LOGIN TOOL?</text>
      <rect x="0" y="22" width="504" height="52" rx="7" fill="#ffffff" stroke="#dce3e6" stroke-width="1.5" />
      <text x="16" y="44" font-family="-apple-system, sans-serif" font-weight="700" font-size="13" fill="#18252c">new-wasm-tool.dev</text>
      <text x="16" y="62" font-family="-apple-system, sans-serif" font-size="11" fill="#5c6b73">Not indexed yet · Nominate for NoLogin Lab CADES 2.0 vetting</text>
      <rect x="382" y="34" width="106" height="28" rx="5" fill="#f0f7f5" stroke="#99cbc0" />
      <text x="435" y="52" font-family="-apple-system, sans-serif" font-weight="700" font-size="11.5" fill="#08695d" text-anchor="middle">+ Nominate ↗</text>
    </g>

    <!-- 3. Quick-Search Mini Preview at Bottom -->
    <g transform="translate(20, 522)">
      <rect width="504" height="36" rx="6" fill="#ffffff" stroke="#bfcbd0" />
      <text x="14" y="23" font-family="-apple-system, sans-serif" font-size="12" fill="#78909c">🔍  Search 320+ zero-login tools or SaaS to replace...</text>

      <!-- Top Result Row -->
      <g transform="translate(0, 48)">
        <rect width="504" height="54" rx="6" fill="#ffffff" stroke="#dce3e6" />
        <text x="14" y="22" font-family="-apple-system, sans-serif" font-weight="700" font-size="13" fill="#18252c">Excalidraw</text>
        <rect x="90" y="9" width="28" height="17" rx="3" fill="#08695d" />
        <text x="104" y="21" font-family="-apple-system, sans-serif" font-weight="700" font-size="10.5" fill="#ffffff" text-anchor="middle">96</text>
        <rect x="124" y="9" width="52" height="17" rx="3" fill="#f4f6f7" stroke="#dce3e6" />
        <text x="150" y="21" font-family="-apple-system, sans-serif" font-weight="600" font-size="9.5" fill="#5c6b73" text-anchor="middle">Design</text>
        <rect x="182" y="9" width="40" height="17" rx="3" fill="#f0f7f5" stroke="#cfe3de" />
        <text x="202" y="21" font-family="-apple-system, sans-serif" font-weight="600" font-size="9.5" fill="#17694c" text-anchor="middle">Local</text>
        <text x="14" y="41" font-family="-apple-system, sans-serif" font-size="11" fill="#5c6b73">Hand-drawn diagrams, whiteboards &amp; architecture sketches</text>
        <text x="394" y="31" font-family="-apple-system, sans-serif" font-weight="600" font-size="11" fill="#5c6b73">Info</text>
        <rect x="428" y="15" width="64" height="24" rx="4" fill="#f0f7f5" stroke="#99cbc0" />
        <text x="460" y="31" font-family="-apple-system, sans-serif" font-weight="700" font-size="11" fill="#08695d" text-anchor="middle">Open ↗</text>
      </g>
    </g>

    <!-- Popup Footer -->
    <g transform="translate(20, 676)">
      <line x1="0" y1="0" x2="504" y2="0" stroke="#dce3e6" />
      <text x="0" y="22" font-family="-apple-system, sans-serif" font-size="11" fill="#5c6b73">Verified by <tspan font-weight="700" fill="#08695d">NoLoginTools.org</tspan></text>
      <text x="504" y="22" font-family="-apple-system, sans-serif" font-weight="600" font-size="11" fill="#5c6b73" text-anchor="end">Lab  ·  Finder  ·  Privacy  ·  Submit</text>
    </g>
  </g>
</svg>`;

writeFileSync(resolve(storeDir, 'promo-small-440x280.svg'), smallPromoSvg, 'utf8');
writeFileSync(resolve(storeDir, 'marquee-1400x560.svg'), marqueeSvg, 'utf8');
writeFileSync(resolve(storeDir, 'screenshot-1280x800.svg'), screenshotSvg, 'utf8');
writeFileSync(resolve(storeDir, 'screenshot-2-finder-1280x800.svg'), screenshot2Svg, 'utf8');
writeFileSync(resolve(storeDir, 'screenshot-3-privacy-1280x800.svg'), screenshot3Svg, 'utf8');

console.log('Generated extension store artwork SVG assets:');
console.log(' - promo-small-440x280.svg');
console.log(' - marquee-1400x560.svg');
console.log(' - screenshot-1280x800.svg (Screenshot 1: SERP Truth Badges & Summary Bar)');
console.log(' - screenshot-2-finder-1280x800.svg (Screenshot 2: Paywall Switcher & Spotlight Mini-Finder)');
console.log(' - screenshot-3-privacy-1280x800.svg (Screenshot 3: CADES 2.0 5D HUD & Zero-DOM Privacy)');

const chromeApp = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const pngTargets = [
  { name: 'screenshot-1280x800', width: 1280, height: 800 },
  { name: 'screenshot-2-finder-1280x800', width: 1280, height: 800 },
  { name: 'screenshot-3-privacy-1280x800', width: 1280, height: 800 },
  { name: 'promo-small-440x280', width: 440, height: 280 },
  { name: 'marquee-1400x560', width: 1400, height: 560 },
];

if (existsSync(chromeApp)) {
  console.log('Rendering official PNG store assets via Chrome headless:');
  for (const t of pngTargets) {
    const svgPath = resolve(storeDir, `${t.name}.svg`);
    const pngPath = resolve(storeDir, `${t.name}.png`);
    try {
      execSync(
        `"${chromeApp}" --headless=new --screenshot="${pngPath}" --window-size=${t.width},${t.height} --hide-scrollbars "file://${svgPath}"`,
        { stdio: 'ignore' }
      );
      console.log(` - ${t.name}.png (${t.width}x${t.height})`);
    } catch (e) {
      console.warn(`Failed rendering ${t.name}.png:`, e.message);
    }
  }
}

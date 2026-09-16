// @ts-check

/**
 * @typedef {Object} CollectionItem
 * @property {string} toolSlug
 * @property {string} roleTitle
 * @property {string} whySelected
 */

/**
 * @typedef {Object} CollectionFAQ
 * @property {string} question
 * @property {string} answer
 */

/**
 * @typedef {Object} CuratedCollection
 * @property {string} slug
 * @property {string} title
 * @property {string} tagline
 * @property {string} persona
 * @property {string} category
 * @property {string} icon
 * @property {string} heroQuote
 * @property {string} description
 * @property {string[]} guarantees
 * @property {CollectionItem[]} items
 * @property {CollectionFAQ[]} faqs
 * @property {string[]} relatedSlugs
 */

/** @type {CuratedCollection[]} */
export const CURATED_COLLECTIONS = [
  {
    slug: 'ephemeral-creative-suite',
    title: 'Zero-Account Creative Studio',
    tagline: 'A full-spectrum digital design & media suite operating 100% in local browser memory',
    persona: 'Designers, Illustrators & Content Creators',
    category: 'Design & Media',
    icon: '🎨',
    heroQuote: 'Never let subscription paywalls or forced cloud sign-ins interrupt your creative flow.',
    description: 'Modern design software has evolved into a walled garden of mandatory Adobe Creative Cloud subscriptions, aggressive telemetry, and perpetual sync prompts. The Zero-Account Creative Studio breaks free from this paradigm by assembling best-in-class WebAssembly-powered visual, raster, vector, and audio workstations. Every tool in this stack boots instantly in your web browser, executes computations strictly on local hardware, and never uploads your creative intellectual property to remote cloud silos.',
    guarantees: [
      '100% Client-Side WebAssembly Execution',
      'No Signups, Accounts, or Billing Ties',
      'Zero Cloud Retention of Project Files',
      'Instant Launch with Zero Installation'
    ],
    items: [
      {
        toolSlug: 'photopea-com',
        roleTitle: 'Full-Featured Photoshop Alternative',
        whySelected: 'Handles complex multi-layer PSD, XCF, and RAW files with adjustment layers and smart filters directly in browser WebGL memory.'
      },
      {
        toolSlug: 'excalidraw-com',
        roleTitle: 'Hand-Drawn Whiteboard & Wireframing',
        whySelected: 'End-to-end encrypted virtual whiteboard ideal for rapid system diagrams, UX flows, and client concept brainstorming.'
      },
      {
        toolSlug: 'squoosh-app',
        roleTitle: 'High-Fidelity Image Compression',
        whySelected: 'Google-developed WebAssembly image codec providing real-time side-by-side visual diffs for MozJPEG, WebP, and AVIF.'
      },
      {
        toolSlug: 'svgedit-netlify-app-editor-index-html',
        roleTitle: 'Direct SVG Vector Construction',
        whySelected: 'Lightweight, standalone vector graphic editor producing clean, human-readable SVG code without proprietary markup bloat.'
      },
      {
        toolSlug: 'audiomass-co',
        roleTitle: '32-Bit In-Browser Audio DAW',
        whySelected: 'Full multi-track waveform editor with parametric EQ, compression, and normalization operating inside Web Audio API buffers.'
      },
      {
        toolSlug: 'coolors-co',
        roleTitle: 'Harmonic Palette Generator',
        whySelected: 'Instant spacebar-driven color palette generator with contrast ratio analysis and exportable hex/RGB tokens.'
      }
    ],
    faqs: [
      {
        question: 'Can this browser creative stack handle large, print-resolution assets?',
        answer: 'Yes. Modern 64-bit browser runtimes allocate gigabytes of WebAssembly memory. Photopea comfortably handles multi-layered 300 DPI posters, and Squoosh compresses 50MB RAW exports seamlessly on local hardware.'
      },
      {
        question: 'Are my draft illustrations or audio tracks visible to server operators?',
        answer: 'No. The tools in this stack operate as static client-side applications. Your bitmaps, vector shapes, and audio buffers remain confined to your device RAM.'
      }
    ],
    relatedSlugs: ['social-media-growth-box', 'secure-freelancer-toolkit']
  },
  {
    slug: 'secure-freelancer-toolkit',
    title: 'Confidential Client Workflow Stack',
    tagline: 'Professional contracts, encrypted file delivery, and private communication without account footprints',
    persona: 'Freelancers, Contractors & Independent Consultants',
    category: 'Productivity & Privacy',
    icon: '💼',
    heroQuote: 'Deliver world-class client work while keeping non-disclosure agreements and confidential drafts strictly secure.',
    description: 'Independent consultants and freelancers handle highly sensitive client documents—trade secrets, financial statements, and early product roadmaps—under strict non-disclosure obligations. Routing these client assets through invasive third-party SaaS creates legal vulnerability and tracking exposure. This stack equips you with an air-tight, zero-account operational foundation: compile and sign PDF agreements locally, transmit multi-gigabyte deliverables over peer-to-peer encrypted channels, and share sensitive credentials via auto-destructing secret links.',
    guarantees: [
      'Client Files Processed Strictly In Browser',
      'End-to-End Encrypted File Delivery Links',
      'Zero Cloud Retention of NDAs & Invoices',
      'No Persistent Vendor Lock-in or Tracking'
    ],
    items: [
      {
        toolSlug: 'tools-pdf24-org-en',
        roleTitle: 'Contract Signing & PDF Hardening',
        whySelected: 'Merges, signs, protects, and flattens sensitive client contracts and deliverables entirely in-browser without server upload.'
      },
      {
        toolSlug: 'wormhole-app',
        roleTitle: 'E2EE Ephemeral File Delivery',
        whySelected: 'Delivers files up to 10GB with end-to-end encryption and automatic link expiration after 24 hours or download limits.'
      },
      {
        toolSlug: 'privnote-com',
        roleTitle: 'Self-Destructing Secret Handover',
        whySelected: 'Transmits client API keys, staging passwords, and access credentials with single-read self-destructing links.'
      },
      {
        toolSlug: 'temp-mail-org',
        roleTitle: 'Burner Inbox for Client QA Testing',
        whySelected: 'Generates instant temporary inboxes to test customer registration flows and staging email deliverability without spam.'
      },
      {
        toolSlug: 'hemingwayapp-com',
        roleTitle: 'Clarity & Proposal Copy Polish',
        whySelected: 'Analyzes client proposals and deliverables for reading level, passive voice, and stylistic punch with zero remote logging.'
      },
      {
        toolSlug: 'time-is',
        roleTitle: 'Global Client Timezone Synchronization',
        whySelected: 'Displays atomic-precise synchronized time across any global client timezone with zero latency or cookies.'
      }
    ],
    faqs: [
      {
        question: 'How does client-side PDF signing comply with confidentiality agreements?',
        answer: 'Because tools like PDF24 execute signature rendering in the local browser canvas without dispatching the document bytes to remote servers, the file never leaves your physical perimeter—satisfying strict enterprise NDAs.'
      },
      {
        question: 'What happens to files sent via Wormhole once downloaded?',
        answer: 'Wormhole keys are held only in the link URL fragment (#). Once the link reaches its configured expiration or download threshold, the ciphertext is permanently purged from relays.'
      }
    ],
    relatedSlugs: ['ephemeral-creative-suite', 'remote-meeting-clean-stack']
  },
  {
    slug: 'web-developer-quick-kit',
    title: 'Frictionless Dev & Debugging Arsenal',
    tagline: 'Instant syntax validation, payload visualization, offline API docs, and HTTP inspection',
    persona: 'Frontend Engineers, Backend Developers & SREs',
    category: 'Development',
    icon: '⚡',
    heroQuote: 'Debug production incidents and inspect complex payloads without signup friction or token authentication.',
    description: 'Every developer knows the annoyance of needing a quick JSON tree inspection or regex match breakdown, only to be confronted with a "Sign in with GitHub" wall and a 5-step onboarding wizard. The Frictionless Dev & Debugging Arsenal curates the quickest, most dependable developer utilities on the web. These tools boot in milliseconds, operate offline through service workers, and never store your proprietary JSON payloads, database connection strings, or code snippets.',
    guarantees: [
      'Instant Response Times with Zero Onboarding',
      'No Remote Logging of Proprietary API Payloads',
      'Full Keyboard Shortcut & Clipboard Ergonomics',
      'Reliable Offline PWA Support'
    ],
    items: [
      {
        toolSlug: 'devdocs-io',
        roleTitle: 'Offline Unified API Documentation',
        whySelected: 'Fast, searchable, keyboard-driven offline documentation covering 100+ programming languages, frameworks, and web standards.'
      },
      {
        toolSlug: 'regex101-com',
        roleTitle: 'Deep Regular Expression Debugger',
        whySelected: 'Interactive regex engine breakdown with visual AST match trees, PCRE/JavaScript/Python syntax checks, and unit test suites.'
      },
      {
        toolSlug: 'jsoncrack-com',
        roleTitle: 'Visual Hierarchical Graph Inspector',
        whySelected: 'Transforms dense, nested JSON and GraphQL response payloads into interactive, pan-and-zoom node tree diagrams.'
      },
      {
        toolSlug: 'hoppscotch-io',
        roleTitle: 'Open-Source API Request Sandbox',
        whySelected: 'High-performance HTTP, WebSocket, and GraphQL testing client running purely in browser without mandatory cloud accounts.'
      },
      {
        toolSlug: 'carbon-now-sh',
        roleTitle: 'Syntax-Highlighted Code Presentation',
        whySelected: 'Renders high-resolution, branded code snippet images for technical documentation, pull requests, and architecture reviews.'
      },
      {
        toolSlug: 'caniuse-com',
        roleTitle: 'Browser Compatibility Support Matrix',
        whySelected: 'The definitive benchmark for CSS, HTML, and JavaScript Web API cross-browser adoption, baseline specs, and engine compatibility.'
      }
    ],
    faqs: [
      {
        question: 'Are my proprietary JSON payloads or API endpoints safe on these tools?',
        answer: 'Yes. Tools like JSON Crack and Regex101 process your input strictly within the browser DOM and WebAssembly memory. They do not persist or transmit data to remote servers.'
      },
      {
        question: 'Can DevDocs be used when on an airplane or offline?',
        answer: 'Yes. DevDocs utilizes browser IndexedDB and Service Workers to cache entire documentation libraries locally for fast offline access.'
      }
    ],
    relatedSlugs: ['data-analyst-sanitizer-box', 'crypto-investor-privacy-suite']
  },
  {
    slug: 'academic-privacy-station',
    title: 'Air-Gapped Writing & Research Desk',
    tagline: 'Distraction-free Markdown drafting, multi-language grammar verification, and mathematical simulation',
    persona: 'Academics, Researchers & University Students',
    category: 'Writing & Education',
    icon: '📚',
    heroQuote: 'Protect intellectual originality and research discoveries from commercial AI crawlers and data brokers.',
    description: 'Academic manuscripts, unpublished clinical trials, and mathematical proofs represent years of intellectual effort. Submitting unreleased drafts into cloud writing suites often exposes your research to undisclosed AI model training, corporate telemetry, and potential academic scoop risks. The Air-Gapped Writing & Research Desk establishes a sovereign intellectual workspace: draft in clean Markdown, audit linguistic precision, compute complex equations, and compile PDF chapters without a single user profile or tracking footprint.',
    guarantees: [
      'Unpublished Theses Protected from AI Ingestion',
      'Local-First Formula & Function Calculations',
      'Distraction-Free Minimalist User Interfaces',
      'Zero Cloud Sync Conflicts or Paywalls'
    ],
    items: [
      {
        toolSlug: 'dillinger-io',
        roleTitle: 'Clean Markdown Drafting & Export',
        whySelected: 'Distraction-free split-pane Markdown editor with real-time HTML preview, word counts, and instant PDF/HTML compilation.'
      },
      {
        toolSlug: 'languagetool-org',
        roleTitle: 'Linguistic & Grammar Audit Engine',
        whySelected: 'Multi-lingual spelling, grammar, and style verification supporting over 30 languages with zero mandatory login.'
      },
      {
        toolSlug: 'desmos-com-calculator',
        roleTitle: 'Interactive Graphing & Formula Sandbox',
        whySelected: 'The world standard for graphing mathematical curves, regression models, polar coordinates, and calculus functions.'
      },
      {
        toolSlug: 'wolframalpha-com',
        roleTitle: 'Computational Knowledge Engine',
        whySelected: 'Algorithmic problem solving across differential equations, statistical distributions, physics constants, and chemistry formulas.'
      },
      {
        toolSlug: 'tools-pdf24-org-en',
        roleTitle: 'Academic Paper Compression & OCR',
        whySelected: 'Extracts pages, generates searchable text via client-side OCR, and shrinks scanned journal manuscripts for repository submission.'
      },
      {
        toolSlug: 'duck-ai',
        roleTitle: 'Private Anonymous AI Research Assistant',
        whySelected: 'Access state-of-the-art language models without storing search histories, profiling researcher queries, or training models on prompt text.'
      }
    ],
    faqs: [
      {
        question: 'Will my research prompts be used to train future AI models on DuckDuckGo AI?',
        answer: 'No. DuckDuckGo AI routes queries through privacy-preserving proxy relays and has explicit contractual guarantees that user prompts are never retained for model training.'
      },
      {
        question: 'Can I export LaTeX formulas and equations easily?',
        answer: 'Yes. Desmos allows direct copying of LaTeX representations, and Dillinger provides native MathJax rendering for inline equations.'
      }
    ],
    relatedSlugs: ['web-developer-quick-kit', 'secure-freelancer-toolkit']
  },
  {
    slug: 'crypto-investor-privacy-suite',
    title: 'Zero-KYC & Clean Machine Crypto Stack',
    tagline: 'Cryptographic hashing, local secret encryption, network leak checks, and immutable verification',
    persona: 'Crypto Investors, Web3 Builders & Privacy Advocates',
    category: 'Finance & Security',
    icon: '🛡️',
    heroQuote: 'Execute high-stakes digital asset operations with zero identity linkage and air-gapped cryptographic assurance.',
    description: 'In decentralized finance, operational security (OpSec) is non-negotiable. Connecting to centralized tools that capture IP addresses, device canvas fingerprints, or browser telemetry can irreversibly de-anonymize wallet addresses and expose cold storage vaults. This curated stack brings together battle-tested cryptographic Swiss-Army knives designed specifically for high-assurance, zero-trust environments. Encrypt your seed backups locally, inspect smart contract bytecodes, verify DNS leak protection, and archive blockchain announcements permanently.',
    guarantees: [
      'Client-Side AES-256-GCM Cryptographic Primitives',
      'Zero Identity (KYC) or IP Correlation',
      'Comprehensive WebRTC & DNS Leak Verification',
      'Permanent Immutable Third-Party Snapshots'
    ],
    items: [
      {
        toolSlug: 'hat-sh',
        roleTitle: 'Local File & Seed Phrase AES Encryption',
        whySelected: 'Pure browser-based AES-256-GCM encryption and decryption. Never transmits unencrypted file chunks or passphrases across the wire.'
      },
      {
        toolSlug: 'gchq-github-io-cyberchef',
        roleTitle: 'The Cyber Swiss Army Knife',
        whySelected: 'Construct complex cryptographic pipelines: Keccak256 hashing, base58/hex conversions, ABI decoding, and entropy analysis.'
      },
      {
        toolSlug: 'yopass-se',
        roleTitle: 'Encrypted Ephemeral Secret Sharing',
        whySelected: 'Share private keys or one-time recovery codes using end-to-end client-side encryption and automated zero-knowledge expiration.'
      },
      {
        toolSlug: 'privacytests-org',
        roleTitle: 'Browser Fingerprint & Defense Benchmark',
        whySelected: 'Provides rigorous, automated testing of browser privacy features, tracking defenses, and state partitioning mechanisms.'
      },
      {
        toolSlug: 'dnsleaktest-com',
        roleTitle: 'VPN / Tor Network Integrity Audit',
        whySelected: 'Rapidly identifies whether DNS queries are leaking to your ISP before signing multi-sig transactions or interacting with dApps.'
      },
      {
        toolSlug: 'archive-today',
        roleTitle: 'Immutable On-Chain Event Snapshotting',
        whySelected: 'Creates indelible, legally-defensible web snapshots of token tokenomics, governance proposals, and smart contract audit disclosures.'
      }
    ],
    faqs: [
      {
        question: 'Why is client-side encryption preferable to cloud password managers for seed phrases?',
        answer: 'Cloud password managers introduce centralized breach risk and require master accounts tied to phone numbers or email addresses. Hat.sh uses client-side Web Cryptography APIs, meaning ciphertext is generated locally without an external relay.'
      },
      {
        question: 'Does CyberChef send my cryptographic keys to remote servers?',
        answer: 'No. CyberChef was developed by GCHQ as a 100% client-side application. All operations and recipes run entirely inside your browser JavaScript runtime.'
      }
    ],
    relatedSlugs: ['web-developer-quick-kit', 'secure-freelancer-toolkit']
  },
  {
    slug: 'remote-meeting-clean-stack',
    title: 'No-Track Meeting & Collab Stack',
    tagline: 'Instant video calls, group scheduling grids, real-time whiteboards, and local file transfers',
    persona: 'Remote Teams, Agile Squads & Privacy-First Collectives',
    category: 'Collaboration',
    icon: '🤝',
    heroQuote: 'Host meetings and collaborate in real-time without forcing teammates or clients to download apps or create accounts.',
    description: 'Meeting friction kills momentum. Forcing external clients or internal teams to install Zoom, register for Miro, or sign up for Doodle adds unnecessary delays and privacy compromises. The No-Track Meeting & Collab Stack establishes a friction-free collaboration environment that works entirely in modern web browsers. Jump on encrypted video calls, align schedules across conflicting timezones, draw system architectures on an infinite canvas, and beam files directly over the local network—all in zero clicks.',
    guarantees: [
      'No App Downloads or Account Sign-Ups for Participants',
      'End-to-End WebRTC Video & Audio Encryption',
      'Local-Network Peer-to-Peer File Air-Dropping',
      'Zero Meeting Log Retention or Surveillance'
    ],
    items: [
      {
        toolSlug: 'meet-jit-si',
        roleTitle: 'Instant Encrypted Video Conferences',
        whySelected: 'Launch high-definition video rooms with screen sharing, tile views, and end-to-end encryption without requiring any account or plug-in.'
      },
      {
        toolSlug: 'www-when2meet-com',
        roleTitle: 'Group Timezone Availability Grid',
        whySelected: 'The fastest tool to coordinate group schedules. Participants paint their availability on a shared heatmap without creating accounts.'
      },
      {
        toolSlug: 'tldraw-com',
        roleTitle: 'Infinite Collaborative Sketchpad',
        whySelected: 'Fluid, multi-user real-time whiteboarding canvas with shapes, sticky notes, and arrows designed for seamless team architecture sessions.'
      },
      {
        toolSlug: 'til-re',
        roleTitle: 'Synchronized Meeting Timer & Clock',
        whySelected: 'URL-shareable countdown timers, stopwatches, and meeting clocks keeping sprints, timeboxed standups, and workshops on schedule.'
      },
      {
        toolSlug: 'pairdrop-net',
        roleTitle: 'Peer-to-Peer Local Network File AirDrop',
        whySelected: 'Shares files and text between devices on the same Wi-Fi network using WebRTC peer-to-peer data channels with zero server storage.'
      },
      {
        toolSlug: 'privnote-com',
        roleTitle: 'One-Time Meeting Passcode Handover',
        whySelected: 'Safely delivers meeting access codes, staging links, or confidential agenda notes that self-destruct once viewed.'
      }
    ],
    faqs: [
      {
        question: 'Do meeting participants need to create an account or provide an email?',
        answer: 'Not at all. Every tool in this stack functions instantaneously via shareable URLs. Participants simply click the link in their browser and start collaborating.'
      },
      {
        question: 'Can Jitsi Meet handle large team presentations and screen sharing?',
        answer: 'Yes. Jitsi supports dozens of simultaneous participants, crystal-clear 1080p screen sharing, and presenter focus modes with zero software installation.'
      }
    ],
    relatedSlugs: ['ephemeral-creative-suite', 'secure-freelancer-toolkit']
  },
  {
    slug: 'social-media-growth-box',
    title: 'Instant Creator Sandbox',
    tagline: 'High-engagement GIF creation, background removal, social card previewing, and QR marketing',
    persona: 'Social Media Managers, Indie Hackers & Content Marketers',
    category: 'Media & Marketing',
    icon: '🚀',
    heroQuote: 'Produce eye-catching social media creative and optimize marketing links without monthly subscription fatigue.',
    description: 'In the fast-moving world of social media growth, speed of execution is everything. Waiting on cumbersome desktop software or paying hefty recurring fees for simple background cuts, GIF compressions, or Twitter card previews slows down campaigns. The Instant Creator Sandbox delivers an agile, zero-login content production suite. Clean up avatar photos, convert screen recordings to featherlight GIFs, inspect Open Graph metadata before publishing, and generate print-ready vector QR codes instantly.',
    guarantees: [
      'Rapid Content Prototyping and Export',
      'Zero Watermarks or Artificial Export Limits',
      'No Credit Card Requirements or Free-Trial Traps',
      'Safe Testing of Open Graph Social Previews'
    ],
    items: [
      {
        toolSlug: 'ezgif-com',
        roleTitle: 'Swiss Army Knife for Animated GIFs & Video',
        whySelected: 'Convert MP4 to GIF, crop, resize, reverse, and optimize animated visuals with precise frame-level controls and zero watermarks.'
      },
      {
        toolSlug: 'remove-bg',
        roleTitle: 'Instant AI Background Removal',
        whySelected: 'Cuts out complex hair and product backgrounds in a single drag-and-drop, outputting clean transparent PNGs in seconds.'
      },
      {
        toolSlug: 'metatags-io',
        roleTitle: 'Real-Time Social Card Meta Debugger',
        whySelected: 'Preview how landing pages, blog posts, and products look across Twitter/X cards, Facebook Open Graph, LinkedIn, and Slack.'
      },
      {
        toolSlug: 'audiotrimmer-com',
        roleTitle: 'Audio Teaser & Soundbite Slicer',
        whySelected: 'Cut catchy audio snippets, podcast intros, and sound effects for TikTok, Instagram Reels, and YouTube Shorts with smooth fades.'
      },
      {
        toolSlug: 'qrcode-monkey-com',
        roleTitle: 'High-Resolution Vector QR Code Builder',
        whySelected: 'Generates custom-colored vector QR codes with logo embedding, gradient styles, and infinite resolution SVG/EPS exports.'
      },
      {
        toolSlug: 'ray-so',
        roleTitle: 'High-Impact Social Screenshot Framing',
        whySelected: 'Frames code snippets, tweet quotes, and customer reviews in gorgeous modern gradient backgrounds ready for LinkedIn and X.'
      }
    ],
    faqs: [
      {
        question: 'Do these tools add watermarks to exported marketing images?',
        answer: 'No. The tools curated in this stack produce clean, commercial-ready assets without watermarking, forced brand attribution, or export downgrades.'
      },
      {
        question: 'Why should I debug social meta tags before sharing a URL?',
        answer: 'Platforms like Twitter and LinkedIn aggressively cache Open Graph image previews. Testing with MetaTags.io ensures your image aspect ratios and descriptions render perfectly before launching.'
      }
    ],
    relatedSlugs: ['ephemeral-creative-suite', 'remote-meeting-clean-stack']
  },
  {
    slug: 'data-analyst-sanitizer-box',
    title: 'Air-Gapped Data Wrangling Toolkit',
    tagline: 'In-browser SQLite analysis, table conversions, data visualization, and synthetic dataset generation',
    persona: 'Data Scientists, BI Analysts & Investigative Reporters',
    category: 'Data & Analytics',
    icon: '📊',
    heroQuote: 'Clean, convert, and query sensitive tabular datasets without uploading private spreadsheets to third-party clouds.',
    description: 'Data analysts and investigative journalists regularly handle sensitive CSVs, employee payroll data, financial balances, and confidential survey logs. Uploading these datasets to web-based converters or online BI dashboards is an acute security hazard that can violate GDPR and corporate data handling policies. The Air-Gapped Data Wrangling Toolkit executes all transformations locally: query tables using in-browser WebAssembly SQLite, generate publication-grade SVG charts, convert tables across formats, and create synthetic test data with complete privacy.',
    guarantees: [
      'Zero Server Ingestion of Tabular Datasets',
      'In-Browser WebAssembly SQLite Query Engine',
      'Publication-Quality SVG Vector Charts',
      'Complete Immunity to Cloud Breach Exposure'
    ],
    items: [
      {
        toolSlug: 'lite-datasette-io',
        roleTitle: 'WASM In-Browser SQLite Query Engine',
        whySelected: 'Run full SQL queries, JOINs, and aggregates against CSV and SQLite files inside browser WebAssembly without server uploads.'
      },
      {
        toolSlug: 'csvjson-com',
        roleTitle: 'Tabular Parsing, Cleaning & Restructuring',
        whySelected: 'Rapidly transforms unorganized CSV and TSV files into hierarchical JSON objects or SQL insert scripts entirely in memory.'
      },
      {
        toolSlug: 'tableconvert-com',
        roleTitle: 'Universal Table Format Converter',
        whySelected: 'Bi-directional conversions between Excel spreadsheets, Markdown tables, CSV, HTML tables, and LaTeX tabular environments.'
      },
      {
        toolSlug: 'rawgraphs-io',
        roleTitle: 'Publication-Ready SVG Data Visualizations',
        whySelected: 'Builds complex alluvial diagrams, treemaps, beeswarm plots, and chord graphs directly in browser canvas, exporting clean vector SVGs.'
      },
      {
        toolSlug: 'mockaroo-com',
        roleTitle: 'Synthetic Test Data Generation',
        whySelected: 'Generates up to 1,000 rows of realistic mock names, addresses, emails, and financial amounts to test pipelines without real PII.'
      },
      {
        toolSlug: 'gchq-github-io-cyberchef',
        roleTitle: 'Bulk Data Column Sanitation & Regex',
        whySelected: 'Executes chained regex extraction, column sorting, SHA-256 hashing of identifier columns, and format stripping in seconds.'
      }
    ],
    faqs: [
      {
        question: 'Can I query confidential CSV files containing patient or customer data with Datasette Lite?',
        answer: 'Yes! Datasette Lite runs entirely within your browser using Pyodide and WebAssembly. Your CSV files never leave your computer, making it compliant with strict privacy regulations.'
      },
      {
        question: 'What chart formats can RAWGraphs export?',
        answer: 'RAWGraphs exports vector SVG files, PNG images, and raw data models. The SVG exports can be opened and styled in vector editors like Figma or Illustrator.'
      }
    ],
    relatedSlugs: ['web-developer-quick-kit', 'crypto-investor-privacy-suite']
  }
];

/**
 * @param {string} slug
 * @returns {CuratedCollection | undefined}
 */
export function getCollectionBySlug(slug) {
  return CURATED_COLLECTIONS.find((c) => c.slug === slug);
}

/**
 * @param {string} slug
 * @returns {CuratedCollection[]}
 */
export function getRelatedCollections(slug) {
  const current = getCollectionBySlug(slug);
  if (!current) return [];
  return current.relatedSlugs
    .map((s) => getCollectionBySlug(s))
    .filter(/** @type {(c: CuratedCollection | undefined) => c is CuratedCollection} */ (c) => Boolean(c));
}

/**
 * @param {string} toolSlug
 * @returns {CuratedCollection[]}
 */
export function findCollectionsForTool(toolSlug) {
  return CURATED_COLLECTIONS.filter((c) => c.items.some((item) => item.toolSlug === toolSlug));
}

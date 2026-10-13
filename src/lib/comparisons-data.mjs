// @ts-check

/**
 * @typedef {Object} ComparisonVerdict
 * @property {string} summary
 * @property {string[]} chooseAIf
 * @property {string[]} chooseBIf
 */

/**
 * @typedef {Object} ComparisonPair
 * @property {string} slug
 * @property {string} toolASlug
 * @property {string} toolBSlug
 * @property {string} category
 * @property {string} headline
 * @property {ComparisonVerdict} verdict
 */

/** @type {ComparisonPair[]} */
export const COMPARISON_PAIRS = [
  {
    slug: 'excalidraw-vs-tldraw',
    toolASlug: 'excalidraw-com',
    toolBSlug: 'tldraw-com',
    category: 'Design',
    headline: 'Hand-drawn sketchy whiteboard with end-to-end encryption vs crisp modern minimalist vector canvas',
    verdict: {
      summary: 'Excalidraw is ideal for architects and developers who prefer low-fidelity sketching and zero-knowledge encryption, while tldraw is superior for clean vector UI drafts, sticky note clustering, and smooth canvas navigation.',
      chooseAIf: [
        'You want a hand-drawn sketchy aesthetic that keeps team discussions focused on architecture rather than visual polish',
        'You require zero-knowledge end-to-end encrypted collaboration rooms where the server cannot view canvas data',
        'You need to embed editable scene data directly into exported SVG or PNG files for later re-editing',
      ],
      chooseBIf: [
        'You prefer clean, modern geometric vector lines and sharp typographic layout',
        'You need snappy sticky-note clustering and dynamic arrow binding between shapes',
        'You want a lightweight, distraction-free whiteboard with smooth trackpad and tablet gestures',
      ],
    },
  },
  {
    slug: 'squoosh-vs-tinypng',
    toolASlug: 'squoosh-app',
    toolBSlug: 'tinypng-com',
    category: 'Media',
    headline: 'Client-side WebAssembly image compressor with visual diff vs automated cloud lossy compression',
    verdict: {
      summary: 'Squoosh gives you total client-side privacy and granular control over modern codecs (WebP, AVIF, MozJPEG) in your browser memory, whereas TinyPNG offers rapid drag-and-drop batch compression without manual tweaking.',
      chooseAIf: [
        'You want 100% client-side privacy where your images never leave your local device memory',
        'You need granular slider controls over visual quality, chroma subsampling, and codecs like AVIF or WebP',
        'You need to work offline or process confidential corporate graphics without third-party server exposure',
      ],
      chooseBIf: [
        'You have dozens of PNG/JPEG images you want to batch-compress simultaneously in one drop',
        'You prefer automated, set-and-forget lossy quantization without fiddling with compression codecs',
        'You want consistent, proven web image payload reduction in seconds',
      ],
    },
  },
  {
    slug: 'drawio-vs-excalidraw',
    toolASlug: 'app-diagrams-net',
    toolBSlug: 'excalidraw-com',
    category: 'Productivity',
    headline: 'Enterprise UML & cloud architecture diagramming vs rapid low-fidelity collaborative wireframing',
    verdict: {
      summary: 'Diagrams.net (Draw.io) is the benchmark for formal system flowcharts, cloud infrastructure maps, and ER diagrams, whereas Excalidraw excels at agile team brainstorming, early-stage sketches, and casual visual thinking.',
      chooseAIf: [
        'You need formal architecture stencils (AWS, Google Cloud, Azure, Kubernetes, Cisco, UML, BPMN)',
        'You require automatic layout algorithms, precise orthogonal connector routing, and multi-page diagrams',
        'You want native integration with local storage, Google Drive, OneDrive, or GitHub repositories',
      ],
      chooseBIf: [
        'You want rapid, low-friction whiteboarding without navigating complex stencil panels',
        'You prefer a playful hand-drawn look that prevents bikeshedding on visual layout details',
        'You need instant real-time peer-to-peer encrypted collaboration via a shareable URL',
      ],
    },
  },
  {
    slug: 'pdf24-vs-tinywow',
    toolASlug: 'tools-pdf24-org-en',
    toolBSlug: 'tinywow-com',
    category: 'Productivity',
    headline: 'Unlimited dedicated PDF utility suite vs multi-format all-in-one file conversion toolkit',
    verdict: {
      summary: 'PDF24 Tools is the undisputed leader for high-volume, unrestricted PDF merging, splitting, and OCR, while TinyWow is a broader multi-media utility covering video, audio, image, and PDF workflows under a single roof.',
      chooseAIf: [
        'Your workflow strictly centers on PDF documents (merging, splitting, compressing, OCR, page extraction)',
        'You have large file sizes and do not want artificial file size or hourly task quotas',
        'You want maximum document confidentiality with automated server file purging',
      ],
      chooseBIf: [
        'You need a universal converter that handles video, audio, and images alongside PDF documents',
        'You want quick AI utility tools like background removal and text extraction in the same interface',
        'You need occasional one-off file conversions across disparate media types',
      ],
    },
  },
  {
    slug: 'hemingway-vs-languagetool',
    toolASlug: 'hemingwayapp-com',
    toolBSlug: 'languagetool-org',
    category: 'Writing',
    headline: 'Distraction-free style & readability polishing vs multilingual grammar, spelling, and punctuation checker',
    verdict: {
      summary: 'Hemingway Editor helps you write concise, punchy prose by highlighting passive voice and complex sentences, while LanguageTool is an advanced linguistic engine catching grammatical errors across 30+ languages.',
      chooseAIf: [
        'You want to improve readability, eliminate passive voice, and cut wordy sentences in English writing',
        'You prefer an uncluttered, distraction-free markdown-friendly draft canvas',
        'You want instant color-coded visual feedback on grade reading levels',
      ],
      chooseBIf: [
        'You need rigorous grammar, punctuation, and contextual spelling corrections',
        'You write in languages other than English (German, French, Spanish, Chinese, etc.)',
        'You need formal tone checking, synonym suggestions, and style corrections for professional communication',
      ],
    },
  },
  {
    slug: 'audiomass-vs-audiotrimmer',
    toolASlug: 'audiomass-co',
    toolBSlug: 'audiotrimmer-com',
    category: 'Media',
    headline: 'Full-featured multi-track WebAudio DAW vs instantaneous waveform audio cutter and ringtone maker',
    verdict: {
      summary: 'AudioMass is a complete browser-based digital audio workstation with effects, filters, and spectral analysis, whereas Audio Trimmer is an ultra-fast tool built for slicing audio files and creating ringtones in seconds.',
      chooseAIf: [
        'You need multi-track editing, audio frequency filtering, EQ adjustments, or normalization',
        'You want visual spectrogram analysis and professional audio mastering controls in your browser',
        'You are editing podcast interviews, field recordings, or music tracks with WebAudio API',
      ],
      chooseBIf: [
        'You just need to quickly cut the beginning or end off an MP3/WAV file with zero learning curve',
        'You want to create a mobile ringtone with smooth fade-in and fade-out',
        'You need an ultra-lightweight interface that loads instantly on mobile and desktop',
      ],
    },
  },
  {
    slug: 'jsoncrack-vs-jsonformatter',
    toolASlug: 'jsoncrack-com',
    toolBSlug: 'jsonformatter-org',
    category: 'Development',
    headline: 'Interactive graph-node visualization for nested JSON vs rapid syntax validator, minifier, and beautifier',
    verdict: {
      summary: 'JSON Crack transforms deeply nested JSON payloads into intuitive interactive node graphs, while JSON Formatter is the fast, everyday workhorse for formatting, validating, and minifying payloads.',
      chooseAIf: [
        'You are inspecting complex, deeply nested JSON responses and need a visual bird-eye tree graph',
        'You need to export visual diagram nodes to SVG or PNG for documentation and architecture decks',
        'You want to search and visually trace relationships between entities in an API payload',
      ],
      chooseBIf: [
        'You need instant, lightweight JSON beautification, validation, and minification',
        'You want fast conversion between JSON, XML, CSV, and YAML',
        'You work with massive raw JSON strings and need quick line-by-line linting without graph rendering overhead',
      ],
    },
  },
  {
    slug: 'photopea-vs-ezgif',
    toolASlug: 'photopea-com',
    toolBSlug: 'ezgif-com',
    category: 'Design',
    headline: 'Full Photoshop-grade raster & layer editor vs dedicated animated GIF and frame-by-frame video studio',
    verdict: {
      summary: 'Photopea is a full professional photo and graphics suite supporting PSD layers, masks, and smart objects, whereas ezGIF is the specialized king of animated GIFs, video-to-GIF conversion, and frame-level speed adjustments.',
      chooseAIf: [
        'You need comprehensive raster photo retouching, color grading, and complex layer composites',
        'You work with PSD, AI, Sketch, or RAW image formats with text layers and clipping masks',
        'You want Photoshop-equivalent keyboard shortcuts and blending modes in your browser tab',
      ],
      chooseBIf: [
        'You want to create, optimize, resize, or reverse animated GIF and WebP files',
        'You need to convert short video clips (MP4/WebM) into high-quality animated GIFs with custom framerate',
        'You need to edit animation timing frame by frame without complex timeline layers',
      ],
    },
  },
  {
    slug: 'haikei-vs-fffuel',
    toolASlug: 'haikei-app',
    toolBSlug: 'fffuel-co',
    category: 'Design',
    headline: 'Unified multi-shape vector background studio vs specialized collection of 40+ generative SVG and CSS pattern tools',
    verdict: {
      summary: 'Haikei provides an integrated visual studio for composing customizable layered waves, blobs, and poly-grid backgrounds, while Fffuel offers a modular suite of 40+ distinct generators for SVG noise textures, gradients, and organic graphics.',
      chooseAIf: [
        'You want an integrated canvas studio with interactive controls to compose multi-layer wave, blob, and grid backgrounds',
        'You need real-time fine-tuning of complexity, contrast, and aspect ratio in an all-in-one visual editor',
        'You want instant export of production-ready SVG and PNG background artwork for website hero sections',
      ],
      chooseBIf: [
        'You want standalone micro-tools for niche aesthetics like SVG squiggles, noise textures, and contour maps',
        'You need pure CSS color mesh gradients or procedural SVG patterns without full visual canvas overhead',
        'You prefer exploring dozens of focused single-purpose design generators rather than a single canvas tool',
      ],
    },
  },
  {
    slug: 'csvjson-vs-tableconvert',
    toolASlug: 'csvjson-com',
    toolBSlug: 'tableconvert-com',
    category: 'Data',
    headline: 'Deep developer data parsing and SQL generation vs multi-format markdown, excel, and LaTeX table converter',
    verdict: {
      summary: 'CSVJSON specializes in structural developer transformations between CSV, JSON, and SQL database schemas, while TableConvert focuses on formatting tabular data for documentation (Markdown, LaTeX, HTML, and Excel).',
      chooseAIf: [
        'You need to transform complex nested JSON arrays into tabular CSV or generate SQL INSERT statements',
        'You want granular control over delimiter parsing, key quotes, and JSON hierarchy flattening',
        'You are dealing with API responses and database dump conversions',
      ],
      chooseBIf: [
        'You need to convert tables for documentation into GitHub-flavored Markdown, HTML, or LaTeX format',
        'You want an interactive spreadsheet-like grid editor to clean and edit table cells before exporting',
        'You need to copy Excel or Google Sheets cells directly and output clean web-ready tables',
      ],
    },
  },
  {
    slug: 'desmos-vs-geogebra',
    toolASlug: 'desmos-com-calculator',
    toolBSlug: 'geogebra-org-calculator',
    category: 'Education',
    headline: 'Fast intuitive 2D graphing & equation analysis vs comprehensive 3D geometry, calculus, and CAS algebra suite',
    verdict: {
      summary: 'Desmos is the gold standard for responsive 2D graphing, equation visualization, and classroom algebra, while GeoGebra offers a full mathematical laboratory with dynamic 3D geometry, CAS symbolic computation, and calculus construction.',
      chooseAIf: [
        'You need ultra-fast, intuitive 2D Cartesian and polar equation plotting with instant slider animations',
        'You want clean, uncluttered visual graphs for physics, calculus, or statistics problem sets',
        'You prefer a lightweight interface with zero learning curve for rapid mathematical sketching',
      ],
      chooseBIf: [
        'You require 3D spatial geometry, vector planes, polyhedra, and surface rotation',
        'You need symbolic computer algebra (CAS), polynomial factorization, and step-by-step calculus derivatives',
        'You are building interactive Euclidean geometric proofs with compass, straightedge, and angle bisector tools',
      ],
    },
  },
  {
    slug: 'browserleaks-vs-ipleak',
    toolASlug: 'browserleaks-com',
    toolBSlug: 'ipleak-net',
    category: 'Privacy',
    headline: 'Deep hardware fingerprinting & canvas/WebGL leak audit vs real-time IP, WebRTC, and DNS resolver integrity testing',
    verdict: {
      summary: 'BrowserLeaks provides granular cryptographic hardware fingerprint inspection (Canvas, WebGL, AudioContext, Font metrics), while IPLeak focuses on instantaneous network-layer anonymity diagnostics (WebRTC IPv4/IPv6 leaks, DNS server integrity, torrent IP inspection).',
      chooseAIf: [
        'You want to inspect deep browser fingerprint entropy including HTML5 Canvas hash, WebGL vendor strings, and AudioContext signatures',
        'You are testing anti-detect browsers or fingerprint resistance settings in Brave, Firefox, or Tor Browser',
        'You need technical parameter breakdowns of font rendering metrics and screen hardware properties',
      ],
      chooseBIf: [
        'You need a rapid, unified sanity check on VPN and proxy leaks (WebRTC STUN/TURN candidate leaks)',
        'You want to detect transparent DNS hijacking and verify that all DNS queries resolve through your VPN provider',
        'You need to test torrent client IP binding and geo-location header consistency',
      ],
    },
  },
  {
    slug: 'cyberchef-vs-transform-tools',
    toolASlug: 'gchq-github-io-cyberchef',
    toolBSlug: 'transform-tools',
    category: 'Development',
    headline: 'General cryptographic decoding & byte-level pipeline workbench vs multi-language AST code and schema transpiler',
    verdict: {
      summary: 'CyberChef is the premier data forensics workstation for chaining byte-level decoders, hashes, and parsers, while transform.tools specializes in modern frontend and backend code conversion (JSON to TypeScript, GraphQL to types, CSS to Tailwind, SVG to JSX).',
      chooseAIf: [
        'You are decoding Base64, Hex, URL encoding, gzip streams, or inspecting raw binary byte dumps',
        'You need to chain sequential data operations (e.g. Base64 decode → Gunzip → JSON beautify → SHA-256 hash)',
        'You are doing cybersecurity triage, CTF challenges, or digital forensics without sending data over the network',
      ],
      chooseBIf: [
        'You need instant code generation: JSON to TypeScript interfaces, Rust structs, or Go types',
        'You want to convert design tokens: CSS to Tailwind, SVG to React JSX, or JSON to Zod schemas',
        'You are scaffolding API contracts and type definitions during web engineering',
      ],
    },
  },
  {
    slug: 'comparediff-vs-diffhero',
    toolASlug: 'comparediff-io',
    toolBSlug: 'diffhero-app',
    category: 'Development',
    headline: 'Ultra-fast inline text and markdown diff comparator vs visual side-by-side file syntax differ with line folding',
    verdict: {
      summary: 'Compare Diff delivers an instant, zero-friction inline text differ with clean character-level highlighting in local memory, whereas Diffhero provides a full side-by-side file comparison suite with code syntax highlighting and multi-file support.',
      chooseAIf: [
        'You need a quick, no-nonsense text comparison for pasting two snippets of prose, markdown, or config files',
        'You want instantaneous character-by-character deletion and insertion highlights without extra UI controls',
        'You prefer a clean, minimal interface that executes 100% in local memory with zero external requests',
      ],
      chooseBIf: [
        'You are comparing full source code files with language-aware syntax highlighting and line numbers',
        'You need side-by-side split view with synchronized scrolling and foldable unchanged blocks',
        'You want to upload larger code files and export unified diff patches (.patch / .diff)',
      ],
    },
  },
];

/**
 * @returns {ComparisonPair[]}
 */
export function getComparisonPairs() {
  return COMPARISON_PAIRS;
}

/**
 * @param {string} slug
 * @returns {ComparisonPair | undefined}
 */
export function getComparisonBySlug(slug) {
  return COMPARISON_PAIRS.find((p) => p.slug === slug);
}

/**
 * @param {string} toolSlug
 * @returns {ComparisonPair[]}
 */
export function findComparisonsForTool(toolSlug) {
  return COMPARISON_PAIRS.filter(
    (p) => p.toolASlug === toolSlug || p.toolBSlug === toolSlug
  );
}

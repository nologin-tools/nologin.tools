// @ts-check

/**
 * @typedef {Object} WorkflowStep
 * @property {number} stepNumber
 * @property {string} toolSlug
 * @property {string} actionTitle
 * @property {string} actionDescription
 * @property {string} inputFormat
 * @property {string} outputFormat
 * @property {string} proTip
 */

/**
 * @typedef {Object} WorkflowFAQ
 * @property {string} question
 * @property {string} answer
 */

/**
 * @typedef {Object} WorkflowRecipe
 * @property {string} slug
 * @property {string} title
 * @property {string} category
 * @property {string} timeEstimate
 * @property {'Beginner' | 'Intermediate' | 'Advanced'} difficulty
 * @property {string} privacyGuarantee
 * @property {string} headline
 * @property {string} summary
 * @property {WorkflowStep[]} steps
 * @property {string} whyThisStack
 * @property {WorkflowFAQ[]} faqs
 */

/** @type {WorkflowRecipe[]} */
export const WORKFLOW_RECIPES = [
  {
    slug: 'private-podcast-production',
    title: 'Private Podcast Production Pipeline',
    category: 'Media',
    timeEstimate: '15 mins',
    difficulty: 'Beginner',
    privacyGuarantee: '100% In-Browser Audio Synthesis, Client-Side Image Compression & End-to-End Encrypted Delivery',
    headline: 'Record DAW audio, trim audio segments, compress cover artwork, and distribute podcast master files without a single login',
    summary: 'Legacy podcast publishing pipelines force you into monthly subscription silos like Adobe Audition, Canva, and WeTransfer—all demanding invasive signups and tracking user metadata. This workflow lets independent creators, journalists, and privacy-conscious podcasters produce, polish, and transmit high-fidelity audio episodes entirely inside local browser memory.',
    steps: [
      {
        stepNumber: 1,
        toolSlug: 'audiomass-co',
        actionTitle: 'Record & Multi-Track Edit Raw Audio',
        actionDescription: 'Launch AudioMass in your browser. Record your microphone voice track directly into Web Audio buffers or drag-and-drop existing sound files. Apply parametric equalization, noise gating, dynamic compression, and normalization without sending voice data to remote servers.',
        inputFormat: 'Microphone Stream / Local WAV / MP3',
        outputFormat: 'Lossless 44.1kHz WAV Master',
        proTip: 'Use AudioMass’s "Normalize" effect (-1.0 dBFS) across your main master bus to prevent distortion before downstream clipping.',
      },
      {
        stepNumber: 2,
        toolSlug: 'audiotrimmer-com',
        actionTitle: 'Trim Intros, Outros & Episode Teasers',
        actionDescription: 'Load your exported WAV master into AudioTrimmer. Set surgical in/out timestamps, apply subtle 2-second fade-ins and fade-outs, and render teaser soundbites or clean episode boundaries instantly.',
        inputFormat: 'Exported WAV / MP3 Master',
        outputFormat: 'Clean Segmented MP3 / M4A',
        proTip: 'Exporting smaller 30-second soundbites is ideal for social media sharing while keeping audio file payloads under mobile data limits.',
      },
      {
        stepNumber: 3,
        toolSlug: 'squoosh-app',
        actionTitle: 'Compress Episode Square Cover Artwork',
        actionDescription: 'Drop your 3000x3000px episode cover art into Squoosh. Use Google’s WebAssembly codecs (MozJPEG or WebP) with visual side-by-side diffing to reduce image file size from 12MB to under 300KB without visible pixelation.',
        inputFormat: 'Hi-Res PNG / PSD Raster (3000x3000px)',
        outputFormat: 'Optimized WebP / JPEG Cover Art (<300KB)',
        proTip: 'Apple Podcasts and Spotify reject artwork larger than 512KB. Target 85% quality in MozJPEG for optimal sharpness-to-filesize ratio.',
      },
      {
        stepNumber: 4,
        toolSlug: 'wormhole-app',
        actionTitle: 'Deliver Master Files with End-to-End Encryption',
        actionDescription: 'Drop your final audio episode and cover artwork into Wormhole. Files are encrypted client-side in your browser before transfer. Generate an ephemeral download link that automatically expires after 24 hours or 100 downloads.',
        inputFormat: 'Final Audio Episode + Cover Art Bundle',
        outputFormat: 'Zero-Knowledge Ephemeral Share Link',
        proTip: 'Wormhole supports files up to 10GB with streaming peer-to-peer WebRTC transfer so downloaders can begin fetching before upload finishes.',
      },
    ],
    whyThisStack: 'Commercial podcast tooling captures telemetry on speech waveforms, project names, and listener distributions. By chaining AudioMass (WASM audio DAW), AudioTrimmer (fast boundary slicing), Squoosh (client-side image codec), and Wormhole (zero-knowledge transfer), your confidential interview tapes and media assets never sit unencrypted on corporate clouds.',
    faqs: [
      {
        question: 'Can I produce a broadcast-quality podcast entirely in the browser without software installation?',
        answer: 'Yes. Modern browser WebAssembly engines provide sub-millisecond audio buffer processing. AudioMass delivers 32-bit floating point audio calculations on par with desktop DAWs like Audacity.',
      },
      {
        question: 'Are my audio recordings uploaded to any cloud server during editing?',
        answer: 'No. AudioMass and Squoosh execute entirely in your local browser sandbox memory. Audio files never leave your device until you intentionally share them via Wormhole.',
      },
    ],
  },
  {
    slug: 'secure-document-redaction',
    title: 'Confidential PDF Redaction & Sharing',
    category: 'Privacy',
    timeEstimate: '10 mins',
    difficulty: 'Beginner',
    privacyGuarantee: 'Browser-Engine PDF Manipulation, Cryptographic Hash Sanitization & Local AES-256-GCM Encryption',
    headline: 'Redact sensitive text, strip tracking metadata, apply AES-256 encryption, and deliver private documents with zero third-party leakage',
    summary: 'Legal contracts, tax forms, and medical records contain sensitive PII. Uploading them to random cloud PDF converters exposes your private data to retention algorithms and OCR indexing. This workflow combines PDF24, CyberChef, hat.sh, and Wormhole to sanitize and lock documents completely.',
    steps: [
      {
        stepNumber: 1,
        toolSlug: 'tools-pdf24-org-en',
        actionTitle: 'Redact PII & Merge Target Documents',
        actionDescription: 'Open PDF24 Tools to merge multiple source sheets, rearrange pages, and permanently redact sensitive Social Security numbers, bank details, and personal signatures. The text layer is scrubbed, preventing copy-paste recovery of blacked-out boxes.',
        inputFormat: 'Unredacted Source PDFs / Scans',
        outputFormat: 'Visual & Text-Layer Redacted PDF',
        proTip: 'Never use simple black highlighter rectangles in Acrobat or Word. PDF24 flattens the raster layer to guarantee underlying vector glyphs are irrecoverable.',
      },
      {
        stepNumber: 2,
        toolSlug: 'gchq-github-io-cyberchef',
        actionTitle: 'Inspect Headers & Strip Metadata Footprints',
        actionDescription: 'Load the redacted document into CyberChef. Run the "Extract EXIF" and "Strip metadata" operations to remove printer serials, software author tags, GPS coordinates, and document creation timestamps. Verify file integrity using SHA-256 checksums.',
        inputFormat: 'Redacted PDF File',
        outputFormat: 'Zero-Metadata Sanitized Document + SHA-256 Hash',
        proTip: 'CyberChef was developed by the UK GCHQ for data analysts. It executes 100% client-side via JavaScript without any server transmission.',
      },
      {
        stepNumber: 3,
        toolSlug: 'yopass-se',
        actionTitle: 'Apply Client-Side End-to-End Encryption',
        actionDescription: 'Paste confidential document credentials or payload keys into Yopass. The browser encrypts the data locally with AES-256 before generating a self-destructing one-time access link.',
        inputFormat: 'Sanitized Data / Credentials',
        outputFormat: 'Cryptographically Secured One-Time Decryption Link',
        proTip: 'Send the decryption link over a separate secure channel (e.g. Signal) to adhere to two-factor out-of-band security practices.',
      },
      {
        stepNumber: 4,
        toolSlug: 'wormhole-app',
        actionTitle: 'Distribute via Self-Destructing Link',
        actionDescription: 'Upload the encrypted payload to Wormhole. Set the link lifetime to 24 hours or 1 single download. Once fetched, the file vanishes from the intermediary transfer cache forever.',
        inputFormat: 'Encrypted Payload',
        outputFormat: 'One-Time Self-Destruct Download URL',
        proTip: 'Even if the Wormhole link were intercepted in transit, the payload cannot be decrypted without the recipient holding the decryption keys.',
      },
    ],
    whyThisStack: 'Enterprise PDF tools (Acrobat Pro, Smallpdf) retain document copies for AI analysis and search indexing. By coupling PDF24 (local PDF flattening), CyberChef (metadata deletion), hat.sh (zero-knowledge browser cryptography), and Wormhole (self-destruct transport), sensitive documents stay 100% private.',
    faqs: [
      {
        question: 'Why not just draw black boxes in standard PDF viewers?',
        answer: 'Most basic PDF viewers only overlay black shapes over the text, leaving the underlying selectable text characters intact. PDF24 completely deletes the vector glyphs beneath.',
      },
      {
        question: 'Does hat.sh store my password or decrypted document?',
        answer: 'Never. hat.sh uses the browser-native SubtleCrypto API. All mathematical encryption happens in your computer’s RAM and no plaintext ever leaves your browser window.',
      },
    ],
  },
  {
    slug: 'vector-to-web-asset',
    title: 'Vector Graphic to Production Web Asset',
    category: 'Design',
    timeEstimate: '10 mins',
    difficulty: 'Intermediate',
    privacyGuarantee: '100% Client-Side Vector Synthesis, SVGO Code Cleaning & Modern Image Compression',
    headline: 'Sketch architecture diagrams, fine-tune vector geometry, strip SVG bloat, and compress responsive raster fallbacks with zero design suites',
    summary: 'Building fast modern websites requires crisp vector illustrations and lightweight responsive fallbacks. Heavy desktop software like Illustrator or Figma adds megabytes of proprietary XML namespaces and requires mandatory cloud accounts. This 4-step pipeline delivers ultra-lean SVGs and WebPs directly from your browser.',
    steps: [
      {
        stepNumber: 1,
        toolSlug: 'excalidraw-com',
        actionTitle: 'Sketch Concept Architecture & System Diagram',
        actionDescription: 'Draft your wireframe, database architecture, or user journey diagram in Excalidraw. Leverage the intuitive hand-drawn or clean vector aesthetic with dynamic auto-snapping arrow connectors. Export as clean raw SVG.',
        inputFormat: 'Ideation / Canvas Sketch',
        outputFormat: 'Raw Excalidraw SVG with Embedded Elements',
        proTip: 'Check "Embed Scene" in Excalidraw’s export dialog so you can re-import the SVG later to edit shapes without losing diagram state.',
      },
      {
        stepNumber: 2,
        toolSlug: 'app-diagrams-net',
        actionTitle: 'Fine-Tune Precision Vector Paths & Layout',
        actionDescription: 'Import the raw SVG into Diagrams.net. Adjust layout geometry, align elements to a 4px layout grid, tweak stroke weights, and customize styling directly inside the browser canvas.',
        inputFormat: 'Raw Diagram SVG',
        outputFormat: 'Polished Multi-Node SVG Illustration',
        proTip: 'Diagrams.net runs entirely client-side in the browser and supports exporting clean, standards-compliant SVG code.',
      },
      {
        stepNumber: 3,
        toolSlug: 'jakearchibald-github-io-svgomg',
        actionTitle: 'Strip XML Cruft with SVGO Web GUI',
        actionDescription: 'Drop your SVG into SVGOMG (built by Jake Archibald). Toggle aggressive minification switches: remove doctype, strip XML namespaces, collapse useless groups, minify path coordinates, and convert colors to hex shorthand. Watch file weight drop by 40% to 75%.',
        inputFormat: 'Unoptimized SVG (25KB - 150KB)',
        outputFormat: 'Production-Ready Minified SVG (<5KB)',
        proTip: 'Keep "Round/rewrite numbers" set to 2 decimal places. This preserves razor-sharp visual fidelity while discarding microscopic floating-point noise.',
      },
      {
        stepNumber: 4,
        toolSlug: 'squoosh-app',
        actionTitle: 'Generate Responsive WebP & AVIF Fallbacks',
        actionDescription: 'For platforms that do not support inline SVG or require static OpenGraph preview cards, render your SVG to high-res PNG and drop into Squoosh. Output modern WebP and AVIF assets at 1x and 2x DPR.',
        inputFormat: 'High-Res Raster Export (PNG 2400px)',
        outputFormat: 'Sub-50KB Responsive WebP / AVIF Images',
        proTip: 'Using AVIF in Squoosh can deliver an additional 20% byte savings over WebP for high-contrast illustrations and technical diagrams.',
      },
    ],
    whyThisStack: 'Frontend web performance demands sub-10KB vector icons and diagrams. By chaining Excalidraw for rapid visual thinking, SVG-Edit for precision nodes, SVGOMG for automated SVGO optimization, and Squoosh for raster fallback generation, you construct a complete web graphic studio without Figma or Adobe Cloud accounts.',
    faqs: [
      {
        question: 'Why do SVGs need optimization after exporting from design tools?',
        answer: 'Design tools inject extensive metadata, comments, editor namespaces, and 6-decimal-place coordinate strings that browsers do not need. SVGOMG strips this overhead, drastically improving First Contentful Paint (FCP).',
      },
      {
        question: 'Can I use the exported SVG directly in React or Astro components?',
        answer: 'Yes! The cleaned SVG code from SVGOMG contains no conflicting doctypes or invalid attributes, making it clean for direct JSX/Astro inline embedding.',
      },
    ],
  },
  {
    slug: 'anonymous-markdown-publishing',
    title: 'Distraction-Free Anonymous Publishing',
    category: 'Writing',
    timeEstimate: '12 mins',
    difficulty: 'Beginner',
    privacyGuarantee: '100% Stateless Editorial Memory, Real-Time Readability Scoring & Anonymous Web Publishing',
    headline: 'Draft markdown notes, polish prose readability, inspect grammar, and publish live web articles with zero accounts or tracking footprints',
    summary: 'Publishing thoughts online often requires creating accounts on Medium, Substack, or WordPress—subjecting your writing to author identity verification, behavioral tracking, and algorithmic paywalls. This workflow allows whistleblowers, essayists, and minimalist writers to craft, refine, and publish live web pages anonymously.',
    steps: [
      {
        stepNumber: 1,
        toolSlug: 'dillinger-io',
        actionTitle: 'Draft Articles in Live Split Markdown',
        actionDescription: 'Open Dillinger for a distraction-free typing environment. Take advantage of side-by-side live HTML preview, GitHub Flavored Markdown (GFM) tables, code syntax highlighting, and auto-saving to local browser storage.',
        inputFormat: 'Raw Text / Ideas',
        outputFormat: 'Structured Markdown Document (`.md`)',
        proTip: 'Dillinger stores drafts in your browser’s `localStorage`. You can disconnect from Wi-Fi and write completely offline without interruption.',
      },
      {
        stepNumber: 2,
        toolSlug: 'hemingwayapp-com',
        actionTitle: 'Audit Readability & Trim Wordy Sentences',
        actionDescription: 'Paste your draft into Hemingway Editor. Instantly identify hard-to-read sentences (highlighted in red), passive voice constructions (green), unnecessary adverbs (blue), and simpler word alternatives (purple). Target a Grade 7–9 reading level for maximum clarity.',
        inputFormat: 'Markdown Prose Text',
        outputFormat: 'Punchy, High-Clarity Narrative',
        proTip: 'Aim to reduce red highlighted sentences to under 5% of your total paragraph count to keep technical and persuasive essays engaging.',
      },
      {
        stepNumber: 3,
        toolSlug: 'languagetool-org',
        actionTitle: 'Deep Proofread & Multilingual Grammar Check',
        actionDescription: 'Pass your refined text through LanguageTool. Catch subtle contextual misspellings, misplaced commas, false friends in 30+ languages, and stylistic inconsistencies without sending data to ad networks.',
        inputFormat: 'Polished Narrative Draft',
        outputFormat: 'Grammatically Flawless Publication Copy',
        proTip: 'LanguageTool detects nuanced language traps that basic spellcheckers miss, such as their/there confusion and hyphenation in compound modifiers.',
      },
      {
        stepNumber: 4,
        toolSlug: 'write-as',
        actionTitle: 'Publish Instantly to the Web Without Signup',
        actionDescription: 'Paste your finished markdown into Write.as. Hit "Publish" to generate a clean, typography-focused live web page instantly. No email verification, no username registration, and no tracking scripts injected into your readers’ browsers.',
        inputFormat: 'Final Markdown / HTML Text',
        outputFormat: 'Live Global Public URL (Fast & Ad-Free)',
        proTip: 'Save the secret edit token provided by Write.as in your personal notes so you can update or delete your anonymous article in the future.',
      },
    ],
    whyThisStack: 'Platforms like Medium force readers to log in and track every mouse movement. Chaining Dillinger (local writing), Hemingway (readability polish), LanguageTool (grammar audit), and Write.as (accountless publishing) establishes a clean, modern freedom-of-speech publishing stack.',
    faqs: [
      {
        question: 'Can readers view my Write.as article without an account or paywall?',
        answer: 'Yes. Write.as generates clean static HTML pages readable by anyone on mobile or desktop without intrusive subscription popups or paywalls.',
      },
      {
        question: 'Does Write.as track my IP address or personal identity?',
        answer: 'Write.as is engineered from the ground up for anonymity. It does not require personal credentials, uses minimal access logging, and supports publishing over Tor or VPNs.',
      },
    ],
  },
  {
    slug: 'api-payload-debugging',
    title: 'Developer API Payload & Token Debugging',
    category: 'Development',
    timeEstimate: '8 mins',
    difficulty: 'Intermediate',
    privacyGuarantee: '100% In-Browser AST Traversal, Zero Remote API Logging & Offline Token Decoding',
    headline: 'Visualize complex JSON trees, validate schemas, generate typed code definitions, and inspect JWT tokens without exposing API credentials',
    summary: 'Pasting production API payloads, database rows, or OAuth bearer tokens into arbitrary web utilities exposes confidential user records, customer emails, and session secrets to third-party databases. This developer stack runs entirely in your browser sandbox to inspect, type, and validate payloads securely.',
    steps: [
      {
        stepNumber: 1,
        toolSlug: 'jsoncrack-com',
        actionTitle: 'Visualize Nested Response Trees & Relationships',
        actionDescription: 'Paste your raw API JSON response into JSON Crack. The tool dynamically parses the schema into an interactive node graph with zoom, pan, and collapsible object clusters. Spot nested arrays, null properties, and structure bugs instantly.',
        inputFormat: 'Raw Unformatted JSON String',
        outputFormat: 'Interactive Visual Graph & Node Map',
        proTip: 'Use JSON Crack’s search filter to highlight all occurrences of keys like `id`, `status`, or `error` across multi-megabyte payloads.',
      },
      {
        stepNumber: 2,
        toolSlug: 'jsonformatter-org',
        actionTitle: 'Validate Syntax, Format & Minify Payload',
        actionDescription: 'Load the JSON into JSON Formatter. Ensure proper RFC 8259 syntax compliance, identify unclosed braces or trailing commas, and generate beautified 2-space indented code for documentation or minified strings for API mock testing.',
        inputFormat: 'Potentially Malformed JSON String',
        outputFormat: 'Strictly Validated & Indented JSON',
        proTip: 'Validating against strict RFC 8259 prevents subtle parsing bugs in production Go and Java backends that reject non-standard JSON quotes.',
      },
      {
        stepNumber: 3,
        toolSlug: 'transform-tools',
        actionTitle: 'Generate TypeScript Interfaces, Go Structs & Rust Types',
        actionDescription: 'Drop the validated JSON into transform.tools. Instantly transform the payload into fully-typed TypeScript interfaces, Go struct tags with `json:"..."`, Rust serde structs, or Python Pydantic models with automated type inference.',
        inputFormat: 'Sample JSON Object Data',
        outputFormat: 'Type-Safe Code Definitions (TS / Go / Rust / Python)',
        proTip: 'Transform.tools handles union types and optional nullable fields automatically, saving hours of manual boilerplate type authoring.',
      },
      {
        stepNumber: 4,
        toolSlug: 'jwt-io',
        actionTitle: 'Decode & Inspect JWT Authentication Tokens',
        actionDescription: 'Paste your Authorization Bearer token into JWT.io. Decode the Base64URL header and payload claims (`iss`, `sub`, `exp`, `roles`) instantly. Verify expiration timestamps and algorithm integrity without sending your JWT secret over the wire.',
        inputFormat: 'Base64URL JWT String (`eyJ...`)',
        outputFormat: 'Decoded JSON Claims & Header Specifications',
        proTip: 'Verify the `exp` unix epoch timestamp against your local machine time to diagnose cryptic 401 Unauthorized errors in API gateways.',
      },
    ],
    whyThisStack: 'Enterprise API payloads often carry sensitive database columns and internal user IDs. Using this client-side debugging pipeline (JSON Crack, JSON Formatter, transform.tools, and JWT.io) guarantees your internal schemas and API tokens never end up in cloud telemetry logs.',
    faqs: [
      {
        question: 'Is it safe to paste confidential production JSON into these tools?',
        answer: 'Yes, because JSON Crack, transform.tools, and JWT.io process your data strictly in local browser JavaScript memory without transmitting the payload to backend servers.',
      },
      {
        question: 'Can I generate types for multiple programming languages at once?',
        answer: 'Yes! Transform.tools supports TypeScript, Go, Rust, Kotlin, Swift, Python, and C# conversions with a single click.',
      },
    ],
  },
  {
    slug: 'ephemeral-team-sync',
    title: 'Ephemeral Zero-Account Team Meeting',
    category: 'Productivity',
    timeEstimate: '5 mins',
    difficulty: 'Beginner',
    privacyGuarantee: 'WebRTC Peer-to-Peer Encryption, Zero-Signup Video Rooms & Anonymous Time Coordination',
    headline: 'Coordinate meeting availability, spin up encrypted video conferences, and brainstorm on collaborative whiteboards without any accounts',
    summary: 'Scheduling an ad-hoc sync with external contractors, clients, or cross-functional teams usually requires navigating calendar invitations, Google Workspace logins, and Zoom client downloads. This recipe lets teams align time, meet on video, and co-design architecture in under 5 minutes with zero accounts.',
    steps: [
      {
        stepNumber: 1,
        toolSlug: 'www-when2meet-com',
        actionTitle: 'Poll Team Availability Without Signups',
        actionDescription: 'Create a When2meet event with your target dates and hour ranges. Share the unique event link with participants. Each team member drags across the calendar grid to mark available time slots without logging in. The heat map instantly reveals the optimal meeting window.',
        inputFormat: 'Proposed Meeting Dates & Time Range',
        outputFormat: 'Consolidated Participant Availability Heatmap',
        proTip: 'Hovering over any green block on When2meet reveals exactly which participants are available, making conflicting compromise decisions effortless.',
      },
      {
        stepNumber: 2,
        toolSlug: 'meet-jit-si',
        actionTitle: 'Launch Instant Encrypted Video Call',
        actionDescription: 'Navigate to Jitsi Meet and enter a custom room name (e.g. `nologin-sync-789`). Share the room URL with attendees. Enjoy HD video, spatial audio, screen sharing, and end-to-end encryption directly in Chrome, Firefox, or Safari with zero registration.',
        inputFormat: 'Browser Camera & Microphone Permissions',
        outputFormat: 'Multi-Party Encrypted Video Conference',
        proTip: 'Add a room password in Jitsi Meet’s security settings once all your expected attendees have joined to lock the meeting against room-hopping drop-ins.',
      },
      {
        stepNumber: 3,
        toolSlug: 'excalidraw-com',
        actionTitle: 'Co-Design on Real-Time E2EE Whiteboard',
        actionDescription: 'Click "Live Collaboration" in Excalidraw to start a session. Copy the shareable link into your Jitsi chat. All participants can draw, type sticky notes, sketch architecture boxes, and point with live cursor presence—protected by end-to-end encryption.',
        inputFormat: 'Collaborative Ideas & Diagram Needs',
        outputFormat: 'Shared E2EE Canvas + Exported PNG/SVG Summary',
        proTip: 'Excalidraw’s collaboration uses client-side encryption keys in the URL hash, meaning even the relay server cannot inspect your whiteboard drawings.',
      },
    ],
    whyThisStack: 'Corporate video and collaboration tools like Zoom, Teams, and Miro harvest meeting attendance, user graphs, and behavioral biometric metrics. By combining When2meet (anonymous polling), Jitsi Meet (open WebRTC video), and Excalidraw (E2EE visual collaboration), your meetings leave zero permanent corporate footprints.',
    faqs: [
      {
        question: 'Do attendees need to install any app or plugin to join?',
        answer: 'No. Jitsi Meet, Excalidraw, and When2meet run 100% natively in all modern web browsers on laptops, tablets, and smartphones.',
      },
      {
        question: 'Is there a meeting time limit like Zoom’s 40-minute cap?',
        answer: 'No. Jitsi Meet has no artificial meeting duration caps or forced disconnect timers.',
      },
    ],
  },
  {
    slug: 'csv-data-cleansing-and-viz',
    title: 'Tabular Data Cleansing & Charting',
    category: 'Data',
    timeEstimate: '10 mins',
    difficulty: 'Intermediate',
    privacyGuarantee: '100% Client-Side In-Memory Data Processing, Zero Database Storage & Vector Chart Export',
    headline: 'Parse messy CSV datasets, reformat into Markdown/LaTeX tables, and render publication-ready vector charts without exposing proprietary data',
    summary: 'Analysts and researchers frequently need to clean raw business exports, format tables for academic papers, and visualize trends for executive briefings. Uploading proprietary sales figures or user datasets to cloud dashboards risks data exfiltration. This workflow sanitizes, formats, and graphs tabular data entirely inside your browser.',
    steps: [
      {
        stepNumber: 1,
        toolSlug: 'csvjson-com',
        actionTitle: 'Parse, Clean & Transpose Messy Delimited Data',
        actionDescription: 'Paste your raw CSV, TSV, or spreadsheet export into CSVJSON. Select delimiters, handle quoted strings, detect column types, transpose rows into columns, or convert flat records into hierarchical JSON structures.',
        inputFormat: 'Raw Comma/Tab Delimited CSV String',
        outputFormat: 'Normalized JSON Array / Clean CSV Table',
        proTip: 'Use CSVJSON’s "Parse JSON values" toggle to parse nested JSON strings inside specific table columns automatically.',
      },
      {
        stepNumber: 2,
        toolSlug: 'tableconvert-com',
        actionTitle: 'Convert to Markdown, HTML & LaTeX Formats',
        actionDescription: 'Load your clean tabular data into TableConvert. Format and align columns, filter rows, and generate formatted Markdown tables for GitHub READMEs, HTML `<table>` snippets, or publication-ready LaTeX tables for Overleaf research papers.',
        inputFormat: 'Clean Tabular Data',
        outputFormat: 'Markdown Table / HTML Snippet / LaTeX Matrix',
        proTip: 'TableConvert features an interactive table editor where you can sort columns, edit cell values directly, and copy formatted Markdown in one click.',
      },
      {
        stepNumber: 3,
        toolSlug: 'rawgraphs-io',
        actionTitle: 'Render Publication-Ready Vector Visualizations',
        actionDescription: 'Drop your cleaned dataset into RAWGraphs. Map dimensions to visual channels and choose from advanced charts: alluvial diagrams, circular treemaps, beeswarm plots, bump charts, or convex hulls. Customize color palettes and export vector SVG or high-res PNG.',
        inputFormat: 'Clean Tabular CSV / JSON Dataset',
        outputFormat: 'Publication-Grade SVG / PNG Chart',
        proTip: 'Export as SVG to easily adjust typography, legend placement, or color fills in vector software like SVG-Edit without rerendering.',
      },
    ],
    whyThisStack: 'Corporate analytics platforms like Tableau or PowerBI require costly subscriptions and upload company financials to cloud data warehouses. Chaining CSVJSON (in-memory parsing), TableConvert (multi-syntax conversion), and RAWGraphs (client-side D3 rendering) gives data professionals an airtight private data science bench.',
    faqs: [
      {
        question: 'Does RAWGraphs upload my dataset to a remote cloud server?',
        answer: 'No. RAWGraphs processes all data calculations and D3 vector rendering directly in your browser’s JavaScript thread. Your data never touches any external server.',
      },
      {
        question: 'Can I export charts as vector graphics for research paper publication?',
        answer: 'Yes. RAWGraphs exports crisp vector SVG files that scale infinitely without pixelation and can be inserted into LaTeX/PDF publications.',
      },
    ],
  },
  {
    slug: 'social-media-media-prep',
    title: 'Social Media Graphic & GIF Optimization',
    category: 'Design',
    timeEstimate: '10 mins',
    difficulty: 'Beginner',
    privacyGuarantee: '100% Client-Side Raster Canvas, Local WebP/AVIF Encoding & Lossless GIF Optimization',
    headline: 'Design multi-layer graphics, crop and compress animated GIFs, and output ultra-fast WebP assets without Adobe or Canva subscriptions',
    summary: 'Producing high-engagement content for X (Twitter), LinkedIn, and blogs demands crisp banners, smooth animated GIFs, and lightweight thumbnails. Canva and Adobe require subscriptions and watermark non-paying accounts. This lightweight stack equips content creators with Photoshop-level editing, GIF optimization, and WebP compression.',
    steps: [
      {
        stepNumber: 1,
        toolSlug: 'photopea-com',
        actionTitle: 'Compose Multi-Layer Social Media Banners',
        actionDescription: 'Open Photopea for a complete in-browser Photoshop equivalent. Create canvas dimensions (e.g. 1200x675px for Twitter/LinkedIn), add raster layers, apply blending modes, insert text typography, and adjust curves and color balances.',
        inputFormat: 'PSD / JPG / PNG / RAW Assets',
        outputFormat: 'Composed Full-Fidelity Graphic Asset',
        proTip: 'Photopea can open and save native Photoshop `.psd` files with full layer hierarchy and layer masks intact, right in your browser.',
      },
      {
        stepNumber: 2,
        toolSlug: 'ezgif-com',
        actionTitle: 'Cut, Speed Up & Compress Animated GIFs',
        actionDescription: 'Upload screen recordings or short video clips to ezGIF. Trim exact start and stop frame timestamps, crop to 16:9 or 1:1 square ratios, adjust frame rate (fps), and run the lossy GIF optimizer to slash file size by 30–60% without stutter.',
        inputFormat: 'MP4 Video / Animated GIF / WebM',
        outputFormat: 'Optimized, Smooth Animated GIF (<5MB)',
        proTip: 'Use ezGIF’s "Color Reduction" and "Drop Frames" settings to bring heavy GIFs under Twitter’s 15MB and Discord’s 8MB limits effortlessly.',
      },
      {
        stepNumber: 3,
        toolSlug: 'squoosh-app',
        actionTitle: 'Compress Final Thumbnails with WebP Codecs',
        actionDescription: 'Drop your final graphics into Squoosh. Compare original vs compressed output using the interactive split slider. Adjust MozJPEG or WebP compression ratios to hit crisp clarity while keeping total file size under 150KB for instant web page loads.',
        inputFormat: 'High-Res Raster PNG / JPEG',
        outputFormat: 'Sub-150KB WebP / MozJPEG Image',
        proTip: 'WebP compression generally provides a 25–35% smaller file size than standard JPEG at identical perceived visual quality.',
      },
    ],
    whyThisStack: 'Commercial design apps lock basic export resolutions and transparent PNGs behind paywalls. Chaining Photopea (full PSD manipulation), ezGIF (surgical video/GIF trimming), and Squoosh (WebAssembly image optimization) grants creators complete graphic autonomy without subscriptions.',
    faqs: [
      {
        question: 'Can Photopea really replace desktop Photoshop for social media graphics?',
        answer: 'Yes! Photopea supports layer styles, text layers, vector masks, smart objects, and keyboard shortcuts identical to Photoshop, running entirely in browser WebGL.',
      },
      {
        question: 'How do I keep my animated GIFs under Twitter and Discord file limits?',
        answer: 'In ezGIF, set fps to 12–15, crop unnecessary borders, and use the Lossy GIF compressor with an optimization level between 30 and 80 to shrink file sizes by more than half.',
      },
    ],
  },
  {
    slug: 'geodata-to-interactive-map',
    title: 'Spatial Data Mapping & Format Pipeline',
    category: 'Data',
    timeEstimate: '10 mins',
    difficulty: 'Intermediate',
    privacyGuarantee: '100% In-Browser Vector Geometry Processing, Zero Map Server Tracking & Custom SVG Export',
    headline: 'Inspect and edit GeoJSON points and polygons, convert GIS coordinate formats, and visualize spatial distributions without ArcGIS',
    summary: 'Urban planners, cartographers, and developers often struggle with complex GIS formats like Shapefile, KML, and GeoJSON. Proprietary mapping platforms like ArcGIS or Mapbox require API keys, payment tiers, and developer logins. This workflow provides an instant, zero-login spatial workbench.',
    steps: [
      {
        stepNumber: 1,
        toolSlug: 'geojson-io',
        actionTitle: 'Inspect, Draw & Edit GeoJSON Geometries',
        actionDescription: 'Open GeoJSON.io. Draw point markers, polygons, and multi-line strings directly over a live satellite or street map. The right-hand panel renders the synchronized GeoJSON code in real time, allowing manual property editing and feature inspections.',
        inputFormat: 'Raw Coordinate Strings / GeoJSON File',
        outputFormat: 'Strict GeoJSON FeatureCollection',
        proTip: 'You can drag and drop existing KML, GPX, or TopoJSON files into GeoJSON.io and it will automatically parse them onto the map canvas.',
      },
      {
        stepNumber: 2,
        toolSlug: 'convertio-co',
        actionTitle: 'Convert GIS Coordinate Formats & Tabular Data',
        actionDescription: 'Use Convertio to convert GIS spatial outputs into CSV coordinate matrices, XML structures, or compressed archives. Convert between KML, KMZ, GPX, and spreadsheet formats in seconds.',
        inputFormat: 'GeoJSON / KML / GPX File',
        outputFormat: 'Converted CSV Coordinates / Standard Data File',
        proTip: 'Convertio processes files securely with automatic file deletion from their processing nodes within 24 hours.',
      },
      {
        stepNumber: 3,
        toolSlug: 'rawgraphs-io',
        actionTitle: 'Render Spatial Distribution Charts & Projections',
        actionDescription: 'Load coordinate tables and spatial attributes into RAWGraphs. Choose scatter plots, hexagonal binning, or contour density maps to visualize geographic clustering and demographic distributions without rendering bloated web map tiles.',
        inputFormat: 'Clean Coordinate CSV / GeoJSON Attributes',
        outputFormat: 'High-Resolution Vector Distribution Graphic (SVG)',
        proTip: 'Hexagonal binning is especially effective for visualizing dense urban coordinate clusters that would otherwise suffer from point overplotting.',
      },
    ],
    whyThisStack: 'Enterprise GIS software suites are notorious for steep learning curves and mandatory licensing servers. Combining GeoJSON.io (interactive vector cartography), Convertio (rapid format bridging), and RAWGraphs (density and distribution visualization) provides a rapid geodata workflow directly in any browser tab.',
    faqs: [
      {
        question: 'Can I draw custom delivery zones or geofences using GeoJSON.io?',
        answer: 'Yes. Use the polygon tool on GeoJSON.io to trace your geographic boundaries. The tool immediately outputs the valid GeoJSON polygon coordinates for use in backends or databases.',
      },
      {
        question: 'Does GeoJSON.io work with GPS tracks from smartwatches and bikes?',
        answer: 'Yes. Simply drag your `.gpx` file onto the GeoJSON.io window and your GPS route will be rendered along with full coordinate waypoints.',
      },
    ],
  },
  {
    slug: 'browser-privacy-and-leak-audit',
    title: 'Complete Browser Leak & Security Audit',
    category: 'Privacy',
    timeEstimate: '8 mins',
    difficulty: 'Beginner',
    privacyGuarantee: 'Zero-Trace Local Diagnostic Testing, Real-Time WebRTC Leak Detection & OS Hardening Scripts',
    headline: 'Audit browser fingerprinting, uncover WebRTC IP leaks, test DNS resolver integrity, and generate local OS privacy hardening scripts',
    summary: 'VPN marketing claims frequently promise 100% anonymity, yet hidden WebRTC leaks, ISP DNS hijacking, and missing HTTP headers expose users every day. Commercial privacy audit portals often track your visits and attempt to upsell affiliate VPNs. This workflow executes an objective, zero-login 4-point privacy and security audit.',
    steps: [
      {
        stepNumber: 1,
        toolSlug: 'ipleak-net',
        actionTitle: 'Detect Public IP, WebRTC Leaks & Geolocation',
        actionDescription: 'Visit IPLeak to instantly scan your connection. Verify whether your real residential IPv4/IPv6 address is exposed through browser WebRTC STUN requests, and check whether your browser reveals device battery, canvas fingerprint, or system timezone.',
        inputFormat: 'Active Browser Network Session',
        outputFormat: 'Comprehensive IP, WebRTC & Location Report',
        proTip: 'If your true ISP address appears under the "WebRTC IP Addresses" section while connected to a VPN, disable WebRTC in your browser settings immediately.',
      },
      {
        stepNumber: 2,
        toolSlug: 'dnsleaktest-com',
        actionTitle: 'Test DNS Resolver Integrity & ISP Hijacking',
        actionDescription: 'Run the Extended Test on DNS Leak Test. The tool generates dozens of synthetic DNS queries to detect whether your DNS lookups are being quietly routed through your local ISP rather than your trusted encrypted resolver.',
        inputFormat: 'Recursive DNS Query Stream',
        outputFormat: 'Verified Resolver Server IPs & Hostnames',
        proTip: 'In a secure configuration, all resolved servers should match your chosen secure DNS provider (e.g. Quad9, Cloudflare 1.1.1.1) rather than your internet service provider.',
      },
      {
        stepNumber: 3,
        toolSlug: 'securityheaders-com',
        actionTitle: 'Audit HTTP Security Headers & Transport Security',
        actionDescription: 'Enter any website domain or personal portal into Security Headers (created by Scott Helme). Evaluate crucial protection headers: Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), X-Frame-Options, and Referrer-Policy.',
        inputFormat: 'Target Domain URL (e.g. `yourdomain.com`)',
        outputFormat: 'Graded Security Scorecard (A+ to F) with Fixes',
        proTip: 'An A+ grade requires HSTS with `preload` and `includeSubDomains` along with a robust Content Security Policy that restricts unauthorized script execution.',
      },
      {
        stepNumber: 4,
        toolSlug: 'privacy-sexy',
        actionTitle: 'Generate Local OS Privacy Hardening Scripts',
        actionDescription: 'Open privacy.sexy to eliminate OS-level telemetry and background data exfiltration. Select targeted toggles for Windows, macOS, or Linux to disable diagnostic tracking, disable cloud clipboard sync, and disable ad IDs. Review and run the script locally.',
        inputFormat: 'OS Platform Selection & Desired Privacy Toggles',
        outputFormat: 'Transparent, Open-Source Bash / PowerShell Script',
        proTip: 'privacy.sexy scripts are fully readable plain text. You can inspect every single command line before executing it on your machine.',
      },
    ],
    whyThisStack: 'True digital privacy requires defense-in-depth across the browser, network, server, and operating system. Combining IPLeak (network & WebRTC), DNS Leak Test (resolver integrity), Security Headers (web transport security), and privacy.sexy (OS telemetry removal) gives you a complete audit without signing up for commercial privacy services.',
    faqs: [
      {
        question: 'What is a WebRTC leak and why is it dangerous?',
        answer: 'WebRTC is an in-browser technology used for video and voice calls. However, it can bypass your VPN tunnel to query local network interfaces, revealing your true ISP IP address to any website you visit.',
      },
      {
        question: 'Are privacy.sexy scripts safe to run on my computer?',
        answer: 'Yes. privacy.sexy is open-source and displays every script command in plain view before you run it. It also includes built-in revert scripts to restore default settings whenever needed.',
      },
    ],
  },
];

/**
 * Return all curated workflow recipes
 * @returns {WorkflowRecipe[]}
 */
export function getWorkflowRecipes() {
  return WORKFLOW_RECIPES;
}

/**
 * Find a specific workflow recipe by slug
 * @param {string} slug
 * @returns {WorkflowRecipe | undefined}
 */
export function getWorkflowBySlug(slug) {
  return WORKFLOW_RECIPES.find((w) => w.slug === slug);
}

/**
 * Find all workflow recipes that feature a specific tool slug
 * @param {string} toolSlug
 * @returns {WorkflowRecipe[]}
 */
export function findWorkflowsForTool(toolSlug) {
  return WORKFLOW_RECIPES.filter((w) =>
    w.steps.some((step) => step.toolSlug === toolSlug)
  );
}

// @ts-check

/**
 * @typedef {Object} AlternativeTarget
 * @property {string} slug
 * @property {string} name
 * @property {string} category
 * @property {string[]} aliases
 * @property {string} headline
 * @property {string} primaryUtility
 */

/** @type {AlternativeTarget[]} */
export const ALTERNATIVE_TARGETS = [
  {
    slug: 'photoshop',
    name: 'Adobe Photoshop',
    category: 'Design',
    aliases: ['Adobe Photoshop', 'Adobe Photoshop Select Subject', 'Adobe Photoshop Save for Web', 'Photoshop ICO plugins', 'Photoshop'],
    headline: 'In-browser raster graphics & photo editing without Adobe Creative Cloud subscriptions or signups',
    primaryUtility: 'Photo editing, PSD manipulation, and image composition',
  },
  {
    slug: 'canva',
    name: 'Canva',
    category: 'Design',
    aliases: ['Canva', 'Canva Pro Background Remover', 'Canva asset library'],
    headline: 'Instant graphic design, background removal, and layout creation without mandatory accounts',
    primaryUtility: 'Social media graphics, poster design, and vector assets',
  },
  {
    slug: 'figma',
    name: 'Figma',
    category: 'Design',
    aliases: ['Figma', 'Figma FigJam', 'FigJam', 'Figma vector generator plugins'],
    headline: 'Vector wireframing, diagramming, and UI sketching without team workspace account walls',
    primaryUtility: 'Interactive vector design, wireframes, and collaborative boards',
  },
  {
    slug: 'miro',
    name: 'Miro',
    category: 'Productivity',
    aliases: ['Miro', 'Apple Freeform'],
    headline: 'Infinite digital whiteboard for brainstorming and architecture maps with zero registration',
    primaryUtility: 'Brainstorming, sprint planning, and visual mapping',
  },
  {
    slug: 'lucidchart',
    name: 'Lucidchart',
    category: 'Productivity',
    aliases: ['Lucidchart', 'Microsoft Visio', 'OmniGraffle', 'Visio'],
    headline: 'Architecture diagrams, flowcharts, and network topology maps with client-side privacy',
    primaryUtility: 'Technical diagrams, cloud architecture, and flowcharts',
  },
  {
    slug: 'notion',
    name: 'Notion',
    category: 'Writing',
    aliases: ['Notion', 'Typora', 'StackEdit'],
    headline: 'Distraction-free Markdown writing and local document drafting without account lock-in',
    primaryUtility: 'Markdown editing, document drafting, and plain text notes',
  },
  {
    slug: 'grammarly',
    name: 'Grammarly',
    category: 'Writing',
    aliases: ['Grammarly', 'ProWritingAid', 'QuillBot', 'Ginger Software', 'Microsoft Word Editor'],
    headline: 'Real-time spelling, style, and grammar editing without telemetry or cloud keylogging',
    primaryUtility: 'Grammar checking, readability analysis, and style enhancement',
  },
  {
    slug: 'zoom',
    name: 'Zoom',
    category: 'Communication',
    aliases: ['Zoom', 'Google Meet', 'Microsoft Teams'],
    headline: 'Encrypted video conferencing and instant meeting rooms with zero app installs or signups',
    primaryUtility: 'Video calls, screen sharing, and peer-to-peer conferencing',
  },
  {
    slug: 'smallpdf',
    name: 'Smallpdf',
    category: 'Productivity',
    aliases: ['Smallpdf', 'ILovePDF', 'Adobe Acrobat Pro', 'Adobe Acrobat'],
    headline: 'PDF merging, compression, and format conversion executed locally in your browser',
    primaryUtility: 'PDF splitting, compression, and document signing',
  },
  {
    slug: 'postman',
    name: 'Postman',
    category: 'Development',
    aliases: ['Postman', 'Postman Visualizer', 'Postman Token Inspector', 'Sublime Text JSON plugins'],
    headline: 'JSON payload visualization, tree structuring, and token inspection with zero telemetry',
    primaryUtility: 'API debugging, JSON formatting, and JWT token inspection',
  },
  {
    slug: 'audacity',
    name: 'Audacity',
    category: 'Media',
    aliases: ['Audacity', 'Adobe Audition', 'GarageBand', 'Soundtrap'],
    headline: 'Waveform audio trimming, multi-track mixing, and sound mastering via WebAudio API',
    primaryUtility: 'Audio trimming, podcast editing, and format export',
  },
  {
    slug: 'tinypng',
    name: 'TinyPNG',
    category: 'Media',
    aliases: ['TinyPNG', 'Kraken.io', 'OptimiZilla', 'Compressor.io', 'ImageOptim'],
    headline: 'Lossless & lossy image compression using WebAssembly with zero server uploads',
    primaryUtility: 'Image size reduction and modern WebP/AVIF compression',
  },
  {
    slug: 'cloudconvert',
    name: 'CloudConvert',
    category: 'Productivity',
    aliases: ['CloudConvert', 'Handbrake', 'Zamzar'],
    headline: 'File format conversion for media, documents, and archives without account queues',
    primaryUtility: 'Multi-format file transcoding and document conversion',
  },
  {
    slug: 'illustrator',
    name: 'Adobe Illustrator',
    category: 'Design',
    aliases: ['Adobe Illustrator', 'Inkscape', 'Boxy SVG', 'Adobe Illustrator SVG Export', 'SVGO CLI', 'Vector Magic'],
    headline: 'Vector graphic editing and SVG optimization without expensive Creative Cloud plans',
    primaryUtility: 'SVG illustration, vector path editing, and SVG payload minification',
  },
  {
    slug: 'visio',
    name: 'Microsoft Visio',
    category: 'Productivity',
    aliases: ['Microsoft Visio', 'OmniGraffle', 'Lucidchart'],
    headline: 'Enterprise flowcharting, network topology diagrams, and UML mapping with zero login',
    primaryUtility: 'Process flowcharts, network architecture, and system diagrams',
  },
  {
    slug: 'ilovepdf',
    name: 'ILovePDF',
    category: 'Productivity',
    aliases: ['ILovePDF', 'Smallpdf', 'Adobe Acrobat Pro'],
    headline: 'All-in-one PDF utilities running securely without uploading sensitive documents',
    primaryUtility: 'PDF conversion, page extraction, and password removal',
  },
  {
    slug: 'wetransfer',
    name: 'WeTransfer',
    category: 'Communication',
    aliases: ['WeTransfer', 'Dropbox Transfer', 'SendGB', 'Firefox Send', 'Filemail', 'Snapdrop', 'Wormhole'],
    headline: 'End-to-end encrypted ephemeral file sharing and P2P transfers without account lock-in or upload queues',
    primaryUtility: 'Ephemeral file transfer, large file sharing, and direct peer-to-peer data pipes',
  },
  {
    slug: 'excel',
    name: 'Microsoft Excel',
    category: 'Data',
    aliases: ['Microsoft Excel', 'Excel', 'Google Sheets', 'Custom Excel financial sheets', 'Excel Export macros', 'Microsoft Excel Power Query'],
    headline: 'Client-side tabular data cleansing, spreadsheet parsing, and visual charting without Office 365 logins',
    primaryUtility: 'Spreadsheet parsing, CSV/JSON format conversion, and in-browser SQL analysis',
  },
  {
    slug: 'chatgpt',
    name: 'ChatGPT',
    category: 'AI',
    aliases: ['ChatGPT', 'ChatGPT Plus', 'chatgpt-com', 'OpenAI ChatGPT', 'ChatGPT Prompt Templates', 'ChatGPT shell explanation', 'ChatGPT cron prompts'],
    headline: 'Instant AI query resolution, research answering, and code explanations without telephone or email registration',
    primaryUtility: 'AI text generation, code explanation, search answering, and developer prompting',
  },
  {
    slug: 'bitly',
    name: 'Bitly',
    category: 'Productivity',
    aliases: ['Bitly', 'TinyURL', 'Dub.co', 'Kutt.it', 'Bitly QR', 'Short.io'],
    headline: 'Fast URL shortening, custom redirection, and ephemeral link sharing without mandatory user accounts',
    primaryUtility: 'URL shortening, link redirection, and instant QR code generation',
  },
];

/**
 * @returns {AlternativeTarget[]}
 */
export function getAlternativeTargets() {
  return ALTERNATIVE_TARGETS;
}

/**
 * @param {string} slug
 * @returns {AlternativeTarget | undefined}
 */
export function getAlternativeBySlug(slug) {
  return ALTERNATIVE_TARGETS.find((t) => t.slug === slug);
}

/**
 * @param {string} alias
 * @returns {AlternativeTarget | undefined}
 */
export function findAlternativeByAlias(alias) {
  const normalized = alias.trim().toLowerCase();
  return ALTERNATIVE_TARGETS.find((t) =>
    t.aliases.some((a) => a.trim().toLowerCase() === normalized) ||
    t.name.trim().toLowerCase() === normalized
  );
}

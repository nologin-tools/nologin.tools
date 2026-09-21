/**
 * scripts/lab/cades-cognitive.mjs
 * 
 * CADES 2.0 (Cognitive Agent Dogfooding & Evaluation System)
 * Cognitive Protocol, Anti-Inflation Calibration Engine, and Agent Review Bridge.
 * 
 * Bridges deterministic harness telemetry (ego-browser + network snooper + output inspector)
 * with the Agent's multimodal cognitive evaluation (visual eye-check, critical thinking, human-like editorial).
 */

/**
 * Validates a cognitive evaluation payload from an Agent or Human Evaluator
 * @param {any} data
 * @param {{ requireBilingual?: boolean }} [options]
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateCognitiveEvaluation(data, options = {}) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Evaluation data must be an object'] };
  }

  const ps = data.productScore;
  if (!ps || typeof ps !== 'object') {
    errors.push('Missing productScore object');
  } else {
    const requiredDims = ['frictionless', 'depth', 'exportFreedom', 'privacy', 'polish'];
    const maxDims = { frictionless: 20, depth: 25, exportFreedom: 20, privacy: 20, polish: 15 };

    for (const dim of requiredDims) {
      if (typeof ps[dim] !== 'number' || ps[dim] < 0 || ps[dim] > maxDims[dim]) {
        errors.push(`Dimension ${dim} must be a number between 0 and ${maxDims[dim]} (got ${ps[dim]})`);
      }
    }

    if (typeof ps.overall !== 'number' || ps.overall < 0 || ps.overall > 100) {
      errors.push('Overall score must be a number between 0 and 100');
    } else {
      const sum = (ps.frictionless || 0) + (ps.depth || 0) + (ps.exportFreedom || 0) + (ps.privacy || 0) + (ps.polish || 0);
      if (sum !== ps.overall) {
        errors.push(`Sum of 5 dimensions (${sum}) must equal overall score (${ps.overall})`);
      }
    }
  }

  if (!data.bestFor || typeof data.bestFor !== 'string' || data.bestFor.trim().length < 10) {
    errors.push('bestFor must be a descriptive string of at least 10 characters');
  }

  if (!Array.isArray(data.pros) || data.pros.length < 2) {
    errors.push('pros must contain at least 2 distinct technical strengths');
  }

  if (!Array.isArray(data.cons) || data.cons.length < 1) {
    errors.push('cons must contain at least 1 honest technical trade-off or limitation');
  }

  if (!data.benchmarkNotes || typeof data.benchmarkNotes !== 'string' || data.benchmarkNotes.trim().length < 15) {
    errors.push('benchmarkNotes must contain authentic real-world testing observations (>= 15 chars)');
  } else {
    // Grounding Check: Must mention observable evidence (metrics, formats, technology, or concrete UI components)
    const hasGroundedEvidence = /(\b\d+(?:\.\d+)?\s*(?:ms|kb|mb|gb|s|fps|%|px|bytes?|requests?|lines?|nodes?)\b|\b(?:svg|png|pdf|wav|json|wasm|webassembly|canvas|indexeddb|localstorage|blob|http|post|get|dom|clipboard|magic bytes?|pwa|monaco|codemirror|modal|button|textarea|input)\b)/i.test(data.benchmarkNotes);
    if (!hasGroundedEvidence) {
      errors.push('benchmarkNotes must mention concrete technical evidence or observations (e.g. latency in ms, payload size, inspected formats, DOM elements, or storage APIs)');
    }
  }

  if (!data.privacyVerdict || typeof data.privacyVerdict !== 'string' || data.privacyVerdict.trim().length < 20) {
    errors.push('privacyVerdict must explain the observed data-flow evidence in at least 20 characters');
  }

  const allowedTiers = ['editors-choice', 'highly-recommended', 'capable-utility', 'emergency-only'];
  if (data.verdictTier !== undefined && !allowedTiers.includes(data.verdictTier)) {
    errors.push(`verdictTier must be one of: ${allowedTiers.join(', ')}`);
  }

  // Anti-Inflation Gate: High-Score Defense (Editor's Choice requires documented workstation depth)
  if (data.productScore && data.productScore.overall >= 90) {
    if (data.productScore.depth < 22) {
      errors.push(`Editor's Choice (overall >= 90) requires Functional Depth >= 22 (current: ${data.productScore.depth}). Single-purpose or configurable utilities cannot exceed 89.`);
    }
    const allContext = `${data.benchmarkNotes || ''} ${(data.pros || []).join(' ')} ${data.bestFor || ''}`;
    const hasWorkstationProof = /(\b(?:canvas|webassembly|wasm|webgl|indexeddb|ast|compiler|pwa|multi-layer|layers?|undo|redo|infinite|tracks?|audio-buffer|waveform|vector|monaco|codemirror|diagrams?|schematics?|cad|3d|spreadsheet|sql-engine)\b)/i.test(allContext);
    if (!hasWorkstationProof) {
      errors.push(`Editor's Choice High-Score Defense: A score >= 90 requires empirical proof of workstation-level depth (e.g. canvas, wasm, ast, compiler, indexeddb, multi-layer, waveform) in benchmarkNotes or pros. Standard utilities belong in highly-recommended (80-89).`);
    }
  }

  if (options.requireBilingual) {
    if (!data.bestForZh || typeof data.bestForZh !== 'string' || data.bestForZh.trim().length < 5) {
      errors.push('bestForZh is required for synchronized bilingual editorial output');
    }
    if (!Array.isArray(data.prosZh) || data.prosZh.length < 2) {
      errors.push('prosZh must contain at least 2 Chinese technical strengths');
    }
    if (!Array.isArray(data.consZh) || data.consZh.length < 1) {
      errors.push('consZh must contain at least 1 Chinese trade-off');
    }
    if (!data.privacyVerdictZh || typeof data.privacyVerdictZh !== 'string' || data.privacyVerdictZh.trim().length < 10) {
      errors.push('privacyVerdictZh is required for synchronized bilingual editorial output');
    }
    if (!data.benchmarkNotesZh || typeof data.benchmarkNotesZh !== 'string' || data.benchmarkNotesZh.trim().length < 8) {
      errors.push('benchmarkNotesZh is required for synchronized bilingual editorial output');
    }
  }

  // Fluff-Buster: Detect generic marketing buzzwords across pros, cons, and notes
  const FLUFF_PATTERNS = [
    { re: /\bseamless(?:ly)?\b/i, word: 'seamless' },
    { re: /\bgame-changer\b/i, word: 'game-changer' },
    { re: /\bcutting-edge\b/i, word: 'cutting-edge' },
    { re: /\bdelve into\b/i, word: 'delve into' },
    { re: /\btestament to\b/i, word: 'testament to' },
    { re: /\brevolutioniz(?:e|ing)\b/i, word: 'revolutionize' },
    { re: /\bintuitive interface\b/i, word: 'intuitive interface' },
    { re: /\buser-friendly interface\b/i, word: 'user-friendly interface' },
    { re: /\bmodern and sleek\b/i, word: 'modern and sleek' }
  ];

  const allText = [
    ...(Array.isArray(data.pros) ? data.pros : []),
    ...(Array.isArray(data.cons) ? data.cons : []),
    data.benchmarkNotes || '',
    data.bestFor || ''
  ].join(' ');

  for (const { re, word } of FLUFF_PATTERNS) {
    if (re.test(allText)) {
      errors.push(`Avoid generic marketing fluff: "${word}". Describe specific functional mechanisms, observable behaviors, or physical measurements instead.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calibrates 5D score based on harness objective facts and optional Agent cognitive adjustments.
 * Enforces anti-inflation boundaries to prevent score clustering at 90+.
 * 
 * Target Distribution:
 * - 90-100 (Editor's Choice): ~12-15% of catalog (Requires outstanding UX, depth, strong privacy evidence, top-tier aesthetics)
 * - 80-89 (Highly Recommended): ~35-40% of catalog (Solid production-grade utilities)
 * - 70-79 (Capable Utility): ~40-45% of catalog (Single-purpose simple utilities, basic UI)
 * - <70 (Rejected / Defunct): Excluded from approved directory
 * 
 * @param {any} harnessReport 
 * @param {any} [agentOverrides] 
 * @returns {any} Calibrated 5D Product Score Breakdown
 */
export function calibrate5DScore(harnessReport, agentOverrides = null) {
  const inspection = harnessReport?.inspection || harnessReport || {};
  const surface = inspection.surface || {};
  const netPrivacy = inspection.networkPrivacy || {};
  const exportGate = inspection.exportGate || {};
  const visual = inspection.visual || {};
  const intent = inspection.intent || {};

  const isLocal = netPrivacy.classification === 'Local Only' && netPrivacy.zeroEgressConfirmed === true;
  const noPayloadEgressObserved = netPrivacy.classification === 'No Payload Egress Observed';
  const isOffline = Boolean(netPrivacy.offlineCapable);
  const hasWasm = Boolean(netPrivacy.hasWebAssembly);
  const hasCanvas = Boolean(surface.canvasCount > 0);
  const hasTracking = Boolean(netPrivacy.hasThirdPartyTracking);
  const hasWatermark = Boolean(exportGate.hasWatermark);
  const isAuthBlocked = Boolean(inspection.initialAuthGate?.blocked);
  const isInterceptedByAuth = Boolean(exportGate.interceptedByAuth);

  // --- Dimension 1: Frictionless UX (0 to 20) ---
  let frictionless = 16;
  if (isAuthBlocked) {
    frictionless = 0;
  } else if (isInterceptedByAuth) {
    frictionless = 4;
  } else {
    if (surface.hasModalBlocked) frictionless -= 3;
    if (surface.buttonLabels?.some(l => /upgrade|pro|pricing/i.test(l))) frictionless -= 1;
    if (surface.fileInputCount > 0 && !surface.hasModalBlocked) frictionless += 1;
  }
  frictionless = Math.max(0, Math.min(20, frictionless));

  // --- Dimension 2: Functional Depth & Fidelity (0 to 25) ---
  // Steep anti-inflation ladder:
  // 8-12: Trivial single-purpose scripts (uuid, base64, simple word count)
  // 13-17: Configurable utilities (multi-input, parameter controls, validation, format presets)
  // 18-21: Professional light suites (batch processing, data visualization, sound/image pipelines)
  // 22-25: Elite workstations (canvas engines, AST parsers, multi-layer/multi-track, undo/redo state stacks)
  let depth = 14;
  const isTrivialUtility = (surface.textareaCount <= 1 && surface.fileInputCount === 0 && !hasCanvas && !hasWasm);
  const isWorkstation = (hasWasm && hasCanvas) || (hasCanvas && surface.textareaCount >= 1 && surface.fileInputCount >= 1);
  const isConfigurable = (surface.textareaCount >= 2 || (surface.textareaCount >= 1 && surface.fileInputCount >= 1) || hasCanvas || hasWasm);

  if (isWorkstation) {
    depth = (hasWasm && hasCanvas) ? 24 : 22; // Elite workstation
  } else if (isConfigurable) {
    depth = 16;
    if (hasWasm || hasCanvas) depth += 2;
  } else if (isTrivialUtility) {
    depth = 11; // Grounded baseline for single-task text/data utilities
  }

  // Visual outcome verification
  if (!visual.capturedOutcome) depth -= 2;
  depth = Math.max(0, Math.min(25, depth));

  // --- Dimension 3: Export Freedom (0 to 20) ---
  let exportFreedom = 14;
  if (isInterceptedByAuth) {
    exportFreedom = 3; // Severe penalty for post-action bait trap
  } else if (hasWatermark) {
    exportFreedom = 5; // Severe penalty for commercial promotional watermark
  } else if (exportGate.downloadTriggered) {
    exportFreedom = (hasCanvas || hasWasm) ? 19 : 16; // Standard clean download vs rich asset export
  } else if (exportGate.passedNoLoginExport || surface.buttonLabels?.some(l => /copy|export/i.test(l))) {
    exportFreedom = 14; // Clipboard copy utility
  }
  exportFreedom = Math.max(0, Math.min(20, exportFreedom));

  // --- Dimension 4: Privacy & Data Sovereignty (0 to 20 - Core Pillar) ---
  let privacy = isLocal ? 17 : noPayloadEgressObserved ? 15 : 13;
  if (isLocal && isOffline) privacy += 2;
  if (hasTracking) privacy -= 4;
  privacy = Math.max(0, Math.min(20, privacy));

  // --- Dimension 5: Stability & Polish (0 to 15) ---
  const ux = harnessReport?.uxTelemetry || inspection.uxTelemetry || {};
  const maxLongTask = ux.maxLongTaskDuration || ux.maxLongTaskMs || 0;
  const clsScore = ux.clsScore || 0;

  let polish = 12;
  if (hasWatermark) polish -= 6;
  if (visual.capturedOutcome) polish += 1;
  if (surface.buttonLabels?.some(l => /ad|sponsor/i.test(l))) polish -= 2;

  // UX Ergonomics & Responsiveness Telemetry
  if (maxLongTask > 400) polish -= 2; // Severe main-thread freezing
  else if (maxLongTask > 150) polish -= 1; // Minor jank
  if (clsScore > 0.1) polish -= 2; // Layout shift jank
  if (!hasWatermark && visual.capturedOutcome && maxLongTask <= 50 && clsScore === 0) polish += 1; // Butter-smooth frame pacing

  polish = Math.max(0, Math.min(15, polish));

  // --- Apply Agent Overrides if provided (Agent Cognitive Judgement) ---
  if (agentOverrides && typeof agentOverrides === 'object') {
    if (typeof agentOverrides.frictionless === 'number') frictionless = Math.max(0, Math.min(20, agentOverrides.frictionless));
    if (typeof agentOverrides.depth === 'number') depth = Math.max(0, Math.min(25, agentOverrides.depth));
    if (typeof agentOverrides.exportFreedom === 'number') exportFreedom = Math.max(0, Math.min(20, agentOverrides.exportFreedom));
    if (typeof agentOverrides.privacy === 'number') privacy = Math.max(0, Math.min(20, agentOverrides.privacy));
    if (typeof agentOverrides.polish === 'number') polish = Math.max(0, Math.min(15, agentOverrides.polish));
  }

  const overall = Math.min(100, frictionless + depth + exportFreedom + privacy + polish);

  const verdictTier = overall >= 90 ? 'editors-choice' :
                      overall >= 80 ? 'highly-recommended' :
                      overall >= 70 ? 'capable-utility' : 'emergency-only';

  return {
    overall,
    frictionless,
    depth,
    exportFreedom,
    privacy,
    polish,
    verdictTier,
    factors: {
      frictionless: [
        frictionless >= 18 ? 'Instant friction-free access without mandatory account creation' : 'Access granted with minor modal friction',
        isLocal ? 'Zero telemetry and in-memory execution' : 'Direct access without registration'
      ],
      depth: [
        depth >= 20 ? (hasWasm ? 'Hardware accelerated via WebAssembly' : 'Comprehensive multi-input transformation engine') : 'Standard client execution pipeline for single-purpose tasks',
        hasCanvas ? 'Interactive canvas rendering engine' : 'Direct in-browser data processing'
      ],
      exportFreedom: [
        exportFreedom >= 18 ? 'Direct unrestricted output export verified' : 'Standard in-browser delivery or clipboard copy',
        hasWatermark ? 'Commercial watermark detected in artifact' : 'Zero post-action bait traps or download paywalls'
      ],
      privacy: [
        isLocal ? '100% in-browser RAM execution with zero external data egress' : 'Ephemeral cloud processing without user profile retention',
        hasTracking ? 'Third-party analytics beacons observed' : 'Zero commercial behavioral tracking or user profiling beacons'
      ],
      polish: [
        visual.capturedOutcome ? 'Outcome screen verified without broken layouts' : 'Standard UI presentation',
        maxLongTask > 400 ? `Main-thread jank observed (${maxLongTask}ms freeze)` : (maxLongTask <= 50 && clsScore === 0 ? 'Smooth responsive interaction (<50ms tasks, 0 layout shifts)' : (polish >= 13 ? 'Modern responsive layout free of intrusive ads' : 'Basic or dated utility interface'))
      ]
    }
  };
}

/**
 * Packages telemetry, surface facts, visual checkpoints, and network logs into a Cognitive Packet.
 * This packet is delivered to the Agent for multimodal inspection and qualitative reasoning.
 * 
 * @param {any} rawReport 
 * @param {string} toolSlug 
 * @returns {any} Cognitive Packet Object
 */
export function generateCognitivePacket(rawReport, toolSlug) {
  const inspection = rawReport.inspection || rawReport;
  const evaluation = rawReport.evaluation || {};
  const meta = evaluation.metadata || {};

  const initialPic = inspection.visual?.initialScreenshot || null;
  const outcomePic = inspection.visual?.outcomeScreenshot || null;
  const netPayloads = inspection.networkPrivacy?.outgoingPayloadRequests || [];
  const exportInfo = inspection.exportGate || {};
  const artifactInfo = exportInfo.artifactInspection || null;

  const baselineScore = calibrate5DScore(rawReport);

  return {
    version: 'CADES-2.0',
    generatedAt: new Date().toISOString(),
    tool: {
      slug: toolSlug,
      targetUrl: inspection.targetUrl,
      finalUrl: inspection.finalUrl,
      name: meta.name || inspection.title || toolSlug,
      category: meta.category || 'Data',
      inferredCoreTask: meta.core_task || inspection.intent?.inferredTask || 'Process data directly in browser',
      repoUrl: meta.repo_url || inspection.githubLink || null
    },
    visualCheckpoints: {
      initialScreenshot: initialPic,
      outcomeScreenshot: outcomePic,
      capturedInitial: Boolean(inspection.visual?.capturedInitial),
      capturedOutcome: Boolean(inspection.visual?.capturedOutcome),
      note: 'Agent MUST use view_image on both images to conduct multimodal review'
    },
    surfaceTelemetry: {
      archetype: inspection.intent?.archetype || 'general',
      textareas: inspection.surface?.textareaCount || 0,
      fileInputs: inspection.surface?.fileInputCount || 0,
      canvases: inspection.surface?.canvasCount || 0,
      hasWebAssembly: Boolean(inspection.networkPrivacy?.hasWebAssembly),
      headings: inspection.surface?.headings || [],
      buttonLabels: inspection.surface?.buttonLabels || []
    },
    networkTelemetry: {
      classification: inspection.networkPrivacy?.classification || 'Unknown',
      payloadEgressObserved: netPayloads.length > 0,
      noPayloadEgressObserved: netPayloads.length === 0,
      observationCaveat: 'No captured payload request is not proof of local-only processing or offline capability.',
      offlineCapable: Boolean(inspection.networkPrivacy?.offlineCapable),
      externalPayloadCount: netPayloads.length,
      payloadRequests: netPayloads.slice(0, 10)
    },
    artifactTelemetry: {
      downloadTriggered: Boolean(exportInfo.downloadTriggered),
      passedExport: Boolean(exportInfo.passedNoLoginExport),
      interceptedByAuth: Boolean(exportInfo.interceptedByAuth),
      authPromptDetails: exportInfo.authPromptDetails || null,
      hasWatermark: Boolean(exportInfo.hasWatermark),
      artifactInspection: artifactInfo
    },
    baselineHeuristicScore: baselineScore,
    reviewPrompt: generateAgentReviewPrompt(toolSlug, inspection, baselineScore)
  };
}

/**
 * Generates the structured prompt presented to the Agent for qualitative evaluation
 */
export function generateAgentReviewPrompt(toolSlug, inspection, baselineScore) {
  return `
### 🔬 CADES 2.0 Agent Multimodal Cognitive Review Task: [${toolSlug}]

**Target URL**: ${inspection.targetUrl}
**Baseline Score (Harness)**: ${baselineScore.overall}/100 (${baselineScore.verdictTier})

**Step 1: Visual Inspection (Agent MUST run view_image)**:
- Initial Impression: \`${inspection.visual?.initialScreenshot}\`
  - Review: Does the UI look modern and clean? Are there deceptive AdSense buttons or dark pattern banners?
- Outcome Delivery: \`${inspection.visual?.outcomeScreenshot}\`
  - Review: Did the core task (image, canvas, diagram, formatted text) actually render with high fidelity? Any blank whiteouts or visible watermarks?

**Step 2: 5D Score Calibration**:
Review the baseline score:
- Frictionless UX: ${baselineScore.frictionless}/20
- Functional Depth: ${baselineScore.depth}/25
- Export Freedom: ${baselineScore.exportFreedom}/20
- Privacy & Sovereignty: ${baselineScore.privacy}/20 (${inspection.networkPrivacy?.classification})
- Stability & Polish: ${baselineScore.polish}/15
*Adjust any dimension if your human-like eye or domain expertise notices quality gaps or superior polish.*

**Step 3: Authentic Human-Like Editorial Synthesis**:
Formulate natural, insightful review content in English and Chinese:
- \`bestFor\`: Who needs this exact workflow today?
- \`pros\`: 2-3 genuine technical highlights.
- \`cons\`: 1-2 honest real-world trade-offs or limits.
- \`benchmarkNotes\`: Real testing findings without boilerplate templates.
`.trim();
}

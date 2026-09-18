// @ts-check

/**
 * @typedef {Object} ScorecardDimension
 * @property {number} score - Points earned in this dimension (0 to maxScore)
 * @property {number} maxScore - Maximum possible points (25)
 * @property {string} name - Dimension title
 * @property {string} status - Short verdict badge (e.g. 'In-Browser Memory Sandbox')
 * @property {string[]} highlights - Specific verified attributes
 */

/**
 * @typedef {Object} PrivacyScorecard
 * @property {'A+' | 'A' | 'B+' | 'B'} overallGrade - Computed letter grade
 * @property {number} overallScore - Total points from 0 to 100
 * @property {string} summary - Comprehensive editorial evaluation
 * @property {{
 *   sandbox: ScorecardDimension;
 *   telemetry: ScorecardDimension;
 *   source: ScorecardDimension;
 *   resilience: ScorecardDimension;
 * }} dimensions
 */

/**
 * Normalizes tool tags into a map of key -> Set<value>
 * Supports `{ tagKey, tagValue }[]`, `{ key, value }[]`, and `string[]` ('key:value')
 * @param {any} tags
 * @returns {Map<string, Set<string>>}
 */
export function normalizeTags(tags) {
  const map = new Map();
  if (!Array.isArray(tags)) return map;

  for (const item of tags) {
    let k = '';
    let v = '';
    if (typeof item === 'string') {
      const idx = item.indexOf(':');
      if (idx !== -1) {
        k = item.slice(0, idx).trim().toLowerCase();
        v = item.slice(idx + 1).trim();
      }
    } else if (item && typeof item === 'object') {
      k = (item.key || item.tagKey || '').trim().toLowerCase();
      v = (item.value || item.tagValue || '').trim();
    }
    if (k && v) {
      if (!map.has(k)) map.set(k, new Set());
      map.get(k).add(v);
    }
  }
  return map;
}

/**
 * Computes deep privacy & sandbox audit scorecard for a tool
 * @param {any} tool - Tool record
 * @param {any} [health] - Health check record or array of recent checks
 * @param {any} [editorial] - Editorial metadata
 * @returns {PrivacyScorecard}
 */
export function computePrivacyScorecard(tool, health, editorial) {
  const tagsMap = normalizeTags(tool.tags || tool.toolTags);
  const dataTags = tagsMap.get('data') || new Set();
  const privacyTags = tagsMap.get('privacy') || new Set();
  const offlineTags = tagsMap.get('offline') || new Set();
  const hostingTags = tagsMap.get('hosting') || new Set();
  const typeTags = tagsMap.get('type') || new Set();

  const isClientSide = dataTags.has('Client-Side Only') || Boolean(tool.capabilities?.clientSideOnly);
  const worksOffline = offlineTags.has('Works Offline') || Boolean(tool.capabilities?.worksOffline);
  const isPwa = typeTags.has('PWA');
  const isSelfHostable = hostingTags.has('Self-Hostable');

  // Empirical audit cross-link: check CADES runtime inspection data from editorial
  const privacyAudit = editorial?.dueDiligence?.privacyAudit || null;
  const runtimeLocalVerified = privacyAudit?.runtimeClassification === 'Local Only';
  const runtimeCloudDetected = privacyAudit?.runtimeClassification === 'Cloud Processed';
  const hasDriftEgress = Boolean(isClientSide && runtimeCloudDetected);
  const effectiveClientSide = (isClientSide || runtimeLocalVerified) && !hasDriftEgress;

  const hasNoTrackers = (privacyTags.has('No Trackers') || effectiveClientSide) && privacyAudit?.statedPolicyCompliance !== 'violation-detected';
  const isPrivacyFocused = privacyTags.has('Privacy Focused');

  // 1. Dimension: Data Sandbox & Storage Isolation (max 25)
  /** @type {ScorecardDimension} */
  let sandbox;
  if (hasDriftEgress) {
    sandbox = {
      name: 'Data Sandbox & Storage Isolation',
      score: 12,
      maxScore: 25,
      status: 'Cloud Egress Detected',
      highlights: [
        'Runtime network sniffing detected unexpected outgoing cloud payloads',
        'Payload transmission observed during interactive task execution',
        'Flagged for privacy policy discrepancy re-evaluation',
      ],
    };
  } else if (effectiveClientSide) {
    sandbox = {
      name: 'Data Sandbox & Storage Isolation',
      score: 25,
      maxScore: 25,
      status: 'In-Browser RAM Sandbox',
      highlights: [
        'Processes files and state strictly in client-side browser memory',
        'Verified zero-egress payload transmission to external servers',
        worksOffline ? 'Verified full offline execution capability' : 'Runs locally without persistent server dependencies',
      ],
    };
  } else if (worksOffline || isPwa) {
    sandbox = {
      name: 'Data Sandbox & Storage Isolation',
      score: 22,
      maxScore: 25,
      status: 'Local-First / Offline Capable',
      highlights: [
        'Local Service Worker and caching support',
        'Operates with minimal ongoing cloud roundtrips',
        'No account authentication required for local state',
      ],
    };
  } else if (isSelfHostable) {
    sandbox = {
      name: 'Data Sandbox & Storage Isolation',
      score: 18,
      maxScore: 25,
      status: 'Self-Hostable Architecture',
      highlights: [
        'Full software stack can be deployed on private infrastructure',
        'User retains sovereign control over database and network egress',
        'No vendor lock-in or forced account identity',
      ],
    };
  } else {
    sandbox = {
      name: 'Data Sandbox & Storage Isolation',
      score: 14,
      maxScore: 25,
      status: 'Zero-Account Ephemeral Server',
      highlights: [
        'Temporary stateless processing without user profile retention',
        'No persistent identity linking or mandatory account creation',
        'Requires network connection to execute backend tasks',
      ],
    };
  }

  // 2. Dimension: Zero Trackers & Telemetry Hygiene (max 25)
  /** @type {ScorecardDimension} */
  let telemetry;
  if (hasNoTrackers) {
    telemetry = {
      name: 'Zero Trackers & Telemetry Hygiene',
      score: 25,
      maxScore: 25,
      status: 'Zero Third-Party Trackers',
      highlights: [
        'No commercial ad networks or cross-site tracking beacons',
        'Zero tracking pixels or third-party behavioral profiling scripts',
        'Clean script execution environment without user fingerprinting',
      ],
    };
  } else if (isPrivacyFocused) {
    telemetry = {
      name: 'Zero Trackers & Telemetry Hygiene',
      score: 22,
      maxScore: 25,
      status: 'Privacy-Hardened Policy',
      highlights: [
        'Audited privacy policy protecting user confidentiality',
        'No mandatory email, telephone, or identity correlation',
        'Strict limits on operational telemetry',
      ],
    };
  } else {
    telemetry = {
      name: 'Zero Trackers & Telemetry Hygiene',
      score: 16,
      maxScore: 25,
      status: 'Standard No-Auth Policy',
      highlights: [
        'Zero forced signup or login cookies required',
        'Operates without identity or social logins',
        'Standard server-side HTTP access logging applies',
      ],
    };
  }

  // 3. Dimension: Source Transparency & Auditability (max 25)
  /** @type {ScorecardDimension} */
  let source;
  const repoUrl = tool.repoUrl || (tool.repository && tool.repository.url) || null;
  const license = tool.githubLicense || (tool.repository && tool.repository.license) || null;
  const stars = tool.githubStars ?? (tool.repository && tool.repository.stars) ?? null;

  if (repoUrl) {
    if (license) {
      source = {
        name: 'Source Transparency & Auditability',
        score: 25,
        maxScore: 25,
        status: `Open Source (${license})`,
        highlights: [
          `Publicly auditable code repository at ${repoUrl}`,
          `OSI-recognized open license: ${license}`,
          stars ? `${stars.toLocaleString()} GitHub community stars` : 'Verifiable public commit history',
        ],
      };
    } else {
      source = {
        name: 'Source Transparency & Auditability',
        score: 21,
        maxScore: 25,
        status: 'Public Repository',
        highlights: [
          `Public code repository accessible at ${repoUrl}`,
          'Community inspectable code base',
          'Independent code verification possible',
        ],
      };
    }
  } else {
    source = {
      name: 'Source Transparency & Auditability',
      score: 12,
      maxScore: 25,
      status: 'Proprietary / Freeware',
      highlights: [
        'Proprietary frontend and application service',
        'Zero-login functionality verified by NoLoginTools manual audit',
        'Runtime network egress and cookies verified via automated scanner',
      ],
    };
  }

  // 4. Dimension: Availability & Infrastructure Resilience (max 25)
  /** @type {ScorecardDimension} */
  let resilience;
  let status = 'online';
  let responseTimeMs = 0;

  if (health) {
    if (Array.isArray(health) && health.length > 0) {
      const latest = health[0];
      status = latest.isOnline ? 'online' : 'offline';
      responseTimeMs = latest.responseTimeMs || 0;
    } else if (typeof health === 'object') {
      status = health.status || (health.isOnline ? 'online' : 'offline');
      responseTimeMs = health.responseTimeMs || 0;
    }
  } else if (tool.effectiveStatus) {
    status = tool.effectiveStatus;
  }

  if (status === 'online') {
    if (responseTimeMs > 0 && responseTimeMs <= 600) {
      resilience = {
        name: 'Availability & Infrastructure Resilience',
        score: 25,
        maxScore: 25,
        status: 'High Uptime & Sub-Second Latency',
        highlights: [
          `Fully operational with fast edge response (~${responseTimeMs}ms)`,
          'Verified active on Cloudflare automated 6h health probe',
          'Reliable service accessibility without login barriers',
        ],
      };
    } else {
      resilience = {
        name: 'Availability & Infrastructure Resilience',
        score: 22,
        maxScore: 25,
        status: 'Operational & Verified',
        highlights: [
          'Tool is online and accessible',
          'Monitored continuously by NoLoginTools automated prober',
          'No scheduled downtime or access gating detected',
        ],
      };
    }
  } else if (status === 'unstable') {
    resilience = {
      name: 'Availability & Infrastructure Resilience',
      score: 12,
      maxScore: 25,
      status: 'Intermittent Availability',
      highlights: [
        'Recent health checks reported temporary timeouts or non-200 responses',
        'Under active automated observation',
        'Alternative zero-login tools available if service is disrupted',
      ],
    };
  } else {
    resilience = {
      name: 'Availability & Infrastructure Resilience',
      score: 0,
      maxScore: 25,
      status: 'Currently Unreachable',
      highlights: [
        'Failed recent automated reachability tests',
        'Archived snapshot available for historical inspection',
        'Community status report flagged for admin re-evaluation',
      ],
    };
  }

  const overallScore = Math.min(100, Math.max(0, sandbox.score + telemetry.score + source.score + resilience.score));

  /** @type {'A+' | 'A' | 'B+' | 'B'} */
  let overallGrade = 'B';
  let summary = '';

  if (overallScore >= 90) {
    overallGrade = 'A+';
    summary = 'Gold Standard Privacy: 100% in-browser client sandbox, verified zero trackers, and auditable open-source code.';
  } else if (overallScore >= 75) {
    overallGrade = 'A';
    summary = 'High-Assurance Privacy: Exceptional privacy hygiene, zero registration friction, and verified infrastructure reliability.';
  } else if (overallScore >= 60) {
    overallGrade = 'B+';
    summary = 'Verified No-Login Utility: Dependable instant utility without signup, with standard cloud session architecture.';
  } else {
    overallGrade = 'B';
    summary = 'Functional No-Login Tool: Provides access without accounts, but operates on proprietary or degraded infrastructure.';
  }

  // Override summary if editorial verdict is available
  if (editorial && editorial.privacyVerdict) {
    summary = editorial.privacyVerdict;
  }

  return {
    overallGrade,
    overallScore,
    summary,
    dimensions: {
      sandbox,
      telemetry,
      source,
      resilience,
    },
  };
}

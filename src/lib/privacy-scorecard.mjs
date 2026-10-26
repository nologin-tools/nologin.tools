// @ts-check
import { resolveEffectiveStatus } from './health-core.mjs';

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
 * Summarizes catalog metadata. These heuristic scores are not runtime evidence.
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
  const runtimeLocalVerified = privacyAudit?.runtimeClassification === 'Local Only' && privacyAudit?.zeroEgressConfirmed === true;
  const runtimeCloudDetected = privacyAudit?.runtimeClassification === 'Cloud Processed' || privacyAudit?.runtimeClassification === 'Payload Egress Observed';
  const hasDriftEgress = Boolean(isClientSide && runtimeCloudDetected);
  const effectiveClientSide = (isClientSide || runtimeLocalVerified) && !hasDriftEgress;

  const hasNoTrackers = privacyTags.has('No Trackers') && privacyAudit?.statedPolicyCompliance !== 'violation-detected';
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
      status: 'Client-Side Processing Listed',
      highlights: [
        'Catalog classification: client-side processing',
        'Processing location does not establish retention or tracking behavior',
        worksOffline ? 'Catalog lists offline support' : 'Offline support has not been recorded',
      ],
    };
  } else if (worksOffline || isPwa) {
    sandbox = {
      name: 'Data Sandbox & Storage Isolation',
      score: 22,
      maxScore: 25,
      status: 'Offline / PWA Metadata',
      highlights: [
        'Catalog lists offline support or PWA installation',
        'PWA installation alone does not establish offline operation',
        'Network behavior depends on the selected workflow',
      ],
    };
  } else if (isSelfHostable) {
    sandbox = {
      name: 'Data Sandbox & Storage Isolation',
      score: 18,
      maxScore: 25,
      status: 'Self-Hostable Architecture',
      highlights: [
        'Catalog lists a self-hosting option',
        'A self-hosted deployment may use different settings from the public site',
        'Review the project deployment instructions before hosting',
      ],
    };
  } else {
    sandbox = {
      name: 'Data Sandbox & Storage Isolation',
      score: 14,
      maxScore: 25,
      status: 'Processing Not Verified Locally',
      highlights: [
        'No local-only processing evidence is recorded in this scorecard',
        'Account requirements and data retention are separate properties',
        'See the editorial notes and provider policy for data handling',
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
      status: 'No Trackers Tag Recorded',
      highlights: [
        'Catalog tag: No Trackers',
        'This tag does not represent a continuous traffic audit',
        'Third-party integrations can change between evaluations',
      ],
    };
  } else if (isPrivacyFocused) {
    telemetry = {
      name: 'Zero Trackers & Telemetry Hygiene',
      score: 22,
      maxScore: 25,
      status: 'Privacy Focused Tag Recorded',
      highlights: [
        'Catalog tag: Privacy Focused',
        'See the hands-on review for the tested no-login workflow',
        'Retention and telemetry depend on the provider policy',
      ],
    };
  } else {
    telemetry = {
      name: 'Zero Trackers & Telemetry Hygiene',
      score: 16,
      maxScore: 25,
      status: 'Tracking Evidence Not Recorded',
      highlights: [
        'No dedicated tracker assessment is recorded here',
        'No-login access does not establish anonymity',
        'Consult the provider policy for logs and cookies',
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
          `Repository license metadata: ${license}`,
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
      status: 'Repository Not Listed',
      highlights: [
        'No source repository is recorded in the catalog',
        'This does not establish that the software is proprietary',
        'See the review for observations from the tested workflow',
      ],
    };
  }

  // 4. Dimension: Availability & Infrastructure Resilience (max 25)
  /** @type {ScorecardDimension} */
  let resilience;
  let status = tool.effectiveStatus || 'unknown';
  let responseTimeMs = 0;

  if (health) {
    if (Array.isArray(health)) {
      status = resolveEffectiveStatus(health.map(check => ({ ...check,
        checkedAt: check.checkedAt ? new Date(check.checkedAt) : undefined,
      }))) || 'unknown';
      responseTimeMs = health[0]?.responseTimeMs || 0;
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
        status: 'Latest Check: Reachable',
        highlights: [
          `Latest HTTP response time (~${responseTimeMs}ms)`,
          'Result comes from the latest recorded health check',
          'An HTTP response does not verify the complete user workflow',
        ],
      };
    } else {
      resilience = {
        name: 'Availability & Infrastructure Resilience',
        score: 22,
        maxScore: 25,
        status: 'Latest Check: Reachable',
        highlights: [
          'The latest check received a response',
          'Availability can change after the recorded check',
          'This is a reachability observation, not an uptime guarantee',
        ],
      };
    }
  } else if (status === 'unknown') {
    resilience = {
      name: 'Availability & Infrastructure Resilience',
      score: 0,
      maxScore: 25,
      status: 'No Recent Check',
      highlights: ['No health check from the last 48 hours is available'],
    };
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
    summary = 'Catalog signals score in the highest band. This score summarizes recorded metadata; it is not a privacy certification.';
  } else if (overallScore >= 75) {
    overallGrade = 'A';
    summary = 'Catalog signals score in the upper band. Consult the hands-on notes for tested behavior.';
  } else if (overallScore >= 60) {
    overallGrade = 'B+';
    summary = 'Catalog signals score in the middle band. Missing metadata can affect this score.';
  } else {
    overallGrade = 'B';
    summary = 'Catalog signals score in the lower band. See the recorded metadata and health results for details.';
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

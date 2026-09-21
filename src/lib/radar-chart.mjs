// @ts-check

/**
 * @typedef {Object} DimensionScore
 * @property {string} key
 * @property {string} label
 * @property {number} score
 * @property {number} maxScore
 */

/**
 * @typedef {Object} RadarChartConfig
 * @property {number} [width=320]
 * @property {number} [height=260]
 * @property {number} [cx=160]
 * @property {number} [cy=125]
 * @property {number} [radius=78]
 * @property {string} [theme='amber'] - 'amber' | 'emerald' | 'sky' | 'neutral'
 */

/**
 * Normalizes dimension scores and computes vertices for the 5-axis radar chart.
 * 
 * Axes order (clockwise from top):
 * 0: Frictionless UX (/20) - 0 deg (top)
 * 1: Functional Depth (/25) - 72 deg (top-right)
 * 2: Export Freedom (/20) - 144 deg (bottom-right)
 * 3: Privacy & Sovereignty (/20) - 216 deg (bottom-left)
 * 4: Stability & Polish (/15) - 288 deg (top-left)
 * 
 * @param {Record<string, number>} rawScores
 * @param {Record<string, string>} [labelOverrides]
 * @returns {DimensionScore[]}
 */
export function normalizeDimensionScores(rawScores, labelOverrides = {}) {
  const definitions = [
    { key: 'frictionless', defaultLabel: 'Frictionless', maxScore: 20 },
    { key: 'depth', defaultLabel: 'Depth', maxScore: 25 },
    { key: 'exportFreedom', defaultLabel: 'Export', maxScore: 20 },
    { key: 'privacy', defaultLabel: 'Privacy', maxScore: 20 },
    { key: 'polish', defaultLabel: 'Polish', maxScore: 15 },
  ];

  return definitions.map((def) => {
    const raw = rawScores?.[def.key];
    const score = typeof raw === 'number' && !Number.isNaN(raw) ? Math.max(0, Math.min(def.maxScore, raw)) : def.maxScore;
    return {
      key: def.key,
      label: labelOverrides[def.key] || def.defaultLabel,
      score,
      maxScore: def.maxScore,
    };
  });
}

/**
 * Resolves theme color palette based on tier or overall score
 * @param {string | number} [tierOrScore='amber']
 * @returns {{ fill: string; stroke: string; point: string; text: string }}
 */
export function resolveRadarTheme(tierOrScore) {
  let tier = 'amber';
  if (typeof tierOrScore === 'number') {
    if (tierOrScore >= 90) tier = 'amber';
    else if (tierOrScore >= 80) tier = 'emerald';
    else if (tierOrScore >= 70) tier = 'sky';
    else tier = 'neutral';
  } else if (typeof tierOrScore === 'string') {
    if (tierOrScore === 'editors-choice' || tierOrScore === 'amber') tier = 'amber';
    else if (tierOrScore === 'highly-recommended' || tierOrScore === 'emerald') tier = 'emerald';
    else if (tierOrScore === 'capable-utility' || tierOrScore === 'sky') tier = 'sky';
    else tier = 'neutral';
  }

  switch (tier) {
    case 'emerald':
      return {
        fill: 'rgba(16, 185, 129, 0.28)',
        stroke: '#059669',
        point: '#047857',
        text: '#065f46',
      };
    case 'sky':
      return {
        fill: 'rgba(14, 165, 233, 0.28)',
        stroke: '#0284c7',
        point: '#0369a1',
        text: '#075985',
      };
    case 'neutral':
      return {
        fill: 'rgba(115, 115, 115, 0.22)',
        stroke: '#525252',
        point: '#404040',
        text: '#262626',
      };
    case 'amber':
    default:
      return {
        fill: 'rgba(245, 158, 11, 0.32)',
        stroke: '#d97706',
        point: '#b45309',
        text: '#92400e',
      };
  }
}

/**
 * Calculates geometric vertex coordinates for the radar chart
 * @param {DimensionScore[]} dimensions
 * @param {RadarChartConfig} [config]
 */
export function computeRadarGeometry(dimensions, config = {}) {
  const cx = config.cx ?? 160;
  const cy = config.cy ?? 125;
  const radius = config.radius ?? 78;
  const totalAxes = dimensions.length || 5;

  /**
   * Angle for axis index i (clockwise, 0 is top at -PI/2)
   * @param {number} i
   */
  const getAngle = (i) => -Math.PI / 2 + (2 * Math.PI * i) / totalAxes;

  // Grid concentric pentagons at 25%, 50%, 75%, 100%
  const gridLevels = [0.25, 0.5, 0.75, 1.0].map((level) => {
    const r = radius * level;
    const points = Array.from({ length: totalAxes }, (_, i) => {
      const theta = getAngle(i);
      const x = (cx + r * Math.cos(theta)).toFixed(1);
      const y = (cy + r * Math.sin(theta)).toFixed(1);
      return `${x},${y}`;
    }).join(' ');
    return { level, points };
  });

  // Spokes from center to outer perimeter
  const spokes = Array.from({ length: totalAxes }, (_, i) => {
    const theta = getAngle(i);
    return {
      x1: cx,
      y1: cy,
      x2: Number((cx + radius * Math.cos(theta)).toFixed(1)),
      y2: Number((cy + radius * Math.sin(theta)).toFixed(1)),
    };
  });

  // Data polygon points and markers
  const dataPoints = dimensions.map((dim, i) => {
    const ratio = dim.maxScore > 0 ? Math.max(0.08, Math.min(1.0, dim.score / dim.maxScore)) : 0.5;
    const r = radius * ratio;
    const theta = getAngle(i);
    const x = Number((cx + r * Math.cos(theta)).toFixed(1));
    const y = Number((cy + r * Math.sin(theta)).toFixed(1));
    return {
      key: dim.key,
      label: dim.label,
      score: dim.score,
      maxScore: dim.maxScore,
      percentage: Math.round(ratio * 100),
      x,
      y,
    };
  });

  const polygonPointsStr = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Labels positioned slightly outside the outer radius
  const labelDistance = radius + 22;
  const labelNodes = dimensions.map((dim, i) => {
    const theta = getAngle(i);
    const lx = cx + labelDistance * Math.cos(theta);
    const ly = cy + labelDistance * Math.sin(theta);

    let anchor = 'middle';
    const cosVal = Math.cos(theta);
    if (cosVal > 0.25) anchor = 'start';
    else if (cosVal < -0.25) anchor = 'end';

    // Vertical baseline alignment adjustment
    let baselineOffset = 4;
    const sinVal = Math.sin(theta);
    if (sinVal < -0.6) baselineOffset = -6; // top
    else if (sinVal > 0.6) baselineOffset = 12; // bottom

    return {
      key: dim.key,
      label: dim.label,
      score: `${dim.score}/${dim.maxScore}`,
      x: Number(lx.toFixed(1)),
      y: Number((ly + baselineOffset).toFixed(1)),
      anchor,
    };
  });

  return {
    cx,
    cy,
    radius,
    gridLevels,
    spokes,
    dataPoints,
    polygonPointsStr,
    labelNodes,
  };
}

/**
 * Generates standalone clean SVG markup for the radar chart (zero JS runtime)
 * @param {Record<string, number>} productScore
 * @param {Object} [options]
 * @param {Record<string, string>} [options.labels]
 * @param {string | number} [options.themeOrTier]
 * @param {number} [options.width=320]
 * @param {number} [options.height=260]
 * @returns {string}
 */
export function renderRadarChartSvg(productScore, options = {}) {
  const width = options.width ?? 320;
  const height = options.height ?? 260;
  const theme = resolveRadarTheme(options.themeOrTier || productScore?.overall || 'amber');
  const dimensions = normalizeDimensionScores(productScore, options.labels);
  const geo = computeRadarGeometry(dimensions, {
    width,
    height,
    cx: width / 2,
    cy: height / 2 - 4,
    radius: Math.min(width, height) * 0.32,
  });

  const gridPolygons = geo.gridLevels
    .map(
      (g) =>
        `<polygon points="${g.points}" fill="none" stroke="#e5e5e5" stroke-width="${g.level === 1 ? '1.5' : '1'}" stroke-dasharray="${g.level === 1 ? 'none' : '2,2'}" />`
    )
    .join('\n      ');

  const spokeLines = geo.spokes
    .map((s) => `<line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="#e5e5e5" stroke-width="1" />`)
    .join('\n      ');

  const vertices = geo.dataPoints
    .map(
      (p) =>
        `<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="${theme.point}" stroke="#ffffff" stroke-width="1.5"><title>${p.label}: ${p.score}/${p.maxScore} (${p.percentage}%)</title></circle>`
    )
    .join('\n      ');

  const textLabels = geo.labelNodes
    .map(
      (l) =>
        `<text x="${l.x}" y="${l.y}" text-anchor="${l.anchor}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="10" font-weight="600" fill="#404040">
        <tspan fill="#171717">${l.label}</tspan> <tspan fill="${theme.text}" font-weight="700">(${l.score})</tspan>
      </text>`
    )
    .join('\n      ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto max-w-[340px] mx-auto select-none" role="img" aria-label="5-Dimension Performance Radar">
      <desc>Radar chart displaying 5 dimensions: Frictionless, Depth, Export, Privacy, Polish</desc>
      <!-- Background Guide Grid -->
      ${gridPolygons}
      <!-- Radial Spokes -->
      ${spokeLines}
      <!-- Data Area -->
      <polygon points="${geo.polygonPointsStr}" fill="${theme.fill}" stroke="${theme.stroke}" stroke-width="2" stroke-linejoin="round" />
      <!-- Vertex Markers -->
      ${vertices}
      <!-- Labels -->
      ${textLabels}
    </svg>`.trim();
}

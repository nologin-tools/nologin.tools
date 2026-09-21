import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeDimensionScores,
  resolveRadarTheme,
  computeRadarGeometry,
  renderRadarChartSvg,
} from '../../src/lib/radar-chart.mjs';

describe('radar-chart', () => {
  describe('normalizeDimensionScores', () => {
    it('normalizes valid scores and clamps to dimension maximums', () => {
      const raw = {
        frictionless: 19,
        depth: 24,
        exportFreedom: 20,
        privacy: 18,
        polish: 14,
      };
      const dims = normalizeDimensionScores(raw);
      assert.equal(dims.length, 5);
      assert.equal(dims[0].key, 'frictionless');
      assert.equal(dims[0].score, 19);
      assert.equal(dims[0].maxScore, 20);

      assert.equal(dims[1].key, 'depth');
      assert.equal(dims[1].score, 24);
      assert.equal(dims[1].maxScore, 25);

      assert.equal(dims[2].key, 'exportFreedom');
      assert.equal(dims[2].score, 20);
      assert.equal(dims[2].maxScore, 20);

      assert.equal(dims[3].key, 'privacy');
      assert.equal(dims[3].score, 18);
      assert.equal(dims[3].maxScore, 20);

      assert.equal(dims[4].key, 'polish');
      assert.equal(dims[4].score, 14);
      assert.equal(dims[4].maxScore, 15);
    });

    it('handles missing or out-of-bound values safely', () => {
      const dims = normalizeDimensionScores({
        frictionless: 999, // should clamp to 20
        depth: -5,        // should clamp to 0
        privacy: NaN,     // should fallback to maxScore (20)
      });
      assert.equal(dims.find((d) => d.key === 'frictionless')?.score, 20);
      assert.equal(dims.find((d) => d.key === 'depth')?.score, 0);
      assert.equal(dims.find((d) => d.key === 'privacy')?.score, 20);
    });

    it('respects localized label overrides', () => {
      const dims = normalizeDimensionScores(
        { frictionless: 18 },
        { frictionless: '零摩擦体验', depth: '功能深度' }
      );
      assert.equal(dims.find((d) => d.key === 'frictionless')?.label, '零摩擦体验');
      assert.equal(dims.find((d) => d.key === 'depth')?.label, '功能深度');
    });
  });

  describe('resolveRadarTheme', () => {
    it('selects amber for editors-choice (score >= 90)', () => {
      const theme95 = resolveRadarTheme(95);
      const themeEc = resolveRadarTheme('editors-choice');
      assert.match(theme95.stroke, /d97706/i);
      assert.match(themeEc.stroke, /d97706/i);
    });

    it('selects emerald for highly-recommended (score 80-89)', () => {
      const theme85 = resolveRadarTheme(85);
      const themeHr = resolveRadarTheme('highly-recommended');
      assert.match(theme85.stroke, /059669/i);
      assert.match(themeHr.stroke, /059669/i);
    });

    it('selects sky for capable-utility (score 70-79)', () => {
      const theme75 = resolveRadarTheme(75);
      const themeCu = resolveRadarTheme('capable-utility');
      assert.match(theme75.stroke, /0284c7/i);
      assert.match(themeCu.stroke, /0284c7/i);
    });

    it('selects neutral for low scores or unknown tier', () => {
      const theme65 = resolveRadarTheme(65);
      assert.match(theme65.stroke, /525252/i);
    });
  });

  describe('computeRadarGeometry', () => {
    it('produces valid coordinates without NaN', () => {
      const dims = normalizeDimensionScores({
        frictionless: 19,
        depth: 24,
        exportFreedom: 19,
        privacy: 19,
        polish: 14,
      });
      const geo = computeRadarGeometry(dims, { width: 320, height: 260, cx: 160, cy: 130, radius: 80 });

      assert.equal(geo.gridLevels.length, 4);
      assert.equal(geo.spokes.length, 5);
      assert.equal(geo.dataPoints.length, 5);
      assert.equal(geo.labelNodes.length, 5);

      for (const pt of geo.dataPoints) {
        assert.ok(!Number.isNaN(pt.x), `pt.x is NaN for ${pt.key}`);
        assert.ok(!Number.isNaN(pt.y), `pt.y is NaN for ${pt.key}`);
      }

      for (const lbl of geo.labelNodes) {
        assert.ok(!Number.isNaN(lbl.x), `lbl.x is NaN for ${lbl.key}`);
        assert.ok(!Number.isNaN(lbl.y), `lbl.y is NaN for ${lbl.key}`);
        assert.ok(['start', 'middle', 'end'].includes(lbl.anchor));
      }
    });
  });

  describe('renderRadarChartSvg', () => {
    it('renders clean valid SVG containing polygon, markers, and text', () => {
      const svg = renderRadarChartSvg(
        {
          overall: 95,
          frictionless: 19,
          depth: 24,
          exportFreedom: 19,
          privacy: 19,
          polish: 14,
        },
        {
          labels: {
            frictionless: 'UX',
            depth: 'Depth',
            exportFreedom: 'Export',
            privacy: 'Privacy',
            polish: 'Polish',
          },
          themeOrTier: 'editors-choice',
        }
      );

      assert.ok(svg.startsWith('<svg'), 'Starts with <svg');
      assert.ok(svg.endsWith('</svg>'), 'Ends with </svg>');
      assert.ok(svg.includes('role="img"'));
      assert.ok(svg.includes('polygon points='));
      assert.ok(svg.includes('<circle cx='));
      assert.ok(svg.includes('UX'));
      assert.ok(svg.includes('(19/20)'));
      assert.ok(!svg.includes('NaN'), 'SVG must not contain NaN');
    });
  });
});

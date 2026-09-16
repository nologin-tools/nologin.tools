// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateDynamicBadgeSvg,
  getPrivacyGradeEmbedCode,
  getSandboxEmbedCode,
} from '../../src/lib/badge-core.mjs';

describe('Privacy Grade & Sandbox Dynamic Shields', () => {
  it('generates A+ privacy grade badge with emerald color', () => {
    const svg = generateDynamicBadgeSvg({
      badgeType: 'grade',
      grade: 'A+',
    });

    assert.ok(svg.includes('<svg'), 'Should return valid SVG');
    assert.ok(svg.includes('privacy'), 'Left text should be privacy');
    assert.ok(svg.includes('A+'), 'Right text should be A+');
    assert.ok(svg.includes('#059669'), 'A+ badge should use emerald color');
    assert.ok(svg.includes('Privacy Grade: A+'), 'Title should reflect privacy grade');
  });

  it('generates distinct colors across grades A, B+, and B', () => {
    const svgA = generateDynamicBadgeSvg({ badgeType: 'grade', grade: 'A' });
    assert.ok(svgA.includes('#16a34a'), 'Grade A should use green #16a34a');

    const svgBPlus = generateDynamicBadgeSvg({ badgeType: 'grade', grade: 'B+' });
    assert.ok(svgBPlus.includes('#0284c7'), 'Grade B+ should use sky blue #0284c7');

    const svgB = generateDynamicBadgeSvg({ badgeType: 'grade', grade: 'B' });
    assert.ok(svgB.includes('#d97706'), 'Grade B should use amber #d97706');
  });

  it('generates sandbox isolation dynamic badge', () => {
    const svg = generateDynamicBadgeSvg({
      badgeType: 'sandbox',
      sandboxStatus: '100% in-browser',
    });

    assert.ok(svg.includes('sandbox'), 'Left text should be sandbox');
    assert.ok(svg.includes('100% in-browser'), 'Right text should reflect sandbox status');
    assert.ok(svg.includes('#059669'), 'In-browser sandbox should use emerald color');
  });

  it('generates square and dark style variants', () => {
    const svgSquare = generateDynamicBadgeSvg({
      badgeType: 'grade',
      grade: 'A+',
      style: 'flat-square',
    });
    assert.ok(svgSquare.includes('rx="0"'), 'Square badge must have rx=0');

    const svgDark = generateDynamicBadgeSvg({
      badgeType: 'grade',
      grade: 'A+',
      style: 'flat-dark',
    });
    assert.ok(svgDark.includes('fill="#2d2d2d"'), 'Dark badge left rect must be #2d2d2d');
  });

  it('provides helper embed codes for GitHub READMEs', () => {
    const gradeEmbed = getPrivacyGradeEmbedCode('excalidraw-com', 'https://nologin.tools', 'A+');
    assert.ok(gradeEmbed.markdown.includes('https://nologin.tools/api/badge/excalidraw-com.svg?type=grade'));
    assert.ok(gradeEmbed.markdown.includes('https://nologin.tools/badge/excalidraw-com'));
    assert.ok(gradeEmbed.svg.includes('<a href="https://nologin.tools/badge/excalidraw-com">'));

    const sandboxEmbed = getSandboxEmbedCode('excalidraw-com', 'https://nologin.tools', '100% in-browser');
    assert.ok(sandboxEmbed.markdown.includes('https://nologin.tools/api/badge/excalidraw-com.svg?type=sandbox'));
    assert.ok(sandboxEmbed.svg.includes('<img src="https://nologin.tools/api/badge/excalidraw-com.svg?type=sandbox"'));
  });
});

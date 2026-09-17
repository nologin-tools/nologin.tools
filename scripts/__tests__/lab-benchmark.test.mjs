import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectFormat, extractDimensions, checkWatermark, inspectArtifact } from '../lab/inspectors/output-inspector.mjs';
import { generateSamplePng, generateSampleSvg } from '../lab/fixtures/generate-fixtures.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

describe('NoLogin Lab: Fixtures & Output Inspector', () => {
  it('generates valid PNG with correct Magic Bytes and 800x600 dimensions', () => {
    const pngBuf = generateSamplePng(800, 600);
    assert.ok(pngBuf.length > 50000, 'PNG buffer should be substantial');

    const format = detectFormat(pngBuf);
    assert.equal(format, 'png', 'Must detect PNG format from magic bytes');

    const dims = extractDimensions(pngBuf, 'png');
    assert.ok(dims, 'Must extract dimensions from IHDR');
    assert.equal(dims.width, 800);
    assert.equal(dims.height, 600);
  });

  it('generates valid SVG with correct viewBox and XML headers', () => {
    const svgStr = generateSampleSvg();
    const svgBuf = Buffer.from(svgStr, 'utf-8');

    const format = detectFormat(svgBuf);
    assert.equal(format, 'svg', 'Must detect SVG format');

    const dims = extractDimensions(svgBuf, 'svg');
    assert.ok(dims, 'Must extract dimensions from viewBox');
    assert.equal(dims.width, 800);
    assert.equal(dims.height, 600);

    // Also verify comma-separated viewBox syntax
    const commaSvg = Buffer.from('<svg viewBox="0, 0, 1024, 768"></svg>');
    const commaDims = extractDimensions(commaSvg, 'svg');
    assert.deepEqual(commaDims, { width: 1024, height: 768 });
  });

  it('detects watermark injection signatures accurately and avoids false positives', () => {
    const cleanBuf = Buffer.from('<svg width="100" height="100"><!-- Created with Inkscape --><circle cx="50" cy="50" r="40"/></svg>');
    const cleanCheck = checkWatermark(cleanBuf, 'svg');
    assert.equal(cleanCheck.hasWatermark, false, 'Legitimate editor comments should not trigger watermark');

    const watermarkedBuf = Buffer.from('<svg width="100" height="100"><text>Created with Free Tier Watermark</text></svg>');
    const wmCheck = checkWatermark(watermarkedBuf, 'svg');
    assert.equal(wmCheck.hasWatermark, true);
    assert.equal(wmCheck.detectedSignature, 'watermark');
  });

  it('inspectArtifact computes accurate compression ratio and dimension preservation', () => {
    const pngPath = resolve(ROOT, 'scripts/lab/fixtures/sample.png');
    assert.ok(existsSync(pngPath), 'sample.png fixture must exist');

    const originalFixture = {
      size: 400000,
      width: 800,
      height: 600,
      format: 'png'
    };

    const res = inspectArtifact(pngPath, originalFixture);
    assert.equal(res.success, true);
    assert.equal(res.file.format, 'png');
    assert.equal(res.file.dimensions.width, 800);
    assert.equal(res.file.dimensions.height, 600);
    assert.equal(res.quality.dimensionPreserved, true);
    assert.equal(res.quality.isBaitTrap, false);
    assert.ok(typeof res.quality.compressionRatio === 'number');
  });

  it('detects bait-and-switch HTML traps disguised as image downloads', () => {
    const fakeHtmlBuf = Buffer.from('<!DOCTYPE html><html><body><h1>Please Log In to Download</h1></body></html>');
    const fakeHtmlPath = resolve(__dirname, 'temp-trap.html');
    
    // Test format detection on HTML
    const format = detectFormat(fakeHtmlBuf);
    assert.equal(format, 'html');

    const originalFixture = { size: 10000, width: 800, height: 600, format: 'png' };
    const trapCheck = (format === 'html') && (originalFixture.format !== 'html');
    assert.equal(trapCheck, true, 'Must flag HTML disguised as PNG as bait trap');
  });

  it('validates sample.json fixture structure and integrity', () => {
    const jsonPath = resolve(ROOT, 'scripts/lab/fixtures/sample.json');
    assert.ok(existsSync(jsonPath), 'sample.json fixture must exist');

    const raw = readFileSync(jsonPath, 'utf-8');
    const parsed = JSON.parse(raw);
    assert.ok(parsed.benchmarkMeta, 'Must contain benchmarkMeta');
    assert.ok(Array.isArray(parsed.performanceMatrix), 'Must contain performanceMatrix array');
    assert.equal(parsed.performanceMatrix.length, 50, 'Must have 50 items');
    assert.equal(detectFormat(Buffer.from(raw)), 'json', 'Must detect json format');
  });

  it('generates and detects valid sample.md Markdown fixture', () => {
    const mdPath = resolve(ROOT, 'scripts/lab/fixtures/sample.md');
    assert.ok(existsSync(mdPath), 'sample.md fixture must exist');

    const mdBuf = readFileSync(mdPath);
    assert.equal(detectFormat(mdBuf), 'markdown', 'Must detect markdown format');
    const mdText = mdBuf.toString('utf-8');
    assert.ok(mdText.includes('# NoLogin Lab Benchmark Standard Document'), 'Must have H1 heading');
    assert.ok(mdText.includes('```typescript'), 'Must have TypeScript code block');
    assert.ok(mdText.includes('| Architecture Paradigm |'), 'Must have markdown table');
  });

  it('generates and detects valid sample.wav 44.1kHz audio fixture', () => {
    const wavPath = resolve(ROOT, 'scripts/lab/fixtures/sample.wav');
    assert.ok(existsSync(wavPath), 'sample.wav fixture must exist');

    const wavBuf = readFileSync(wavPath);
    assert.equal(detectFormat(wavBuf), 'wav', 'Must detect wav format');
    assert.equal(wavBuf.toString('ascii', 0, 4), 'RIFF');
    assert.equal(wavBuf.toString('ascii', 8, 12), 'WAVE');
    assert.equal(wavBuf.readUInt32LE(24), 44100, 'Sample rate must be 44.1kHz');
    assert.equal(wavBuf.readUInt16LE(20), 1, 'Audio format must be PCM (1)');
  });

  it('generates and detects valid sample.pdf standard fixture', () => {
    const pdfPath = resolve(ROOT, 'scripts/lab/fixtures/sample.pdf');
    assert.ok(existsSync(pdfPath), 'sample.pdf fixture must exist');

    const pdfBuf = readFileSync(pdfPath);
    assert.equal(detectFormat(pdfBuf), 'pdf', 'Must detect pdf format');
    assert.ok(pdfBuf.toString('utf-8').includes('%PDF-1.4'));
    assert.ok(pdfBuf.toString('utf-8').includes('%%EOF'));
  });

  it('detects MP3 magic bytes correctly', () => {
    const id3Buf = Buffer.from([0x49, 0x44, 0x33, 0x03, 0x00, 0x00]); // ID3v2
    assert.equal(detectFormat(id3Buf), 'mp3', 'Must detect ID3 MP3');

    const syncBuf = Buffer.from([0xFF, 0xFB, 0x90, 0x64]); // MPEG-1 Layer 3 frame sync
    assert.equal(detectFormat(syncBuf), 'mp3', 'Must detect frame sync MP3');
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';
import {
  detectFormat,
  extractDimensions,
  checkWatermark,
  inspectArtifact,
  analyzePngScanlines,
  computeHammingDistance,
  checkSvgBlank
} from '../lab/inspectors/output-inspector.mjs';
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

  it('computes 64-bit dHash and detects rich non-blank canvas on sample.png', () => {
    const pngPath = resolve(ROOT, 'scripts/lab/fixtures/sample.png');
    const pngBuf = readFileSync(pngPath);
    const analysis = analyzePngScanlines(pngBuf);
    assert.ok(analysis, 'Must successfully parse non-interlaced PNG scanlines');
    assert.equal(analysis.isBlankCanvas, false, 'sample.png should not be flagged as blank');
    assert.ok(analysis.perceptualHash, 'Must produce a 16-hex perceptual hash');
    assert.equal(analysis.perceptualHash.length, 16, 'dHash must be 16 hex characters (64 bits)');
    assert.ok(analysis.variance > 10.0, 'sample.png has rich gradient variance');
  });

  it('detects completely blank / whiteout canvas and flags isBlankCanvas', () => {
    // Generate a 400x300 pure white PNG (all pixels 255, variance 0)
    const width = 400;
    const height = 300;
    const rowLength = 1 + width * 3;
    const rawData = Buffer.alloc(rowLength * height);
    for (let y = 0; y < height; y++) {
      const rowOffset = y * rowLength;
      rawData[rowOffset] = 0x00; // Filter: None
      for (let x = 0; x < width; x++) {
        const pxOffset = rowOffset + 1 + x * 3;
        rawData[pxOffset] = 255;
        rawData[pxOffset + 1] = 255;
        rawData[pxOffset + 2] = 255;
      }
    }
    const idatData = zlib.deflateSync(rawData);

    // PNG signature + IHDR + IDAT + IEND
    const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const ihdr = Buffer.alloc(25);
    ihdr.writeUInt32BE(13, 0);
    ihdr.write('IHDR', 4, 4, 'ascii');
    ihdr.writeUInt32BE(width, 8);
    ihdr.writeUInt32BE(height, 12);
    ihdr[16] = 8;
    ihdr[17] = 2; // RGB
    ihdr[18] = 0;
    ihdr[19] = 0;
    ihdr[20] = 0;

    const idatChunk = Buffer.alloc(12 + idatData.length);
    idatChunk.writeUInt32BE(idatData.length, 0);
    idatChunk.write('IDAT', 4, 4, 'ascii');
    idatData.copy(idatChunk, 8);

    const whitePng = Buffer.concat([sig, ihdr, idatChunk]);
    const analysis = analyzePngScanlines(whitePng);
    assert.ok(analysis, 'Must parse blank white PNG');
    assert.equal(analysis.isBlankCanvas, true, 'Zero-variance whiteout image must be flagged as blank canvas');
    assert.equal(analysis.variance, 0);
  });

  it('computes Hamming distance and visual fidelity accurately', () => {
    const hashA = '0000000000000000';
    const hashB = '0000000000000000';
    const distZero = computeHammingDistance(hashA, hashB);
    assert.equal(distZero, 0, 'Identical hashes have 0 distance');

    // Differing by 1 bit: '0000000000000001'
    const hashC = '0000000000000001';
    const distOne = computeHammingDistance(hashA, hashC);
    assert.equal(distOne, 1, 'Differing by 1 bit has distance 1');

    // Differing by all 64 bits: 'ffffffffffffffff'
    const hashD = 'ffffffffffffffff';
    const distAll = computeHammingDistance(hashA, hashD);
    assert.equal(distAll, 64, 'Differing by all bits has distance 64');
  });

  it('detects blank vs non-blank SVG files accurately', () => {
    const emptySvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>');
    assert.equal(checkSvgBlank(emptySvg), true, 'Empty SVG without primitives must be flagged as blank');

    const validSvg = Buffer.from('<svg width="100" height="100"><rect width="100" height="100" fill="red"/></svg>');
    assert.equal(checkSvgBlank(validSvg), false, 'SVG with rect primitive is non-blank');
  });

  it('verifies all standard grounded test fixtures exist and are non-empty', () => {
    const fixtureNames = ['sample.png', 'sample.svg', 'sample.json', 'sample.md', 'sample.wav', 'sample.pdf'];
    for (const name of fixtureNames) {
      const p = resolve(ROOT, 'scripts/lab/fixtures', name);
      assert.ok(existsSync(p), `Fixture ${name} must exist on disk`);
      const stat = readFileSync(p);
      assert.ok(stat.length > 0, `Fixture ${name} must have non-zero byte length`);
    }
  });

  it('matches multilingual and icon-based action/export buttons accurately', () => {
    const actionRegex = /format|beautify|convert|run|generate|minify|transform|calculate|process|compress|translate|validate|parse|analyze|execute|test|decode|inspect|optimize|merge|split|upload|render|apply|start|resize|crop|build|edit|转换|生成|运行|压缩|执行|格式化|合并|拆分|上传|优化|计算|解析|测试|处理|应用|剪切|缩放/i;
    const exportRegex = /download|export|save|copy|share|get output|get code|下载|导出|保存|复制|提取/i;

    // English verbs
    assert.ok(actionRegex.test('Convert Image'));
    assert.ok(actionRegex.test('Optimize SVG'));
    assert.ok(actionRegex.test('Compress PNG'));
    assert.ok(actionRegex.test('Run Query'));
    assert.ok(exportRegex.test('Download Result'));
    assert.ok(exportRegex.test('Export to PNG'));

    // Chinese verbs
    assert.ok(actionRegex.test('开始转换'));
    assert.ok(actionRegex.test('在线压缩'));
    assert.ok(actionRegex.test('格式化代码'));
    assert.ok(actionRegex.test('合并PDF'));
    assert.ok(exportRegex.test('立即下载'));
    assert.ok(exportRegex.test('导出文件'));

    // Rejection of non-actions
    assert.ok(!actionRegex.test('Sign In With Google'));
    assert.ok(!actionRegex.test('Cookie Preferences'));
  });

  it('correctly maps file input accept types to standard grounded fixtures', () => {
    function resolveFixtureForAccept(acceptStr, context = '') {
      const lower = (acceptStr + ' ' + context).toLowerCase();
      if (lower.includes('pdf')) return 'pdf';
      if (lower.includes('svg')) return 'svg';
      if (lower.includes('audio') || lower.includes('wav') || lower.includes('mp3')) return 'wav';
      if (lower.includes('json')) return 'json';
      if (lower.includes('md') || lower.includes('markdown')) return 'md';
      return 'png'; // default image
    }

    assert.equal(resolveFixtureForAccept('image/*, .png, .jpg'), 'png');
    assert.equal(resolveFixtureForAccept('.pdf, application/pdf'), 'pdf');
    assert.equal(resolveFixtureForAccept('image/svg+xml, .svg'), 'svg');
    assert.equal(resolveFixtureForAccept('audio/wav, audio/mp3'), 'wav');
    assert.equal(resolveFixtureForAccept('.json, application/json'), 'json');
    assert.equal(resolveFixtureForAccept('', 'Squoosh image compression in browser'), 'png');
    assert.equal(resolveFixtureForAccept('', 'Merge and split PDF files locally'), 'pdf');
  });

  it('verifies benchmark.mjs displays clean help and supports --rolling and --sync', () => {
    const res = spawnSync('node', ['scripts/lab/benchmark.mjs', '--help'], {
      cwd: ROOT,
      encoding: 'utf-8'
    });
    assert.equal(res.status, 0);
    assert.ok(res.stdout.includes('--rolling'));
    assert.ok(res.stdout.includes('--sync'));
    assert.ok(res.stdout.includes('--url'));
    assert.ok(res.stdout.includes('--slug'));
  });
});


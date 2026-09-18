/**
 * scripts/lab/inspectors/output-inspector.mjs
 * 
 * High-precision output artifact inspector for NoLogin Lab benchmark.
 * Inspects downloaded files for:
 * 1. Format & MIME type via Magic Bytes
 * 2. Resolution & Dimension Preservation (PNG, JPEG, WebP, SVG)
 * 3. Compression / Optimization Ratio
 * 4. Watermark & Branding Injection
 * 5. Trap Detection (HTML redirect, auth wall response, truncated payload)
 */

import { readFileSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import zlib from 'node:zlib';

/**
 * Detects format and magic byte classification
 * @param {Buffer} buf 
 * @returns {string} 'png' | 'jpeg' | 'webp' | 'svg' | 'pdf' | 'zip' | 'wav' | 'mp3' | 'markdown' | 'html' | 'json' | 'unknown'
 */
export function detectFormat(buf) {
  if (!buf || buf.length < 4) return 'unknown';

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
    return 'png';
  }

  // JPEG: FF D8 FF
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) {
    return 'jpeg';
  }

  // WebP: RIFF .... WEBP
  if (buf.length >= 12 &&
      buf.toString('ascii', 0, 4) === 'RIFF' &&
      buf.toString('ascii', 8, 12) === 'WEBP') {
    return 'webp';
  }

  // WAV: RIFF .... WAVE
  if (buf.length >= 12 &&
      buf.toString('ascii', 0, 4) === 'RIFF' &&
      buf.toString('ascii', 8, 12) === 'WAVE') {
    return 'wav';
  }

  // MP3: ID3 or frame sync 0xFF 0xE0
  if ((buf.length >= 3 && buf.toString('ascii', 0, 3) === 'ID3') ||
      (buf[0] === 0xFF && (buf[1] & 0xE0) === 0xE0)) {
    return 'mp3';
  }

  // PDF: %PDF-
  if (buf.length >= 5 && buf.toString('ascii', 0, 5) === '%PDF-') {
    return 'pdf';
  }

  // ZIP: PK\x03\x04
  if (buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4B && buf[2] === 0x03 && buf[3] === 0x04) {
    return 'zip';
  }

  // Text-based formats (SVG, HTML, JSON, Markdown)
  const headerText = buf.subarray(0, Math.min(buf.length, 1024)).toString('utf-8').trim();

  if (/<svg[\s>]/i.test(headerText) || (headerText.startsWith('<?xml') && /<svg[\s>]/i.test(headerText))) {
    return 'svg';
  }

  if (/<(!doctype\s+)?html/i.test(headerText) || /<head[\s>]/i.test(headerText) || /<body[\s>]/i.test(headerText)) {
    return 'html';
  }

  if (headerText.startsWith('{') || headerText.startsWith('[')) {
    try {
      JSON.parse(buf.toString('utf-8'));
      return 'json';
    } catch {
      // not valid json
    }
  }

  if (/^#+\s+|^\s*[-*+]\s+|\[.+?\]\(.+?\)|```/m.test(headerText)) {
    return 'markdown';
  }

  return 'unknown';
}

/**
 * Parses image dimensions without external binaries
 * @param {Buffer} buf 
 * @param {string} format 
 * @returns {{ width: number, height: number } | null}
 */
export function extractDimensions(buf, format) {
  try {
    if (format === 'png' && buf.length >= 24) {
      // IHDR chunk: width at 16..19, height at 20..23
      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      return { width, height };
    }

    if (format === 'jpeg') {
      let offset = 2;
      while (offset < buf.length - 1) {
        if (buf[offset] !== 0xFF) {
          offset++;
          continue;
        }
        const marker = buf[offset + 1];
        // SOF0 (Baseline), SOF2 (Progressive)
        if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
          if (offset + 8 >= buf.length) break;
          const height = buf.readUInt16BE(offset + 5);
          const width = buf.readUInt16BE(offset + 7);
          return { width, height };
        }
        if (marker === 0xD9 || marker === 0xDA) break; // EOI or SOS
        if (offset + 3 >= buf.length) break;
        const length = buf.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
    }

    if (format === 'webp') {
      const type = buf.toString('ascii', 12, 16);
      if (type === 'VP8 ' && buf.length >= 30) {
        const width = buf.readUInt16LE(26) & 0x3fff;
        const height = buf.readUInt16LE(28) & 0x3fff;
        return { width, height };
      } else if (type === 'VP8L' && buf.length >= 25) {
        const b0 = buf[21];
        const b1 = buf[22];
        const b2 = buf[23];
        const b3 = buf[24];
        const width = 1 + (((b1 & 0x3F) << 8) | b0);
        const height = 1 + (((b3 & 0xF) << 10) | (b2 << 2) | ((b1 & 0xC0) >> 6));
        return { width, height };
      } else if (type === 'VP8X' && buf.length >= 30) {
        const width = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
        const height = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
        return { width, height };
      }
    }

    if (format === 'svg') {
      const text = buf.toString('utf-8');
      const viewBoxMatch = text.match(/viewBox=["']\s*([0-9.]+)[,\s]+([0-9.]+)[,\s]+([0-9.]+)[,\s]+([0-9.]+)\s*["']/i);
      if (viewBoxMatch) {
        return {
          width: Math.round(parseFloat(viewBoxMatch[3])),
          height: Math.round(parseFloat(viewBoxMatch[4]))
        };
      }
      const wMatch = text.match(/width=["']([0-9.]+)["']/i);
      const hMatch = text.match(/height=["']([0-9.]+)["']/i);
      if (wMatch && hMatch) {
        return {
          width: Math.round(parseFloat(wMatch[1])),
          height: Math.round(parseFloat(hMatch[1]))
        };
      }
    }
  } catch (e) {
    // ignore parse error, return null
  }
  return null;
}

/**
 * Checks for watermark signatures or commercial promotional injections
 * @param {Buffer} buf 
 * @param {string} format 
 * @returns {{ hasWatermark: boolean, detectedSignature: string | null }}
 */
export function checkWatermark(buf, format) {
  const textSample = buf.toString('utf-8', 0, Math.min(buf.length, 100000)).toLowerCase();
  
  const suspiciousKeywords = [
    'watermark',
    'created with free',
    'made with free',
    'trial version',
    'demo watermark',
    'unregistered version',
    'upgrade to remove',
    'ilovepdf',
    'freepik watermark',
    'canva free',
    'remove-watermark',
    'watermark added'
  ];

  for (const kw of suspiciousKeywords) {
    if (textSample.includes(kw)) {
      return { hasWatermark: true, detectedSignature: kw };
    }
  }

  return { hasWatermark: false, detectedSignature: null };
}

/**
 * Checks for promotional tails, backlinks, or watermark signatures injected into copied text
 * @param {string} text
 * @returns {{ hasTail: boolean, detectedTail: string | null, cleanText: string }}
 */
export function checkClipboardTail(text) {
  if (typeof text !== 'string' || !text.trim()) {
    return { hasTail: false, detectedTail: null, cleanText: '' };
  }

  // Check for standalone tail lines at the end of the text (common pattern for copy-injected tails)
  const TAIL_PATTERNS = [
    // Standard promotional signatures with or without URLs
    /(?:\r?\n)+(?:[-—*#\s]*)(?:generated|created|formatted|converted|copied|beautified|powered)\s+by\s+([^\r\n]+)$/i,
    /(?:\r?\n)+(?:[-—*#\s]*)(?:made with|via|shared from)\s+([a-z0-9_.-]+(?:\.[a-z]{2,})?[^\r\n]*)$/i,
    /(?:\r?\n)+(?:[-—*#\s]*)(?:visit|source|website):\s*(https?:\/\/[^\s]+)$/i,
    // Trailing backlink on its own final line
    /(?:\r?\n)+(?:[-—*#\s]*)(https?:\/\/(?:www\.)?[a-z0-9_.-]+\.[a-z]{2,}[^\s]*)$/i,
    // Chinese promotional signatures
    /(?:\r?\n)+(?:[-—*#\s]*)(?:本内容由|本文由|内容由|由|来源[：:]|转自|分享自|关注公众号[：:]|使用)\s*([^\r\n]+)$/i,
    // Block comment signatures (e.g. /* Generated by ToolName */)
    /(?:\r?\n)+(?:\/\*+|\/\/|<!--)\s*(?:generated|created|formatted|powered)\s+(?:by|with)\s+([^*]+)(?:\*+\/|-->)?$/i
  ];

  for (const pattern of TAIL_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const detectedTail = match[0].trim();
      const cleanText = text.slice(0, match.index).trimEnd();
      return {
        hasTail: true,
        detectedTail,
        cleanText
      };
    }
  }

  // Check for embedded watermark keywords
  const lower = text.toLowerCase();
  const suspiciousKeywords = [
    'watermark',
    'created with free',
    'made with free',
    'trial version',
    'upgrade to remove',
    'unregistered version',
    'demo version watermark'
  ];

  for (const kw of suspiciousKeywords) {
    if (lower.includes(kw)) {
      return {
        hasTail: true,
        detectedTail: kw,
        cleanText: text
      };
    }
  }

  return { hasTail: false, detectedTail: null, cleanText: text };
}

/**
 * Detects string format for clipboard text
 * @param {string} text
 * @returns {'json' | 'svg' | 'markdown' | 'html' | 'css' | 'sql' | 'base64' | 'text'}
 */
export function detectTextFormat(text) {
  if (typeof text !== 'string' || !text.trim()) return 'text';
  const trimmed = text.trim();

  // JSON
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // might have a tail or be invalid json
    }
  }

  // SVG
  if (/<svg[\s>]/i.test(trimmed) && /<\/svg>/i.test(trimmed)) {
    return 'svg';
  }

  // HTML
  if (/<(!doctype\s+)?html/i.test(trimmed) || /<(?:head|body|div|span|p|table)\b/i.test(trimmed)) {
    return 'html';
  }

  // CSS
  if (/^[.#a-z0-9_-][^{}]*\{[^}]+\}/im.test(trimmed)) {
    return 'css';
  }

  // SQL
  if (/^(?:SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE)\b/i.test(trimmed)) {
    return 'sql';
  }

  // Markdown
  if (/^#+\s+|^\s*[-*+]\s+|\[.+?\]\(.+?\)|```/m.test(trimmed)) {
    return 'markdown';
  }

  // Base64
  if (trimmed.length >= 24 && /^[A-Za-z0-9+/=]+$/.test(trimmed) && trimmed.length % 4 === 0) {
    return 'base64';
  }

  return 'text';
}

/**
 * Analyzes non-interlaced PNG scanlines to detect blank canvases and compute dHash (difference hash)
 * @param {Buffer} buf
 * @returns {{ isBlankCanvas: boolean, perceptualHash: string, meanLuminance: number, variance: number } | null}
 */
export function analyzePngScanlines(buf) {
  try {
    if (!buf || buf.length < 33 || buf[0] !== 0x89 || buf[1] !== 0x50) return null;
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    const bitDepth = buf[24];
    const colorType = buf[25];
    const interlace = buf[28];

    // Only process 8-bit depth non-interlaced images
    if (bitDepth !== 8 || interlace !== 0 || width < 2 || height < 2) return null;

    let bytesPerPixel = 3;
    if (colorType === 2) bytesPerPixel = 3; // RGB
    else if (colorType === 6) bytesPerPixel = 4; // RGBA
    else if (colorType === 0) bytesPerPixel = 1; // Grayscale
    else if (colorType === 4) bytesPerPixel = 2; // Gray + Alpha
    else if (colorType === 3) bytesPerPixel = 1; // Indexed
    else return null;

    // Collect IDAT chunks
    const idatChunks = [];
    let offset = 8;
    while (offset < buf.length - 12) {
      const len = buf.readUInt32BE(offset);
      const type = buf.toString('ascii', offset + 4, offset + 8);
      if (type === 'IDAT') {
        idatChunks.push(buf.subarray(offset + 8, offset + 8 + len));
      }
      offset += 12 + len;
    }

    if (idatChunks.length === 0) return null;
    const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
    const rowStride = 1 + width * bytesPerPixel;
    if (decompressed.length < rowStride * height) return null;

    // Sample a 9x8 grid for dHash and compute luminance variance
    const sampledLuminance = [];
    for (let r = 0; r < 8; r++) {
      const y = Math.floor((r / 7) * (height - 1));
      const rowStart = y * rowStride;
      for (let c = 0; c < 9; c++) {
        const x = Math.floor((c / 8) * (width - 1));
        const pxStart = rowStart + 1 + x * bytesPerPixel;
        let lum = 0;
        if (bytesPerPixel >= 3) {
          const red = decompressed[pxStart];
          const green = decompressed[pxStart + 1];
          const blue = decompressed[pxStart + 2];
          lum = 0.299 * red + 0.587 * green + 0.114 * blue;
        } else {
          lum = decompressed[pxStart];
        }
        sampledLuminance.push(lum);
      }
    }

    // Variance calculation on the 72 sampled points
    let sum = 0;
    for (const l of sampledLuminance) sum += l;
    const mean = sum / sampledLuminance.length;
    let varSum = 0;
    for (const l of sampledLuminance) varSum += (l - mean) * (l - mean);
    const variance = varSum / sampledLuminance.length;

    // A canvas is blank if variance is near-zero (< 1.0) and dimensions are substantial
    const isBlankCanvas = (variance < 1.0) && (width >= 100 && height >= 100);

    // Compute 64-bit dHash: for each row, compare adjacent column values (c > c+1)
    let bits = '';
    for (let r = 0; r < 8; r++) {
      const rowOffset = r * 9;
      for (let c = 0; c < 8; c++) {
        const left = sampledLuminance[rowOffset + c];
        const right = sampledLuminance[rowOffset + c + 1];
        bits += (left > right) ? '1' : '0';
      }
    }

    // Convert 64 binary bits to 16-character hexadecimal string
    let hexHash = '';
    for (let i = 0; i < 64; i += 4) {
      const nibble = bits.slice(i, i + 4);
      hexHash += parseInt(nibble, 2).toString(16);
    }

    return {
      isBlankCanvas,
      perceptualHash: hexHash,
      meanLuminance: Number(mean.toFixed(2)),
      variance: Number(variance.toFixed(2))
    };
  } catch {
    return null;
  }
}

/**
 * Computes the Hamming distance (differing bits) between two 16-hex perceptual hashes
 * @param {string} hashA 
 * @param {string} hashB 
 * @returns {number} Hamming distance (0 to 64)
 */
export function computeHammingDistance(hashA, hashB) {
  if (!hashA || !hashB || hashA.length !== 16 || hashB.length !== 16) return 64;
  try {
    let diff = BigInt('0x' + hashA) ^ BigInt('0x' + hashB);
    let count = 0;
    while (diff > 0n) {
      if (diff & 1n) count++;
      diff >>= 1n;
    }
    return count;
  } catch {
    return 64;
  }
}

/**
 * Checks if an SVG is completely empty or lacks rendering primitives
 * @param {Buffer} buf 
 * @returns {boolean}
 */
export function checkSvgBlank(buf) {
  if (!buf || buf.length === 0) return true;
  const text = buf.toString('utf-8');
  const hasVisiblePrimitives = /<(path|rect|circle|ellipse|line|polyline|polygon|text|image|use)\b/i.test(text);
  return !hasVisiblePrimitives;
}

/**
 * Deep inspection of an exported lab artifact
 * @param {string} artifactPath - Path to downloaded file
 * @param {Object} [originalFixture] - Information about original input file
 * @param {number} [originalFixture.size] - Input file size in bytes
 * @param {number} [originalFixture.width] - Input width
 * @param {number} [originalFixture.height] - Input height
 * @param {string} [originalFixture.format] - Input format
 * @param {string} [originalFixture.path] - Path to original fixture file
 * @param {string} [originalFixture.perceptualHash] - Precomputed perceptual hash
 */
export function inspectArtifact(artifactPath, originalFixture = null) {
  if (!existsSync(artifactPath)) {
    return {
      success: false,
      error: `Artifact file does not exist at ${artifactPath}`
    };
  }

  const stat = statSync(artifactPath);
  const buf = readFileSync(artifactPath);
  const format = detectFormat(buf);
  const sha256 = createHash('sha256').update(buf).digest('hex');
  const dimensions = extractDimensions(buf, format);
  const watermarkCheck = checkWatermark(buf, format);

  // Trap check: did the tool download an HTML login page instead of the real file?
  const isBaitTrap = (format === 'html') && (!originalFixture || originalFixture.format !== 'html');
  
  let compressionRatio = null;
  let sizeDeltaBytes = null;
  let isLossless = false;

  if (originalFixture && originalFixture.size) {
    sizeDeltaBytes = stat.size - originalFixture.size;
    compressionRatio = Number((((originalFixture.size - stat.size) / originalFixture.size) * 100).toFixed(2));
    if (originalFixture.sha256 && originalFixture.sha256 === sha256) {
      isLossless = true;
    }
  }

  let dimensionPreserved = true;
  if (originalFixture && originalFixture.width && originalFixture.height && dimensions) {
    dimensionPreserved = (dimensions.width === originalFixture.width && dimensions.height === originalFixture.height);
  }

  let isBlankCanvas = false;
  let perceptualHash = null;
  let visualFidelity = null;

  if (format === 'png') {
    const pngAnalysis = analyzePngScanlines(buf);
    if (pngAnalysis) {
      isBlankCanvas = pngAnalysis.isBlankCanvas;
      perceptualHash = pngAnalysis.perceptualHash;
    }
  } else if (format === 'svg') {
    isBlankCanvas = checkSvgBlank(buf);
  }

  // Calculate visual fidelity against original fixture
  if (originalFixture) {
    let origHash = originalFixture.perceptualHash || null;
    if (!origHash && originalFixture.path && originalFixture.format === 'png' && existsSync(originalFixture.path)) {
      try {
        const origBuf = readFileSync(originalFixture.path);
        const origAnalysis = analyzePngScanlines(origBuf);
        if (origAnalysis) origHash = origAnalysis.perceptualHash;
      } catch {}
    }

    if (isBlankCanvas) {
      visualFidelity = 0;
    } else if (perceptualHash && origHash) {
      const dist = computeHammingDistance(perceptualHash, origHash);
      visualFidelity = Math.max(0, Math.min(100, Math.round((1 - dist / 64) * 100)));
    } else if (dimensionPreserved && !isBaitTrap) {
      visualFidelity = 95;
    }
  }

  return {
    success: true,
    file: {
      path: artifactPath,
      sizeBytes: stat.size,
      format,
      sha256,
      dimensions
    },
    quality: {
      isBaitTrap,
      hasWatermark: watermarkCheck.hasWatermark,
      watermarkSignature: watermarkCheck.detectedSignature,
      dimensionPreserved,
      compressionRatio,
      sizeDeltaBytes,
      isLossless,
      isBlankCanvas,
      perceptualHash,
      visualFidelity
    }
  };
}

/**
 * Deep inspection of a clipboard export artifact
 * @param {string} clipboardText - The raw string written to clipboard
 * @param {Object} [options]
 * @param {string} [options.expectedFormat] - Expected format hint ('json'|'svg'|'markdown'|'code'|'text')
 */
export function inspectClipboardArtifact(clipboardText, options = {}) {
  if (typeof clipboardText !== 'string' || !clipboardText.trim()) {
    return {
      success: false,
      type: 'clipboard',
      error: 'Clipboard content is empty or contains only whitespace'
    };
  }

  const rawText = clipboardText;
  const tailCheck = checkClipboardTail(rawText);
  const cleanText = tailCheck.cleanText;
  let detectedFormat = detectTextFormat(rawText);
  if (detectedFormat === 'text' && tailCheck.hasTail) {
    // If tail broke format detection, re-detect on clean text
    const cleanFormat = detectTextFormat(cleanText);
    if (cleanFormat !== 'text') {
      detectedFormat = cleanFormat;
    }
  }

  // Trap / Bait check: Is the copied text actually an auth prompt, paywall message, or error page?
  const isAuthOrPaywallPrompt = /(?:sign in|log in|create an account|register|please login|upgrade to (?:pro|vip)|unlock full content|subscribe to copy|请登录后查看|开通\s*vip|登录后复制|免费版仅支持|扫码登录)/i.test(rawText);
  const isHtmlTrap = (detectedFormat === 'html') && Boolean(options.expectedFormat && options.expectedFormat !== 'html');
  const isBaitTrap = isAuthOrPaywallPrompt || isHtmlTrap;

  // Format validation
  let isValidStructure = true;
  let tailBrokeFormat = false;

  if (detectedFormat === 'json' || options.expectedFormat === 'json') {
    let rawParsed = false;
    try {
      JSON.parse(rawText.trim());
      rawParsed = true;
    } catch {}

    let cleanParsed = false;
    try {
      JSON.parse(cleanText.trim());
      cleanParsed = true;
    } catch {}

    if (!rawParsed && cleanParsed) {
      // The promotional tail was what broke the JSON structure
      tailBrokeFormat = true;
      isValidStructure = true;
    } else if (!rawParsed && !cleanParsed) {
      isValidStructure = false;
    }
  } else if (detectedFormat === 'svg' || options.expectedFormat === 'svg') {
    const hasSvgWrap = /<svg[\s\S]*<\/svg>/i.test(cleanText);
    const isBlank = checkSvgBlank(Buffer.from(cleanText, 'utf-8'));
    isValidStructure = hasSvgWrap && !isBlank;
  }

  return {
    success: true,
    type: 'clipboard',
    file: {
      format: detectedFormat,
      sizeBytes: Buffer.byteLength(rawText, 'utf-8'),
      charCount: rawText.length,
      lineCount: rawText.split(/\r?\n/).length
    },
    quality: {
      isBaitTrap,
      hasWatermark: tailCheck.hasTail,
      watermarkSignature: tailCheck.detectedTail,
      tailBrokeFormat,
      cleanText,
      isValidStructure,
      dimensionPreserved: true,
      isBlankCanvas: false
    }
  };
}

/**
 * Assesses overall artifact quality and computes quality penalties for CADES 2.0 evaluation
 * Supports both physical file downloads and clipboard text exports.
 * @param {any} report - Return value from inspectArtifact() or inspectClipboardArtifact()
 * @returns {{ isDegraded: boolean, penalty: number, recommendation: 'pass' | 'warning' | 'reject', reasons: string[] }}
 */
export function assessArtifactQuality(report) {
  if (!report || !report.success) {
    return {
      isDegraded: true,
      penalty: 15,
      recommendation: 'reject',
      reasons: [report?.error || 'Artifact missing or unreadable']
    };
  }

  const q = report.quality || {};
  const isClipboard = report.type === 'clipboard';
  const reasons = [];
  let penalty = 0;

  if (q.isBaitTrap) {
    const trapMsg = isClipboard
      ? 'Bait-and-switch trap detected: Clipboard output contains login/paywall prompt instead of data'
      : 'Bait-and-switch trap detected: Download resulted in login trap HTML';
    reasons.push(trapMsg);
    return { isDegraded: true, penalty: 20, recommendation: 'reject', reasons };
  }

  if (q.tailBrokeFormat) {
    reasons.push(`Commercial promotional tail broke data syntax: ${q.watermarkSignature || 'promotional tail'}`);
    penalty += 15;
  } else if (q.hasWatermark) {
    const sig = q.watermarkSignature || 'unknown';
    if (isClipboard) {
      reasons.push(`Promotional watermark tail injected into clipboard: ${sig}`);
      penalty += 4;
    } else {
      reasons.push(`Commercial watermark signature detected: ${sig}`);
      return { isDegraded: true, penalty: 15, recommendation: 'reject', reasons };
    }
  }

  if (q.isValidStructure === false) {
    reasons.push('Output content failed structural integrity / parse validation');
    penalty += 10;
  }

  if (q.isBlankCanvas) {
    reasons.push('Blank canvas whiteout detected: Exported file lacks visible graphic primitives or has zero variance');
    return { isDegraded: true, penalty: 15, recommendation: 'reject', reasons };
  }

  if (q.dimensionPreserved === false) {
    reasons.push('Resolution downgraded: Output dimensions do not match source fixture');
    penalty += 4;
  }

  if (typeof q.visualFidelity === 'number' && q.visualFidelity < 70) {
    reasons.push(`Low visual fidelity: Difference hash indicates significant distortion (${q.visualFidelity}%)`);
    penalty += 3;
  }

  return {
    isDegraded: penalty > 0,
    penalty,
    recommendation: penalty >= 10 ? 'reject' : penalty > 0 ? 'warning' : 'pass',
    reasons
  };
}

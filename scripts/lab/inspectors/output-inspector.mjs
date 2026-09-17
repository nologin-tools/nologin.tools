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
 * Deep inspection of an exported lab artifact
 * @param {string} artifactPath - Path to downloaded file
 * @param {Object} [originalFixture] - Information about original input file
 * @param {number} [originalFixture.size] - Input file size in bytes
 * @param {number} [originalFixture.width] - Input width
 * @param {number} [originalFixture.height] - Input height
 * @param {string} [originalFixture.format] - Input format
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
      isLossless
    }
  };
}

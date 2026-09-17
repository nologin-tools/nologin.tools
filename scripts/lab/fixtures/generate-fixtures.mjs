#!/usr/bin/env node
/**
 * scripts/lab/fixtures/generate-fixtures.mjs
 * 
 * Generates standardized, reproducible test assets for NoLogin Lab benchmark suite.
 * Generates:
 * - sample.png: 800x600 24-bit RGB test image with color gradients and geometric patterns.
 * - sample.svg: Complex vector illustration with nested groups, gradients, and typography.
 * - sample.json: Deeply nested JSON dataset for developer tools.
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = __dirname;

if (!existsSync(FIXTURES_DIR)) {
  mkdirSync(FIXTURES_DIR, { recursive: true });
}

// CRC32 implementation for PNG chunks
function createCrc32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = createCrc32Table();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(typeStr, dataBuf) {
  const length = dataBuf.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(typeStr, 4, 4, 'ascii');
  dataBuf.copy(chunk, 8);
  
  const crcTarget = chunk.subarray(4, 8 + length);
  const crcVal = crc32(crcTarget);
  chunk.writeUInt32BE(crcVal, 8 + length);
  return chunk;
}

export function generateSamplePng(width = 800, height = 600) {
  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR: width, height, 8 bit depth, 2 color type (Truecolor RGB), 0 compression, 0 filter, 0 interlace
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // ColorType = RGB (3 bytes per pixel)
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw Scanlines: each row = 1 filter byte (0x00) + width * 3 bytes (RGB)
  const rowLength = 1 + width * 3;
  const rawData = Buffer.alloc(rowLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0x00; // Filter: None
    
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      
      // Generate rich geometric gradient pattern
      const r = Math.floor((x / width) * 255);
      const g = Math.floor((y / height) * 255);
      const b = Math.floor(((x * y) / (width * height)) * 255);
      
      // Grid lines every 50px
      const isGrid = (x % 50 === 0) || (y % 50 === 0);
      
      if (isGrid) {
        rawData[pxOffset] = 255;
        rawData[pxOffset + 1] = 255;
        rawData[pxOffset + 2] = 255;
      } else {
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
      }
    }
  }

  // Deflate compress raw scanlines
  const compressedData = zlib.deflateSync(rawData, { level: 6 });
  const idatChunk = makeChunk('IDAT', compressedData);

  // IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

export function generateSampleSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1e2e"/>
      <stop offset="100%" stop-color="#11111b"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#89b4fa"/>
      <stop offset="50%" stop-color="#cba6f7"/>
      <stop offset="100%" stop-color="#f38ba8"/>
    </linearGradient>
    <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="800" height="600" fill="url(#bgGrad)"/>

  <!-- Complex Vector Grid -->
  <g stroke="rgba(255,255,255,0.05)" stroke-width="1">
    <line x1="0" y1="100" x2="800" y2="100"/>
    <line x1="0" y1="200" x2="800" y2="200"/>
    <line x1="0" y1="300" x2="800" y2="300"/>
    <line x1="0" y1="400" x2="800" y2="400"/>
    <line x1="0" y1="500" x2="800" y2="500"/>
    <line x1="200" y1="0" x2="200" y2="600"/>
    <line x1="400" y1="0" x2="400" y2="600"/>
    <line x1="600" y1="0" x2="600" y2="600"/>
  </g>

  <!-- Decorative Polygons & Curves -->
  <g filter="url(#dropShadow)">
    <polygon points="400,120 480,240 320,240" fill="url(#accentGrad)" opacity="0.9"/>
    <circle cx="400" cy="300" r="70" fill="none" stroke="#a6e3a1" stroke-width="6" stroke-dasharray="12 6"/>
    <path d="M 250 450 C 320 380, 480 520, 550 450 S 700 380, 750 420" fill="none" stroke="#f9e2af" stroke-width="4"/>
  </g>

  <!-- Benchmark Typography -->
  <text x="400" y="520" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" fill="#cdd6f4">
    NoLogin Lab Benchmark Standard Fixture
  </text>
  <text x="400" y="550" text-anchor="middle" font-family="monospace" font-size="12" fill="#a6adc8">
    Resolution: 800x600 · Vector Integrity: Verified
  </text>
</svg>
`;
}

export function generateSampleJson() {
  const data = {
    benchmarkMeta: {
      suite: "NoLoginLab-Standard-Fixture",
      timestamp: 1773738000000,
      version: "1.0.0"
    },
    performanceMatrix: Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      uuid: `550e8400-e29b-41d4-a716-4466554400${(i + 10).toString(16)}`,
      name: `Benchmark-Entity-${i + 1}`,
      metrics: {
        latencyMs: Math.round(10 + Math.random() * 90),
        throughput: Math.round(500 + Math.random() * 1500),
        active: i % 2 === 0
      },
      tags: ["performance", "benchmark", i % 3 === 0 ? "core" : "edge"],
      nested: {
        tier: i < 10 ? "S" : i < 30 ? "A" : "B",
        attributes: {
          flagA: true,
          flagB: false,
          checksum: `0x${(i * 9999).toString(16).toUpperCase()}`
        }
      }
    }))
  };
  return JSON.stringify(data, null, 2);
}

export function generateSampleMarkdown() {
  return `# NoLogin Lab Benchmark Standard Document: Architectural Principles for Zero-Login Web Applications

> **Abstract**: In an era where online identity fragmentation and compulsory credential gatekeeping degrade user experience and privacy, zero-login architectures demonstrate that full functional fidelity can be achieved entirely in client-side runtime environments.

---

## 1. Introduction and Threat Model

Traditional cloud applications rely heavily on centralized identity providers (IdPs), session tokens, and server-side state persistence. While this model simplifies monetization and user telemetry, it introduces significant systemic risks:

1. **Credential Exhaustion & Leakage**: Centralized databases remain primary targets for credential stuffing and exfiltration attacks.
2. **Artificial Friction**: Obligatory sign-up funnels introduce high bounce rates for ephemeral, task-focused user operations.
3. **Data Sovereignty Violations**: User inputs are frequently ingested into server-side logs and training pipelines without transparent consent.

### 1.1 Comparison Matrix

The following table evaluates security guarantees across architectural paradigms:

| Architecture Paradigm | Client Isolation | Telemetry Risk | Latency Profile | Offline Capability |
| :--- | :---: | :---: | :---: | :---: |
| **Traditional SaaS** | Low | High | Network Bound (>300ms) | None |
| **Federated OAuth** | Medium | Moderate | Token Bound (>500ms) | None |
| **NoLogin Local-First** | **High** | **Zero** | **Memory Bound (<50ms)** | **Full (PWA/Wasm)** |

---

## 2. Core Implementation Strategy

Zero-login tools leverage modern Web APIs including **WebAssembly (Wasm)**, **Web Audio API**, **Web Workers**, and **IndexedDB/OPFS** to achieve high computational throughput directly within the user's browser sandbox.

### 2.1 Cryptographic Entropy Pipeline (TypeScript)

\`\`\`typescript
export interface EntropyAudit {
  readonly timestamp: number;
  readonly byteLength: number;
  readonly digestHex: string;
}

export async function generateSecureToken(byteLength: number = 32): Promise<EntropyAudit> {
  const buffer = new Uint8Array(byteLength);
  crypto.getRandomValues(buffer);
  
  const digestBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(digestBuffer));
  const digestHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return {
    timestamp: Date.now(),
    byteLength,
    digestHex
  };
}
\`\`\`

### 2.2 AST Parsing and Memory Allocation (Python)

\`\`\`python
import json
from dataclasses import dataclass
from typing import List, Dict, Any

@dataclass(frozen=True)
class BenchmarkMetric:
    task_id: str
    tti_ms: float
    memory_peak_mb: float
    egress_bytes: int

def evaluate_telemetry_leak(traffic_log: List[Dict[str, Any]]) -> BenchmarkMetric:
    total_egress = sum(entry.get("payload_bytes", 0) for entry in traffic_log if not entry.get("is_telemetry"))
    return BenchmarkMetric(
        task_id="bench-ast-001",
        tti_ms=142.5,
        memory_peak_mb=18.4,
        egress_bytes=total_egress
    )
\`\`\`

---

## 3. Verification and Empirical Standards

To certify that an application adheres to the **Verified by NoLoginTools.org** standard, the following criteria must be satisfied:

- [x] **Zero Mandatory Registration**: Full core utility accessible without authentication prompts.
- [x] **No Degradation of Output**: Exported assets must not contain forced promotional watermarks.
- [x] **Local Data Custody**: Unencrypted user payload must never be transmitted to remote origins.
- [x] **Export Parity**: Generated artifacts can be retrieved via standard browser download streams or clipboard operations.
- [ ] *Optional Enhancement*: Full PWA service worker caching for complete air-gapped offline resilience.

### 3.1 Mathematical Formulations

The computational complexity of client-side stream processing satisfies:

$$T(n) = \mathcal{O}(n \log n) + \mathcal{O}(k)$$

Where $n$ denotes input buffer length in bytes, and $k$ represents DOM rendering layout thrashing.

---

## 4. Conclusion and Editorial Verdict

Tools that respect user autonomy by decoupling functional utility from account registration represent the gold standard of ethical web software engineering.
`;
}

export function generateSampleWav(durationSec = 1.0, sampleRate = 44100, frequency = 440) {
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * 2; // 16-bit mono = 2 bytes per sample
  const headerSize = 44;
  const totalSize = headerSize + dataSize;
  const buf = Buffer.alloc(totalSize);

  // RIFF header
  buf.write("RIFF", 0, 4, "ascii");
  buf.writeUInt32LE(totalSize - 8, 4);
  buf.write("WAVE", 8, 4, "ascii");

  // fmt subchunk
  buf.write("fmt ", 12, 4, "ascii");
  buf.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buf.writeUInt16LE(1, 20);  // AudioFormat (1 = uncompressed PCM)
  buf.writeUInt16LE(1, 22);  // NumChannels (1 = Mono)
  buf.writeUInt32LE(sampleRate, 24); // SampleRate
  buf.writeUInt32LE(sampleRate * 2, 28); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  buf.writeUInt16LE(2, 32);  // BlockAlign (NumChannels * BitsPerSample/8)
  buf.writeUInt16LE(16, 34); // BitsPerSample (16 bits)

  // data subchunk
  buf.write("data", 36, 4, "ascii");
  buf.writeUInt32LE(dataSize, 40);

  // Synthesize clean 440Hz sine wave tone
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t);
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    buf.writeInt16LE(intSample, 44 + i * 2);
  }

  return buf;
}

export function generateSamplePdf() {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 57 >>
stream
BT
/F1 24 Tf
100 700 Td
(NoLogin Lab Benchmark Standard PDF) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000236 00000 n 
0000000344 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
425
%%EOF
`;
  return Buffer.from(content, 'utf-8');
}

export function generateAllFixtures() {
  const pngPath = resolve(FIXTURES_DIR, 'sample.png');
  const svgPath = resolve(FIXTURES_DIR, 'sample.svg');
  const jsonPath = resolve(FIXTURES_DIR, 'sample.json');
  const mdPath = resolve(FIXTURES_DIR, 'sample.md');
  const wavPath = resolve(FIXTURES_DIR, 'sample.wav');
  const pdfPath = resolve(FIXTURES_DIR, 'sample.pdf');

  const pngBuf = generateSamplePng(800, 600);
  writeFileSync(pngPath, pngBuf);

  const svgStr = generateSampleSvg();
  writeFileSync(svgPath, svgStr, 'utf-8');

  const jsonStr = generateSampleJson();
  writeFileSync(jsonPath, jsonStr, 'utf-8');

  const mdStr = generateSampleMarkdown();
  writeFileSync(mdPath, mdStr, 'utf-8');

  const wavBuf = generateSampleWav(1.0, 44100, 440);
  writeFileSync(wavPath, wavBuf);

  const pdfBuf = generateSamplePdf();
  writeFileSync(pdfPath, pdfBuf);

  return {
    png: { path: pngPath, size: pngBuf.length },
    svg: { path: svgPath, size: Buffer.byteLength(svgStr) },
    json: { path: jsonPath, size: Buffer.byteLength(jsonStr) },
    md: { path: mdPath, size: Buffer.byteLength(mdStr) },
    wav: { path: wavPath, size: wavBuf.length },
    pdf: { path: pdfPath, size: pdfBuf.length }
  };
}

// Auto-run when executed directly via CLI
if (process.argv[1] && process.argv[1].endsWith('generate-fixtures.mjs')) {
  console.log('Generating NoLogin Lab standard test fixtures...');
  const res = generateAllFixtures();
  console.log(`✓ sample.png generated (${(res.png.size / 1024).toFixed(1)} KB) -> ${res.png.path}`);
  console.log(`✓ sample.svg generated (${(res.svg.size / 1024).toFixed(1)} KB) -> ${res.svg.path}`);
  console.log(`✓ sample.json generated (${(res.json.size / 1024).toFixed(1)} KB) -> ${res.json.path}`);
  console.log(`✓ sample.md generated (${(res.md.size / 1024).toFixed(1)} KB) -> ${res.md.path}`);
  console.log(`✓ sample.wav generated (${(res.wav.size / 1024).toFixed(1)} KB) -> ${res.wav.path}`);
  console.log(`✓ sample.pdf generated (${(res.pdf.size / 1024).toFixed(1)} KB) -> ${res.pdf.path}`);
}

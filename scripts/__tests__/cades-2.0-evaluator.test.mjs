import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCognitiveEvaluation,
  calibrate5DScore,
  generateCognitivePacket,
  generateAgentReviewPrompt
} from '../lab/cades-cognitive.mjs';
import { assessArtifactQuality } from '../lab/inspectors/output-inspector.mjs';

describe('CADES 2.0: Cognitive Evaluation Protocol & Anti-Inflation Calibrator', () => {
  it('validates compliant Agent cognitive evaluation payloads', () => {
    const validPayload = {
      productScore: {
        overall: 88,
        frictionless: 19,
        depth: 21,
        exportFreedom: 18,
        privacy: 18,
        polish: 12
      },
      verdictTier: 'highly-recommended',
      bestFor: 'Developers needing instant in-browser SQL query beautification and syntax validation.',
      pros: [
        '100% in-browser parsing using WebAssembly AST with zero network egress',
        'Direct formatted output copy and file download without authentication'
      ],
      cons: [
        'Lacks support for obscure database dialects like CockroachDB'
      ],
      privacyVerdict: 'Observed SQL processing remained in browser memory with no payload-bearing requests during the tested interaction.',
      benchmarkNotes: 'CADES 2.0 Agent verified: injected complex 250-line nested SQL query, completed format in 45ms with flawless syntax tree preservation.'
    };

    const res = validateCognitiveEvaluation(validPayload);
    assert.equal(res.valid, true);
    assert.equal(res.errors.length, 0);
  });

  it('requires complete Chinese fields before synchronized bilingual output', () => {
    const payload = {
      productScore: {
        overall: 88,
        frictionless: 19,
        depth: 21,
        exportFreedom: 18,
        privacy: 18,
        polish: 12
      },
      verdictTier: 'highly-recommended',
      bestFor: 'Developers formatting structured SQL directly in the browser.',
      pros: ['Parses a 250-line SQL fixture', 'Exports clean text without an account'],
      cons: ['Does not support every database dialect'],
      privacyVerdict: 'No payload-bearing request was observed during the tested formatting workflow.',
      benchmarkNotes: 'Formatted a 250-line SQL fixture in 45ms using a textarea and copy button.'
    };

    const incomplete = validateCognitiveEvaluation(payload, { requireBilingual: true });
    assert.equal(incomplete.valid, false);
    assert.ok(incomplete.errors.some(error => error.includes('bestForZh')));

    const complete = validateCognitiveEvaluation({
      ...payload,
      bestForZh: '适合直接在浏览器中格式化结构化 SQL 的开发者。',
      prosZh: ['完成 250 行 SQL 样本解析', '无需账户即可复制干净文本'],
      consZh: ['并非覆盖所有数据库方言'],
      privacyVerdictZh: '测试格式化流程中未观察到携带数据的网络请求。',
      benchmarkNotesZh: '通过文本框和复制按钮在 45ms 内格式化 250 行 SQL 样本。'
    }, { requireBilingual: true });
    assert.equal(complete.valid, true);
  });

  it('rejects invalid or mathematically inconsistent evaluation payloads', () => {
    // Mismatched sum: 20 + 20 + 20 + 20 + 10 = 90, but overall declared 95
    const invalidPayload = {
      productScore: {
        overall: 95,
        frictionless: 20,
        depth: 20,
        exportFreedom: 20,
        privacy: 20,
        polish: 10
      },
      bestFor: 'Short',
      pros: ['Only one pro'],
      cons: [],
      benchmarkNotes: ''
    };

    const res = validateCognitiveEvaluation(invalidPayload);
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('Sum of 5 dimensions')));
    assert.ok(res.errors.some(e => e.includes('bestFor must be')));
    assert.ok(res.errors.some(e => e.includes('pros must contain at least 2')));
    assert.ok(res.errors.some(e => e.includes('cons must contain at least 1')));
    assert.ok(res.errors.some(e => e.includes('benchmarkNotes must contain')));
  });

  it('enforces anti-inflation calibration for simple single-task utilities (prevents false 90+ clustering)', () => {
    const simpleUtilityReport = {
      inspection: {
        targetUrl: 'https://simple-uppercase.example.com',
        initialAuthGate: { blocked: false },
        surface: {
          textareaCount: 1,
          fileInputCount: 0,
          canvasCount: 0,
          buttonLabels: ['Copy Text']
        },
        networkPrivacy: {
          classification: 'Local Only',
          zeroEgressConfirmed: true,
          offlineCapable: true,
          hasWebAssembly: false,
          hasThirdPartyTracking: false
        },
        exportGate: {
          downloadTriggered: false,
          passedNoLoginExport: true,
          hasWatermark: false
        },
        visual: {
          capturedInitial: true,
          capturedOutcome: true
        }
      }
    };

    const calibrated = calibrate5DScore(simpleUtilityReport);
    // Even though it is Local Only and clean, simple utility depth is calibrated to ~15, not 25!
    assert.ok(calibrated.depth <= 16, `Simple utility depth should be calibrated realistically (got ${calibrated.depth})`);
    assert.ok(calibrated.overall >= 70 && calibrated.overall <= 84, `Simple utility should calibrate to Capable Utility or Highly Recommended tier, not inflated Editor's Choice (got ${calibrated.overall})`);
    assert.equal(calibrated.verdictTier, calibrated.overall >= 80 ? 'highly-recommended' : 'capable-utility');
  });

  it('awards Editor Choice (>= 90) only to comprehensive power utilities', () => {
    const powerUtilityReport = {
      inspection: {
        targetUrl: 'https://power-studio.example.com',
        initialAuthGate: { blocked: false },
        surface: {
          textareaCount: 2,
          fileInputCount: 1,
          canvasCount: 1,
          buttonLabels: ['Transform', 'Export PNG', 'Render Vector']
        },
        networkPrivacy: {
          classification: 'Local Only',
          zeroEgressConfirmed: true,
          offlineCapable: true,
          hasWebAssembly: true,
          hasThirdPartyTracking: false
        },
        exportGate: {
          downloadTriggered: true,
          passedNoLoginExport: true,
          hasWatermark: false
        },
        visual: {
          capturedInitial: true,
          capturedOutcome: true
        }
      }
    };

    const calibrated = calibrate5DScore(powerUtilityReport);
    assert.ok(calibrated.depth >= 23, `Power utility should have high depth score (got ${calibrated.depth})`);
    assert.ok(calibrated.overall >= 90, `Power utility with Wasm+Canvas+Export+Local should achieve Editor Choice (got ${calibrated.overall})`);
    assert.equal(calibrated.verdictTier, 'editors-choice');
  });

  it('severely penalizes bait-and-switch auth traps and commercial watermarks', () => {
    const baitTrapReport = {
      inspection: {
        initialAuthGate: { blocked: false },
        exportGate: {
          interceptedByAuth: true,
          authPromptDetails: 'Modal: Please sign up to download your high-res file'
        },
        networkPrivacy: { classification: 'Local Only', zeroEgressConfirmed: true },
        surface: { buttonLabels: ['Download'] },
        visual: { capturedOutcome: true }
      }
    };

    const calibratedBait = calibrate5DScore(baitTrapReport);
    assert.equal(calibratedBait.exportFreedom, 3, 'Bait trap must severely crush export freedom');
    assert.equal(calibratedBait.frictionless, 4, 'Bait trap must penalize frictionless UX');
    assert.equal(calibratedBait.verdictTier, 'emergency-only');

    const watermarkReport = {
      inspection: {
        initialAuthGate: { blocked: false },
        exportGate: {
          passedNoLoginExport: true,
          hasWatermark: true
        },
        networkPrivacy: { classification: 'Local Only', zeroEgressConfirmed: true },
        surface: { buttonLabels: ['Export'] },
        visual: { capturedOutcome: true }
      }
    };

    const calibratedWm = calibrate5DScore(watermarkReport);
    assert.equal(calibratedWm.exportFreedom, 5, 'Commercial watermark must crush export freedom');
    assert.ok(calibratedWm.polish <= 8, 'Watermark must penalize polish');
  });

  it('generates rich CADES 2.0 Cognitive Evidence Packet for Agent review', () => {
    const rawReport = {
      inspection: {
        targetUrl: 'https://excalidraw.com',
        finalUrl: 'https://excalidraw.com/',
        title: 'Excalidraw | Hand-drawn look & feel collaborative whiteboard',
        visual: {
          initialScreenshot: '/tmp/excalidraw-initial.png',
          outcomeScreenshot: '/tmp/excalidraw-outcome.png',
          capturedInitial: true,
          capturedOutcome: true
        },
        surface: {
          textareaCount: 0,
          fileInputCount: 0,
          canvasCount: 1,
          buttonLabels: ['Export Image', 'Live Collaboration']
        },
        networkPrivacy: {
          classification: 'Local Only',
          zeroEgressConfirmed: true,
          offlineCapable: true,
          hasWebAssembly: false,
          outgoingPayloadRequests: []
        },
        exportGate: {
          downloadTriggered: true,
          passedNoLoginExport: true,
          hasWatermark: false
        }
      },
      evaluation: {
        metadata: {
          name: 'Excalidraw',
          category: 'Design',
          core_task: 'Draw hand-crafted diagrams and export locally',
          repo_url: 'https://github.com/excalidraw/excalidraw'
        }
      }
    };

    const packet = generateCognitivePacket(rawReport, 'excalidraw-com');
    assert.equal(packet.version, 'CADES-2.0');
    assert.equal(packet.tool.slug, 'excalidraw-com');
    assert.equal(packet.visualCheckpoints.capturedInitial, true);
    assert.equal(packet.visualCheckpoints.capturedOutcome, true);
    assert.equal(packet.networkTelemetry.payloadEgressObserved, false);
    assert.equal(packet.networkTelemetry.noPayloadEgressObserved, true);
    assert.match(packet.networkTelemetry.observationCaveat, /not proof/i);
    assert.ok(packet.reviewPrompt.includes('CADES 2.0 Agent Multimodal Cognitive Review Task'));
    assert.ok(typeof packet.baselineHeuristicScore.overall === 'number');
  });

  it('assessArtifactQuality detects bait traps, watermarks, and resolution degradation', () => {
    // Clean report
    const cleanReport = {
      success: true,
      quality: {
        isBaitTrap: false,
        hasWatermark: false,
        isBlankCanvas: false,
        dimensionPreserved: true,
        visualFidelity: 96
      }
    };
    const cleanAssessment = assessArtifactQuality(cleanReport);
    assert.equal(cleanAssessment.isDegraded, false);
    assert.equal(cleanAssessment.recommendation, 'pass');
    assert.equal(cleanAssessment.penalty, 0);

    // Degraded report: Resolution downgraded
    const degradedReport = {
      success: true,
      quality: {
        isBaitTrap: false,
        hasWatermark: false,
        isBlankCanvas: false,
        dimensionPreserved: false,
        visualFidelity: 65
      }
    };
    const degradedAssessment = assessArtifactQuality(degradedReport);
    assert.equal(degradedAssessment.isDegraded, true);
    assert.ok(degradedAssessment.penalty >= 7);
    assert.ok(degradedAssessment.reasons.some(r => r.includes('Resolution downgraded')));
    assert.ok(degradedAssessment.reasons.some(r => r.includes('Low visual fidelity')));

    // Rejection report: Watermark
    const wmReport = {
      success: true,
      quality: {
        isBaitTrap: false,
        hasWatermark: true,
        watermarkSignature: 'freepik watermark',
        isBlankCanvas: false,
        dimensionPreserved: true
      }
    };
    const wmAssessment = assessArtifactQuality(wmReport);
    assert.equal(wmAssessment.recommendation, 'reject');
    assert.equal(wmAssessment.penalty, 15);
  });

  it('rejects generic marketing fluff buzzwords in Agent evaluation', () => {
    const fluffPayload = {
      productScore: {
        overall: 85,
        frictionless: 18,
        depth: 20,
        exportFreedom: 18,
        privacy: 17,
        polish: 12
      },
      bestFor: 'This tool is a game-changer for quick design tasks.',
      pros: [
        'Offers a seamless and intuitive interface for all users',
        'Direct in-browser processing with zero account setup'
      ],
      cons: [
        'Lacks dark mode'
      ],
      benchmarkNotes: 'Tested in browser with 200px image and 45ms latency.'
    };

    const res = validateCognitiveEvaluation(fluffPayload);
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('game-changer')));
    assert.ok(res.errors.some(e => e.includes('seamless')));
    assert.ok(res.errors.some(e => e.includes('intuitive interface')));
  });

  it('requires concrete empirical evidence in benchmarkNotes', () => {
    const ungroundedPayload = {
      productScore: {
        overall: 85,
        frictionless: 18,
        depth: 20,
        exportFreedom: 18,
        privacy: 17,
        polish: 12
      },
      bestFor: 'Batch text processing and transformation utilities.',
      pros: [
        'Fast response and clean layout without advertisements',
        'Direct in-browser processing with zero account setup'
      ],
      cons: [
        'Lacks dark mode'
      ],
      // Pure vague ungrounded observation with no metrics, formats, or DOM evidence
      benchmarkNotes: 'I tested this tool on the web and it worked really nicely as expected.'
    };

    const res = validateCognitiveEvaluation(ungroundedPayload);
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('concrete technical evidence')));
  });

  it('calibrates Stability & Polish score based on UX Ergonomics telemetry', () => {
    const baseReport = {
      inspection: {
        targetUrl: 'https://vector.example.com',
        initialAuthGate: { blocked: false },
        surface: { textareaCount: 0, fileInputCount: 1, canvasCount: 1, buttonLabels: ['Export SVG'] },
        networkPrivacy: { classification: 'Local Only', zeroEgressConfirmed: true, offlineCapable: true, hasWebAssembly: true, hasThirdPartyTracking: false },
        exportGate: { downloadTriggered: true, passedNoLoginExport: true, hasWatermark: false },
        visual: { capturedInitial: true, capturedOutcome: true }
      }
    };

    // Case 1: Severe main-thread freezing (>400ms) and high layout shift (>0.1)
    const jankyReport = {
      ...baseReport,
      uxTelemetry: {
        longTasksCount: 5,
        maxLongTaskDuration: 520, // > 400ms freeze
        clsScore: 0.18 // > 0.1 CLS
      }
    };
    const jankyCalibrated = calibrate5DScore(jankyReport);
    assert.ok(jankyCalibrated.polish <= 11, `Janky UI polish score should be penalized (got ${jankyCalibrated.polish})`);
    assert.ok(jankyCalibrated.factors.polish.some(f => f.includes('jank observed')));

    // Case 2: Butter-smooth frame pacing (<50ms, 0 CLS)
    const smoothReport = {
      ...baseReport,
      uxTelemetry: {
        longTasksCount: 0,
        maxLongTaskDuration: 24,
        clsScore: 0
      }
    };
    const smoothCalibrated = calibrate5DScore(smoothReport);
    assert.ok(smoothCalibrated.polish >= 14, `Smooth UI polish score should receive polish bonus (got ${smoothCalibrated.polish})`);
    assert.ok(smoothCalibrated.factors.polish.some(f => f.includes('Smooth responsive interaction')));
  });

  it('enforces High-Score Defense: blocks Editor Choice for tools lacking workstation depth', () => {
    const inflatedPayload = {
      productScore: {
        overall: 94,
        frictionless: 20,
        depth: 18, // Less than 22
        exportFreedom: 20,
        privacy: 20,
        polish: 16
      },
      verdictTier: 'editors-choice',
      bestFor: 'Simple string uppercase conversion without server processing',
      pros: ['Fast response in 10ms', 'Instant clipboard copy of text'],
      cons: ['Only handles basic casing'],
      privacyVerdict: 'No external network traffic observed during test.',
      benchmarkNotes: 'Clicked uppercase button in 15ms and copied text to clipboard.'
    };

    const validation = validateCognitiveEvaluation(inflatedPayload);
    assert.equal(validation.valid, false);
    assert.ok(validation.errors.some(e => e.includes('Functional Depth >= 22')));
    assert.ok(validation.errors.some(e => e.includes('High-Score Defense')));
  });
});

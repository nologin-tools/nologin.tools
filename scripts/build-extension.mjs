import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { ALTERNATIVE_TARGETS } from '../src/lib/alternatives-data.mjs';
import { COMPARISON_PAIRS } from '../src/lib/comparisons-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const buildDataPath = resolve(ROOT, 'src/data/build-data.json');
const editorialPath = resolve(ROOT, 'src/data/tool-editorial.json');
const zhTranslationsPath = resolve(ROOT, 'src/data/translations/zh.json');
const extDir = resolve(ROOT, 'packages/extension');
const srcDir = resolve(extDir, 'src');

const buildData = JSON.parse(readFileSync(buildDataPath, 'utf8'));
const editorialData = JSON.parse(readFileSync(editorialPath, 'utf8'));
const zhTranslations = existsSync(zhTranslationsPath)
  ? JSON.parse(readFileSync(zhTranslationsPath, 'utf8'))
  : {};

const CATEGORY_ZH = {
  AI: 'AI 工具',
  Design: '图像与设计',
  Writing: '写作与编辑',
  Development: '开发者工具',
  Productivity: 'PDF 与办公效率',
  Media: '音视频处理',
  Privacy: '隐私与安全',
  Data: '数据与表格',
  Communication: '加密通信与传输',
  Education: '教育与科学',
  Finance: '金融与计算',
  Other: '其他工具',
};

const TIER_LABELS = {
  en: {
    'editors-choice': "Editor's Choice",
    'highly-recommended': 'Highly Recommended',
    'capable-utility': 'Capable Utility',
    'emergency-only': 'Basic Utility',
  },
  zh: {
    'editors-choice': '编辑精选',
    'highly-recommended': '强烈推荐',
    'capable-utility': '实力工具',
    'emergency-only': '基础可用',
  },
};

const TARGET_HEADLINES_ZH = {
  photoshop: '无需订阅 Adobe Creative Cloud 或登录账号，直接在浏览器内进行专业 PSD 图层编辑与抠图',
  canva: '告别强制注册与导出付费墙，即开即用的免登录图形设计、抠图与排版工具',
  figma: '无需团队账号壁垒，在浏览器内快速绘制矢量线框图、架构白板与 UI 草图',
  miro: '零账号注册的无限协作白板，支持端到端加密头脑风暴与架构图绘制',
  lucidchart: '纯前端隐私保护的架构图、流程图、UML 与网络拓扑绘制工具，无需登录',
  notion: '无账号绑定的沉浸式 Markdown 写作与本地文档编辑，数据完全自主可控',
  grammarly: '零云端键盘记录与遥测，在浏览器内安全进行拼写、语法与文风润色',
  zoom: '无需下载客户端或注册账号，一键创建端到端加密的视频会议与屏幕共享房间',
  smallpdf: '在浏览器本地内存中完成 PDF 合并、拆分、压缩与转换，无每日次数限制',
  postman: '零遥测的 API 调试、JSON 可视化解析与 JWT 令牌检查工具，免账号直用',
  audacity: '基于 WebAudio API 的浏览器端音频波形裁剪、混音与降噪处理，文件零上传',
  tinypng: '基于 WebAssembly 的本地无损/有损图片压缩，支持 WebP/AVIF，图片绝不上传服务器',
  cloudconvert: '无需排队或注册账号的多格式文档、音视频与图片转换工具',
  illustrator: '无需昂贵 Creative Cloud 订阅，在浏览器内进行 SVG 矢量编辑与代码压缩优化',
  visio: '零登录即可绘制专业系统流程图、云架构图与网络拓扑图',
  ilovepdf: '全功能免费 PDF 工具箱，无需上传敏感合同文件即可在浏览器内完成处理',
  wetransfer: '无需邮箱验证或订阅，使用端到端加密与 P2P 局域网/直连技术即时传输大文件',
  excel: '无需登录 Office 365，在浏览器本地完成 CSV/JSON/Excel 清洗、转换与可视化图表',
  chatgpt: '无需手机号或邮箱注册，即开即用的 AI 问答、代码解释与智能检索工具',
  bitly: '无需注册账号，快速生成短链接、自定义跳转与高颜值二维码',
  kapwing: '无需注册账号或忍受强制导出水印，在浏览器内直接裁剪视频、转换 GIF 与录制屏幕',
  doodle: '无需强制参与者注册账号，打开链接即可完成群组排期协调与即时匿名投票',
  toggl: '在浏览器本地记录番茄钟、专注时长与项目工时，无需注册云端监控账号',
  iloveimg: '纯前端批量压缩、缩放图片、智能抠图与 WebP/AVIF 转换，告别上传排队限制',
  pastebin: '免注册在线剪贴板、阅后即焚加密便签与跨设备点对点文本传输工具',
  devtoys: '打开浏览器即用的开发者瑞士军刀，本地完成编码解码、哈希生成、JSON 格式化与 JWT 调试',
};

const DOMAIN_MAP = {
  photoshop: ['photoshop.adobe.com', 'adobe.com', 'express.adobe.com', 'pixlr.com'],
  canva: ['canva.com'],
  figma: ['figma.com'],
  miro: ['miro.com'],
  lucidchart: ['lucidchart.com', 'lucid.app'],
  notion: ['notion.so', 'notion.site'],
  grammarly: ['grammarly.com', 'quillbot.com', 'prowritingaid.com'],
  zoom: ['zoom.us', 'meet.google.com', 'teams.microsoft.com'],
  smallpdf: ['smallpdf.com', 'acrobat.adobe.com'],
  ilovepdf: ['ilovepdf.com'],
  postman: ['postman.com', 'insomnia.rest'],
  audacity: ['audacityteam.org', 'soundtrap.com'],
  tinypng: ['tinypng.com', 'kraken.io', 'compressor.io'],
  cloudconvert: ['cloudconvert.com', 'zamzar.com'],
  illustrator: ['illustrator.adobe.com', 'vectormagic.com'],
  visio: ['visio.office.com'],
  wetransfer: ['wetransfer.com', 'sendgb.com', 'filemail.com'],
  excel: ['sheets.google.com', 'airtable.com'],
  chatgpt: ['chatgpt.com', 'chat.openai.com', 'openai.com'],
  bitly: ['bitly.com', 'tinyurl.com', 'dub.co', 'short.io'],
  kapwing: ['kapwing.com', 'veed.io', 'clipchamp.com'],
  doodle: ['doodle.com', 'calendly.com', 'strawpoll.com'],
  toggl: ['toggl.com', 'clockify.me'],
  iloveimg: ['iloveimg.com', 'remove.bg', 'photoroom.com', 'clippingmagic.com'],
  pastebin: ['pastebin.com', 'gist.github.com'],
  devtoys: ['devtoys.app', 'devutils.com', 'jsonlint.com'],
};

const TARGET_FALLBACK_SLUGS = {
  kapwing: ['ezgif-com', 'recordrtc-org', 'audiomass-co', 'audiotrimmer-com'],
  doodle: ['when2meet-com', 'syncwhen-com', 'askmeanythi-ng', 'worldtimebuddy-com'],
  toggl: ['pomofocus-io', 'til-re'],
  iloveimg: ['squoosh-app', 'image-conversion-com', 'photopea-com', 'ezgif-com'],
  pastebin: ['pairdrop-net', 'sharedrop-io', 'cryptgeon-org'],
  devtoys: ['it-tools-tech', 'gchq-github-io-cyberchef', 'transform-tools'],
};

const EXTRA_PAYWALL_TARGETS = [
  {
    domains: ['loom.com', 'descript.com'],
    targetName: 'Loom / Descript',
    targetSlug: 'loom',
    category: 'Media',
    headlineEn: 'Record screen, trim audio/video, and edit media in-browser without account signup or watermark gates',
    headlineZh: '无需注册账号或忍受导出水印，在浏览器内直接录制屏幕与剪辑音视频',
    aliases: ['Loom', 'Descript', 'Audacity'],
    fallbackSlugs: ['recordrtc-org', 'audiomass-co', 'ezgif-com', 'audiotrimmer-com'],
  },
  {
    domains: ['typeform.com'],
    targetName: 'Typeform',
    targetSlug: 'typeform',
    category: 'Productivity',
    headlineEn: 'Run instant polls and lightweight Q&A sessions without forcing participants to create accounts',
    headlineZh: '无需强制参与者注册账号，一键发起即时匿名投票与问答收集',
    aliases: ['Typeform', 'StrawPoll', 'Slido'],
    fallbackSlugs: ['askmeanythi-ng', 'when2meet-com'],
  },
];

const approvedTools = (buildData.tools || []).filter((t) => t.status === 'approved');
const toolNameBySlug = new Map(approvedTools.map((t) => [t.slug, t.name]));

const ALTERNATIVE_PAGE_SLUGS = new Set(ALTERNATIVE_TARGETS.map((t) => t.slug));

function buildExtensionIndex(lang = 'en') {
  const isZh = lang === 'zh';
  const prefix = isZh ? '/zh' : '';

  const tools = approvedTools
    .map((t) => {
      const getTagValue = (key) =>
        t.tags?.find((item) => item.tagKey === key || item.key === key)?.tagValue ||
        t.tags?.find((item) => item.tagKey === key || item.key === key)?.value;

      const category = getTagValue('category') || 'Other';
      const categoryLabel = isZh ? CATEGORY_ZH[category] || category : category;

      const isClientSideOnly = Boolean(
        t.tags?.some(
          (item) =>
            (item.tagKey === 'data' || item.key === 'data') &&
            (item.tagValue === 'Client-Side Only' || item.value === 'Client-Side Only')
        )
      );
      const worksOffline = Boolean(
        t.tags?.some(
          (item) =>
            (item.tagKey === 'offline' || item.key === 'offline') &&
            (item.tagValue === 'Works Offline' || item.value === 'Works Offline')
        )
      );
      const isOpenSource = Boolean(
        t.repoUrl ||
          t.tags?.some(
            (item) =>
              (item.tagKey === 'source' || item.key === 'source') &&
              (item.tagValue === 'Open Source' || item.value === 'Open Source')
          )
      );
      const isFree = Boolean(
        t.tags?.some(
          (item) =>
            (item.tagKey === 'pricing' || item.key === 'pricing') &&
            (item.tagValue === 'Free' || item.value === 'Free')
        )
      );

      let hostname = '';
      try {
        hostname = new URL(t.url).hostname.replace(/^www\./, '').toLowerCase();
      } catch {}

      const editEntry = editorialData[t.slug];
      const editLocale = (isZh ? editEntry?.zh : editEntry?.en) || editEntry?.en || null;
      const zhTrans = isZh ? zhTranslations[t.slug] : null;

      const description = (zhTrans?.description || t.description || '').trim();
      const coreTask = (zhTrans?.coreTask || t.coreTask || '').trim();

      const scoreObj = editLocale?.productScore || null;
      const overallScore = typeof scoreObj?.overall === 'number' ? scoreObj.overall : null;
      const tier =
        editLocale?.verdictTier ||
        (overallScore >= 90
          ? 'editors-choice'
          : overallScore >= 80
            ? 'highly-recommended'
            : 'capable-utility');
      const tierLabel = TIER_LABELS[lang]?.[tier] || TIER_LABELS.en[tier] || null;

      const toolComparisons = COMPARISON_PAIRS.filter(
        (p) => p.toolASlug === t.slug || p.toolBSlug === t.slug
      ).map((p) => {
        const vsSlug = p.toolASlug === t.slug ? p.toolBSlug : p.toolASlug;
        return {
          slug: p.slug,
          vsSlug,
          vsName: toolNameBySlug.get(vsSlug) || vsSlug,
          url: `https://nologin.tools${prefix}/compare/${p.slug}`,
        };
      });

      return {
        slug: t.slug,
        name: t.name,
        url: t.url,
        hostname,
        category,
        categoryLabel,
        description,
        coreTask,
        isFeatured: Boolean(t.isFeatured),
        detailUrl: `https://nologin.tools${prefix}/tool/${t.slug}`,
        badgeUrl: `https://nologin.tools${prefix}/badge/${t.slug}`,
        capabilities: {
          clientSideOnly: isClientSideOnly,
          worksOffline,
          openSource: isOpenSource,
          free: isFree,
        },
        cades: overallScore
          ? {
              score: overallScore,
              tier,
              tierLabel,
              dimensions: {
                frictionless: scoreObj.frictionless ?? 0,
                depth: scoreObj.depth ?? 0,
                exportFreedom: scoreObj.exportFreedom ?? 0,
                privacy: scoreObj.privacy ?? 0,
                polish: scoreObj.polish ?? 0,
              },
              bestFor: editLocale?.bestFor || coreTask || description,
              privacyVerdict: editLocale?.privacyVerdict || '',
              benchmarkNotes: editLocale?.benchmarkNotes || '',
              alternativeTo: Array.isArray(editLocale?.alternativeTo)
                ? editLocale.alternativeTo
                : [],
              testedAt: editLocale?.testedAt || '2026-10',
            }
          : null,
        comparisons: toolComparisons,
      };
    })
    .sort((a, b) => {
      const scoreA = (a.cades?.score || 0) + (a.isFeatured ? 3 : 0) + (a.capabilities.clientSideOnly ? 1 : 0);
      const scoreB = (b.cades?.score || 0) + (b.isFeatured ? 3 : 0) + (b.capabilities.clientSideOnly ? 1 : 0);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return a.name.localeCompare(b.name);
    });

  // Build paywallTargets map
  const paywallTargets = {};

  for (const target of ALTERNATIVE_TARGETS) {
    const domains = DOMAIN_MAP[target.slug] || [`${target.slug}.com`];
    const matchingSlugs = new Set(TARGET_FALLBACK_SLUGS[target.slug] || []);

    for (const [toolSlug, entry] of Object.entries(editorialData)) {
      const alts = entry.en?.alternativeTo || [];
      if (
        alts.some((a) =>
          target.aliases.some((alias) => alias.toLowerCase() === a.toLowerCase())
        )
      ) {
        matchingSlugs.add(toolSlug);
      }
    }

    const matchingTools = tools
      .filter((t) => matchingSlugs.has(t.slug))
      .sort((a, b) => {
        const aCat = a.category === target.category ? 1 : 0;
        const bCat = b.category === target.category ? 1 : 0;
        if (aCat !== bCat) return bCat - aCat;
        const aScore = a.cades?.score || 0;
        const bScore = b.cades?.score || 0;
        if (bScore !== aScore) return bScore - aScore;
        if (a.capabilities.clientSideOnly !== b.capabilities.clientSideOnly) {
          return b.capabilities.clientSideOnly ? 1 : -1;
        }
        return 0;
      })
      .slice(0, 4);

    if (matchingTools.length === 0) continue;

    const hasAltPage = ALTERNATIVE_PAGE_SLUGS.has(target.slug);
    const alternativePageUrl = hasAltPage
      ? `https://nologin.tools${prefix}/alternative/${target.slug}`
      : null;
    const headline = isZh
      ? TARGET_HEADLINES_ZH[target.slug] || target.headline
      : target.headline;

    for (const domain of domains) {
      paywallTargets[domain] = {
        targetName: target.name,
        targetSlug: target.slug,
        category: target.category,
        headline,
        alternativePageUrl,
        tools: matchingTools,
      };
    }
  }

  for (const extra of EXTRA_PAYWALL_TARGETS) {
    const matchingSlugs = new Set(extra.fallbackSlugs.map((s) => s.trim()));
    for (const [toolSlug, entry] of Object.entries(editorialData)) {
      const alts = entry.en?.alternativeTo || [];
      if (
        alts.some((a) =>
          extra.aliases.some((alias) => alias.toLowerCase() === a.toLowerCase())
        )
      ) {
        matchingSlugs.add(toolSlug);
      }
    }
    const matchingTools = tools
      .filter((t) => matchingSlugs.has(t.slug))
      .sort((a, b) => (b.cades?.score || 0) - (a.cades?.score || 0))
      .slice(0, 4);

    if (matchingTools.length === 0) continue;
    for (const domain of extra.domains) {
      paywallTargets[domain] = {
        targetName: extra.targetName,
        targetSlug: extra.targetSlug,
        category: extra.category,
        headline: isZh ? extra.headlineZh : extra.headlineEn,
        alternativePageUrl: null,
        tools: matchingTools,
      };
    }
  }

  const comparisons = COMPARISON_PAIRS.map((p) => ({
    slug: p.slug,
    toolASlug: p.toolASlug,
    toolAName: toolNameBySlug.get(p.toolASlug) || p.toolASlug,
    toolBSlug: p.toolBSlug,
    toolBName: toolNameBySlug.get(p.toolBSlug) || p.toolBSlug,
    category: p.category,
    url: `https://nologin.tools${prefix}/compare/${p.slug}`,
  }));

  return {
    schema_version: '2.0',
    extension_version: '2.0.0',
    generated_at: new Date().toISOString().split('T')[0],
    lang,
    total_tools: tools.length,
    total_paywall_targets: Object.keys(paywallTargets).length,
    total_comparisons: comparisons.length,
    tools,
    paywallTargets,
    comparisons,
  };
}

const indexEn = buildExtensionIndex('en');
const indexZh = buildExtensionIndex('zh');

mkdirSync(srcDir, { recursive: true });
writeFileSync(resolve(srcDir, 'extension-index.en.json'), JSON.stringify(indexEn), 'utf8');
writeFileSync(resolve(srcDir, 'extension-index.zh.json'), JSON.stringify(indexZh), 'utf8');

// Legacy backward-compatible files used by existing tests
writeFileSync(resolve(srcDir, 'tools-data.json'), JSON.stringify(indexEn.tools), 'utf8');
writeFileSync(resolve(srcDir, 'alternatives-data.json'), JSON.stringify(indexEn.paywallTargets, null, 2), 'utf8');

// Publish static remote sync endpoints (/api/extension-index.json and /zh/api/extension-index.json)
const publicApiDir = resolve(ROOT, 'public/api');
const publicZhApiDir = resolve(ROOT, 'public/zh/api');
mkdirSync(publicApiDir, { recursive: true });
mkdirSync(publicZhApiDir, { recursive: true });
writeFileSync(resolve(publicApiDir, 'extension-index.json'), JSON.stringify(indexEn), 'utf8');
writeFileSync(resolve(publicZhApiDir, 'extension-index.json'), JSON.stringify(indexZh), 'utf8');

console.log(
  `Generated extension v2.0 index (EN & ZH): ${indexEn.total_tools} verified tools, ${indexEn.total_paywall_targets} paywall target domains, ${indexEn.total_comparisons} head-to-head comparisons.`
);

// Trigger store promotional artwork generation
try {
  const assetGenScript = resolve(ROOT, 'scripts/generate-extension-store-assets.mjs');
  if (existsSync(assetGenScript)) {
    execSync(`node "${assetGenScript}"`, { stdio: 'inherit' });
  }
} catch (e) {
  console.warn('Store asset generation skipped:', e.message);
}

// Package dual zip distribution (Chrome MV3 + Firefox MV3)
const distExtDir = resolve(ROOT, 'dist-extension');
const downloadsDir = resolve(ROOT, 'public/downloads');
mkdirSync(distExtDir, { recursive: true });
mkdirSync(downloadsDir, { recursive: true });

const BUNDLE_FILES = 'manifest.json background.js content.js content.css icons popup src';

try {
  // 1. Chrome Web Store Packaging
  const chromeZip = resolve(distExtDir, 'nologin-quick-switcher-chrome.zip');
  execSync(
    `cd "${extDir}" && rm -f "${chromeZip}" && zip -r "${chromeZip}" ${BUNDLE_FILES} -x "*.DS_Store"`,
    { stdio: 'inherit' }
  );
  console.log(`Packaged Chrome extension: ${chromeZip}`);
  copyFileSync(chromeZip, resolve(downloadsDir, 'nologin-quick-switcher-chrome.zip'));

  // 2. Firefox AMO Packaging (with gecko ID)
  const chromeManifestPath = resolve(extDir, 'manifest.json');
  const baseManifest = JSON.parse(readFileSync(chromeManifestPath, 'utf8'));
  const firefoxManifest = {
    ...baseManifest,
    browser_specific_settings: {
      gecko: {
        id: 'extension@nologin.tools',
        strict_min_version: '109.0',
      },
    },
  };

  const firefoxManifestPath = resolve(extDir, 'manifest.firefox.json');
  writeFileSync(firefoxManifestPath, JSON.stringify(firefoxManifest, null, 2), 'utf8');

  const firefoxZip = resolve(distExtDir, 'nologin-quick-switcher-firefox.zip');
  execSync(
    `cd "${extDir}" && rm -f "${firefoxZip}" && cp manifest.json manifest.chrome.bak && cp manifest.firefox.json manifest.json && zip -r "${firefoxZip}" ${BUNDLE_FILES} -x "*.DS_Store" && mv manifest.chrome.bak manifest.json && rm manifest.firefox.json`,
    { stdio: 'inherit' }
  );
  console.log(`Packaged Firefox extension: ${firefoxZip}`);
  copyFileSync(firefoxZip, resolve(downloadsDir, 'nologin-quick-switcher-firefox.zip'));

  // 3. Default bundle copy for backwards compatibility
  copyFileSync(chromeZip, resolve(downloadsDir, 'nologin-extension.zip'));
  console.log(`Published downloads to ${downloadsDir}:`);
  console.log(' - nologin-quick-switcher-chrome.zip');
  console.log(' - nologin-quick-switcher-firefox.zip');
  console.log(' - nologin-extension.zip');
} catch (e) {
  console.log('Zip packaging skipped or failed:', e.message);
}

// @ts-check
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');

const isExecute = process.argv.includes('--execute');

const approvedTools = [
  {
    id: 843,
    slug: 'www-wheyindex-com',
    name: 'WheyIndex',
    description: 'An interactive protein powder index and price comparison calculator that normalizes cost per 25g of protein and scores ingredient formulation purity across 480+ products.',
    coreTask: 'Search, filter by dietary requirements, and compare normalized protein cost and formulation scores across powders without an account.',
    repoUrl: null,
    tags: [
      { key: 'category', value: 'Data' },
      { key: 'data', value: 'Server-Side' },
      { key: 'privacy', value: 'Privacy Focused' },
      { key: 'type', value: 'Web App' },
      { key: 'hosting', value: 'Cloud Only' },
      { key: 'offline', value: 'Online Only' },
      { key: 'pricing', value: 'Free' }
    ]
  },
  {
    id: 846,
    slug: 'claude-resets-com',
    name: 'Claude-resets',
    description: 'A real-time tracking dashboard for Anthropic Claude Code rate limit reset intervals, historical cooldown periods, and usage reset announcements.',
    coreTask: 'Check current time elapsed since the last Claude Code rate limit reset and review historical interval statistics without logging in.',
    repoUrl: null,
    tags: [
      { key: 'category', value: 'Development' },
      { key: 'data', value: 'Client-Side Only' },
      { key: 'privacy', value: 'Privacy Focused' },
      { key: 'type', value: 'Web App' },
      { key: 'hosting', value: 'Cloud Only' },
      { key: 'offline', value: 'Online Only' },
      { key: 'pricing', value: 'Free' }
    ]
  },
  {
    id: 862,
    slug: 'discrete-logarithm-tomasz-slapinski-pl',
    name: 'DLOG Visualizer',
    description: "An educational BigInt mathematical solver that visualizes Shanks's baby-step giant-step algorithm for the discrete logarithm problem step-by-step in the browser.",
    coreTask: 'Compute discrete logarithms and review the modular arithmetic baby-step/giant-step table without registration.',
    repoUrl: null,
    tags: [
      { key: 'category', value: 'Education' },
      { key: 'data', value: 'Client-Side Only' },
      { key: 'privacy', value: 'Privacy Focused' },
      { key: 'type', value: 'Web App' },
      { key: 'hosting', value: 'Cloud Only' },
      { key: 'offline', value: 'Works Offline' },
      { key: 'pricing', value: 'Free' }
    ]
  },
  {
    id: 886,
    slug: 'currawongweb-com-verify-china-usci-checker',
    name: 'China USCI Checker',
    description: 'A client-side verification tool that validates Chinese 18-character Unified Social Credit Identifiers (GB 32100-2015) and parses authority codes, entity types, and regional division.',
    coreTask: 'Enter an 18-character Chinese unified social credit code to verify checksum validity and inspect its structural breakdown without login.',
    repoUrl: null,
    tags: [
      { key: 'category', value: 'Data' },
      { key: 'data', value: 'Client-Side Only' },
      { key: 'privacy', value: 'Privacy Focused' },
      { key: 'type', value: 'Web App' },
      { key: 'hosting', value: 'Cloud Only' },
      { key: 'offline', value: 'Works Offline' },
      { key: 'pricing', value: 'Free' }
    ]
  },
  {
    id: 887,
    slug: 'leettranslator-com',
    name: 'Leet Speak Translator',
    description: 'A client-side text converter that transforms plain English into 1337 leet speak and decodes leet representations back into standard text with customizable mapping modes.',
    coreTask: 'Convert English text to leet speak or decode 1337 back to plain English in real time without creating an account.',
    repoUrl: null,
    tags: [
      { key: 'category', value: 'Writing' },
      { key: 'data', value: 'Client-Side Only' },
      { key: 'privacy', value: 'Privacy Focused' },
      { key: 'type', value: 'Web App' },
      { key: 'hosting', value: 'Cloud Only' },
      { key: 'offline', value: 'Works Offline' },
      { key: 'pricing', value: 'Free' }
    ]
  },
  {
    id: 905,
    slug: 'sellwhere-app',
    name: 'SellWhere',
    description: 'A real-time resale fee calculator that compares seller fees, shipping attribution, and estimated net payouts across eBay, Poshmark, Mercari, Depop, Etsy, and Vinted.',
    coreTask: 'Enter an item price and shipping terms to compare net payouts across six resale platforms without an account.',
    repoUrl: null,
    tags: [
      { key: 'category', value: 'Finance' },
      { key: 'data', value: 'Client-Side Only' },
      { key: 'privacy', value: 'Privacy Focused' },
      { key: 'type', value: 'Web App' },
      { key: 'hosting', value: 'Cloud Only' },
      { key: 'offline', value: 'Works Offline' },
      { key: 'pricing', value: 'Free' }
    ]
  }
];

const rejectionMap = {
  842: '核心图像编辑功能存在登录拦截弹窗及订阅购买门槛',
  844: '数字商品销售页/付费软件下载商店 (Gumroad)',
  845: '八字排盘/推命算卦 (不符合生产力/隐私免登录工具定位)',
  847: '房贷比价意向留资表单/强制收集用户隐私联系方式',
  848: '星盘排盘/占星娱乐内容 (不符合生产力工具定位)',
  849: 'PDF合并等文档处理重定向至商业SaaS注册购买页面',
  850: 'AI智能体导航站/目录聚合页 (非免登录交互工具)',
  851: '站点响应 HTTP 403 阻断/无法正常公开访问',
  852: '自动化批量矩阵刷量提交 (codaaiteam@gmail.com)',
  853: '自动化批量矩阵刷量提交 (codaaiteam@gmail.com)',
  854: '自动化批量矩阵刷量提交 (codaaiteam@gmail.com)',
  855: '同一主域名重复提交 (reficompass.com 已存在条目 ID 847)',
  856: 'Vercel 临时预览分支部署，非正式独立服务域名',
  857: '批量多站点矩阵提交 (seaman.lee.100@gmail.com)',
  858: '批量多站点矩阵提交 (seaman.lee.100@gmail.com)',
  859: '批量多站点矩阵提交 (seaman.lee.100@gmail.com)',
  860: 'rehost.page 临时匿名网页托管，缺乏长期可用性保障',
  861: '商业 API 服务商/仅提供接口文档浏览 (非免登录计算工具)',
  863: '批量 SEO 外链矩阵提交 (promo.desk@riahstudio.com)',
  864: '批量 SEO 外链矩阵提交 (promo.desk@riahstudio.com)',
  865: '批量 SEO 外链矩阵提交 (promo.desk@riahstudio.com)',
  866: 'rehost.page 临时匿名网页托管，缺乏长期可用性保障',
  867: '基础静态占位页，无实际可用的免登录独立计算功能',
  868: '同一主域名重复切片/重复提交 (cv.cm 已存在条目 ID 867)',
  869: 'rehost.page 临时匿名网页托管，缺乏长期可用性保障',
  870: '银行账单转换涉及敏感金融文档上传，核心转换引导付费注册',
  871: '静态图标展示预览，缺乏独立免登录实用处理能力',
  872: 'AI视频生成功能要求登录账户授权与积分购买',
  873: '第三方社交媒体下载抓取脚本，服务稳定性不足且受反爬限制',
  874: 'rehost.page 临时匿名网页托管，缺乏长期可用性保障',
  875: '静态壁纸图片展示与下载，非在线交互计算工具',
  876: '界面语言单一且功能与已有成熟 PDF 本地工具高度重复',
  877: 'AI图像生成需消耗点数且要求登录个人账户',
  878: 'AI图片编辑核心生成环节弹出强制登录注册弹窗',
  879: '自动化批量矩阵刷量提交 (codaaiteam@gmail.com)',
  880: '紫微斗数算命排盘 (不符合生产力工具定位)',
  881: '诱导性视频格式转换包装页，实际处理需排队或登录验证',
  882: '纯静态字体映射展示，与已有成熟工具高度重复且体验粗糙',
  883: 'Sitemap 提取器交互脆弱且依赖特定服务端反代',
  884: '商业 API 接口网关与营销推广页面 (非免登录工具)',
  885: 'AI设计套件核心画板需要登录个人账户方可操作',
  888: '自动化批量矩阵刷量提交 (codaaiteam@gmail.com)',
  889: '自动化批量矩阵刷量提交 (codaaiteam@gmail.com)',
  890: 'Seedream 图像生成需登录账户与扣除云端点数',
  891: '虚假 AI 规划诱导表单，实际核心功能不可用',
  892: '插件注册表/导航汇总页面 (非独立免登录计算工具)',
  893: '胡须造型试戴需上传人脸并要求登录注册',
  894: 'AI去模糊核心处理需要注册账户与购买套餐',
  895: '图片文字编辑需登录个人账户方可下载结果',
  896: '临时穿透隧道/chatgpt.site 临时子域',
  897: 'AI工具导航站/目录聚合页 (非免登录交互工具)',
  898: '游戏 Wiki / 宠物图鉴指南，非在线实用计算工具',
  899: '站点无法访问/已失效 (HTTP 404)',
  900: '视频压缩处理排队时间过长且需绑定电子邮箱接收',
  901: 'AI视频生成与多模型API，需注册账户与付费充值',
  902: '未经正式部署的 Storybook 内部组件测试页面',
  903: '自动化 AI Agent 脚本批量提交 (@agentmail.to)',
  904: '电商优惠券与折扣码导流站',
  906: '自动化批量矩阵刷量提交 (codaaiteam@gmail.com)',
  907: '自动化批量矩阵刷量提交 (codaaiteam@gmail.com)',
  908: '自动化批量矩阵刷量提交 (codaaiteam@gmail.com)',
  909: 'AI图像生成与提示词库，要求登录账户',
  910: '极限竞速游戏车辆维基百科指南',
  911: '临时穿透隧道 (trycloudflare.com)',
  912: 'Unicode 艺术字体简易映射，与现有工具重复',
  913: '纯空白记事页，无实质性独立免登录工具特性',
  914: '简单切图页面，带有大量侵入性广告弹窗且功能受限',
  915: 'AI模型试用页，要求登录并排队等待',
  916: 'AI图生视频工具，实际使用强制要求 Google 登录',
  917: 'AI智能体导航站/目录聚合站 (非免登录交互工具)'
};

async function main() {
  console.log(`[patrol-ingestion] Mode: ${isExecute ? 'EXECUTE' : 'DRY-RUN'}`);

  const sql = [];

  // 1. Edit suggestions
  console.log('[patrol-ingestion] Adding edit suggestions mutations...');
  // Suggestion 6: Approve GizmoBench description
  sql.push(`UPDATE tools SET description = 'GizmoBench is a collection of free browser tools for everyday tasks, including calculators, converters, JSON and Markdown utilities, image and audio tools, 3D viewers, and hardware checks. Every core tool works without an account. File tools process documents and images on your device without uploading them, and each tool explains its processing limits. IP address lookup uses the GizmoBench server.' WHERE id = 723;`);
  sql.push(`UPDATE edit_suggestions SET status = 'approved' WHERE id = 6;`);
  // Suggestion 7: Reject Formweft description
  sql.push(`UPDATE edit_suggestions SET status = 'rejected' WHERE id = 7;`);

  // 2. Approved tools
  console.log(`[patrol-ingestion] Adding ${approvedTools.length} approved tools...`);
  for (const tool of approvedTools) {
    const nameEscaped = tool.name.replace(/'/g, "''");
    const descEscaped = tool.description.replace(/'/g, "''");
    const taskEscaped = tool.coreTask.replace(/'/g, "''");
    const repoEscaped = tool.repoUrl ? `'${tool.repoUrl.replace(/'/g, "''")}'` : 'NULL';

    sql.push(`UPDATE tools SET name = '${nameEscaped}', description = '${descEscaped}', core_task = '${taskEscaped}', repo_url = ${repoEscaped}, rejection_reason = NULL WHERE id = ${tool.id} AND status = 'pending';`);
    sql.push(`DELETE FROM tags WHERE tool_id = ${tool.id};`);
    for (const tag of tool.tags) {
      sql.push(`INSERT INTO tags (tool_id, tag_key, tag_value) VALUES (${tool.id}, '${tag.key}', '${tag.value}');`);
    }
    sql.push(`UPDATE tools SET status = 'approved', approved_at = unixepoch(), rejection_reason = NULL WHERE id = ${tool.id} AND status = 'pending';`);
  }

  // 3. Rejected tools
  console.log(`[patrol-ingestion] Adding ${Object.keys(rejectionMap).length} rejections...`);
  for (const [id, reason] of Object.entries(rejectionMap)) {
    const reasonEscaped = reason.replace(/'/g, "''");
    sql.push(`UPDATE tools SET status = 'rejected', rejection_reason = '${reasonEscaped}', is_featured = 0, featured_at = NULL WHERE id = ${id} AND status = 'pending';`);
  }

  const sqlFile = resolve(ROOT_DIR, 'scripts/.patrol-ingestion.sql');
  writeFileSync(sqlFile, sql.join('\n'), 'utf-8');
  console.log(`[patrol-ingestion] Generated ${sql.length} SQL statements in ${sqlFile}`);

  if (!isExecute) {
    console.log('[patrol-ingestion] Dry run complete. Use --execute to commit to D1.');
    return;
  }

  console.log('[patrol-ingestion] Executing on remote Cloudflare D1...');
  execSync(`npx wrangler d1 execute nologin-tools-db --remote --file=${sqlFile} --yes`, {
    cwd: ROOT_DIR,
    stdio: 'inherit'
  });
  console.log('✅ [patrol-ingestion] Successfully executed all mutations on D1!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

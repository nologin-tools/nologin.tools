---
name: submission-review
description: >-
  Vetting and review runbook for new tool submissions and edit suggestions in nologin.tools.
  Use this skill to query pending submissions from Cloudflare D1, enforce domain quality gates and anti-spam filters,
  invoke tool-evaluation for ungated candidates, synthesize taxonomy tags and metadata,
  generate multi-language translations for 7 locales, and update the remote database.
---

# Submission Review & Ingestion Runbook (`submission-review`)

This skill defines the autonomous vetting and ingestion workflow for incoming tool submissions and community edit suggestions in `nologin.tools`.

The Agent is fully authorized to inspect submissions and update the remote Cloudflare D1 database (`nologin-tools-db`) using `npx wrangler d1 execute nologin-tools-db --remote`.

---

## 1. Operating Principles & Safety Guardrails

1. **Zero Destructive Deletes**: Never execute `DELETE FROM tools`. Non-compliant, dead, or spam submissions must be marked `status = 'rejected'` with an explicit `rejection_reason`.
2. **Simplified Submission Flow**: Tools are submitted with only `url` (and optional `submitter_email`). The Agent handles URL validation, dogfooding, metadata extraction, categorization, tagging, and multi-language translation autonomously.
3. **Execution Environment & Concurrency**:
   - Remote D1 CLI: `npx wrangler d1 execute nologin-tools-db --remote --json --command "<SQL>"`
   - Browser Dogfooding: All browser operations must run sequentially (`concurrency = 1`). Never run parallel browser sessions.
   - Sweep dangling browser spaces before and after review runs: `node scripts/clean-browser-spaces.mjs`.

---

## 2. Part A: Review Pending Tool Submissions (`status = 'pending'`)

### Step 1: Query Pending Queue
```bash
npx wrangler d1 execute nologin-tools-db --remote --json --command "SELECT id, name, url, description, core_task, submitter_email, repo_url FROM tools WHERE status = 'pending' ORDER BY id ASC;"
```

---

### Step 2: Quality Gate 1 — Immediate Hard Rejection Filters (Pre-Browser)
Before launching browser sessions, immediately reject non-compliant submissions matching any of the following patterns:

- **Ephemeral Tunnels & Temporary Hosts**: Host contains `trycloudflare.com`, `ngrok`, `localtunnel`, `catbox.moe`, `drive.google.com`, `dropbox.com`, or `*.chatgpt.site`.
  - `rejection_reason = '临时穿透隧道/临时网盘直链/chatgpt.site临时子域'`
- **Preview & Branch Deployments**: Host matches `*-git-*.vercel.app`, `*-preview-*.pages.dev`, `*-preview.netlify.app`, or contains preview/PR commit hashes.
  - `rejection_reason = '临时构建预览/非生产环境部署分支链接'`
- **Direct Repositories & Non-Web Apps**: URL starts with `https://github.com/` (un-deployed code repo), Chrome Web Store, or desktop-only installers.
  - `rejection_reason = '直接提交 GitHub 仓库链接 (未部署为在线 Web 工具)'` or `'本地客户端软件下载/Chrome扩展插件 (非免登录网页工具)'`
- **Commercial Stores & Paid Downloads**: Host contains `gumroad.com`, `lemonsqueezy.com`, `/shop/`, or task indicates paid digital downloads / Stripe checkout.
  - `rejection_reason = '数字商品销售页/付费软件下载/Shopify商店'`
- **SEO Campaign & Tracking Pollution**: URL contains bulk marketing tracking (`utm_campaign=`, `utm_source=nologin`, `utm_medium=directory`).
  - `rejection_reason = '携带批量外链推广跟踪参数'`
- **Low-Quota Paywall Bait**: Description or task indicates 1 free query, 3 free tasks/day before a hard paywall.
  - `rejection_reason = '极低单日免费额度诱饵/本质为付费漏斗'`
- **Entertainment & Divination**: Horoscope, tarot, astrology, casual mini-games, or quizzes outside productivity/privacy/utility scope.
  - `rejection_reason = '游戏试玩/星座占卜/心理测试/娱乐休闲内容 (不符合生产力/隐私免登录工具定位)'`
- **Spam Bots & Dummy Submissions**: Submitter email from automated agent pools (`@agent.qq.com`, `foundagent.net`), or core_task is placeholder/trivial (length < 10, "use tool", "check", "所有事情").
  - `rejection_reason = '自动化脚本提交/无意义核心任务描述'`

**Execute Rejection in D1**:
```sql
UPDATE tools SET status = 'rejected', rejection_reason = ? WHERE id = ?;
```

---

### Step 3: Quality Gate 2 — Platform Subdomain Anti-Slicing Policy
For domains hosted on shared subdomains (`vercel.app`, `pages.dev`, `netlify.app`, `hf.space`, `streamlit.app`):
1. Check if the database already contains an approved or pending tool with the same hostname.
2. If the submitter submitted multiple URL slices (e.g. `domain.pages.dev/tool-1`, `domain.pages.dev/tool-2`):
   - Keep only the primary/most comprehensive root tool.
   - Reject all redundant slices: `rejection_reason = '同一主域名重复切片/重复提交 (已存在首选条目)'`.

---

### Step 4: Quality Gate 3 — Open-Source Green Channel (`*.github.io`)
If URL is on `*.github.io` and has an associated GitHub repository:
- Verify the repo is active, legitimate, and not impersonated.
- Fast-track approval for client-side privacy-first web apps (e.g., CyberChef, SVGOMG).
- Automatically populate `repo_url` and assign `source:Open Source`.

---

### Step 5: Quality Gate 4 — Empirical Evaluation Gatekeeper (`tool-evaluation`)
For every ungated candidate tool, invoke the evaluation harness defined in `tool-evaluation`:

```bash
node scripts/inspect-tool-dogfood.mjs "<URL>" --slug "<slug>" --packet-file "/tmp/packet-<slug>.json"
```

1. **Verify No-Login Usability & Anti-Bait Gatekeeper**:
   - Did the tool load cleanly without mandatory registration or login walls?
   - Did the export/download gatekeeper succeed without triggering login modals or paywalls?
   - Is the rendered output free of forced commercial watermarks?
2. **Review Product Score**:
   - Tool must score **Product Score $\ge 70$** to be approved.
   - Tools scoring **$\ge 90$ (Editor's Choice)** should be flagged for `is_featured` consideration.
3. **If Failed**:
   - Initial Auth Wall: `rejection_reason = '首屏强制要求注册/登录 (' || reason || ')'`
   - Bait-and-Switch on Export: `rejection_reason = '诱导拦截 (Bait-and-Switch): 核心操作/导出时弹出强制登录'`
   - Watermark / Low Score: `rejection_reason = 'NoLogin Lab 实测未达标 (< 70分) 或存在导出限制/强制商业水印'`
   - Dead Link: `rejection_reason = '站点无法访问/已失效 (HTTP 404/DNS错误/超时)'`
   - Mark rejected:
     ```sql
     UPDATE tools SET status = 'rejected', rejection_reason = ? WHERE id = ?;
     ```

---

### Step 6: Metadata Synthesis, 7-Locale Translation & D1 Update

For approved tools:
1. **Synthesize Metadata** (objective, factual, stripping marketing buzzwords):
   - `name`: Clean brand name.
   - `description`: 1–2 objective English sentences explaining exact capabilities and processing mode.
   - `core_task`: Action phrase summarizing the verified utility (e.g. `Compress SVG files client-side`).
   - `repo_url`: GitHub repo URL if available.
   - `category`: Exactly one of the 11 valid categories: `AI`, `Design`, `Writing`, `Development`, `Productivity`, `Utilities`, `Media`, `Security`, `Math`, `Finance`, `Privacy`.
   - `tags`:
     - `category:<Cat>`
     - `data:Local Only` or `data:Cloud Processed`
     - `privacy:No Tracking` or `privacy:Minimal`
     - `type:Web App` (or API/CLI)
     - `hosting:Cloud Only` or `hosting:Self-Hostable`
     - `offline:Offline Capable` or `offline:Online Only`
     - `pricing:Free` or `pricing:Freemium`
     - `source:Open Source` (if `repo_url` is present)

2. **Update Remote D1**:
   ```sql
   UPDATE tools SET
     name = ?,
     description = ?,
     core_task = ?,
     repo_url = ?,
     status = 'approved',
     approved_at = unixepoch()
   WHERE id = ?;
   ```
   Insert tags into `tags` table (`tool_id`, `tag_key`, `tag_value`).

3. **Synchronize Multi-Language Translations (Mandatory)**:
   Generate natural translations for `description` and `coreTask` across all 7 non-English locales (`zh`, `ja`, `ko`, `es`, `fr`, `de`, `pt`).
   Write the payload to `/tmp/translations-<slug>.json`:
   ```json
   {
     "<slug>": {
       "zh": { "description": "...", "coreTask": "..." },
       "ja": { "description": "...", "coreTask": "..." },
       "ko": { "description": "...", "coreTask": "..." },
       "es": { "description": "...", "coreTask": "..." },
       "fr": { "description": "...", "coreTask": "..." },
       "de": { "description": "...", "coreTask": "..." },
       "pt": { "description": "...", "coreTask": "..." }
     }
   }
   ```
   Apply and verify:
   ```bash
   node scripts/sync-tool-translations.mjs --apply /tmp/translations-<slug>.json
   node scripts/sync-tool-translations.mjs --status
   ```

4. **Sync Editorial Review to `src/data/tool-editorial.json`**:
   Ensure qualitative findings from `tool-evaluation` are synchronized via:
   ```bash
   node scripts/inspect-tool-dogfood.mjs "<URL>" --slug "<slug>" --eval-file "/tmp/eval-<slug>.json" --sync
   ```

---

## 3. Part B: Review Edit Suggestions (`edit_suggestions`)

1. **Query Suggestions**:
   ```bash
   npx wrangler d1 execute nologin-tools-db --remote --json --command "SELECT * FROM edit_suggestions WHERE status = 'pending';"
   ```
2. **Verify Proposed Changes**:
   - New `url`: Ensure domain adheres to quality gates, is alive, and resolves to the same service. If valid, update `tools.url` and `tools.slug`.
   - New `repo_url`: Verify repo exists and corresponds to the tool.
   - Text/Tag updates: Ensure objectivity and compliance with standard tags.
3. **Apply**:
   - Approved: Update `tools` table, then `UPDATE edit_suggestions SET status = 'approved' WHERE id = ?;`.
   - If `description` or `core_task` changed: Re-sync translations for all 7 locales via `scripts/sync-tool-translations.mjs --apply`.
   - Rejected: `UPDATE edit_suggestions SET status = 'rejected' WHERE id = ?;`.

---

## 4. Review Summary Output

Format and report review results clearly:
```markdown
### 📋 Submission Review Summary
- **Total Processed**: N
- **Approved**: X (list tools with category and product score)
- **Rejected**: Y (breakdown by reason)
- **Edit Suggestions Handled**: A approved, B rejected
- **Translations Synced**: All 7 locales verified
```

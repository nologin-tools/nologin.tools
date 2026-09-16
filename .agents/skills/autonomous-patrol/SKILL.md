---
name: autonomous-patrol
description: >-
  Autonomous daily operations, vetting, and maintenance runbook for nologin.tools.
  Use this skill to review pending tool submissions, audit edit suggestions, perform
  daily rolling health & dead-link patrols (100 tools), verify NoLogin Verified badges
  across homepage DOM and GitHub README, refresh open-source repository metadata, and
  update remote Cloudflare D1 database autonomously.
---

# Autonomous Daily Patrol & Review (`autonomous-patrol`)

This skill defines the autonomous operations runbook for `nologin.tools`. The Agent is fully authorized to query and update the remote Cloudflare D1 database (`nologin-tools-db`) using `npx wrangler d1 execute nologin-tools-db --remote`. No manual user confirmation is required for high-confidence decisions.

---

## 1. Operating Principles & Safety Guardrails

1. **Zero Destructive Deletes**: Never execute `DELETE FROM tools`. Inactive, dead, or non-compliant tools are marked `status = 'unstable'` or `'rejected'`. All operations must remain reversible.
2. **High-Confidence Autonomous Action**:
   - Approve when no-login capability is verified on the live site.
   - Reject when mandatory login, dead-links (404/DNS failure), domain parking, or scam/spam is confirmed. Always record a clear `rejection_reason`.
   - Ambiguous/edge cases: Keep `status = 'pending'` and highlight in the daily summary.
3. **Execution Environment**:
   - Remote D1 CLI: `npx wrangler d1 execute nologin-tools-db --remote --json --command "<SQL>"`
   - Browser: Always use `ego-browser` with `{ waitUntil: "domcontentloaded", timeout: 20000 }` to avoid hanging on streaming connections.

---

## 2. Execution Workflow

### Phase 1: Clear Pending Queue (Submissions & Edit Suggestions)

#### A. Pending Tools (`status = 'pending'`)
1. Query pending tools:
   ```bash
   npx wrangler d1 execute nologin-tools-db --remote --json --command "SELECT id, name, url, description, core_task, repo_url FROM tools WHERE status = 'pending';"
   ```
2. For each pending tool, open with `ego-browser`:
   ```bash
   ego-browser nodejs <<'INNER'
   const task = await taskSpace("inspect pending tool");
   const page = task.page("p1");
   await page.goto("<URL>", { waitUntil: "domcontentloaded", timeout: 20000 });
   const info = await page.evaluate(() => {
     const text = document.body.innerText;
     const hasLogin = /sign in|log in|create account|register/i.test(text);
     const fileInputs = document.querySelectorAll('input[type="file"]').length;
     return { title: document.title, fileInputs, textSnippet: text.slice(0, 500) };
   });
   console.log(JSON.stringify(info));
   await task.finish({ keep: [] });
INNER
   ```
3. Evaluate criteria:
   - **Approve**: Tool functions in the browser without mandatory login. Visitor usage or free quotas available.
     - Set status: `UPDATE tools SET status = 'approved', approved_at = unixepoch() WHERE id = ?;`
     - Ensure required tags exist in `tags` table (`category`, `pricing`, `type`, `data`, `hosting`, `offline`).
     - If `repo_url` is provided and valid, ensure `source:Open Source` tag exists.
   - **Reject**:
     - Hard login wall (cannot use core task without account).
     - Dead link (404, 500, DNS failure, timeout).
     - Domain parking ("domain for sale", registrar landing page).
     - Download-only desktop/mobile app or browser extension without online web interface.
     - Set status: `UPDATE tools SET status = 'rejected', rejection_reason = ? WHERE id = ?;`

#### B. Pending Edit Suggestions (`status = 'pending'`)
1. Query suggestions:
   ```bash
   npx wrangler d1 execute nologin-tools-db --remote --json --command "SELECT * FROM edit_suggestions WHERE status = 'pending';"
   ```
2. Verify proposed changes:
   - New `url`: Verify it is accessible and resolves to the same legitimate service. If valid, update `tools.url` and `tools.slug`.
   - New `repo_url`: Verify GitHub repo exists and matches the tool.
   - Tag/Description updates: Ensure objective language and accuracy.
3. Apply:
   - Approved: Update `tools` table, then `UPDATE edit_suggestions SET status = 'approved' WHERE id = ?;`
   - Rejected: `UPDATE edit_suggestions SET status = 'rejected' WHERE id = ?;`

---

### Phase 2: Rolling Health & Dead-Link Patrol (100 Tools)

1. Select 100 approved tools using dynamic priority:
   - Priority 1: Tools currently marked `status = 'unstable'` (recheck for recovery).
   - Priority 2: Tools with oldest or missing `last_checked_at` in `health_checks`.
   ```sql
   SELECT t.id, t.name, t.url, t.status, t.repo_url,
          (SELECT MAX(checked_at) FROM health_checks WHERE tool_id = t.id) as last_checked
   FROM tools t
   WHERE t.status IN ('approved', 'unstable')
   ORDER BY (CASE WHEN t.status = 'unstable' THEN 0 ELSE 1 END), last_checked ASC NULLS FIRST
   LIMIT 100;
   ```
2. For each tool:
   - Check connectivity and latency.
   - If redirects occur: detect if domain permanently migrated (301) and update `url` and `slug`.
   - If site is dead (404, DNS error, expired parking page) or stealth login wall was added:
     - Mark as `unstable`: `UPDATE tools SET status = 'unstable' WHERE id = ?;`
   - Record check in `health_checks`:
     ```sql
     INSERT INTO health_checks (tool_id, checked_at, is_online, http_status, response_time_ms)
     VALUES (?, unixepoch(), ?, ?, ?);
     ```

---

### Phase 3: Dual-Surface Badge Verification

Inspect both the **Tool Primary Website** and **GitHub README** for official badges:

1. **Homepage DOM Check (`ego-browser`)**:
   - Inspect rendered DOM for badge indicators:
     - Explicit: `nologin.tools/badge`, `nologintools.org/badge` in `<img>` or `<a>` href/src.
     - Implicit: mentions of `nologin.tools`, `nologintools.org`, or `Verified by NoLoginTools`.
2. **GitHub README Check** (if `repo_url` is present):
   - Fast fetch: `https://raw.githubusercontent.com/<owner>/<repo>/HEAD/README.md`
   - Check for badge markdown/html.
3. Update `badge_displays` table:
   ```sql
   INSERT INTO badge_displays (tool_id, display_type, last_checked_at)
   VALUES (?, ?, unixepoch())
   ON CONFLICT(tool_id) DO UPDATE SET
     display_type = excluded.display_type,
     last_checked_at = excluded.last_checked_at;
   ```
   *(Note: `explicit` awards +10 recommendation points on homepage; `implicit` awards +5 points)*

---

### Phase 4: Open-Source Metadata Refresh

For tools with `repo_url`:
1. Parse repo owner and name.
2. Query GitHub API: `https://api.github.com/repos/<owner>/<repo>`.
3. Update `tools` table:
   ```sql
   UPDATE tools SET
     github_stars = ?,
     github_forks = ?,
     github_license = ?,
     github_language = ?,
     github_updated_at = ?,
     github_fetched_at = unixepoch()
   WHERE id = ?;
   ```

---

### Phase 5: Generate Daily Briefing

At the conclusion of the run, format and output a concise report:

```markdown
### 🤖 Daily Operations Briefing (<YYYY-MM-DD>)

- **Pending Submissions**:
  - Approved: X (list names & categories)
  - Rejected: Y (list names & reasons)
  - Pending Review: Z (ambiguous items)
- **Edit Suggestions**:
  - Approved: X | Rejected: Y
- **Rolling Patrol (100 Tools)**:
  - Healthy (Online): A
  - Abnormal / Unstable: B (list names & detected issues)
  - Redirects Self-Healed: C (list old -> new URLs)
- **Badge Detections**:
  - Newly detected explicit badges: D (list tools)
- **GitHub Sync**:
  - Repositories refreshed: E
```

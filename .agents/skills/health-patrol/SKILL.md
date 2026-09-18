---
name: health-patrol
description: >-
  High-throughput rolling health patrol, dead-link remediation, badge verification,
  and repository metadata synchronization for nologin.tools. Use this skill to check
  connectivity across 1000 approved tools, auto-heal 301 redirects, escalate anomalies
  and run rolling CADES dogfooding via tool-evaluation, verify NoLogin badges on websites
  and GitHub READMEs, and refresh GitHub stats.
---

# Health Patrol & Ecosystem Maintenance (`health-patrol`)

This skill defines the routine infrastructure health patrol, dead-link self-healing, badge audit, and open-source metadata synchronization for `nologin.tools`.

---

## 1. Operating Principles & Safety Guardrails

1. **Reversible Remediation**: Never execute `DELETE FROM tools`. Inactive, dead, or failing tools are marked `status = 'unstable'`. If a dead tool comes back online, it recovers to `status = 'approved'`.
2. **Health Check Intelligence**:
   - Always send `User-Agent: NoLoginTools-HealthChecker/1.0`.
   - Consider a site "reachable" (server is up) if it returns any HTTP status except `404`, `410`, DNS failure, or connection timeout. WAF blocks (403), rate limits (429), or 5xx server errors indicate the server exists and should not immediately trigger a dead-link flag on a single check.
3. **Strict Concurrency Guardrail for Browser Operations**:
   - HTTP liveness probes can run with modest concurrency (batch size 3–5).
   - Any browser-driven inspection (`ego-browser`, CADES rolling dogfooding, DOM badge checks) **MUST run sequentially (`concurrency = 1`)**.
   - Sweep dangling browser spaces before and after patrol runs: `node scripts/clean-browser-spaces.mjs`.

---

## 2. Track A: High-Frequency Liveness & Dead-Link Patrol (1000 Tools)

### Step 1: Select 1000 Tools with Dynamic Risk Priority
Query tools prioritizing unstable items, high-churn platform subdomains (`vercel.app`, `pages.dev`, `netlify.app`, `hf.space`), and oldest checked tools:

```sql
SELECT t.id, t.name, t.url, t.status, t.repo_url,
       (SELECT MAX(checked_at) FROM health_checks WHERE tool_id = t.id) as last_checked
FROM tools t
WHERE t.status IN ('approved', 'unstable')
ORDER BY
  (CASE WHEN t.status = 'unstable' THEN 0
        WHEN t.url LIKE '%.vercel.app%' OR t.url LIKE '%.pages.dev%' OR t.url LIKE '%.netlify.app%' THEN 1
        ELSE 2 END) ASC,
  last_checked ASC NULLS FIRST
LIMIT 1000;
```

---

### Step 2: Probe Connectivity & Self-Heal Redirects
For each tool:
1. **Probe HTTP Connectivity**:
   - Send GET/HEAD request with a 10-second timeout.
   - Record response in `health_checks`:
     ```sql
     INSERT INTO health_checks (tool_id, checked_at, is_online, http_status, response_time_ms)
     VALUES (?, unixepoch(), ?, ?, ?);
     ```
2. **Detect 301 Permanent Migration (Self-Healing)**:
   - If response is a permanent redirect (301) to a new canonical URL on the same legitimate domain or official new home:
     - Verify the destination is accessible.
     - Auto-heal in D1:
       ```sql
       UPDATE tools SET url = ?, slug = ? WHERE id = ?;
       ```
3. **Dead Link Remediation**:
   - If site returns 404, DNS NXDOMAIN, domain parking page, or repeatedly times out:
     - Mark as `unstable`:
       ```sql
       UPDATE tools SET status = 'unstable' WHERE id = ?;
       ```
4. **Recovery**:
   - If a previously `unstable` tool is confirmed online and reachable:
     - Restore status: `UPDATE tools SET status = 'approved', rejection_reason = NULL WHERE id = ?;`

---

## 3. Track B: Rolling CADES Dogfooding Batch (15–25 Tools/Day)

Normal homepages can disguise post-action paywalls, silent commercial watermarks, or degraded features. All approved tools must cycle through rolling CADES dogfooding on a 12–15 day cadence via `tool-evaluation`:

```bash
# Execute rolling dogfooding for the 20 oldest-tested approved tools
node scripts/inspect-tool-dogfood.mjs --rolling 20 --sync
```

The `--rolling` engine automatically selects tools with the oldest `testedAt` in `src/data/tool-editorial.json`:
- Verifies export buttons remain un-gated.
- Inspects outcome screenshots for injected watermarks.
- Refreshes empirical product scores and updates `testedAt`.

---

## 4. Track C: Immediate Anomaly Escalation Protocol

If Track A flags unexpected 302 redirects to auth portals, brand changes, or intermittent network drops:
1. Escalate immediately into a single-tool CADES inspection:
   ```bash
   node scripts/inspect-tool-dogfood.mjs "<URL>" --slug "<slug>" --existing-task "<core_task>"
   ```
2. If degradation, bait-trap, or watermark is confirmed:
   - Mark as `unstable`:
     ```sql
     UPDATE tools SET status = 'unstable', rejection_reason = '日常复测异常: 发现后置诱导登录、强制商业水印或导出中断' WHERE slug = ?;
     ```
   - Clear `is_featured` if previously featured:
     ```sql
     UPDATE tools SET is_featured = 0, featured_at = NULL WHERE slug = ?;
     ```

---

## 5. Track D: Dual-Surface Badge Verification

Inspect both the **Tool Primary Website** and **GitHub README** for official NoLogin Verified badges:

1. **Homepage DOM Check (`ego-browser`)**:
   - Search rendered DOM for badge indicators:
     - Explicit: `nologin.tools/badge` or `nologintools.org/badge` in `<img>` src or `<a>` href (`display_type = 'explicit'`).
     - Implicit: Text mentions of `nologin.tools`, `nologintools.org`, or `Verified by NoLoginTools` (`display_type = 'implicit'`).
2. **GitHub README Check** (if `repo_url` is present):
   - Fast fetch: `https://raw.githubusercontent.com/<owner>/<repo>/HEAD/README.md`.
   - Scan for badge SVG or markdown links.
3. **Update `badge_displays` Table**:
   ```sql
   INSERT INTO badge_displays (tool_id, display_type, last_checked_at)
   VALUES (?, ?, unixepoch())
   ON CONFLICT(tool_id) DO UPDATE SET
     display_type = excluded.display_type,
     last_checked_at = excluded.last_checked_at;
   ```
   *(Explicit badges award +10 recommendation points; implicit awards +5 points)*

---

## 6. Track E: Open-Source Metadata Synchronization

For tools with `repo_url`:
1. Extract repository `<owner>/<repo>`.
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

## 7. Health Patrol Summary Output

Format and report results upon completion:
```markdown
### 🛡️ Health Patrol Summary
- **1000-Tool Rolling Check**:
  - Healthy (Online): X
  - Newly Unstable / Dead: Y (list tools with HTTP status / error)
  - Recovered to Approved: Z
  - 301 Redirects Auto-Healed: W (list old -> new URLs)
- **Rolling CADES Dogfooding**:
  - Tools Audited: 20
  - Regressions / Watermark Traps Found: N
- **Badge Detections**:
  - Explicit: A | Implicit: B
- **GitHub Sync**:
  - Repositories refreshed: C
```

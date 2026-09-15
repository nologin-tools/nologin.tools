# @nologin-tools/mcp (nologin-tools-mcp)

> Official Model Context Protocol (MCP) server for discovering verified zero-login, privacy-first web tools.

Integrates the curated database of 180+ verified no-login web tools directly into your AI coding assistant or desktop agent.

## Tools Provided

- `search_nologin_tools`: Find tools by keyword, task, category, client-side only, offline PWA, or open-source status.
- `get_tool_details`: Get full technical specs, client-side cryptographic guarantees, GitHub stars/license, health uptime, and editorial reviews.
- `list_workflows`: Get curated multi-tool recipes chaining 2 to 4 no-login tools for complete tasks (e.g. podcast production, secure PDF redaction).
- `find_alternatives`: Instantly find no-login, private alternatives to closed SaaS (Canva, Photoshop, Figma, WeTransfer, Smallpdf, Miro, Lucidchart, Notion, Loom, Zoom).

## Quickstart

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nologin-tools": {
      "command": "npx",
      "args": ["-y", "nologin-tools-mcp"]
    }
  }
}
```

Config file locations:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### Cursor

Add to your project `.cursor/mcp.json` or Global Cursor Settings:

```json
{
  "mcpServers": {
    "nologin-tools": {
      "command": "npx",
      "args": ["-y", "nologin-tools-mcp"]
    }
  }
}
```

### Windsurf / Antigravity / Custom Agents

Execute via standard I/O (stdio):

```bash
npx -y nologin-tools-mcp
```

Or test locally:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"find_alternatives","arguments":{"software":"canva"}}}' | npx -y nologin-tools-mcp
```

## Resilience & Privacy

- **Zero-Dependency**: Starts in <200ms using native Node.js streams.
- **Offline Capable**: Queries `https://nologin.tools/api/v1` for real-time health data, with automatic fallback to bundled static snapshots if offline.
- **Privacy-First**: No telemetry, no tokens, no tracking.

## License

CC0-1.0 Universal (Public Domain)

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { handleMcpMessage, MCP_TOOLS } from '../src/server.mjs';

describe('Official MCP Server (nologin-tools-mcp)', () => {
  describe('Protocol Handshake & Discovery', () => {
    it('handles initialize handshake adhering to MCP 2024-11-05', async () => {
      const response = await handleMcpMessage({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          clientInfo: { name: 'claude-desktop', version: '0.1.0' },
        },
      });

      assert.equal(response.jsonrpc, '2.0');
      assert.equal(response.id, 1);
      assert.equal(response.result.protocolVersion, '2024-11-05');
      assert.equal(response.result.serverInfo.name, 'nologin-tools-mcp');
      assert.ok(response.result.capabilities.tools);
    });

    it('ignores notifications/initialized silently', async () => {
      const response = await handleMcpMessage({
        jsonrpc: '2.0',
        method: 'notifications/initialized',
      });
      assert.equal(response, null);
    });

    it('answers ping requests', async () => {
      const response = await handleMcpMessage({
        jsonrpc: '2.0',
        id: 42,
        method: 'ping',
      });
      assert.equal(response.id, 42);
      assert.deepEqual(response.result, {});
    });

    it('lists all 4 registered MCP tools with JSON schemas', async () => {
      const response = await handleMcpMessage({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
      });

      assert.equal(response.id, 2);
      assert.ok(Array.isArray(response.result.tools));
      assert.equal(response.result.tools.length, 4);

      const toolNames = response.result.tools.map((t) => t.name);
      assert.ok(toolNames.includes('search_nologin_tools'));
      assert.ok(toolNames.includes('get_tool_details'));
      assert.ok(toolNames.includes('list_workflows'));
      assert.ok(toolNames.includes('find_alternatives'));

      for (const tool of response.result.tools) {
        assert.ok(tool.description);
        assert.equal(tool.inputSchema.type, 'object');
      }
    });
  });

  describe('Tool Execution (tools/call)', () => {
    it('executes search_nologin_tools with keyword query', async () => {
      const response = await handleMcpMessage({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'search_nologin_tools',
          arguments: { q: 'excalidraw' },
        },
      });

      assert.equal(response.id, 3);
      assert.ok(response.result.content);
      const text = response.result.content[0].text;
      assert.ok(text.includes('Excalidraw'));
      assert.ok(text.includes('https://excalidraw.com'));
      assert.ok(text.includes('Design'));
    });

    it('executes search_nologin_tools with boolean filters', async () => {
      const response = await handleMcpMessage({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'search_nologin_tools',
          arguments: { category: 'Design', clientSide: true, limit: 3 },
        },
      });

      assert.equal(response.id, 4);
      const text = response.result.content[0].text;
      assert.ok(text.includes('Found'));
      assert.ok(text.includes('Client-Side Only'));
    });

    it('executes get_tool_details for a known slug', async () => {
      const response = await handleMcpMessage({
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'get_tool_details',
          arguments: { slug: 'excalidraw-com' },
        },
      });

      assert.equal(response.id, 5);
      const text = response.result.content[0].text;
      assert.ok(text.includes('Excalidraw (Verified Zero-Login Tool)'));
      assert.ok(text.includes('https://excalidraw.com'));
      assert.ok(text.includes('Privacy & Capability Specifications'));
      assert.ok(text.includes('Client-Side Only'));
      assert.ok(text.includes('Yes (Runs 100% in browser sandbox)'));
      assert.ok(text.includes('Code Repository'));
    });

    it('executes list_workflows', async () => {
      const response = await handleMcpMessage({
        jsonrpc: '2.0',
        id: 6,
        method: 'tools/call',
        params: {
          name: 'list_workflows',
          arguments: { category: 'Media' },
        },
      });

      assert.equal(response.id, 6);
      const text = response.result.content[0].text;
      assert.ok(text.includes('Private Podcast Production Pipeline') || text.includes('Workflows'));
      assert.ok(text.includes('Pipeline Steps:'));
    });

    it('executes find_alternatives for closed SaaS targets', async () => {
      const response = await handleMcpMessage({
        jsonrpc: '2.0',
        id: 7,
        method: 'tools/call',
        params: {
          name: 'find_alternatives',
          arguments: { software: 'canva' },
        },
      });

      assert.equal(response.id, 7);
      const text = response.result.content[0].text;
      assert.ok(text.includes('Zero-Login Alternatives to Canva'));
      assert.ok(text.includes('Photopea'));
      assert.ok(text.includes('Recommended No-Login In-Browser Tools:'));
    });
  });

  describe('Error Handling', () => {
    it('returns error code -32601 for unknown methods', async () => {
      const response = await handleMcpMessage({
        jsonrpc: '2.0',
        id: 8,
        method: 'unknown/method',
      });

      assert.equal(response.id, 8);
      assert.equal(response.error.code, -32601);
      assert.ok(response.error.message.includes('Method not found'));
    });

    it('returns isError: true when required arguments are missing in tool call', async () => {
      const response = await handleMcpMessage({
        jsonrpc: '2.0',
        id: 9,
        method: 'tools/call',
        params: {
          name: 'get_tool_details',
          arguments: {},
        },
      });

      assert.equal(response.id, 9);
      assert.equal(response.result.isError, true);
      assert.ok(response.result.content[0].text.includes('Missing required argument: slug'));
    });
  });
});

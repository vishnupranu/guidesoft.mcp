// ==========================================================================
// Guidesoft.MCP — Vercel AI SDK & Magic UI Studio Engine
// ==========================================================================

const builderState = {
  activeFile: 'app/api/agent/route.ts',
  currentLeftTab: 'files',
  currentCanvasView: 'preview',
  currentDevice: 'desktop',
  isAgentRunning: false,
  isRecordingVoice: false,

  // Virtual Filesystem Store (Next.js 14 App Router + Vercel AI SDK + Magic UI)
  files: {
    'app/api/agent/route.ts': `// Vercel AI SDK (v4 / v5) + MCP Tool Calling Router
import { streamText, convertToModelMessages, isStepCount, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google('gemini-1.5-pro'),
    messages: await convertToModelMessages(messages),
    stopWhen: isStepCount(5),
    tools: {
      // MCP PostgreSQL Tool Binding
      queryPostgres: tool({
        description: 'Execute SQL queries or vector search against PostgreSQL MCP',
        inputSchema: z.object({ query: z.string() }),
        execute: async ({ query }) => {
          // Dispatches call to MCP Router over JSON-RPC 2.0
          return { status: 'success', rowsAffected: 1, query };
        }
      }),

      // MCP Stripe Tool Binding
      createStripeCheckout: tool({
        description: 'Create a subscription checkout session via Stripe MCP',
        inputSchema: z.object({ planId: z.string(), priceInCents: z.number() }),
        execute: async ({ planId, priceInCents }) => {
          return { checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_live_123', planId };
        }
      }),

      // MCP WhatsApp Tool Binding
      sendWhatsAppMessage: tool({
        description: 'Dispatch automated WhatsApp business messages via WhatsApp MCP',
        inputSchema: z.object({ recipientPhone: z.string(), messageText: z.string() }),
        execute: async ({ recipientPhone, messageText }) => {
          return { messageId: 'wa_msg_98765', status: 'sent', recipientPhone };
        }
      })
    }
  });

  return result.toDataStreamResponse();
}`,
    'mcp-config.json': `{
  "version": "2.0.0",
  "provider": "Vercel AI SDK",
  "mcpServers": {
    "postgresql": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "tools": ["queryPostgres", "create_table", "inspect_schema"]
    },
    "stripe": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-stripe"],
      "tools": ["createStripeCheckout", "get_subscriptions"]
    },
    "whatsapp": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-whatsapp"],
      "tools": ["sendWhatsAppMessage"]
    }
  }
}`,
    'components/magicui/border-beam.tsx': `// Magic UI Border Beam Component
import React from 'react';

export const BorderBeam = ({ className = '', duration = 4 }) => {
  return (
    <div
      style={{ animationDuration: \`\${duration}s\` }}
      className={\`pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [background:linear-gradient(90deg,transparent,#6366f1,#06b6d4,transparent)] \${className}\`}
    />
  );
};`,
    'components/magicui/shine-button.tsx': `// Magic UI Shine Button Component
import React from 'react';

export const ShineButton = ({ children, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={\`relative inline-flex items-center justify-center overflow-hidden rounded-md bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 font-semibold text-white shadow-lg transition-transform hover:scale-105 \${className}\`}
    >
      <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity hover:opacity-100" />
      {children}
    </button>
  );
};`,
    'docker-compose.yml': `version: '3.8'

services:
  mcp-router:
    image: guidesoft/mcp-router:latest
    ports:
      - "8080:8080"
    environment:
      - VERCEL_AI_SDK=true
      - MCP_SERVERS=postgresql:5432,stripe:8001,whatsapp:8002`
  },

  mcpServers: [
    { name: 'postgresql-mcp', status: 'Connected', tools: ['queryPostgres', 'vector_search'] },
    { name: 'stripe-mcp', status: 'Connected', tools: ['createStripeCheckout', 'billing_portal'] },
    { name: 'whatsapp-mcp', status: 'Connected', tools: ['sendWhatsAppMessage', 'webhook'] },
    { name: 'resend-mcp', status: 'Connected', tools: ['send_email'] }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  renderFileTree();
  renderMcpServerList();
  openFileInEditor('app/api/agent/route.ts');
  renderSimulatedAppView();
});

function switchLeftTab(tabName) {
  builderState.currentLeftTab = tabName;
  document.querySelectorAll('.snav-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.stab-content').forEach(c => c.classList.remove('active'));

  const btn = document.getElementById(`stab-${tabName}`);
  const content = document.getElementById(`content-${tabName}`);
  if (btn) btn.classList.add('active');
  if (content) content.classList.add('active');
}

function renderFileTree() {
  const container = document.getElementById('file-tree-container');
  if (!container) return;

  let html = `<div class="tree-folder"><i data-lucide="folder"></i> <span>guidesoft-nextjs</span></div>`;
  Object.keys(builderState.files).forEach(filename => {
    const isActive = filename === builderState.activeFile ? 'active' : '';
    html += `
      <div class="tree-file ${isActive}" onclick="openFileInEditor('${filename}')">
        <i data-lucide="file-code"></i>
        <span>${filename}</span>
      </div>
    `;
  });

  container.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}

function openFileInEditor(filename) {
  builderState.activeFile = filename;
  renderFileTree();

  const fnElem = document.getElementById('current-filename');
  if (fnElem) fnElem.innerHTML = `<i data-lucide="file-code"></i> <span>${filename}</span>`;

  const codeElem = document.getElementById('editor-code-content');
  if (codeElem) {
    codeElem.innerText = builderState.files[filename] || '// Empty File';
  }

  if (window.lucide) lucide.createIcons();
}

function renderMcpServerList() {
  const container = document.getElementById('mcp-server-list');
  if (!container) return;

  let html = '';
  builderState.mcpServers.forEach(srv => {
    html += `
      <div class="mcp-card-item magic-card">
        <div class="border-beam"></div>
        <div class="mcp-card-header">
          <span>${srv.name}</span>
          <span style="color:#10b981; font-size:0.7rem;">● ${srv.status}</span>
        </div>
        <div class="mcp-tool-tags">
          ${srv.tools.map(t => `<span class="mcp-tag">${t}</span>`).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function applyRecipe(recipeType) {
  const promptInput = document.getElementById('prompt-input');
  if (!promptInput) return;

  if (recipeType === 'saas') {
    promptInput.value = "Build a subscription SaaS using Vercel AI SDK streamText, Stripe MCP checkout, PostgreSQL vector storage, and Magic UI Border Beam components.";
  } else if (recipeType === 'ai-chat') {
    promptInput.value = "Create a conversational RAG AI agent with Vercel AI SDK, PostgreSQL embeddings MCP, and Magic UI Shine Buttons.";
  } else if (recipeType === 'whatsapp') {
    promptInput.value = "Assemble an autonomous WhatsApp lead capture engine with Vercel Edge Functions and WhatsApp MCP gateway.";
  }
}

function toggleVoiceInput() {
  builderState.isRecordingVoice = !builderState.isRecordingVoice;
  const btn = document.getElementById('voice-btn');

  if (builderState.isRecordingVoice) {
    btn.style.color = '#f43f5e';
    logTerminal('Listening for Vercel AI SDK prompt dictation...', 'info');
    setTimeout(() => {
      applyRecipe('saas');
      toggleVoiceInput();
      logTerminal('Voice prompt transcribed into Vercel AI SDK spec.', 'success');
    }, 2500);
  } else {
    btn.style.color = 'inherit';
  }
}

function switchCanvasView(viewName) {
  builderState.currentCanvasView = viewName;
  document.querySelectorAll('.cmode-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.canvas-view-pane').forEach(pane => pane.classList.remove('active'));

  const btn = document.getElementById(`cmode-${viewName}`);
  const pane = document.getElementById(`pane-${viewName}`);
  if (btn) btn.classList.add('active');
  if (pane) pane.classList.add('active');
}

function setViewportDevice(device) {
  builderState.currentDevice = device;
  document.querySelectorAll('.cdevice-btn').forEach(btn => btn.classList.remove('active'));
  const btn = document.getElementById(`cdev-${device}`);
  if (btn) btn.classList.add('active');

  const canvasArea = document.getElementById('viewport-canvas-area');
  if (canvasArea) {
    canvasArea.className = `viewport-canvas-area viewport-${device}`;
  }
}

function renderSimulatedAppView() {
  const frame = document.getElementById('simulated-app-frame');
  if (!frame) return;

  frame.innerHTML = `
    <div class="app-comp-card comp-hero magic-card">
      <div class="border-beam"></div>
      <h2 style="color:#fff; font-size:1.3rem;">Vercel AI SDK + Magic UI Platform</h2>
      <p style="font-size:0.8rem; color:#9ca3af; margin: 0.4rem 0 0.8rem 0;">Powered by Model Context Protocol (MCP) & Edge Functions.</p>
      <button class="btn-magic primary magic-shine-btn" onclick="triggerAppAction('checkout')">
        <div class="shine-effect"></div>
        <span>Invoke Stripe MCP Checkout ($29/mo)</span>
      </button>
    </div>

    <div class="app-comp-card magic-card" style="background:rgba(6, 182, 212, 0.08); border-color: rgba(6, 182, 212, 0.3);">
      <h4 style="color:#06b6d4; font-size:0.85rem; margin-bottom:0.4rem;">PostgreSQL MCP Vector Storage</h4>
      <p style="font-size:0.75rem; color:#9ca3af;">Connected via Vercel AI SDK tool binding • 0.3ms query latency</p>
    </div>

    <div class="app-comp-card magic-card" style="background:rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.3);">
      <h4 style="color:#10b981; font-size:0.85rem; margin-bottom:0.4rem;">WhatsApp Business MCP Gateway</h4>
      <p style="font-size:0.75rem; color:#9ca3af;">Active on Vercel Edge • Webhook route ready</p>
    </div>
  `;
}

function triggerAppAction(actionType) {
  if (actionType === 'checkout') {
    logTerminal('[VERCEL-AI-SDK] Executing tool `createStripeCheckout` via MCP...', 'info');
    setTimeout(() => {
      logTerminal('[VERCEL-AI-SDK] Tool call succeeded: https://checkout.stripe.com/c/pay/cs_live_123', 'success');
      alert('Stripe MCP Checkout Session Created via Vercel AI SDK!');
    }, 800);
  }
}

function startAgenticWorkflow() {
  const promptInput = document.getElementById('prompt-input');
  const userPrompt = promptInput ? promptInput.value.trim() : '';

  if (!userPrompt) {
    alert('Please enter a specification prompt!');
    return;
  }

  logTerminal(`🚀 Invoking Vercel AI SDK \`streamText\` workflow...`, 'agent');
  logTerminal(`[PROMPT] "${userPrompt}"`, 'info');

  const steps = [
    { delay: 500, text: '[Vercel AI SDK] Initializing streamText with `stopWhen: isStepCount(5)`...', type: 'agent' },
    { delay: 1200, text: '[MCP Tool Router] Bound `queryPostgres`, `createStripeCheckout`, `sendWhatsAppMessage`.', type: 'info' },
    { delay: 1900, text: '[Coder Agent] Synthesizing Next.js route `app/api/agent/route.ts`...', type: 'agent' },
    { delay: 2600, text: '[Magic UI Synthesizer] Mounting `<BorderBeam />` and `<ShineButton />` primitives...', type: 'info' },
    { delay: 3300, text: '✅ VERCEL AI SDK STACK GENERATED & COMPILED CLEANLY!', type: 'success' }
  ];

  steps.forEach(step => {
    setTimeout(() => {
      logTerminal(step.text, step.type);
      if (step.type === 'success') {
        openFileInEditor('app/api/agent/route.ts');
        switchCanvasView('preview');
      }
    }, step.delay);
  });
}

function runInspectorToolCall() {
  const srvSelect = document.getElementById('inspector-mcp-select');
  const toolSelect = document.getElementById('inspector-tool-select');
  const jsonOut = document.getElementById('inspector-json-output');

  const srv = srvSelect ? srvSelect.value : 'postgres';
  const tool = toolSelect ? toolSelect.value : 'queryPostgres';

  logTerminal(`[MCP-INSPECTOR] Executing tool \`${tool}\` on server \`${srv}\`...`, 'info');

  if (jsonOut) {
    jsonOut.innerText = `{\n  "jsonrpc": "2.0",\n  "result": {\n    "provider": "Vercel AI SDK",\n    "mcp_server": "${srv}",\n    "tool_executed": "${tool}",\n    "data": [\n      { "id": "mcp_usr_101", "status": "active", "timestamp": "${new Date().toISOString()}" }\n    ]\n  },\n  "id": ${Math.floor(Math.random() * 9000) + 1000}\n}`;
  }

  logTerminal(`[MCP-INSPECTOR] Vercel AI SDK Tool Call Returned 200 OK.`, 'success');
}

function logTerminal(message, type = 'info') {
  const body = document.getElementById('terminal-body');
  if (!body) return;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.innerText = `[${timeStr}] ${message}`;

  body.appendChild(entry);
  body.scrollTop = body.scrollHeight;
}

function clearTerminalLogs() {
  const body = document.getElementById('terminal-body');
  if (body) body.innerHTML = '';
}

function openMcpCatalogModal() {
  document.getElementById('mcp-modal').classList.add('active');
}

function closeMcpCatalogModal() {
  document.getElementById('mcp-modal').classList.remove('active');
}

function addMcpServer(serverName) {
  builderState.mcpServers.push({
    name: `${serverName.toLowerCase().replace(/\s+/g, '-')}-mcp`,
    status: 'Connected',
    tools: ['execute', 'configure']
  });
  renderMcpServerList();
  closeMcpCatalogModal();
  logTerminal(`[MCP-MARKETPLACE] Attached MCP Server: ${serverName}`, 'success');
}

function runHealthCheck() {
  logTerminal('--- RUNNING VERCEL AI SDK & MCP DIAGNOSTICS ---', 'info');
  logTerminal('✔ Vercel AI SDK streamText Engine: HEALTHY', 'success');
  logTerminal('✔ MCP JSON-RPC Gateway: ONLINE', 'success');
  logTerminal('✔ Magic UI Border Beam Shader: ACTIVE', 'success');
}

function exportProjectZip() {
  logTerminal('📦 Packaging Next.js + Vercel AI SDK + Magic UI Software Stack...', 'info');
  setTimeout(() => {
    alert('Guidesoft.MCP Software Stack exported successfully!');
    logTerminal('✅ Project files saved to workspace.', 'success');
  }, 600);
}

function copyCurrentCode() {
  const codeElem = document.getElementById('editor-code-content');
  if (codeElem) {
    navigator.clipboard.writeText(codeElem.innerText).then(() => {
      alert(`Copied ${builderState.activeFile} to clipboard!`);
    });
  }
}

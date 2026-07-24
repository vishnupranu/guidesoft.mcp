// ==========================================================================
// MCP Market — Complete Cloud Hub, Onboarding & Studio Engine
// ==========================================================================

const marketState = {
  currentMode: 'marketplace', // 'marketplace' | 'onboarding' | 'dashboard' | 'studio'
  selectedCategory: 'all',
  searchQuery: '',
  onboardingStep: 1,

  servers: [
    {
      id: 'postgres',
      name: 'PostgreSQL MCP Server',
      package: '@modelcontextprotocol/server-postgres',
      category: 'database',
      icon: 'database',
      description: 'Official PostgreSQL Model Context Protocol server. Provides relational query execution, schema inspection, and vector embeddings.',
      tools: ['queryPostgres', 'create_table', 'inspect_schema', 'vector_search'],
      downloads: '142k',
      verified: true
    },
    {
      id: 'stripe',
      name: 'Stripe Payments MCP Server',
      package: '@modelcontextprotocol/server-stripe',
      category: 'saas',
      icon: 'credit-card',
      description: 'Automate subscription checkout sessions, webhook handlers, customer billing portals, and invoice dispatches via MCP.',
      tools: ['createStripeCheckout', 'get_subscriptions', 'refund_charge'],
      downloads: '98k',
      verified: true
    },
    {
      id: 'github',
      name: 'GitHub API MCP Server',
      package: '@modelcontextprotocol/server-github',
      category: 'developer',
      icon: 'git-branch',
      description: 'Interface AI agents directly with GitHub repositories, pull requests, issue tracking, commit logs, and workflow actions.',
      tools: ['create_pull_request', 'search_code', 'create_issue', 'get_file_contents'],
      downloads: '210k',
      verified: true
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business MCP Gateway',
      package: '@modelcontextprotocol/server-whatsapp',
      category: 'chat',
      icon: 'message-square',
      description: 'Direct integration with WhatsApp Cloud API. Send interactive buttons, template messages, and listen to inbound customer webhooks.',
      tools: ['sendWhatsAppMessage', 'send_template', 'listen_webhook'],
      downloads: '64k',
      verified: true
    },
    {
      id: 'brave',
      name: 'Brave Search AI MCP Server',
      package: '@modelcontextprotocol/server-brave-search',
      category: 'ai',
      icon: 'globe',
      description: 'Equip AI models with real-time web search capability, news retrieval, and site indexing without rate limits.',
      tools: ['web_search', 'local_search'],
      downloads: '175k',
      verified: true
    },
    {
      id: 'memory',
      name: 'Knowledge Graph Memory MCP',
      package: '@modelcontextprotocol/server-memory',
      category: 'ai',
      icon: 'brain-circuit',
      description: 'Persistent knowledge graph memory for AI assistants. Store entities, relations, and context across sessions.',
      tools: ['create_entities', 'read_graph', 'search_nodes'],
      downloads: '88k',
      verified: true
    },
    {
      id: 'resend',
      name: 'Resend Mailer MCP Server',
      package: '@modelcontextprotocol/server-resend',
      category: 'saas',
      icon: 'mail',
      description: 'Transactional email delivery platform. Send automated onboarding emails, password resets, and HTML newsletters.',
      tools: ['send_email', 'get_batch_status'],
      downloads: '52k',
      verified: true
    },
    {
      id: 'puppeteer',
      name: 'Puppeteer Web Scraper MCP',
      package: '@modelcontextprotocol/server-puppeteer',
      category: 'developer',
      icon: 'code-2',
      description: 'Headless browser automation. Capture screenshots, execute JavaScript on web pages, and scrape dynamic DOM elements.',
      tools: ['navigate', 'screenshot', 'click_element', 'extract_text'],
      downloads: '115k',
      verified: true
    }
  ]
};

const builderState = {
  activeFile: 'app/api/agent/route.ts',
  currentLeftTab: 'files',
  currentCanvasView: 'preview',
  currentDevice: 'desktop',
  isAgentRunning: false,
  isRecordingVoice: false,

  files: {
    'app/api/agent/route.ts': `// Vercel AI SDK + MCP Router
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
      queryPostgres: tool({
        description: 'Execute SQL queries or vector search against PostgreSQL MCP',
        inputSchema: z.object({ query: z.string() }),
        execute: async ({ query }) => ({ status: 'success', rowsAffected: 1, query })
      }),
      createStripeCheckout: tool({
        description: 'Create a subscription checkout session via Stripe MCP',
        inputSchema: z.object({ planId: z.string(), priceInCents: z.number() }),
        execute: async ({ planId }) => ({ checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_live_123', planId })
      })
    }
  });

  return result.toDataStreamResponse();
}`,
    'mcp-config.json': `{
  "version": "2.6.0",
  "provider": "MCP Market Engine",
  "mcpServers": {
    "postgresql": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-postgres"] },
    "stripe": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-stripe"] }
  }
}`
  },

  mcpServers: [
    { name: 'postgresql-mcp', status: 'Connected', tools: ['queryPostgres', 'vector_search'] },
    { name: 'stripe-mcp', status: 'Connected', tools: ['createStripeCheckout', 'billing_portal'] }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  renderMarketplaceGrid();
  renderFileTree();
  renderMcpServerList();
  openFileInEditor('app/api/agent/route.ts');
  renderSimulatedAppView();
});

// Top Navigation Mode Switcher (Marketplace vs Onboarding vs Dashboard vs Studio)
function switchTopMode(mode) {
  marketState.currentMode = mode;

  document.querySelectorAll('.mnav-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));

  const btn = document.getElementById(`mnav-${mode}`);
  const view = document.getElementById(`view-${mode}`);
  if (btn) btn.classList.add('active');
  if (view) view.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Onboarding Wizard Controls (/signup/onboarding)
function nextOnboardingStep(stepNum) {
  marketState.onboardingStep = stepNum;

  document.querySelectorAll('.step-item').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.onboard-step-card').forEach(c => c.classList.remove('active'));

  const pill = document.getElementById(`step-pill-${stepNum}`);
  const card = document.getElementById(`onboard-step-${stepNum}`);
  if (pill) pill.classList.add('active');
  if (card) card.classList.add('active');
}

function selectRole(elem) {
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('active'));
  elem.classList.add('active');
}

function selectClient(elem) {
  document.querySelectorAll('.client-card').forEach(c => c.classList.remove('active'));
  elem.classList.add('active');
}

function copyApiKey() {
  const key = 'mcp_live_pk_8f92a10b4c7395729f4f76db2026';
  navigator.clipboard.writeText(key).then(() => {
    alert(`Copied MCP Cloud API Key to clipboard:\n\n${key}`);
  });
}

function completeOnboarding() {
  alert('Welcome to MCP Market Hub! Your cloud environment is fully configured for @happies2012.');
  switchTopMode('dashboard');
}

// Marketplace Controls
function filterMcpCatalog() {
  const searchInput = document.getElementById('market-search-input');
  marketState.searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
  renderMarketplaceGrid();
}

function filterCategory(category, btnElem) {
  marketState.selectedCategory = category;
  document.querySelectorAll('.cat-tag').forEach(b => b.classList.remove('active'));
  if (btnElem) btnElem.classList.add('active');
  renderMarketplaceGrid();
}

function renderMarketplaceGrid() {
  const container = document.getElementById('market-cards-grid');
  const countLabel = document.getElementById('catalog-count-label');
  if (!container) return;

  const filtered = marketState.servers.filter(srv => {
    const matchesCat = marketState.selectedCategory === 'all' || srv.category === marketState.selectedCategory;
    const matchesSearch = !marketState.searchQuery ||
      srv.name.toLowerCase().includes(marketState.searchQuery) ||
      srv.description.toLowerCase().includes(marketState.searchQuery) ||
      srv.package.toLowerCase().includes(marketState.searchQuery);
    return matchesCat && matchesSearch;
  });

  if (countLabel) {
    countLabel.innerText = `Showing ${filtered.length} verified servers`;
  }

  let html = '';
  filtered.forEach(srv => {
    html += `
      <div class="market-server-card magic-card">
        <div class="border-beam"></div>
        <div>
          <div class="card-top-row">
            <div class="server-icon"><i data-lucide="${srv.icon}"></i></div>
            <span class="server-badge">✓ Verified • ${srv.downloads} Installs</span>
          </div>
          <h3 class="server-title">${srv.name}</h3>
          <p class="server-desc">${srv.description}</p>
          <div class="server-tools-list">
            ${srv.tools.map(t => `<span class="tool-pill">${t}</span>`).join('')}
          </div>
        </div>

        <div class="card-actions-row">
          <button class="btn-magic secondary btn-install" onclick="copyInstallCmd('${srv.package}')">
            <i data-lucide="copy"></i> Copy NPX
          </button>
          <button class="btn-magic primary btn-install" onclick="attachMcpToStudio('${srv.name}', '${srv.package}')">
            <i data-lucide="plus"></i> Attach to Studio
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}

function copyInstallCmd(pkgName) {
  const cmd = `npx -y ${pkgName}`;
  navigator.clipboard.writeText(cmd).then(() => {
    alert(`Copied MCP install command to clipboard:\n\n${cmd}`);
  });
}

function attachMcpToStudio(serverName, pkgName) {
  const srvId = serverName.toLowerCase().replace(/\s+/g, '-');
  builderState.mcpServers.push({
    name: srvId,
    status: 'Connected',
    tools: ['execute_query', 'invoke_tool']
  });
  renderMcpServerList();
  switchTopMode('studio');
  logTerminal(`[MCP-MARKETPLACE] Attached \`${pkgName}\` to Studio workspace.`, 'success');
}

// Studio Logic Helpers
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

function renderSimulatedAppView() {
  const frame = document.getElementById('simulated-app-frame');
  if (!frame) return;

  frame.innerHTML = `
    <div class="app-comp-card comp-hero magic-card">
      <div class="border-beam"></div>
      <h2 style="color:#fff; font-size:1.3rem;">MCP Market Cloud Platform</h2>
      <p style="font-size:0.8rem; color:#9ca3af; margin: 0.4rem 0 0.8rem 0;">User Account: @happies2012 • 3 Active MCP Cloud Servers</p>
      <button class="btn-magic primary magic-shine-btn" onclick="triggerAppAction('checkout')">
        <div class="shine-effect"></div>
        <span>Invoke Stripe MCP Checkout ($29/mo)</span>
      </button>
    </div>
  `;
}

function triggerAppAction(actionType) {
  if (actionType === 'checkout') {
    logTerminal('[VERCEL-AI-SDK] Executing tool `createStripeCheckout` via MCP...', 'info');
    setTimeout(() => {
      logTerminal('[VERCEL-AI-SDK] Tool call succeeded: https://checkout.stripe.com/c/pay/cs_live_123', 'success');
      alert('Stripe MCP Checkout Session Created!');
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
    { delay: 1200, text: '[MCP Tool Router] Bound `queryPostgres`, `createStripeCheckout`.', type: 'info' },
    { delay: 1900, text: '[Coder Agent] Synthesizing Next.js route `app/api/agent/route.ts`...', type: 'agent' },
    { delay: 2600, text: '✅ VERCEL AI SDK STACK GENERATED CLEANLY!', type: 'success' }
  ];

  steps.forEach(step => {
    setTimeout(() => {
      logTerminal(step.text, step.type);
      if (step.type === 'success') {
        openFileInEditor('app/api/agent/route.ts');
      }
    }, step.delay);
  });
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

function copyCurrentCode() {
  const codeElem = document.getElementById('editor-code-content');
  if (codeElem) {
    navigator.clipboard.writeText(codeElem.innerText).then(() => {
      alert(`Copied ${builderState.activeFile} to clipboard!`);
    });
  }
}

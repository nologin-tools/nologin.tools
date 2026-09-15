// NoLogin Quick Switcher - Popup Controller

let allTools = [];
let alternativesData = {};
let currentCategory = 'all';
let currentQuery = '';

const searchInput = document.getElementById('search-input');
const categoryPills = document.getElementById('category-pills');
const resultsList = document.getElementById('results-list');
const resultsCount = document.getElementById('results-count');
const altBanner = document.getElementById('alternative-banner');
const bannerTitle = document.getElementById('banner-title');
const bannerDesc = document.getElementById('banner-desc');
const bannerTools = document.getElementById('banner-tools');

async function loadData() {
  try {
    const [toolsRes, altsRes] = await Promise.all([
      fetch(chrome.runtime.getURL('src/tools-data.json')),
      fetch(chrome.runtime.getURL('src/alternatives-data.json')),
    ]);
    allTools = await toolsRes.json();
    alternativesData = await altsRes.json();
  } catch (err) {
    console.error('Error loading extension data:', err);
    allTools = [];
    alternativesData = {};
  }
}

function extractDomain(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.protocol.startsWith('http')) return null;
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

async function checkActiveTabAlternative() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;

    const domain = extractDomain(tab.url);
    if (!domain) return;

    let matched = alternativesData[domain];
    if (!matched) {
      for (const key of Object.keys(alternativesData)) {
        if (domain === key || domain.endsWith('.' + key)) {
          matched = alternativesData[key];
          break;
        }
      }
    }

    if (matched && matched.tools?.length > 0) {
      altBanner.classList.remove('hidden');
      bannerTitle.textContent = `Visiting ${matched.targetName}?`;
      bannerDesc.textContent = `${matched.headline}. Switch to a private, no-signup alternative:`;

      bannerTools.innerHTML = matched.tools.map((t) => `
        <div class="alt-card">
          <div class="alt-card-info">
            <span class="alt-name">${escapeHtml(t.name)}</span>
            <span class="alt-tag">${t.capabilities?.clientSideOnly ? 'Client-Side' : 'Free'}</span>
          </div>
          <button class="alt-btn" data-url="${t.url}">Launch Free ↗</button>
        </div>
      `).join('');

      bannerTools.querySelectorAll('.alt-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          chrome.tabs.create({ url: btn.dataset.url });
        });
      });
    }
  } catch (err) {
    console.warn('Could not inspect active tab:', err);
  }
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderTools() {
  const q = currentQuery.trim().toLowerCase();
  const cat = currentCategory.toLowerCase();

  const filtered = allTools.filter((tool) => {
    if (q) {
      const matchName = tool.name?.toLowerCase().includes(q);
      const matchHost = tool.hostname?.toLowerCase().includes(q);
      const matchTask = tool.coreTask?.toLowerCase().includes(q);
      const matchDesc = tool.description?.toLowerCase().includes(q);
      if (!matchName && !matchHost && !matchTask && !matchDesc) return false;
    }

    if (cat !== 'all') {
      if (cat === 'pdf & office' && tool.category?.toLowerCase() === 'productivity') return true;
      if (tool.category?.toLowerCase() !== cat) return false;
    }

    return true;
  });

  resultsCount.textContent = `${filtered.length} verified tool${filtered.length === 1 ? '' : 's'}`;

  if (filtered.length === 0) {
    resultsList.innerHTML = `
      <div style="padding: 24px 12px; text-align: center; color: #737373;">
        <p style="font-weight: bold; margin-bottom: 4px;">No tools found</p>
        <p style="font-size: 10px;">Try a different keyword or category.</p>
      </div>
    `;
    return;
  }

  const paged = filtered.slice(0, 30);
  resultsList.innerHTML = paged.map((t) => {
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${t.hostname}&sz=32`;
    return `
      <a href="${t.url}" target="_blank" rel="noopener" class="tool-row" data-url="${t.url}">
        <div class="tool-main">
          <img src="${faviconUrl}" alt="" class="tool-favicon" onerror="this.style.display='none'" />
          <div class="tool-details">
            <div class="tool-title-line">
              <span class="tool-name">${escapeHtml(t.name)}</span>
              <span class="badge-category">${escapeHtml(t.category)}</span>
              ${t.capabilities?.clientSideOnly ? '<span class="badge-clientside">Local</span>' : ''}
            </div>
            <div class="tool-desc">${escapeHtml(t.coreTask || t.description)}</div>
          </div>
        </div>
        <span class="tool-open-btn">Open ↗</span>
      </a>
    `;
  }).join('');

  resultsList.querySelectorAll('.tool-row').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: link.dataset.url });
    });
  });
}

// Event Listeners
searchInput.addEventListener('input', (e) => {
  currentQuery = e.target.value;
  renderTools();
});

categoryPills.addEventListener('click', (e) => {
  const pill = e.target.closest('.pill');
  if (!pill) return;

  categoryPills.querySelectorAll('.pill').forEach((p) => p.classList.remove('active'));
  pill.classList.add('active');
  currentCategory = pill.dataset.cat;
  renderTools();
});

// Initialize
async function init() {
  await loadData();
  await checkActiveTabAlternative();
  renderTools();
  searchInput.focus();
}

init();

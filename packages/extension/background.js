// NoLogin Quick Switcher - Background Service Worker

let alternativesData = null;

async function getAlternatives() {
  if (!alternativesData) {
    try {
      const url = chrome.runtime.getURL('src/alternatives-data.json');
      const res = await fetch(url);
      alternativesData = await res.json();
    } catch {
      alternativesData = {};
    }
  }
  return alternativesData;
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

async function updateBadge(tabId, url) {
  if (!tabId || !url) return;
  const domain = extractDomain(url);
  if (!domain) {
    chrome.action.setBadgeText({ text: '', tabId });
    return;
  }

  const alts = await getAlternatives();
  // Check exact domain or subdomain match
  let matched = alts[domain];
  if (!matched) {
    for (const key of Object.keys(alts)) {
      if (domain === key || domain.endsWith('.' + key)) {
        matched = alts[key];
        break;
      }
    }
  }

  if (matched && matched.tools && matched.tools.length > 0) {
    chrome.action.setBadgeText({ text: String(matched.tools.length), tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#16a34a', tabId });
    chrome.action.setTitle({
      title: `${matched.tools.length} No-Login Alternative${matched.tools.length > 1 ? 's' : ''} available for ${matched.targetName}!`,
      tabId,
    });
  } else {
    chrome.action.setBadgeText({ text: '', tabId });
    chrome.action.setTitle({
      title: 'NoLogin Quick Switcher - Find Zero-Login Tools',
      tabId,
    });
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === 'complete') {
    updateBadge(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab?.url) {
      updateBadge(activeInfo.tabId, tab.url);
    }
  } catch {}
});

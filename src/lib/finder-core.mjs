// @ts-check

/**
 * @typedef {Object} FinderToolItem
 * @property {number} id
 * @property {string} slug
 * @property {string} name
 * @property {string} url
 * @property {string} hostname
 * @property {string} description
 * @property {string} coreTask
 * @property {string} category
 * @property {boolean} isFeatured
 * @property {string | null} badgeDisplayType
 * @property {'online' | 'unstable' | 'offline' | null} health
 * @property {number} score
 * @property {boolean} isClientSideOnly
 * @property {boolean} worksOffline
 * @property {boolean} isOpenSource
 * @property {boolean} isFree
 */

/**
 * @typedef {Object} FinderFilters
 * @property {string} [query]
 * @property {string} [category]
 * @property {boolean} [clientSideOnly]
 * @property {boolean} [worksOffline]
 * @property {boolean} [openSource]
 * @property {boolean} [freeOnly]
 * @property {'score' | 'name-asc' | 'name-desc'} [sortBy]
 */

/**
 * Extracts clean hostname from URL
 * @param {string} url
 * @returns {string}
 */
export function extractHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Normalizes a raw tool into a FinderToolItem
 * @param {any} tool
 * @param {string} localizedDesc
 * @param {'online' | 'unstable' | 'offline' | null} health
 * @param {number} score
 * @returns {FinderToolItem}
 */
export function buildFinderItemFromTool(tool, localizedDesc, health, score) {
  const categoryTag = tool.tags?.find((/** @type {{ tagKey: string }} */ t) => t.tagKey === 'category')?.tagValue || 'Other';
  const isClientSideOnly = Boolean(
    tool.tags?.some(
      (/** @type {{ tagKey: string; tagValue: string }} */ t) =>
        t.tagKey === 'data' && t.tagValue === 'Client-Side Only'
    )
  );
  const worksOffline = Boolean(
    tool.tags?.some(
      (/** @type {{ tagKey: string; tagValue: string }} */ t) =>
        t.tagKey === 'offline' && t.tagValue === 'Works Offline'
    )
  );
  const isOpenSource = Boolean(
    tool.repoUrl ||
      tool.tags?.some(
        (/** @type {{ tagKey: string; tagValue: string }} */ t) =>
          t.tagKey === 'source' && t.tagValue === 'Open Source'
      )
  );
  const isFree = Boolean(
    tool.tags?.some(
      (/** @type {{ tagKey: string; tagValue: string }} */ t) =>
        t.tagKey === 'pricing' && t.tagValue === 'Free'
    )
  );

  return {
    id: tool.id,
    slug: tool.slug,
    name: tool.name,
    url: tool.url,
    hostname: extractHostname(tool.url),
    description: localizedDesc || tool.description || '',
    coreTask: tool.coreTask || '',
    category: categoryTag,
    isFeatured: Boolean(tool.isFeatured),
    badgeDisplayType: tool.badgeDisplayType || null,
    health: health ?? null,
    score,
    isClientSideOnly,
    worksOffline,
    isOpenSource,
    isFree,
  };
}

/**
 * Pure filter and sort function used both in test suites and client-side logic
 * @param {FinderToolItem[]} tools
 * @param {FinderFilters} filters
 * @returns {FinderToolItem[]}
 */
export function filterFinderTools(tools, filters) {
  const q = (filters.query || '').trim().toLowerCase();
  const cat = (filters.category || '').trim().toLowerCase();

  const filtered = tools.filter((tool) => {
    // Text search matching
    if (q) {
      const matchName = tool.name.toLowerCase().includes(q);
      const matchHost = tool.hostname.toLowerCase().includes(q);
      const matchTask = tool.coreTask.toLowerCase().includes(q);
      const matchDesc = tool.description.toLowerCase().includes(q);
      if (!matchName && !matchHost && !matchTask && !matchDesc) {
        return false;
      }
    }

    // Category matching
    if (cat && cat !== 'all') {
      if (tool.category.toLowerCase() !== cat) {
        return false;
      }
    }

    // Attribute checkboxes
    if (filters.clientSideOnly && !tool.isClientSideOnly) {
      return false;
    }
    if (filters.worksOffline && !tool.worksOffline) {
      return false;
    }
    if (filters.openSource && !tool.isOpenSource) {
      return false;
    }
    if (filters.freeOnly && !tool.isFree) {
      return false;
    }

    return true;
  });

  // Sorting
  const sortBy = filters.sortBy || 'score';
  return filtered.sort((a, b) => {
    if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'name-desc') {
      return b.name.localeCompare(a.name);
    }
    // Default: score descending
    return b.score - a.score;
  });
}

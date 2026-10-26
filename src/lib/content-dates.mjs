/** Dates describe editorial changes, never rebuilds, liveness checks or GitHub refreshes. */
export function latestContentDate(...values) {
  const dates = values.flat().filter(Boolean).map(value => {
    if (!(value instanceof Date) && !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(String(value))) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }).filter(Boolean);
  return dates.sort().at(-1);
}

export function toolContentDate(tool, editorial, translation, guide) {
  return latestContentDate(tool.approvedAt, tool.contentUpdatedAt,
    editorial?.contentUpdatedAt, translation?.contentUpdatedAt, guide?.updatedAt);
}

function stableContent(value) {
  if (Array.isArray(value)) return value.map(stableContent);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort()
      .filter(key => !['contentUpdatedAt', '_hash', 'testedAt'].includes(key))
      .map(key => [key, stableContent(value[key])]));
  }
  return value;
}

export function withContentUpdatedAt(previous, next, now = new Date().toISOString()) {
  const changed = JSON.stringify(stableContent(previous || {})) !== JSON.stringify(stableContent(next));
  const contentUpdatedAt = changed ? now : previous?.contentUpdatedAt;
  return { ...next, ...(contentUpdatedAt ? { contentUpdatedAt } : {}) };
}

export function sameTags(a, b) {
  const keys = tags => [...new Set(tags.map(t => JSON.stringify([t.key ?? t.tagKey, t.value ?? t.tagValue])))].sort();
  return JSON.stringify(keys(a)) === JSON.stringify(keys(b));
}

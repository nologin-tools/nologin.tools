export interface TagDefinition {
  key: string;
  label: string;
  values: string[];
  multiSelect: boolean;
}

export const TAG_DEFINITIONS: TagDefinition[] = [
  {
    key: 'category',
    label: 'Category',
    values: ['AI', 'Design', 'Writing', 'Development', 'Productivity', 'Media',
             'Privacy', 'Data', 'Communication', 'Education', 'Finance'],
    multiSelect: false,
  },
  {
    key: 'data',
    label: 'Data Processing',
    values: ['Client-Side Only', 'Server-Side'],
    multiSelect: false,
  },
  {
    key: 'privacy',
    label: 'Privacy',
    values: ['No Trackers', 'Privacy Focused'],
    multiSelect: true,
  },
  {
    key: 'type',
    label: 'Type',
    values: ['PWA', 'Web App', 'CLI', 'Desktop App', 'Browser Extension'],
    multiSelect: false,
  },
  {
    key: 'hosting',
    label: 'Hosting',
    values: ['Self-Hostable', 'Cloud Only'],
    multiSelect: false,
  },
  {
    key: 'offline',
    label: 'Offline',
    values: ['Works Offline', 'Online Only'],
    multiSelect: false,
  },
  {
    key: 'pricing',
    label: 'Pricing',
    values: ['Free', 'Freemium', 'Ad-Supported'],
    multiSelect: false,
  },
];

export function getTagLabel(key: string, value: string): string {
  return `${key}:${value}`;
}

export function getAllTagValues(): { key: string; value: string }[] {
  return TAG_DEFINITIONS.flatMap((def) =>
    def.values.map((value) => ({ key: def.key, value }))
  );
}

export function categoryToSlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '-');
}

export function slugToCategory(slug: string): string | undefined {
  const categoryDef = TAG_DEFINITIONS.find((d) => d.key === 'category');
  if (!categoryDef) return undefined;
  return categoryDef.values.find((v) => categoryToSlug(v) === slug);
}

// Tag values that get their own landing page.
// Excludes: reverse tags (Online Only, Cloud Only, Server-Side), overly broad (Web App),
// thin content (Browser Extension <3 tools), and zero-tool values (CLI, Desktop App).
export const TAG_PAGES_ALLOWLIST: { key: string; value: string }[] = [
  { key: 'pricing', value: 'Free' },
  { key: 'data', value: 'Client-Side Only' },
  { key: 'privacy', value: 'Privacy Focused' },
  { key: 'hosting', value: 'Self-Hostable' },
  { key: 'pricing', value: 'Freemium' },
  { key: 'privacy', value: 'No Trackers' },
  { key: 'offline', value: 'Works Offline' },
  { key: 'pricing', value: 'Ad-Supported' },
  { key: 'type', value: 'PWA' },
];

export function tagValueToSlug(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '-');
}

export function slugToTagInfo(slug: string): { key: string; value: string } | undefined {
  return TAG_PAGES_ALLOWLIST.find((t) => tagValueToSlug(t.value) === slug);
}

export function isTagPageAllowed(key: string, value: string): boolean {
  return TAG_PAGES_ALLOWLIST.some((t) => t.key === key && t.value === value);
}

export function sortTagsCategoryFirst(
  tags: { tagKey: string; tagValue: string }[]
): { tagKey: string; tagValue: string }[] {
  return [...tags].sort((a, b) => {
    if (a.tagKey === 'category') return -1;
    if (b.tagKey === 'category') return 1;
    return 0;
  });
}

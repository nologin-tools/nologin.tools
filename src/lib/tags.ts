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
    values: ['Design', 'Writing', 'Development', 'AI', 'Productivity', 'Media',
             'Privacy', 'Data', 'Communication', 'Education', 'Finance'],
    multiSelect: false,
  },
  {
    key: 'source',
    label: 'Source',
    values: ['Open Source', 'Closed Source'],
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

export function sortTagsCategoryFirst(
  tags: { tagKey: string; tagValue: string }[]
): { tagKey: string; tagValue: string }[] {
  return [...tags].sort((a, b) => {
    if (a.tagKey === 'category') return -1;
    if (b.tagKey === 'category') return 1;
    return 0;
  });
}

import data from '../data/tool-guides.json';
import type { Locale } from '../i18n/config';

export interface ToolGuide {
  title: string;
  summary: string;
  testedAt: string;
  updatedAt: string;
  input: string;
  steps: string[];
  result: string;
  limitations: string;
  screenshot?: { src: string; alt: string; width: number; height: number };
  artifact?: { href: string; label: string };
  sources?: { href: string; label: string }[];
}

const guides = data as Record<string, Partial<Record<Locale, ToolGuide>>>;

export function getToolGuide(slug: string, locale: Locale): ToolGuide | undefined {
  return guides[slug]?.[locale];
}

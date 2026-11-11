import programmaticZh from '../data/translations/programmatic-zh.json';
import type { Locale } from '../i18n/config';
import {
  CURATED_COLLECTIONS,
  findCollectionsForTool,
} from './collections-data.mjs';

export interface CollectionItem {
  toolSlug: string;
  roleTitle: string;
  whySelected: string;
}

export interface CollectionFAQ {
  question: string;
  answer: string;
}

export interface CuratedCollection {
  slug: string;
  title: string;
  tagline: string;
  persona: string;
  category: string;
  icon: string;
  heroQuote: string;
  description: string;
  guarantees: string[];
  items: CollectionItem[];
  faqs: CollectionFAQ[];
  relatedSlugs: string[];
}

export {
  CURATED_COLLECTIONS,
  getCollectionBySlug,
  getRelatedCollections,
  findCollectionsForTool,
} from './collections-data.mjs';

export function resolveCollectionDetails(collection: CuratedCollection, locale: Locale = 'en'): CuratedCollection {
  if (locale !== 'zh') return collection;
  const zhCol = (programmaticZh.collections as Record<string, {
    title: string;
    tagline: string;
    persona: string;
    category: string;
    heroQuote: string;
    description: string;
    guarantees: string[];
    items: Record<string, { roleTitle: string; whySelected: string }>;
    faqs: CollectionFAQ[];
  } | undefined>)[collection.slug];
  if (!zhCol) return collection;

  return {
    ...collection,
    title: zhCol.title,
    tagline: zhCol.tagline,
    persona: zhCol.persona,
    category: zhCol.category,
    heroQuote: zhCol.heroQuote,
    description: zhCol.description,
    guarantees: zhCol.guarantees,
    items: collection.items.map((item) => {
      const zhItem = zhCol.items[item.toolSlug];
      return zhItem ? { ...item, roleTitle: zhItem.roleTitle, whySelected: zhItem.whySelected } : item;
    }),
    faqs: zhCol.faqs,
  };
}

export function getLocalizedCollections(locale: Locale = 'en'): CuratedCollection[] {
  return CURATED_COLLECTIONS.map((col) => resolveCollectionDetails(col, locale));
}

export function findLocalizedCollectionsForTool(toolSlug: string, locale: Locale = 'en'): CuratedCollection[] {
  return findCollectionsForTool(toolSlug).map((col) => resolveCollectionDetails(col, locale));
}

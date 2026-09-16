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

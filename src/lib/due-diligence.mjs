// @ts-check
/**
 * Return recorded evidence only. Scores, tags and repository popularity cannot
 * establish network behavior, retention, export integrity or community research.
 * @param {any} _tool
 * @param {any} [editorial]
 * @returns {import('../data/loader').DueDiligenceEvidence | null}
 */
export function resolveDueDiligence(_tool, editorial) {
  const evidence = editorial?.dueDiligence;
  return evidence && Object.keys(evidence).length ? evidence : null;
}

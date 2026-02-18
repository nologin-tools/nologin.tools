export function getBadgeEmbedCode(slug: string, siteUrl: string) {
  return {
    svg: `<a href="${siteUrl}/badge/${slug}">
  <img src="${siteUrl}/badge.svg" alt="NoLogin Verified" />
</a>`,
    meta: `<meta name="nologin-verified" content="${slug}" />`,
    link: `<a href="${siteUrl}/badge/${slug}">NoLogin Verified</a>`,
  };
}

export function getBadgeWeight(
  displayType: 'explicit' | 'implicit' | 'none' | null
): number {
  switch (displayType) {
    case 'explicit':
      return 10;
    case 'implicit':
      return 5;
    default:
      return 0;
  }
}

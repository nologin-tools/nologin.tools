export async function archiveUrl(
  url: string,
  accessKey: string,
  secretKey: string
): Promise<string | null> {
  try {
    const response = await fetch('https://web.archive.org/save', {
      method: 'POST',
      headers: {
        Authorization: `LOW ${accessKey}:${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ url, capture_all: '1' }),
    });
    if (!response.ok) return null;
    return `https://web.archive.org/web/${url}`;
  } catch {
    return null;
  }
}

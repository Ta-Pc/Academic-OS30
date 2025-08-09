export function parseUserIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return u.searchParams.get('userId');
  } catch {
    return null;
  }
}



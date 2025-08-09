export function getBaseUrl(): string {
  // Prefer explicit env when provided
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  const port = process.env.PORT || '3000';
  return `http://localhost:${port}`;
}



/**
 * Consistent date formatting utilities to prevent hydration errors
 * between server and client rendering
 */

/**
 * Format date consistently for both server and client
 * Returns format: "MM/DD/YYYY, HH:MM:SS AM/PM"
 */
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/**
 * Format date consistently for both server and client
 * Returns format: "MM/DD/YYYY"
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format date for week ranges
 * Returns format: "MMM DD, YYYY"
 */
export function formatWeekDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

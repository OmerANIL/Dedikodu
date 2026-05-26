export function formatRelativeDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);

    if (diffSec < 60) return 'Az \u00f6nce';
    if (diffMin < 60) return `${diffMin} dakika \u00f6nce`;
    if (diffHour < 24) return `${diffHour} saat \u00f6nce`;
    if (diffDay < 7) return `${diffDay} g\u00fcn \u00f6nce`;
    if (diffWeek < 5) return `${diffWeek} hafta \u00f6nce`;
    if (diffMonth < 12) return `${diffMonth} ay \u00f6nce`;
    return `${Math.floor(diffDay / 365)} y\u0131l \u00f6nce`;
  } catch {
    return '';
  }
}

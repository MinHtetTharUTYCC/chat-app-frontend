export function getLastSeenToday(timestamp: string): string | null {
    const now = new Date();
    const date = new Date(Number(timestamp));

    if (isNaN(date.getTime())) {
        console.error('Invalid timestamp:', timestamp, date.getTime(), date);
        return null;
    }

    const oneDayMs = 24 * 60 * 60 * 1000;
    const diffMs = now.getTime() - date.getTime();

    if (diffMs > oneDayMs || diffMs < 0) {
        return null;
    }

    if (diffMs < 60 * 1000) {
        return '1m';
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 60) {
        return `${diffMinutes}m`;
    } else {
        return `${diffHours}h`;
    }
}

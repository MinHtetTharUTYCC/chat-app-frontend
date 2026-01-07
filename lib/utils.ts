import { clsx, type ClassValue } from 'clsx';
import { format, isThisMonth, isThisWeek, isToday, isYesterday } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatMessageDate(timestamp: string) {
    const date = new Date(timestamp);

    if (isToday(date)) {
        return format(date, 'hh:mm a');
    }
    if (isYesterday(date)) {
        return format(date, "'Yesterday at' hh:mm a");
    }
    if (isThisWeek(date)) {
        return format(date, "dd 'at' hh:mm a");
    }
    if (isThisMonth(date) || date.getFullYear() === new Date().getFullYear()) {
        return format(date, "MMM dd 'at' hh:mm a");
    }
    return format(date, "MM/dd/yyyy 'at' hh:mm a");
}

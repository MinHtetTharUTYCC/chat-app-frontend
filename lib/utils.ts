import { clsx, type ClassValue } from "clsx"
import { format, isThisMonth, isThisWeek, isToday, isYesterday } from "date-fns";
import { twMerge } from "tailwind-merge"
import { is } from "zod/v4/locales";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function formatLastSeen(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function formatMessageDate(timestamp: string) {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return format(date, "hh:mm a");
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
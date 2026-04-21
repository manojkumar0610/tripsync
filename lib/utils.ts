import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "MMM dd, yyyy");
}

export function formatDateShort(date: string | Date): string {
  return format(new Date(date), "MMM dd");
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getDaysUntilTrip(startDate: string | Date): number {
  return differenceInDays(new Date(startDate), new Date());
}

export function getTripDuration(
  startDate: string | Date,
  endDate: string | Date
): number {
  return differenceInDays(new Date(endDate), new Date(startDate));
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getTripTypeEmoji(type: string): string {
  const map: Record<string, string> = {
    friends: "🎉",
    family: "👨‍👩‍👧‍👦",
    solo: "🧭",
    bike_trip: "🏍️",
  };
  return map[type] ?? "✈️";
}

export function getTripTypeLabel(type: string): string {
  const map: Record<string, string> = {
    friends: "Friends Trip",
    family: "Family Trip",
    solo: "Solo Adventure",
    bike_trip: "Bike Trip",
  };
  return map[type] ?? type;
}

export function getExpenseCategoryIcon(category: string): string {
  const map: Record<string, string> = {
    food: "🍽️",
    transport: "🚗",
    accommodation: "🏨",
    activities: "🎯",
    shopping: "🛍️",
    medical: "💊",
    other: "💰",
  };
  return map[category] ?? "💰";
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + "..." : str;
}

export const EXPENSE_CATEGORIES = [
  { value: "food", label: "Food & Dining", icon: "🍽️" },
  { value: "transport", label: "Transport", icon: "🚗" },
  { value: "accommodation", label: "Accommodation", icon: "🏨" },
  { value: "activities", label: "Activities", icon: "🎯" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "medical", label: "Medical", icon: "💊" },
  { value: "other", label: "Other", icon: "💰" },
];

export const TRIP_INTERESTS = [
  "Adventure",
  "Culture",
  "Food",
  "Nature",
  "Photography",
  "Shopping",
  "History",
  "Nightlife",
  "Wellness",
  "Sports",
  "Art",
  "Music",
];

export const TRIP_STYLES = [
  "Backpacker",
  "Budget",
  "Comfort",
  "Luxury",
  "Adventure",
  "Cultural",
  "Relaxing",
  "Party",
];

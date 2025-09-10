import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  // 한국 시간 기준으로 날짜 포맷팅
  const koreanDate = new Date(date.getTime() + (9 * 60 * 60 * 1000)); // UTC + 9시간
  return koreanDate.toISOString().split('T')[0];
}

export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return formatDate(date) === formatDate(today);
}

export function isFutureDate(date: Date): boolean {
  // 한국 시간 기준으로 오늘 날짜 계산
  const now = new Date();
  const koreanNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  const today = new Date(koreanNow.getFullYear(), koreanNow.getMonth(), koreanNow.getDate(), 23, 59, 59, 999);
  
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate > today;
}

export function isBeforeMinDate(date: Date): boolean {
  const minDate = new Date('2025-09-01');
  minDate.setHours(0, 0, 0, 0);
  
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate < minDate;
}

export function isValidDate(date: Date): boolean {
  return !isFutureDate(date) && !isBeforeMinDate(date);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getDateRange(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

// Create deterministic hash from string (for consistent quote mapping)
export function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Get deterministic index for date
export function getDeterministicIndex(date: string, max: number): number {
  return simpleHash(date) % max;
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getISOWeekString(d: Date = new Date()) {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Difference in days divided by 7
  const diff = (date.getTime() - week1.getTime()) / 86400000;
  const week = 1 + Math.round(diff / 7);
  return `${date.getFullYear()}-W${week.toString().padStart(2, '0')}`;
}

export const AREA_LABELS: Record<string, string> = {
  'CURSOS': 'COURSES',
  'PROJETOS': 'PROJECTS',
  'EVENTOS': 'EVENTS',
  'MARKETING': 'MARKETING'
};

export function getISOWeekRange(d: Date = new Date()) {
  const date = new Date(d.getTime());
  const day = date.getDay();
  // ISO week starts on Monday
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
  const monday = new Date(date.getTime());
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday.getTime());
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const start = monday.toLocaleDateString('en-US', options);
  const end = sunday.toLocaleDateString('en-US', options);
  
  return `${start} - ${end}`;
}

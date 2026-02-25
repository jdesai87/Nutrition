import { DayLog, FoodEntry, UserSettings, ActivityLevel, GoalAggressiveness } from "./types";

const DAYS_KEY = "nutrition_days";
const SETTINGS_KEY = "nutrition_settings";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 13,
  light: 14,
  moderate: 15,
  active: 16,
};

const DEFICIT_MAP: Record<GoalAggressiveness, number> = {
  conservative: 300,  // ~0.6 lb/week
  moderate: 500,      // ~1 lb/week
  aggressive: 750,    // ~1.5 lb/week
};

export function calculateTargets(weight: number, activity: ActivityLevel, goal: GoalAggressiveness) {
  const maintenance = weight * ACTIVITY_MULTIPLIERS[activity];
  const deficit = DEFICIT_MAP[goal];
  const calories = Math.round(maintenance - deficit);
  const protein = Math.round(weight); // 1g per lb — gold standard for muscle preservation
  const fat = Math.round(weight * 0.35); // 0.35g per lb
  const carbCalories = calories - (protein * 4) - (fat * 9);
  const carbs = Math.round(Math.max(carbCalories / 4, 50)); // floor at 50g
  return { calorieTarget: calories, proteinTarget: protein, carbTarget: carbs, fatTarget: fat };
}

export const DEFAULT_SETTINGS: UserSettings = {
  calorieTarget: 2000,
  proteinTarget: 150,
  carbTarget: 200,
  fatTarget: 65,
  name: "",
  weight: 0,
  activityLevel: "moderate",
  goalAggressiveness: "moderate",
};

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Settings
export function getSettings(): UserSettings {
  return getItem(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function saveSettings(settings: UserSettings): void {
  setItem(SETTINGS_KEY, settings);
}

// Day logs
function getAllDays(): Record<string, DayLog> {
  return getItem<Record<string, DayLog>>(DAYS_KEY, {});
}

function saveAllDays(days: Record<string, DayLog>): void {
  setItem(DAYS_KEY, days);
}

export function getTodayKey(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

export function getDayLog(date: string): DayLog {
  const days = getAllDays();
  return days[date] || { date, entries: [], submitted: false };
}

export function saveDayLog(dayLog: DayLog): void {
  const days = getAllDays();
  days[dayLog.date] = dayLog;
  saveAllDays(days);
}

export function addFoodEntry(date: string, entry: FoodEntry): DayLog {
  const day = getDayLog(date);
  day.entries.push(entry);
  saveDayLog(day);
  return day;
}

export function removeFoodEntry(date: string, entryId: string): DayLog {
  const day = getDayLog(date);
  day.entries = day.entries.filter((e) => e.id !== entryId);
  saveDayLog(day);
  return day;
}

export function deleteDayLog(date: string): void {
  const days = getAllDays();
  delete days[date];
  saveAllDays(days);
}

export function getRecentDays(count: number = 30): DayLog[] {
  const days = getAllDays();
  return Object.values(days)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, count);
}

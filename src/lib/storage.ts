import { DayLog, FoodEntry, UserSettings, ActivityLevel, GoalType, GoalPace } from "./types";

const DAYS_KEY = "nutrition_days";
const SETTINGS_KEY = "nutrition_settings";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 13,
  light: 14,
  moderate: 15,
  active: 16,
};

// Calorie adjustment from maintenance
const CALORIE_ADJUSTMENTS: Record<GoalType, Record<GoalPace, number>> = {
  cut: { conservative: -300, moderate: -500, aggressive: -750 },
  maintain: { conservative: 0, moderate: 0, aggressive: 0 },
  bulk: { conservative: 200, moderate: 350, aggressive: 500 },
};

// Protein per lb bodyweight
const PROTEIN_PER_LB: Record<GoalType, number> = {
  cut: 1.0,      // high to preserve muscle in deficit
  maintain: 0.8, // enough to maintain
  bulk: 1.0,     // high to build muscle
};

// Fat per lb bodyweight
const FAT_PER_LB: Record<GoalType, number> = {
  cut: 0.3,      // lower to save calories for protein
  maintain: 0.35,
  bulk: 0.4,     // higher since calories allow it
};

export function calculateTargets(weight: number, activity: ActivityLevel, goalType: GoalType, goalPace: GoalPace) {
  const maintenance = weight * ACTIVITY_MULTIPLIERS[activity];
  const adjustment = CALORIE_ADJUSTMENTS[goalType][goalPace];
  const calories = Math.round(maintenance + adjustment);
  const protein = Math.round(weight * PROTEIN_PER_LB[goalType]);
  const fat = Math.round(weight * FAT_PER_LB[goalType]);
  const carbCalories = calories - (protein * 4) - (fat * 9);
  const carbs = Math.round(Math.max(carbCalories / 4, 50));
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
  goalType: "cut",
  goalPace: "moderate",
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

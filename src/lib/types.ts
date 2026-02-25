export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: MealType;
  timestamp: number;
}

export interface MacroInsight {
  label: string;
  actual: number;
  target: number;
  unit: string;
}

export interface DaySummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  rating: "excellent" | "good" | "fair" | "poor";
  feedback: string[];
  improvements: string[];
  macroInsights: MacroInsight[];
  tomorrowTweaks: string[];
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  entries: FoodEntry[];
  submitted: boolean;
  summary?: DaySummary;
}

export interface UserSettings {
  calorieTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  name: string;
}

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

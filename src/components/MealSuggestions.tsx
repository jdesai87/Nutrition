"use client";

import { FoodEntry, MacroTotals, MealType, UserSettings } from "@/lib/types";
import { getMealSuggestions } from "@/lib/suggestions";

interface MealSuggestionsProps {
  totals: MacroTotals;
  settings: UserSettings;
  entries: FoodEntry[];
}

export default function MealSuggestions({ totals, settings, entries }: MealSuggestionsProps) {
  const hour = new Date().getHours();
  let nextMeal: MealType = "snack";
  if (hour < 11) nextMeal = "breakfast";
  else if (hour < 15) nextMeal = "lunch";
  else if (hour < 20) nextMeal = "dinner";

  const { suggestions, message } = getMealSuggestions(totals, settings, nextMeal, entries);

  if (suggestions.length === 0 && !message) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Suggestions
      </h3>
      {message && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{message}</p>
      )}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <div key={i} className="px-3 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg">
              <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 capitalize">{s.food}</p>
              <div className="flex justify-between mt-0.5">
                <span className="text-xs text-emerald-600 dark:text-emerald-400">{s.reason}</span>
                <span className="text-xs text-emerald-500 dark:text-emerald-500">
                  {s.calories} cal &middot; {s.protein}g protein
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

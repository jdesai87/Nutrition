"use client";

import { FoodEntry, MealType } from "@/lib/types";

interface FoodLogProps {
  entries: FoodEntry[];
  onRemove: (id: string) => void;
}

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
};

export default function FoodLog({ entries, onRemove }: FoodLogProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400 dark:text-zinc-500">
        <p className="text-lg mb-1">No food logged yet</p>
        <p className="text-sm">Start by adding what you&apos;ve eaten today</p>
      </div>
    );
  }

  const grouped = MEAL_ORDER.map((meal) => ({
    meal,
    label: MEAL_LABELS[meal],
    items: entries.filter((e) => e.meal === meal),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-4">
      {grouped.map((group) => (
        <div key={group.meal}>
          <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
            {group.label}
          </h3>
          <div className="space-y-1">
            {group.items.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between py-2.5 px-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize truncate">
                    {entry.name}
                  </p>
                  <div className="flex gap-3 text-xs text-zinc-400">
                    <span>{entry.calories} cal</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{entry.protein}g P</span>
                    <span>{entry.carbs}g C</span>
                    <span>{entry.fat}g F</span>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(entry.id)}
                  className="ml-2 p-1.5 text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Remove food entry"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

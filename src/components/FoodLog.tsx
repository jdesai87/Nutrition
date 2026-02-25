"use client";

import { FoodEntry, MealType } from "@/lib/types";

interface FoodLogProps {
  entries: FoodEntry[];
  onRemove: (id: string) => void;
}

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

const MEAL_COLORS: Record<MealType, string> = {
  breakfast: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  lunch: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  dinner: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  snack: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-400",
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

  // Sort by timestamp (most recent first)
  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-1.5">
      {sorted.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between py-2.5 px-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg group"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize truncate">
                {entry.name}
              </p>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${MEAL_COLORS[entry.meal]}`}>
                {MEAL_LABELS[entry.meal]}
              </span>
            </div>
            <div className="flex gap-3 text-xs text-zinc-400">
              <span>{entry.calories} cal</span>
              <span className="text-emerald-600 dark:text-emerald-400">{entry.protein}g protein</span>
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
  );
}

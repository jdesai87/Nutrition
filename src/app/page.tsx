"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { FoodEntry, DayLog, MacroTotals } from "@/lib/types";
import {
  getTodayKey,
  getDayLog,
  addFoodEntry,
  removeFoodEntry,
  saveDayLog,
  getSettings,
} from "@/lib/storage";
import { generateSummary, calculateTotals } from "@/lib/summary";
import FoodInput from "@/components/FoodInput";
import FoodLog from "@/components/FoodLog";
import MacroBar from "@/components/MacroBar";
import MealSuggestions from "@/components/MealSuggestions";
import DaySummaryComponent from "@/components/DaySummary";

export default function Home() {
  const [dayLog, setDayLog] = useState<DayLog | null>(null);
  const [totals, setTotals] = useState<MacroTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [settings, setSettings] = useState(getSettings());
  const [showSummary, setShowSummary] = useState(false);

  const loadDay = useCallback(() => {
    const today = getTodayKey();
    const log = getDayLog(today);
    setDayLog(log);
    setTotals(calculateTotals(log.entries));
    setSettings(getSettings());
    if (log.submitted && log.summary) {
      setShowSummary(true);
    }
  }, []);

  useEffect(() => {
    loadDay();
  }, [loadDay]);

  function handleAddFood(food: Omit<FoodEntry, "id" | "timestamp">) {
    const today = getTodayKey();
    const entry: FoodEntry = {
      ...food,
      id: uuidv4(),
      timestamp: Date.now(),
    };
    const updated = addFoodEntry(today, entry);
    setDayLog(updated);
    setTotals(calculateTotals(updated.entries));
  }

  function handleRemoveFood(id: string) {
    const today = getTodayKey();
    const updated = removeFoodEntry(today, id);
    setDayLog(updated);
    setTotals(calculateTotals(updated.entries));
  }

  function handleSubmitDay() {
    if (!dayLog || dayLog.entries.length === 0) return;
    const summary = generateSummary(dayLog.entries, settings);
    const updated = { ...dayLog, submitted: true, summary };
    saveDayLog(updated);
    setDayLog(updated);
    setShowSummary(true);
  }

  function handleReopenDay() {
    if (!dayLog) return;
    const updated = { ...dayLog, submitted: false, summary: undefined };
    saveDayLog(updated);
    setDayLog(updated);
    setShowSummary(false);
  }

  if (!dayLog) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="px-4 pt-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          NutriTrack
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{dateStr}</p>
      </div>

      {/* Show summary if day is submitted */}
      {showSummary && dayLog.summary ? (
        <div className="space-y-4">
          <DaySummaryComponent summary={dayLog.summary} />
          <button
            onClick={handleReopenDay}
            className="w-full py-2.5 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-colors"
          >
            Reopen &amp; edit today
          </button>
        </div>
      ) : (
        <>
          {/* Macro progress bars — calories + protein only */}
          <div className="space-y-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <MacroBar
              label="Calories"
              current={totals.calories}
              target={settings.calorieTarget}
              unit=""
              color="bg-zinc-700 dark:bg-zinc-300"
            />
            <MacroBar
              label="Protein"
              current={totals.protein}
              target={settings.proteinTarget}
              unit="g"
              color="bg-emerald-500"
            />
          </div>

          {/* Food input */}
          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <FoodInput onAdd={handleAddFood} />
          </div>

          {/* Suggestions */}
          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <MealSuggestions totals={totals} settings={settings} entries={dayLog.entries} />
          </div>

          {/* Food log */}
          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Today&apos;s Log
              </h2>
              <span className="text-xs text-zinc-400">{dayLog.entries.length} items</span>
            </div>
            <FoodLog entries={dayLog.entries} onRemove={handleRemoveFood} />
          </div>

          {/* Submit day button */}
          {dayLog.entries.length > 0 && (
            <button
              onClick={handleSubmitDay}
              className="w-full py-3.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-2xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm"
            >
              End Day &amp; Get Summary
            </button>
          )}
        </>
      )}
    </div>
  );
}

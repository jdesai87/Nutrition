"use client";

import { useState, useEffect } from "react";
import { DayLog } from "@/lib/types";
import { getRecentDays, getSettings, deleteDayLog } from "@/lib/storage";
import { calculateTotals } from "@/lib/summary";
import DaySummaryComponent from "@/components/DaySummary";

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

const MEAL_COLORS: Record<string, string> = {
  breakfast: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  lunch: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  dinner: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  snack: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-400",
};

export default function HistoryPage() {
  const [days, setDays] = useState<DayLog[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayLog | null>(null);
  const settings = getSettings();

  useEffect(() => {
    setDays(getRecentDays(30));
  }, []);

  function handleDeleteDay(date: string) {
    if (!window.confirm("Delete this day?")) return;
    deleteDayLog(date);
    setDays(getRecentDays(30));
    if (selectedDay?.date === date) {
      setSelectedDay(null);
    }
  }

  const RATING_COLORS = {
    excellent: "bg-emerald-500",
    good: "bg-blue-500",
    fair: "bg-amber-500",
    poor: "bg-red-500",
  };

  if (selectedDay) {
    const totals = calculateTotals(selectedDay.entries);
    return (
      <div className="px-4 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedDay(null)}
              className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {new Date(selectedDay.date + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h1>
              <p className="text-xs text-zinc-500">{selectedDay.entries.length} items logged</p>
            </div>
          </div>
          <button
            onClick={() => handleDeleteDay(selectedDay.date)}
            className="p-2 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            aria-label="Delete day"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {selectedDay.summary ? (
          <DaySummaryComponent summary={selectedDay.summary} />
        ) : (
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{Math.round(totals.calories)}</p>
              <p className="text-xs text-zinc-400">Calories</p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{Math.round(totals.protein)}g</p>
              <p className="text-xs text-zinc-400">Protein</p>
            </div>
          </div>
        )}

        {/* Day's food entries with meal badges */}
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Food Log</h3>
          {selectedDay.entries.map((entry) => (
            <div key={entry.id} className="flex justify-between items-center py-2.5 px-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize">{entry.name}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${MEAL_COLORS[entry.meal] || ""}`}>
                    {MEAL_LABELS[entry.meal] || entry.meal}
                  </span>
                </div>
              </div>
              <div className="text-xs text-zinc-500 text-right">
                <p>{entry.calories} cal</p>
                <p className="text-emerald-600 dark:text-emerald-400">{entry.protein}g protein</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">History</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Your recent days</p>
      </div>

      {days.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <p className="text-lg mb-1">No history yet</p>
          <p className="text-sm">Start logging food to see your history here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {days.map((day) => {
            const totals = calculateTotals(day.entries);
            const caloriePercent = Math.round((totals.calories / settings.calorieTarget) * 100);
            const proteinPercent = Math.round((totals.protein / settings.proteinTarget) * 100);

            return (
              <div
                key={day.date}
                className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <button
                  onClick={() => setSelectedDay(day)}
                  className="flex-1 text-left p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {new Date(day.date + "T12:00:00").toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-zinc-400">{day.entries.length} items</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {day.submitted && day.summary && (
                        <span className={`w-2 h-2 rounded-full ${RATING_COLORS[day.summary.rating]}`} />
                      )}
                      {!day.submitted && (
                        <span className="text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                          Not submitted
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className={`${caloriePercent > 110 ? "text-red-500" : "text-zinc-500"}`}>
                      {Math.round(totals.calories)} cal ({caloriePercent}%)
                    </span>
                    <span className={`${proteinPercent >= 90 ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500"}`}>
                      {Math.round(totals.protein)}g protein ({proteinPercent}%)
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => handleDeleteDay(day.date)}
                  className="p-4 text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  aria-label="Delete day"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

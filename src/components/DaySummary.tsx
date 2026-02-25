"use client";

import { DaySummary as DaySummaryType } from "@/lib/types";

interface DaySummaryProps {
  summary: DaySummaryType;
}

const RATING_CONFIG = {
  excellent: { label: "Excellent", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800" },
  good: { label: "Good", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800" },
  fair: { label: "Fair", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800" },
  poor: { label: "Needs Work", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800" },
};

export default function DaySummary({ summary }: DaySummaryProps) {
  const config = RATING_CONFIG[summary.rating];

  return (
    <div className="space-y-4">
      {/* Rating */}
      <div className={`text-center py-4 rounded-xl ${config.bg} border ${config.border}`}>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Day Rating</p>
        <p className={`text-2xl font-bold ${config.color}`}>{config.label}</p>
      </div>

      {/* Macro summary — calories + protein only */}
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{summary.totalCalories}</p>
          <p className="text-xs text-zinc-400">Calories</p>
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary.totalProtein}g</p>
          <p className="text-xs text-zinc-400">Protein</p>
        </div>
      </div>

      {/* Feedback */}
      {summary.feedback.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">What went well</h4>
          {summary.feedback.map((f, i) => (
            <p key={i} className="text-sm text-zinc-600 dark:text-zinc-400 pl-3 border-l-2 border-emerald-300 dark:border-emerald-700">
              {f}
            </p>
          ))}
        </div>
      )}

      {/* Improvements */}
      {summary.improvements.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Areas to improve</h4>
          {summary.improvements.map((imp, i) => (
            <p key={i} className="text-sm text-zinc-600 dark:text-zinc-400 pl-3 border-l-2 border-amber-300 dark:border-amber-700">
              {imp}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

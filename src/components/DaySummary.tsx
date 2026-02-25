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

const BAR_COLORS: Record<string, { fill: string; over: string }> = {
  Calories: { fill: "bg-zinc-600 dark:bg-zinc-400", over: "bg-red-500" },
  Protein: { fill: "bg-emerald-500", over: "bg-emerald-500" },
  Carbs: { fill: "bg-blue-500", over: "bg-amber-500" },
  Fat: { fill: "bg-amber-500", over: "bg-red-500" },
};

export default function DaySummary({ summary }: DaySummaryProps) {
  const config = RATING_CONFIG[summary.rating];
  const macroInsights = summary.macroInsights || [];
  const tomorrowTweaks = summary.tomorrowTweaks || [];

  return (
    <div className="space-y-5">
      {/* Rating */}
      <div className={`text-center py-4 rounded-xl ${config.bg} border ${config.border}`}>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Day Rating</p>
        <p className={`text-2xl font-bold ${config.color}`}>{config.label}</p>
      </div>

      {/* Macro breakdown with target bars */}
      {macroInsights.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Macro Breakdown</h4>
          {macroInsights.map((m) => {
            const pct = m.target > 0 ? Math.min((m.actual / m.target) * 100, 100) : 0;
            const isOver = m.actual > m.target;
            const colors = BAR_COLORS[m.label] || BAR_COLORS.Calories;
            return (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-600 dark:text-zinc-400">{m.label}</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-medium">
                    {m.actual}{m.unit}
                    <span className="text-zinc-400"> / {m.target}{m.unit}</span>
                  </span>
                </div>
                <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isOver ? colors.over : colors.fill}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

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

      {/* Tomorrow tweaks */}
      {tomorrowTweaks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Tomorrow, try this</h4>
          {tomorrowTweaks.map((tweak, i) => (
            <p key={i} className="text-sm text-zinc-600 dark:text-zinc-400 pl-3 border-l-2 border-blue-300 dark:border-blue-700">
              {tweak}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

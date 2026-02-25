"use client";

import { useState, useEffect } from "react";
import { UserSettings, ActivityLevel, GoalAggressiveness } from "@/lib/types";
import { getSettings, saveSettings, DEFAULT_SETTINGS, calculateTargets } from "@/lib/storage";

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: "sedentary", label: "Sedentary", desc: "Desk job, little exercise" },
  { value: "light", label: "Lightly Active", desc: "1-3 days/week" },
  { value: "moderate", label: "Moderate", desc: "3-5 days/week" },
  { value: "active", label: "Very Active", desc: "6-7 days/week" },
];

const GOAL_OPTIONS: { value: GoalAggressiveness; label: string; desc: string }[] = [
  { value: "conservative", label: "Slow & Steady", desc: "~0.6 lb/week, 300 cal deficit" },
  { value: "moderate", label: "Moderate", desc: "~1 lb/week, 500 cal deficit" },
  { value: "aggressive", label: "Aggressive", desc: "~1.5 lb/week, 750 cal deficit" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  function recalcFromWeight(weight: number, activity: ActivityLevel, goal: GoalAggressiveness) {
    if (weight <= 0) return;
    const targets = calculateTargets(weight, activity, goal);
    setSettings((s) => ({ ...s, weight, activityLevel: activity, goalAggressiveness: goal, ...targets }));
  }

  function handleSave() {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleClearData() {
    if (window.confirm("This will delete all your nutrition data. Are you sure?")) {
      localStorage.removeItem("nutrition_days");
      window.alert("All day logs have been cleared.");
    }
  }

  const hasWeight = settings.weight > 0;

  return (
    <div className="px-4 pt-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Your targets are calculated from your weight and goal</p>
      </div>

      {/* Weight & Body */}
      <div className="space-y-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Your Body</h2>

        <div>
          <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Current Weight (lbs)</label>
          <input
            type="number"
            value={settings.weight || ""}
            placeholder="e.g. 185"
            onChange={(e) => {
              const w = parseInt(e.target.value) || 0;
              setSettings((s) => ({ ...s, weight: w }));
              if (w > 0) recalcFromWeight(w, settings.activityLevel, settings.goalAggressiveness);
            }}
            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-2">Activity Level</label>
          <div className="grid grid-cols-2 gap-2">
            {ACTIVITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setSettings((s) => ({ ...s, activityLevel: opt.value }));
                  if (settings.weight > 0) recalcFromWeight(settings.weight, opt.value, settings.goalAggressiveness);
                }}
                className={`text-left p-3 rounded-xl border transition-colors ${
                  settings.activityLevel === opt.value
                    ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{opt.label}</p>
                <p className="text-[10px] text-zinc-400">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Goal */}
      <div className="space-y-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Fat Loss Goal</h2>
        <div className="space-y-2">
          {GOAL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setSettings((s) => ({ ...s, goalAggressiveness: opt.value }));
                if (settings.weight > 0) recalcFromWeight(settings.weight, settings.activityLevel, opt.value);
              }}
              className={`w-full text-left p-3 rounded-xl border transition-colors ${
                settings.goalAggressiveness === opt.value
                  ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
              }`}
            >
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{opt.label}</p>
              <p className="text-xs text-zinc-400">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Calculated Targets */}
      <div className="space-y-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Your Targets</h2>
          {hasWeight && (
            <span className="text-[10px] text-zinc-400">Auto-calculated from weight</span>
          )}
        </div>

        {hasWeight && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center">
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{settings.calorieTarget}</p>
              <p className="text-[10px] text-zinc-400">Calories</p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center">
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{settings.proteinTarget}g</p>
              <p className="text-[10px] text-zinc-400">Protein</p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{settings.carbTarget}g</p>
              <p className="text-[10px] text-zinc-400">Carbs</p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center">
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{settings.fatTarget}g</p>
              <p className="text-[10px] text-zinc-400">Fat</p>
            </div>
          </div>
        )}

        {!hasWeight && (
          <p className="text-xs text-zinc-400">Enter your weight above to auto-calculate, or set manually below.</p>
        )}

        <details className="group">
          <summary className="text-xs text-zinc-400 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300">
            Manual override
          </summary>
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Calories</label>
              <input
                type="number"
                value={settings.calorieTarget}
                onChange={(e) => setSettings({ ...settings, calorieTarget: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Protein (g)</label>
              <input
                type="number"
                value={settings.proteinTarget}
                onChange={(e) => setSettings({ ...settings, proteinTarget: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Carbs (g)</label>
              <input
                type="number"
                value={settings.carbTarget}
                onChange={(e) => setSettings({ ...settings, carbTarget: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Fat (g)</label>
              <input
                type="number"
                value={settings.fatTarget}
                onChange={(e) => setSettings({ ...settings, fatTarget: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>
          </div>
        </details>

        <button
          onClick={handleSave}
          className={`w-full py-3 font-semibold rounded-xl text-sm transition-colors ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
          }`}
        >
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>

      {/* Danger zone */}
      <div className="space-y-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Data</h2>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex-1 py-2.5 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-colors"
          >
            Reset Targets
          </button>
          <button
            onClick={handleClearData}
            className="flex-1 py-2.5 text-sm text-red-500 hover:text-red-700 border border-red-200 dark:border-red-800 rounded-xl transition-colors"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { UserSettings } from "@/lib/types";
import { getSettings, saveSettings, DEFAULT_SETTINGS } from "@/lib/storage";

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

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

  return (
    <div className="px-4 pt-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Customize your targets</p>
      </div>

      {/* Targets */}
      <div className="space-y-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Daily Targets</h2>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Calorie Target</label>
            <input
              type="number"
              value={settings.calorieTarget}
              onChange={(e) => setSettings({ ...settings, calorieTarget: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Protein Target (g)</label>
            <input
              type="number"
              value={settings.proteinTarget}
              onChange={(e) => setSettings({ ...settings, proteinTarget: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
          </div>
        </div>

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

      {/* Quick presets */}
      <div className="space-y-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Quick Presets</h2>
        <div className="space-y-2">
          <button
            onClick={() => {
              setSettings({ ...settings, calorieTarget: 1500, proteinTarget: 130 });
            }}
            className="w-full text-left p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Aggressive Cut</p>
            <p className="text-xs text-zinc-400">1500 cal / 130g protein</p>
          </button>
          <button
            onClick={() => {
              setSettings({ ...settings, calorieTarget: 1800, proteinTarget: 150 });
            }}
            className="w-full text-left p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Moderate Cut</p>
            <p className="text-xs text-zinc-400">1800 cal / 150g protein</p>
          </button>
          <button
            onClick={() => {
              setSettings({ ...settings, calorieTarget: 2000, proteinTarget: 150 });
            }}
            className="w-full text-left p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Mild Deficit</p>
            <p className="text-xs text-zinc-400">2000 cal / 150g protein</p>
          </button>
          <button
            onClick={() => {
              setSettings({ ...settings, calorieTarget: 2500, proteinTarget: 180 });
            }}
            className="w-full text-left p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Active / Maintenance</p>
            <p className="text-xs text-zinc-400">2500 cal / 180g protein</p>
          </button>
        </div>
        <p className="text-[10px] text-zinc-400">Tap a preset, then hit Save Settings above</p>
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

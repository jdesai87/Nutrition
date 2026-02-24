"use client";

import { useState, useRef, useEffect } from "react";
import { MealType } from "@/lib/types";
import { searchFoods, NutritionInfo, parseFoodInput, parseNaturalLanguage } from "@/lib/nutrition";

interface FoodInputProps {
  onAdd: (food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    meal: MealType;
  }) => void;
}

export default function FoodInput({ onAdd }: FoodInputProps) {
  const [query, setQuery] = useState("");
  const [meal, setMeal] = useState<MealType>(() => {
    const hour = new Date().getHours();
    if (hour < 11) return "breakfast";
    if (hour < 15) return "lunch";
    if (hour < 20) return "dinner";
    return "snack";
  });
  const [results, setResults] = useState<NutritionInfo[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualCals, setManualCals] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualFat, setManualFat] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (query.length >= 2) {
      const { multiplier } = parseNaturalLanguage(query);
      const found = searchFoods(query);
      // Apply multiplier to dropdown results so users see accurate values
      const adjusted = multiplier !== 1
        ? found.map(f => ({
            ...f,
            calories: Math.round(f.calories * multiplier),
            protein: Math.round(f.protein * multiplier * 10) / 10,
            carbs: Math.round(f.carbs * multiplier * 10) / 10,
            fat: Math.round(f.fat * multiplier * 10) / 10,
            serving: `${multiplier}x ${f.serving}`,
          }))
        : found;
      setResults(adjusted.slice(0, 6));
      setShowResults(adjusted.length > 0);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectFood(food: NutritionInfo) {
    onAdd({
      name: query.trim() || food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      meal,
    });
    setQuery("");
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    if (manualMode) {
      if (!manualCals) return;
      onAdd({
        name: query.trim(),
        calories: parseFloat(manualCals) || 0,
        protein: parseFloat(manualProtein) || 0,
        carbs: parseFloat(manualCarbs) || 0,
        fat: parseFloat(manualFat) || 0,
        meal,
      });
      setManualCals("");
      setManualProtein("");
      setManualCarbs("");
      setManualFat("");
    } else {
      const parsed = parseFoodInput(query);
      if (parsed) {
        onAdd({
          name: parsed.name,
          calories: parsed.calories,
          protein: parsed.protein,
          carbs: parsed.carbs,
          fat: parsed.fat,
          meal,
        });
      } else {
        // If not found, switch to manual mode
        setManualMode(true);
        return;
      }
    }

    setQuery("");
    setShowResults(false);
    inputRef.current?.focus();
  }

  const meals: { value: MealType; label: string }[] = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "snack", label: "Snack" },
  ];

  return (
    <div className="space-y-3">
      {/* Meal selector */}
      <div className="flex gap-1.5">
        {meals.map((m) => (
          <button
            key={m.value}
            onClick={() => setMeal(m.value)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              meal === m.value
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Food input */}
      <form onSubmit={handleSubmit} className="relative" ref={dropdownRef}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (manualMode) setManualMode(false);
            }}
            placeholder='Try "2 slices of bread" or "4 eggs"'
            className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent placeholder:text-zinc-400"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Add
          </button>
        </div>

        {/* Search results dropdown */}
        {showResults && !manualMode && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden">
            {results.map((food, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectFood(food)}
                className="w-full px-4 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700/50 flex justify-between items-center border-b border-zinc-100 dark:border-zinc-700 last:border-0"
              >
                <div>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize">{food.name}</span>
                  <span className="text-xs text-zinc-400 ml-2">{food.serving}</span>
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 space-x-2">
                  <span>{food.calories} cal</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{food.protein}g P</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Manual entry mode */}
      {manualMode && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            &ldquo;{query}&rdquo; not found in database. Enter nutrition info manually:
          </p>
          <div className="grid grid-cols-4 gap-2">
            <input
              type="number"
              placeholder="Calories*"
              value={manualCals}
              onChange={(e) => setManualCals(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
            <input
              type="number"
              placeholder="Protein (g)"
              value={manualProtein}
              onChange={(e) => setManualProtein(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
            <input
              type="number"
              placeholder="Carbs (g)"
              value={manualCarbs}
              onChange={(e) => setManualCarbs(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
            <input
              type="number"
              placeholder="Fat (g)"
              value={manualFat}
              onChange={(e) => setManualFat(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setManualMode(!manualMode)}
        className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
      >
        {manualMode ? "Switch to search mode" : "Enter manually instead"}
      </button>
    </div>
  );
}

import { DaySummary, FoodEntry, UserSettings, MacroTotals } from "./types";

export function calculateTotals(entries: FoodEntry[]): MacroTotals {
  return entries.reduce(
    (totals, entry) => ({
      calories: totals.calories + entry.calories,
      protein: totals.protein + entry.protein,
      carbs: totals.carbs + entry.carbs,
      fat: totals.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function generateSummary(
  entries: FoodEntry[],
  settings: UserSettings
): DaySummary {
  const totals = calculateTotals(entries);

  const caloriePercent = (totals.calories / settings.calorieTarget) * 100;
  const proteinPercent = (totals.protein / settings.proteinTarget) * 100;

  const feedback: string[] = [];
  const improvements: string[] = [];

  // Calories — the energy equation is simple: deficit = fat loss
  if (caloriePercent >= 90 && caloriePercent <= 110) {
    feedback.push("Hit your calorie target. Consistency here is what drives results.");
  } else if (caloriePercent < 90 && caloriePercent >= 70) {
    feedback.push("Solid deficit today. That's how fat loss happens.");
  } else if (caloriePercent < 70) {
    feedback.push("Big deficit today.");
    improvements.push("Undereating slows metabolism and costs muscle. Get closer to your target.");
  } else {
    const over = Math.round(totals.calories - settings.calorieTarget);
    feedback.push(`${over} cal over target.`);
    if (over > 300) {
      improvements.push("One day over won't matter. Just get back on track tomorrow.");
    }
  }

  // Protein — the muscle-sparing macro. Non-negotiable during a cut.
  if (proteinPercent >= 90) {
    feedback.push(`${Math.round(totals.protein)}g protein — that's protecting your muscle.`);
  } else if (proteinPercent >= 70) {
    improvements.push(`${Math.round(totals.protein)}g protein is okay, but ${settings.proteinTarget}g keeps muscle. Add a shake or eggs.`);
  } else {
    improvements.push(`Only ${Math.round(totals.protein)}g protein. Muscle needs at least ${settings.proteinTarget}g. Make protein the priority at every meal.`);
  }

  // Meal patterns — practical observations only
  const mealCounts = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
  entries.forEach((e) => mealCounts[e.meal]++);

  if (mealCounts.breakfast === 0 && proteinPercent < 90) {
    improvements.push("Skipping breakfast makes it harder to hit protein. Even eggs or yogurt helps.");
  }

  if (mealCounts.snack > 3) {
    improvements.push("Lots of snacking — easier to overshoot calories when grazing. Try fewer, bigger meals.");
  }

  // Rating
  let rating: DaySummary["rating"];
  if (caloriePercent <= 110 && proteinPercent >= 90 && improvements.length <= 1) {
    rating = "excellent";
  } else if (caloriePercent <= 120 && proteinPercent >= 70 && improvements.length <= 2) {
    rating = "good";
  } else if (caloriePercent <= 135 || improvements.length <= 3) {
    rating = "fair";
  } else {
    rating = "poor";
  }

  return {
    totalCalories: Math.round(totals.calories),
    totalProtein: Math.round(totals.protein * 10) / 10,
    totalCarbs: Math.round(totals.carbs * 10) / 10,
    totalFat: Math.round(totals.fat * 10) / 10,
    rating,
    feedback,
    improvements,
  };
}

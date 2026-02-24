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

  const calorieDiff = totals.calories - settings.calorieTarget;
  const caloriePercent = (totals.calories / settings.calorieTarget) * 100;
  const proteinPercent = (totals.protein / settings.proteinTarget) * 100;

  const feedback: string[] = [];
  const improvements: string[] = [];

  // Calorie assessment
  if (caloriePercent >= 90 && caloriePercent <= 110) {
    feedback.push("You nailed your calorie target today.");
  } else if (caloriePercent < 90) {
    const deficit = settings.calorieTarget - totals.calories;
    feedback.push(`You were ${Math.round(deficit)} calories under target. A slight deficit supports weight loss, but don't undereat.`);
    if (caloriePercent < 70) {
      improvements.push("Eating too few calories can slow your metabolism. Try to get closer to your target.");
    }
  } else {
    feedback.push(`You went ${Math.round(calorieDiff)} calories over target.`);
    if (calorieDiff > 300) {
      improvements.push("Try to plan meals ahead to stay within your calorie budget.");
    }
  }

  // Protein assessment
  if (proteinPercent >= 90) {
    feedback.push(`Great protein intake at ${Math.round(totals.protein)}g! This helps preserve muscle during weight loss.`);
  } else if (proteinPercent >= 70) {
    feedback.push(`Protein was decent at ${Math.round(totals.protein)}g but below your ${settings.proteinTarget}g target.`);
    improvements.push("Add a protein-rich snack like Greek yogurt or a protein shake to hit your target.");
  } else {
    feedback.push(`Protein was low at ${Math.round(totals.protein)}g (target: ${settings.proteinTarget}g).`);
    improvements.push("Prioritize protein at every meal. Aim for 25-40g per meal with lean meats, eggs, or dairy.");
  }

  // Meal distribution
  const mealCounts = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
  entries.forEach((e) => mealCounts[e.meal]++);

  if (mealCounts.breakfast === 0) {
    improvements.push("You skipped breakfast. A protein-rich breakfast helps control hunger throughout the day.");
  }

  if (mealCounts.snack > 3) {
    improvements.push("Lots of snacking today. Try to consolidate into planned meals to better track intake.");
  }

  // Fat and carb balance
  const fatPercent = ((totals.fat * 9) / Math.max(totals.calories, 1)) * 100;
  if (fatPercent > 40) {
    improvements.push("Fat intake was high today. Try swapping some fatty foods for lean protein sources.");
  }

  // Overall good habits
  if (entries.some((e) => e.name.toLowerCase().includes("salad") || e.name.toLowerCase().includes("vegetable") || e.name.toLowerCase().includes("broccoli") || e.name.toLowerCase().includes("spinach"))) {
    feedback.push("Good job including vegetables today.");
  } else {
    improvements.push("Try to include more vegetables for fiber and micronutrients.");
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

import { DaySummary, FoodEntry, UserSettings, MacroTotals, MacroInsight } from "./types";

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
  const tomorrowTweaks: string[] = [];

  // Calories — energy balance is the foundation
  if (caloriePercent >= 90 && caloriePercent <= 110) {
    feedback.push("Nailed your calorie target. That's the habit that matters most — keep showing up like this.");
  } else if (caloriePercent < 90 && caloriePercent >= 70) {
    feedback.push("Good deficit today. Your body's using stored fat for the difference — that's the goal.");
  } else if (caloriePercent < 70) {
    feedback.push("Way under target today.");
    improvements.push("Your body will slow down to conserve energy if you undereat. That works against you.");
    tomorrowTweaks.push(`Add ~${Math.round(settings.calorieTarget - totals.calories)} more cal. A handful of nuts, an extra egg, or a bigger portion at dinner.`);
  } else {
    const over = Math.round(totals.calories - settings.calorieTarget);
    feedback.push(`${over} cal over target.`);
    if (over > 300) {
      improvements.push("One bad day doesn't undo weeks of work. What matters is what you do tomorrow.");
    }
    // Identify the biggest item — give a specific swap idea
    const sorted = [...entries].sort((a, b) => b.calories - a.calories);
    if (sorted.length > 0) {
      const biggest = sorted[0];
      tomorrowTweaks.push(`"${biggest.name}" was ${biggest.calories} cal — your biggest item. Smaller portion or a lighter swap saves you ${Math.round(biggest.calories * 0.3)}+ cal.`);
    }
  }

  // Protein — the one macro worth obsessing over
  if (proteinPercent >= 90) {
    feedback.push(`${Math.round(totals.protein)}g protein. You're keeping your muscle while losing fat — that's the whole game.`);
  } else if (proteinPercent >= 70) {
    const gap = Math.round(settings.proteinTarget - totals.protein);
    improvements.push(`${Math.round(totals.protein)}g protein — close but not enough. You need ${settings.proteinTarget}g to preserve muscle in a deficit.`);
    tomorrowTweaks.push(`${gap}g short on protein. One chicken breast (40g) or a shake (25g) closes that gap.`);
  } else {
    const gap = Math.round(settings.proteinTarget - totals.protein);
    improvements.push(`Only ${Math.round(totals.protein)}g protein. When protein is this low, your body breaks down muscle for energy. That's what we're avoiding.`);
    tomorrowTweaks.push(`${gap}g gap to fill. Build every meal around protein first — eggs at breakfast, chicken at lunch, fish at dinner.`);
  }

  // Meal patterns
  const mealCounts = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
  entries.forEach((e) => mealCounts[e.meal]++);

  if (mealCounts.breakfast === 0 && proteinPercent < 90) {
    improvements.push("No breakfast logged. That's one less chance to get protein in. Hard to catch up later.");
    tomorrowTweaks.push("Even a quick breakfast — 3 eggs (18g) or Greek yogurt (15g) — makes hitting protein way easier.");
  }

  if (mealCounts.snack > 3) {
    improvements.push("4+ snacks today. Grazing makes it hard to track what's going in. Structured meals keep you honest.");
  }

  // Meal balance — one heavy meal usually means compensating later
  const mealCalories: Record<string, number> = {};
  entries.forEach((e) => {
    mealCalories[e.meal] = (mealCalories[e.meal] || 0) + e.calories;
  });
  const heaviest = Object.entries(mealCalories).sort((a, b) => b[1] - a[1])[0];
  if (heaviest && totals.calories > 0 && heaviest[1] / totals.calories > 0.55) {
    const mealLabel = heaviest[0].charAt(0).toUpperCase() + heaviest[0].slice(1);
    tomorrowTweaks.push(`${mealLabel} was ${Math.round((heaviest[1] / totals.calories) * 100)}% of your day's calories. Spreading meals out keeps energy steady and hunger in check.`);
  }

  // Fat analysis — too much fat = calorie dense, easy to overshoot
  const fatPercent = totals.calories > 0 ? ((totals.fat * 9) / totals.calories) * 100 : 0;
  if (fatPercent > 40 && caloriePercent > 100) {
    tomorrowTweaks.push("Fat was over 40% of your calories. Fat is 9 cal/g vs 4 for protein/carbs — small swaps make a big difference. Try cooking spray instead of oil, leaner cuts of meat.");
  }

  // Carb analysis — low carbs can tank energy, high carbs can spike hunger
  const carbPercent = (totals.carbs / Math.max(settings.carbTarget, 1)) * 100;
  if (carbPercent < 50 && caloriePercent < 90) {
    tomorrowTweaks.push("Very low carbs today. If energy felt off, add rice, oats, or fruit — carbs fuel your workouts and keep you from feeling drained.");
  } else if (carbPercent > 130 && caloriePercent > 100) {
    tomorrowTweaks.push("Carbs were high. Swap some refined carbs (bread, pasta, rice) for protein — it's more filling per calorie and protects muscle.");
  }

  // Protein per meal analysis — spread protein for better absorption
  const mealProtein: Record<string, number> = {};
  entries.forEach((e) => {
    mealProtein[e.meal] = (mealProtein[e.meal] || 0) + e.protein;
  });
  const mealProteinEntries = Object.entries(mealProtein);
  const lowProteinMeals = mealProteinEntries.filter(([, p]) => p < 20);
  if (lowProteinMeals.length > 0 && proteinPercent < 90) {
    const mealNames = lowProteinMeals.map(([m]) => m.charAt(0).toUpperCase() + m.slice(1)).join(" and ");
    tomorrowTweaks.push(`${mealNames} had under 20g protein. Aim for 25-40g per meal — your body can only use so much at once, so spreading it out works better.`);
  }

  // Lowest protein entry swap — find the weakest link
  const lowProteinEntries = entries.filter((e) => e.calories > 150 && e.protein < 10);
  if (lowProteinEntries.length > 0 && proteinPercent < 90) {
    const worst = lowProteinEntries.sort((a, b) => b.calories - a.calories)[0];
    tomorrowTweaks.push(`"${worst.name}" was ${worst.calories} cal but only ${worst.protein}g protein. Swapping for something protein-rich saves calories and builds muscle.`);
  }

  // Macro insights with targets
  const macroInsights: MacroInsight[] = [
    { label: "Calories", actual: Math.round(totals.calories), target: settings.calorieTarget, unit: "cal" },
    { label: "Protein", actual: Math.round(totals.protein), target: settings.proteinTarget, unit: "g" },
    { label: "Carbs", actual: Math.round(totals.carbs), target: settings.carbTarget, unit: "g" },
    { label: "Fat", actual: Math.round(totals.fat), target: settings.fatTarget, unit: "g" },
  ];

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
    macroInsights,
    tomorrowTweaks,
  };
}

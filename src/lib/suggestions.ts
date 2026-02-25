import { FoodEntry, MacroTotals, MealType, UserSettings } from "./types";
import { getAllFoods, NutritionInfo } from "./nutrition";

export interface Suggestion {
  food: string;
  reason: string;
  calories: number;
  protein: number;
}

export function getMealSuggestions(
  currentTotals: MacroTotals,
  settings: UserSettings,
  nextMeal: MealType,
  entries: FoodEntry[]
): { suggestions: Suggestion[]; message: string } {
  const remainingCal = settings.calorieTarget - currentTotals.calories;
  const remainingProtein = settings.proteinTarget - currentTotals.protein;
  const proteinPercent = (currentTotals.protein / settings.proteinTarget) * 100;

  // What foods have already been eaten today (normalized names)
  const eatenNames = new Set(
    entries.map((e) => e.name.toLowerCase().replace(/^\d+\s*/, "").trim())
  );

  // Get all foods from database and score them
  const allFoods = getAllFoods();

  // Filter out already-eaten foods and foods that exceed remaining calories
  const available = allFoods.filter((f) => {
    const nameMatch = eatenNames.has(f.name);
    // Also check partial matches (e.g. "chicken breast" matches "chicken breast")
    const partialMatch = Array.from(eatenNames).some(
      (eaten) => eaten.includes(f.name) || f.name.includes(eaten)
    );
    return !nameMatch && !partialMatch && f.calories <= remainingCal + 100;
  });

  // Score foods based on current needs
  function scoreFood(food: NutritionInfo): number {
    let score = 0;
    const proteinPerCal = food.protein / Math.max(food.calories, 1);

    if (remainingProtein > 30) {
      // Heavy protein priority — rank by protein density
      score += proteinPerCal * 500;
      score += food.protein * 2;
    } else if (remainingProtein > 10) {
      // Moderate protein needed
      score += proteinPerCal * 200;
      score += food.protein;
    } else {
      // Protein is good — balanced scoring
      score += 50;
    }

    // Prefer foods that fit within remaining calorie budget
    if (food.calories <= remainingCal) {
      score += 30;
    }
    // Prefer foods that don't use up too much of remaining budget
    if (food.calories <= remainingCal * 0.5) {
      score += 20;
    }

    // Meal-appropriate bonuses
    if (nextMeal === "breakfast") {
      if (["egg", "oatmeal", "oats", "greek yogurt", "banana", "toast", "smoothie", "protein smoothie"].includes(food.name)) {
        score += 40;
      }
    } else if (nextMeal === "snack") {
      if (food.calories <= 250) score += 30;
      if (["protein bar", "protein shake", "greek yogurt", "almonds", "string cheese", "cottage cheese"].includes(food.name)) {
        score += 40;
      }
    } else if (nextMeal === "dinner") {
      if (food.calories >= 200 && food.calories <= 600) score += 20;
    }

    return score;
  }

  const scored = available
    .map((f) => ({ food: f, score: scoreFood(f) }))
    .sort((a, b) => b.score - a.score);

  // Build suggestions from top scored foods
  let suggestions: Suggestion[] = [];
  let message = "";

  if (remainingCal <= 0) {
    message = "You've hit your calorie target. If you're still hungry, go for something very light.";
    const lightOptions = available
      .filter((f) => f.calories <= 100)
      .sort((a, b) => b.protein - a.protein)
      .slice(0, 2);
    suggestions = lightOptions.map((f) => ({
      food: `${f.name} (${f.serving})`,
      reason: `Only ${f.calories} cal`,
      calories: f.calories,
      protein: f.protein,
    }));
    return { suggestions, message };
  }

  if (entries.length === 0) {
    // No food logged yet — suggest getting started
    const mealLabel = nextMeal === "breakfast" ? "breakfast" : nextMeal === "lunch" ? "lunch" : "your first meal";
    message = `Start your day! Aim for ~${Math.round(remainingProtein)}g protein across your meals.`;
    if (nextMeal === "breakfast") {
      message = `Good morning! Aim for a high-protein ${mealLabel} to start strong.`;
    }
  } else if (remainingProtein > 40 && remainingCal > 300) {
    message = `Still need ~${Math.round(remainingProtein)}g protein with ${Math.round(remainingCal)} cal left. Prioritize protein-rich foods.`;
  } else if (remainingProtein > 15) {
    message = `${Math.round(remainingProtein)}g protein and ${Math.round(remainingCal)} cal to go. You're getting close!`;
  } else if (remainingProtein <= 15 && remainingProtein > 0) {
    message = `Almost there — just ${Math.round(remainingProtein)}g protein left with ${Math.round(remainingCal)} cal remaining.`;
  } else if (remainingCal < 400) {
    message = `Only ${Math.round(remainingCal)} cal left. Keep it light.`;
  } else {
    message = `On track! ${Math.round(remainingCal)} cal and ${Math.round(Math.max(remainingProtein, 0))}g protein remaining.`;
  }

  // Pick top suggestions, avoiding duplicates from same food category
  const seen = new Set<string>();
  for (const item of scored) {
    if (suggestions.length >= 4) break;
    // Avoid showing very similar foods (e.g. "chicken breast" and "grilled chicken")
    const key = item.food.name.split(" ").pop() || item.food.name;
    if (seen.has(key)) continue;
    seen.add(key);

    let reason = "";
    const proteinPerCal = item.food.protein / Math.max(item.food.calories, 1);

    if (proteinPerCal > 0.15) {
      reason = `${item.food.protein}g protein, great ratio`;
    } else if (item.food.protein >= 20) {
      reason = `Solid ${item.food.protein}g protein`;
    } else if (item.food.calories <= 150) {
      reason = "Light option";
    } else {
      reason = `${item.food.protein}g protein, ${item.food.calories} cal`;
    }

    // Add meal-context reasons
    if (nextMeal === "snack" && item.food.calories <= 200) {
      reason = "Good snack — " + reason.charAt(0).toLowerCase() + reason.slice(1);
    }

    suggestions.push({
      food: `${item.food.name} (${item.food.serving})`,
      reason,
      calories: item.food.calories,
      protein: item.food.protein,
    });
  }

  // Meal-specific prefix
  if (nextMeal === "breakfast" && entries.length === 0) {
    message = "Start your day strong! " + message;
  } else if (nextMeal === "dinner") {
    message = "For dinner: " + message;
  }

  // Warn about low protein ratio
  if (proteinPercent < 50 && currentTotals.calories > 500) {
    message += " Your protein is falling behind — focus on lean protein sources.";
  }

  return { suggestions: suggestions.slice(0, 4), message };
}

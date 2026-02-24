import { MacroTotals, MealType, UserSettings } from "./types";

interface Suggestion {
  food: string;
  reason: string;
  calories: number;
  protein: number;
}

const HIGH_PROTEIN_FOODS: Suggestion[] = [
  { food: "Grilled chicken breast (4 oz)", reason: "High protein, low fat", calories: 165, protein: 31 },
  { food: "Greek yogurt (1 cup)", reason: "Great protein snack", calories: 130, protein: 17 },
  { food: "Protein shake", reason: "Quick protein boost", calories: 160, protein: 25 },
  { food: "Cottage cheese (1/2 cup)", reason: "High protein, low calorie", calories: 110, protein: 14 },
  { food: "Turkey breast (4 oz)", reason: "Lean protein source", calories: 135, protein: 30 },
  { food: "Tuna (4 oz)", reason: "Very lean, high protein", calories: 130, protein: 29 },
  { food: "Eggs (2 large)", reason: "Complete protein source", calories: 144, protein: 12 },
  { food: "Salmon (4 oz)", reason: "Protein + healthy fats", calories: 208, protein: 20 },
  { food: "Shrimp (4 oz)", reason: "Ultra-lean protein", calories: 100, protein: 24 },
  { food: "Protein bar", reason: "Convenient on-the-go", calories: 200, protein: 20 },
];

const BALANCED_MEALS: Suggestion[] = [
  { food: "Chicken salad with olive oil dressing", reason: "Balanced macros, filling", calories: 400, protein: 35 },
  { food: "Salmon with brown rice and veggies", reason: "Complete balanced meal", calories: 450, protein: 30 },
  { food: "Turkey wrap with veggies", reason: "Light but satisfying", calories: 350, protein: 25 },
  { food: "Stir fry with tofu/chicken and rice", reason: "Customizable and balanced", calories: 400, protein: 25 },
  { food: "Grilled chicken with sweet potato", reason: "Clean bulk-friendly meal", calories: 380, protein: 35 },
  { food: "Tuna bowl with quinoa", reason: "High protein, complex carbs", calories: 370, protein: 35 },
];

const LOW_CAL_OPTIONS: Suggestion[] = [
  { food: "Large mixed green salad with chicken", reason: "High volume, low calorie", calories: 250, protein: 25 },
  { food: "Egg white omelette with veggies", reason: "Very low calorie, high protein", calories: 150, protein: 20 },
  { food: "Shrimp with steamed broccoli", reason: "Ultra-lean option", calories: 160, protein: 28 },
  { food: "Greek yogurt with berries", reason: "Sweet but nutritious", calories: 170, protein: 17 },
  { food: "Turkey lettuce wraps", reason: "Low carb, high protein", calories: 200, protein: 22 },
];

export function getMealSuggestions(
  currentTotals: MacroTotals,
  settings: UserSettings,
  nextMeal: MealType
): { suggestions: Suggestion[]; message: string } {
  const remainingCal = settings.calorieTarget - currentTotals.calories;
  const remainingProtein = settings.proteinTarget - currentTotals.protein;
  const proteinRatio = currentTotals.protein / Math.max(currentTotals.calories, 1) * 1000;

  let suggestions: Suggestion[] = [];
  let message = "";

  if (remainingCal <= 0) {
    message = "You've reached your calorie target for today. If you're still hungry, stick to zero-calorie beverages or very light options.";
    suggestions = LOW_CAL_OPTIONS.slice(0, 2);
    return { suggestions, message };
  }

  if (remainingProtein > 40 && remainingCal > 300) {
    // Need lots more protein and have calorie budget
    message = `You still need ~${Math.round(remainingProtein)}g protein. Focus on protein-rich options.`;
    suggestions = HIGH_PROTEIN_FOODS
      .filter((s) => s.calories <= remainingCal + 50)
      .slice(0, 4);
  } else if (remainingProtein > 20) {
    // Moderate protein needed
    message = `You need ~${Math.round(remainingProtein)}g more protein with ~${Math.round(remainingCal)} calories remaining.`;
    suggestions = [...HIGH_PROTEIN_FOODS.filter((s) => s.calories <= remainingCal + 50).slice(0, 2),
      ...BALANCED_MEALS.filter((s) => s.calories <= remainingCal + 50).slice(0, 2)];
  } else if (remainingCal < 400) {
    // Low calories remaining
    message = `Only ~${Math.round(remainingCal)} calories left. Keep it light.`;
    suggestions = LOW_CAL_OPTIONS
      .filter((s) => s.calories <= remainingCal + 50)
      .slice(0, 3);
  } else {
    // On track - suggest balanced meals
    message = `You're on track! ~${Math.round(remainingCal)} calories and ~${Math.round(remainingProtein)}g protein remaining.`;
    suggestions = BALANCED_MEALS
      .filter((s) => s.calories <= remainingCal + 50)
      .slice(0, 3);
  }

  if (proteinRatio < 70 && currentTotals.calories > 500) {
    message += " Your protein ratio is low - prioritize protein-rich foods.";
  }

  // Add meal-specific context
  if (nextMeal === "breakfast") {
    message = "Start your day strong! " + message;
  } else if (nextMeal === "dinner") {
    message = "For your last main meal: " + message;
  }

  return { suggestions: suggestions.slice(0, 4), message };
}

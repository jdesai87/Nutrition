export interface NutritionInfo {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

// Quantity words for natural language parsing
const QUANTITY_WORDS: Record<string, number> = {
  'a': 1, 'an': 1, 'one': 1,
  'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'half': 0.5, 'quarter': 0.25,
};

// Unit words that get stripped to find the actual food name
const UNIT_WORDS = new Set([
  'slice', 'slices', 'piece', 'pieces', 'serving', 'servings',
  'cup', 'cups', 'bowl', 'bowls', 'scoop', 'scoops',
  'glass', 'glasses', 'can', 'cans', 'bottle', 'bottles',
  'stick', 'sticks', 'strip', 'strips', 'link', 'links',
  'patty', 'patties', 'handful', 'handfuls',
  'plate', 'plates', 'bar', 'bars',
]);

const FILLER_WORDS = new Set(['of', 'the', 'some', 'with']);

// Common foods database with nutrition per SINGLE serving unit
const FOOD_DATABASE: NutritionInfo[] = [
  // Proteins
  { name: "chicken breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: "4 oz" },
  { name: "grilled chicken", calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: "4 oz" },
  { name: "salmon", calories: 208, protein: 20, carbs: 0, fat: 13, serving: "4 oz" },
  { name: "grilled salmon", calories: 208, protein: 20, carbs: 0, fat: 13, serving: "4 oz" },
  { name: "tuna", calories: 130, protein: 29, carbs: 0, fat: 1, serving: "4 oz" },
  { name: "shrimp", calories: 100, protein: 24, carbs: 0, fat: 0.3, serving: "4 oz" },
  { name: "steak", calories: 271, protein: 26, carbs: 0, fat: 18, serving: "6 oz" },
  { name: "ground beef", calories: 250, protein: 26, carbs: 0, fat: 15, serving: "4 oz" },
  { name: "ground turkey", calories: 170, protein: 21, carbs: 0, fat: 9, serving: "4 oz" },
  { name: "turkey breast", calories: 135, protein: 30, carbs: 0, fat: 1, serving: "4 oz" },
  { name: "pork chop", calories: 231, protein: 27, carbs: 0, fat: 13, serving: "5 oz" },
  { name: "tofu", calories: 144, protein: 15, carbs: 3.5, fat: 8, serving: "1/2 block" },
  { name: "tempeh", calories: 195, protein: 20, carbs: 8, fat: 11, serving: "4 oz" },

  // Eggs & Dairy — "egg" is 1 large egg
  { name: "egg", calories: 72, protein: 6, carbs: 0.4, fat: 5, serving: "1 large" },
  { name: "scrambled egg", calories: 91, protein: 6, carbs: 1, fat: 7, serving: "1 large" },
  { name: "boiled egg", calories: 72, protein: 6, carbs: 0.4, fat: 5, serving: "1 large" },
  { name: "greek yogurt", calories: 130, protein: 17, carbs: 6, fat: 4, serving: "1 cup" },
  { name: "yogurt", calories: 150, protein: 8, carbs: 20, fat: 4, serving: "1 cup" },
  { name: "cottage cheese", calories: 110, protein: 14, carbs: 5, fat: 4, serving: "1/2 cup" },
  { name: "cheese", calories: 113, protein: 7, carbs: 0.4, fat: 9, serving: "1 oz" },
  { name: "string cheese", calories: 80, protein: 7, carbs: 1, fat: 5, serving: "1 stick" },
  { name: "milk", calories: 150, protein: 8, carbs: 12, fat: 8, serving: "1 cup" },
  { name: "almond milk", calories: 30, protein: 1, carbs: 1, fat: 2.5, serving: "1 cup" },

  // Grains & Bread
  { name: "rice", calories: 205, protein: 4, carbs: 45, fat: 0.4, serving: "1 cup cooked" },
  { name: "white rice", calories: 205, protein: 4, carbs: 45, fat: 0.4, serving: "1 cup cooked" },
  { name: "brown rice", calories: 215, protein: 5, carbs: 45, fat: 1.8, serving: "1 cup cooked" },
  { name: "quinoa", calories: 222, protein: 8, carbs: 39, fat: 4, serving: "1 cup cooked" },
  { name: "pasta", calories: 220, protein: 8, carbs: 43, fat: 1.3, serving: "1 cup cooked" },
  { name: "spaghetti", calories: 220, protein: 8, carbs: 43, fat: 1.3, serving: "1 cup cooked" },
  { name: "bread", calories: 80, protein: 3, carbs: 15, fat: 1, serving: "1 slice" },
  { name: "toast", calories: 80, protein: 3, carbs: 15, fat: 1, serving: "1 slice" },
  { name: "whole wheat bread", calories: 80, protein: 4, carbs: 14, fat: 1, serving: "1 slice" },
  { name: "bagel", calories: 270, protein: 10, carbs: 53, fat: 1.5, serving: "1 medium" },
  { name: "tortilla", calories: 120, protein: 3, carbs: 20, fat: 3, serving: "1 medium" },
  { name: "oatmeal", calories: 150, protein: 5, carbs: 27, fat: 3, serving: "1 cup cooked" },
  { name: "oats", calories: 150, protein: 5, carbs: 27, fat: 3, serving: "1 cup cooked" },
  { name: "cereal", calories: 150, protein: 3, carbs: 33, fat: 1, serving: "1 cup" },
  { name: "granola", calories: 200, protein: 5, carbs: 30, fat: 8, serving: "1/2 cup" },

  // Fruits
  { name: "banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, serving: "1 medium" },
  { name: "apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, serving: "1 medium" },
  { name: "orange", calories: 62, protein: 1.2, carbs: 15, fat: 0.2, serving: "1 medium" },
  { name: "berries", calories: 85, protein: 1, carbs: 21, fat: 0.5, serving: "1 cup" },
  { name: "strawberries", calories: 50, protein: 1, carbs: 12, fat: 0.5, serving: "1 cup" },
  { name: "blueberries", calories: 85, protein: 1, carbs: 21, fat: 0.5, serving: "1 cup" },
  { name: "grapes", calories: 104, protein: 1, carbs: 27, fat: 0.2, serving: "1 cup" },
  { name: "avocado", calories: 240, protein: 3, carbs: 12, fat: 22, serving: "1 whole" },

  // Vegetables
  { name: "salad", calories: 50, protein: 3, carbs: 8, fat: 0.5, serving: "2 cups" },
  { name: "broccoli", calories: 55, protein: 4, carbs: 11, fat: 0.6, serving: "1 cup" },
  { name: "spinach", calories: 7, protein: 1, carbs: 1, fat: 0.1, serving: "1 cup raw" },
  { name: "sweet potato", calories: 103, protein: 2, carbs: 24, fat: 0.1, serving: "1 medium" },
  { name: "potato", calories: 161, protein: 4, carbs: 37, fat: 0.2, serving: "1 medium" },
  { name: "baked potato", calories: 161, protein: 4, carbs: 37, fat: 0.2, serving: "1 medium" },
  { name: "corn", calories: 90, protein: 3, carbs: 19, fat: 1.5, serving: "1 ear" },
  { name: "carrots", calories: 52, protein: 1, carbs: 12, fat: 0.3, serving: "1 cup" },
  { name: "green beans", calories: 34, protein: 2, carbs: 8, fat: 0.1, serving: "1 cup" },

  // Nuts & Seeds
  { name: "almonds", calories: 160, protein: 6, carbs: 6, fat: 14, serving: "1 oz (23 almonds)" },
  { name: "peanut butter", calories: 190, protein: 7, carbs: 7, fat: 16, serving: "2 tbsp" },
  { name: "peanuts", calories: 170, protein: 7, carbs: 6, fat: 14, serving: "1 oz" },
  { name: "walnuts", calories: 185, protein: 4, carbs: 4, fat: 18, serving: "1 oz" },
  { name: "trail mix", calories: 175, protein: 5, carbs: 15, fat: 11, serving: "1/4 cup" },

  // Common Meals
  { name: "chicken sandwich", calories: 400, protein: 30, carbs: 35, fat: 14, serving: "1 sandwich" },
  { name: "turkey sandwich", calories: 350, protein: 25, carbs: 35, fat: 10, serving: "1 sandwich" },
  { name: "burger", calories: 540, protein: 34, carbs: 40, fat: 27, serving: "1 burger" },
  { name: "cheeseburger", calories: 590, protein: 36, carbs: 42, fat: 30, serving: "1 burger" },
  { name: "pizza", calories: 285, protein: 12, carbs: 36, fat: 10, serving: "1 slice" },
  { name: "pizza slice", calories: 285, protein: 12, carbs: 36, fat: 10, serving: "1 slice" },
  { name: "burrito", calories: 500, protein: 22, carbs: 55, fat: 20, serving: "1 burrito" },
  { name: "taco", calories: 210, protein: 9, carbs: 21, fat: 10, serving: "1 taco" },
  { name: "sushi roll", calories: 250, protein: 9, carbs: 38, fat: 7, serving: "6 pieces" },
  { name: "sushi", calories: 250, protein: 9, carbs: 38, fat: 7, serving: "6 pieces" },
  { name: "soup", calories: 150, protein: 8, carbs: 18, fat: 5, serving: "1 bowl" },
  { name: "chicken soup", calories: 150, protein: 12, carbs: 15, fat: 5, serving: "1 bowl" },
  { name: "salad with chicken", calories: 350, protein: 30, carbs: 15, fat: 18, serving: "1 large" },
  { name: "caesar salad", calories: 360, protein: 15, carbs: 20, fat: 24, serving: "1 serving" },
  { name: "stir fry", calories: 350, protein: 25, carbs: 30, fat: 14, serving: "1 plate" },
  { name: "fried rice", calories: 350, protein: 10, carbs: 50, fat: 12, serving: "1 cup" },
  { name: "mac and cheese", calories: 350, protein: 12, carbs: 40, fat: 16, serving: "1 cup" },
  { name: "grilled cheese", calories: 370, protein: 14, carbs: 30, fat: 22, serving: "1 sandwich" },

  // Breakfast items
  { name: "pancake", calories: 117, protein: 3, carbs: 18, fat: 3.3, serving: "1 pancake" },
  { name: "waffle", calories: 210, protein: 5, carbs: 25, fat: 10, serving: "1 waffle" },
  { name: "french toast", calories: 125, protein: 4, carbs: 15, fat: 5, serving: "1 slice" },
  { name: "bacon", calories: 40, protein: 3, carbs: 0, fat: 3, serving: "1 slice" },
  { name: "sausage", calories: 85, protein: 4, carbs: 0.5, fat: 7.5, serving: "1 link" },
  { name: "smoothie", calories: 200, protein: 5, carbs: 40, fat: 2, serving: "1 medium" },
  { name: "protein smoothie", calories: 250, protein: 25, carbs: 30, fat: 5, serving: "1 medium" },

  // Snacks
  { name: "protein bar", calories: 200, protein: 20, carbs: 22, fat: 7, serving: "1 bar" },
  { name: "protein shake", calories: 160, protein: 25, carbs: 8, fat: 3, serving: "1 scoop + water" },
  { name: "chips", calories: 150, protein: 2, carbs: 15, fat: 10, serving: "1 oz" },
  { name: "crackers", calories: 130, protein: 2, carbs: 20, fat: 5, serving: "6 crackers" },
  { name: "hummus", calories: 70, protein: 2, carbs: 6, fat: 5, serving: "2 tbsp" },
  { name: "popcorn", calories: 93, protein: 3, carbs: 19, fat: 1, serving: "3 cups" },
  { name: "dark chocolate", calories: 170, protein: 2, carbs: 13, fat: 12, serving: "1 oz" },
  { name: "ice cream", calories: 270, protein: 5, carbs: 30, fat: 14, serving: "1 cup" },
  { name: "cookie", calories: 160, protein: 2, carbs: 22, fat: 7, serving: "1 large" },
  { name: "brownie", calories: 230, protein: 3, carbs: 30, fat: 12, serving: "1 piece" },
  { name: "donut", calories: 300, protein: 4, carbs: 34, fat: 17, serving: "1 medium" },

  // Drinks
  { name: "coffee", calories: 2, protein: 0, carbs: 0, fat: 0, serving: "1 cup black" },
  { name: "latte", calories: 190, protein: 10, carbs: 18, fat: 7, serving: "1 medium" },
  { name: "cappuccino", calories: 120, protein: 8, carbs: 10, fat: 5, serving: "1 medium" },
  { name: "orange juice", calories: 112, protein: 2, carbs: 26, fat: 0.5, serving: "1 cup" },
  { name: "soda", calories: 140, protein: 0, carbs: 39, fat: 0, serving: "1 can" },
  { name: "beer", calories: 153, protein: 2, carbs: 13, fat: 0, serving: "1 can" },
  { name: "wine", calories: 125, protein: 0, carbs: 4, fat: 0, serving: "5 oz" },
  { name: "water", calories: 0, protein: 0, carbs: 0, fat: 0, serving: "1 glass" },
];

// Convert plural to singular form
function toSingular(word: string): string {
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
  if (word.endsWith('ches') || word.endsWith('shes')) return word.slice(0, -2);
  if (word.endsWith('ses') || word.endsWith('xes') || word.endsWith('zes')) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && !word.endsWith('us') && word.length > 2) {
    return word.slice(0, -1);
  }
  return word;
}

// Convert singular to plural form
function toPlural(word: string): string {
  if (word.endsWith('y') && !['ay', 'ey', 'oy', 'uy'].some(e => word.endsWith(e))) {
    return word.slice(0, -1) + 'ies';
  }
  if (['s', 'x', 'z'].some(e => word.endsWith(e)) || word.endsWith('ch') || word.endsWith('sh')) {
    return word + 'es';
  }
  return word + 's';
}

// Parse natural language input into multiplier + food name
export function parseNaturalLanguage(input: string): { multiplier: number; foodName: string } {
  let q = input.toLowerCase().trim();
  let multiplier = 1;

  // Try numeric multiplier first: "4 eggs", "2.5 cups of rice"
  const numMatch = q.match(/^(\d+(?:\.\d+)?)\s+(.+)/);
  if (numMatch) {
    multiplier = parseFloat(numMatch[1]);
    q = numMatch[2];
  } else {
    // Try word multiplier: "two eggs", "half an avocado"
    const words = q.split(/\s+/);
    if (words.length >= 2 && QUANTITY_WORDS[words[0]] !== undefined) {
      multiplier = QUANTITY_WORDS[words[0]];
      q = words.slice(1).join(' ');
    }
  }

  // Strip unit words and filler words
  const words = q.split(/\s+/);
  const cleaned = words.filter(w => !UNIT_WORDS.has(w) && !FILLER_WORDS.has(w));

  // Strip leading articles
  let foodName = cleaned.join(' ').replace(/^(a|an)\s+/, '').trim();

  // If stripping removed everything, use the pre-stripped version
  if (!foodName) foodName = q;

  return { multiplier, foodName };
}

// Smart search that tries original, singular, and plural variants
function findInDatabase(query: string): NutritionInfo[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  function search(term: string): NutritionInfo[] {
    const exact = FOOD_DATABASE.filter(f => f.name === term);
    if (exact.length > 0) return exact;

    const startsWith = FOOD_DATABASE.filter(f => f.name.startsWith(term));
    if (startsWith.length > 0) return startsWith;

    const contains = FOOD_DATABASE.filter(f => f.name.includes(term));
    if (contains.length > 0) return contains;

    return [];
  }

  // Try original query
  let results = search(q);
  if (results.length > 0) return results;

  // Try singular form (eggs → egg)
  const singular = toSingular(q);
  if (singular !== q) {
    results = search(singular);
    if (results.length > 0) return results;
  }

  // Try plural form (egg → eggs)
  const plural = toPlural(q);
  if (plural !== q) {
    results = search(plural);
    if (results.length > 0) return results;
  }

  // Try singular/plural on individual words for multi-word queries
  const queryWords = q.split(/\s+/);
  if (queryWords.length > 1) {
    // Try singularizing the last word: "scrambled eggs" → "scrambled egg"
    const lastSingular = [...queryWords.slice(0, -1), toSingular(queryWords[queryWords.length - 1])].join(' ');
    if (lastSingular !== q) {
      results = search(lastSingular);
      if (results.length > 0) return results;
    }
  }

  // Word match as fallback
  return FOOD_DATABASE.filter(f =>
    queryWords.some(w => {
      const ws = toSingular(w);
      const wp = toPlural(w);
      return f.name.includes(w) || f.name.includes(ws) || f.name.includes(wp);
    })
  );
}

export function searchFoods(query: string): NutritionInfo[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  // Parse natural language to extract just the food name
  const { foodName } = parseNaturalLanguage(q);

  // Search with the cleaned food name
  let results = findInDatabase(foodName);

  // If no results with cleaned name, try original query
  if (results.length === 0 && foodName !== q) {
    results = findInDatabase(q);
  }

  return results;
}

export function parseFoodInput(input: string): NutritionInfo | null {
  const q = input.toLowerCase().trim();
  if (!q) return null;

  const { multiplier, foodName } = parseNaturalLanguage(q);

  // Search for the food
  let results = findInDatabase(foodName);

  // Fallback: try the original query without NL processing
  if (results.length === 0 && foodName !== q) {
    results = findInDatabase(q);
  }

  if (results.length === 0) return null;

  const match = results[0];
  return {
    name: input.trim(),
    calories: Math.round(match.calories * multiplier),
    protein: Math.round(match.protein * multiplier * 10) / 10,
    carbs: Math.round(match.carbs * multiplier * 10) / 10,
    fat: Math.round(match.fat * multiplier * 10) / 10,
    serving: multiplier !== 1 ? `${multiplier}x ${match.serving}` : match.serving,
  };
}

export function getAllFoods(): NutritionInfo[] {
  return FOOD_DATABASE;
}

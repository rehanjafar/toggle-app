// Rough calorie estimation via substring lookup against a small built-in
// table. This is intentionally not a nutrition database — it's a fast,
// zero-dependency heuristic that gives a ballpark number. See the Diet tab's
// on-screen disclaimer; this should never be presented as accurate.

const CALORIE_TABLE = [
  ["banana", 105], ["apple", 95], ["egg", 78], ["fried egg", 90], ["boiled egg", 78],
  ["rice", 205], ["chicken breast", 165], ["chicken", 220], ["pizza", 285], ["coffee", 5],
  ["latte", 120], ["cappuccino", 100], ["salad", 150], ["sandwich", 350], ["burger", 550],
  ["pasta", 220], ["yogurt", 100], ["greek yogurt", 130], ["oatmeal", 150], ["toast", 80],
  ["avocado", 240], ["chocolate", 210], ["cookie", 150], ["protein shake", 200], ["water", 0],
  ["pancake", 175], ["waffle", 220], ["bacon", 90], ["sausage", 150], ["cereal", 180],
  ["milk", 103], ["orange", 62], ["steak", 420], ["fish", 200], ["salmon", 230],
  ["soup", 170], ["fries", 365], ["chips", 150], ["nuts", 170], ["smoothie", 220],
  ["bagel", 250], ["muffin", 340], ["donut", 260], ["ice cream", 210], ["beer", 150],
  ["wine", 125], ["soda", 140], ["tea", 2], ["granola bar", 140], ["hummus", 70],
];

const FALLBACK_CALORIES = 250;

export function estimateCalories(name) {
  const n = name.toLowerCase();
  for (const [key, cal] of CALORIE_TABLE) if (n.includes(key)) return cal;
  return FALLBACK_CALORIES;
}

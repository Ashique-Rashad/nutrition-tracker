import { FoodItem } from '../models/food-item.model';

const food = (
  id: string,
  name: string,
  servingSize: number,
  servingUnit: FoodItem['servingUnit'],
  calories: number,
  protein: number,
  carbs: number,
): FoodItem => ({
  id,
  name,
  servingSize,
  servingUnit,
  nutrition: { calories, protein, carbs },
  isCustom: false,
});

// Values from PRD.md section 9 (per serving).
export const SEED_FOODS: readonly FoodItem[] = [
  food('boiled-egg', 'Boiled egg', 1, 'piece', 78, 6.3, 0.6),
  food('oats-dry', 'Oats (dry)', 40, 'g', 150, 5.0, 27.0),
  food('whole-milk', 'Whole milk', 240, 'ml', 150, 8.0, 12.0),
  food('banana', 'Banana', 1, 'piece', 105, 1.3, 27.0),
  food('apple', 'Apple', 1, 'piece', 95, 0.5, 25.0),
  food('white-bread', 'White bread', 1, 'piece', 79, 2.7, 15.0),
  food('peanut-butter', 'Peanut butter', 1, 'tbsp', 94, 3.6, 3.2),
  food('plain-yogurt', 'Plain yogurt', 100, 'g', 61, 3.5, 4.7),
  food('white-rice-cooked', 'White rice (cooked)', 100, 'g', 130, 2.7, 28.0),
  food('brown-rice-cooked', 'Brown rice (cooked)', 100, 'g', 123, 2.7, 25.6),
  food('chicken-breast-cooked', 'Chicken breast (cooked)', 100, 'g', 165, 31.0, 0.0),
  food('salmon-cooked', 'Salmon (cooked)', 100, 'g', 206, 22.0, 0.0),
  food('lentils-cooked', 'Lentils (cooked)', 100, 'g', 116, 9.0, 20.0),
  food('chickpeas-cooked', 'Chickpeas (cooked)', 100, 'g', 164, 8.9, 27.4),
  food('potato-boiled', 'Potato (boiled)', 100, 'g', 87, 1.9, 20.1),
  food('broccoli-cooked', 'Broccoli (cooked)', 100, 'g', 35, 2.4, 7.2),
  food('paneer', 'Paneer', 100, 'g', 265, 18.0, 1.2),
  food('tofu', 'Tofu', 100, 'g', 76, 8.0, 1.9),
  food('pasta-cooked', 'Pasta (cooked)', 100, 'g', 158, 5.8, 31.0),
  food('olive-oil', 'Olive oil', 1, 'tbsp', 119, 0.0, 0.0),
  food('almonds', 'Almonds', 28, 'g', 164, 6.0, 6.1),
  food('roti-chapati', 'Roti / chapati', 1, 'piece', 120, 3.1, 18.0),
];

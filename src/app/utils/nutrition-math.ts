import { Nutrition } from '../models/nutrition.model';

export const ZERO_NUTRITION: Nutrition = { calories: 0, protein: 0, carbs: 0 };

export function scaleNutrition(n: Nutrition, factor: number): Nutrition {
  return {
    calories: n.calories * factor,
    protein: n.protein * factor,
    carbs: n.carbs * factor,
  };
}

export function sumNutrition(list: readonly Nutrition[]): Nutrition {
  return list.reduce<Nutrition>(
    (acc, n) => ({
      calories: acc.calories + n.calories,
      protein: acc.protein + n.protein,
      carbs: acc.carbs + n.carbs,
    }),
    { ...ZERO_NUTRITION },
  );
}

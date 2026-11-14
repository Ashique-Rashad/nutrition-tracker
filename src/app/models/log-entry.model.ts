import { MealType } from './meal-type.model';

export interface LogEntry {
  id: string;
  foodId: string;
  meal: MealType;
  servings: number; // > 0
}

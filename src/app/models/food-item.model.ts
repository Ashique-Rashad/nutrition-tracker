import { Nutrition } from './nutrition.model';

export type ServingUnit = 'g' | 'ml' | 'piece' | 'cup' | 'tbsp';

export interface FoodItem {
  id: string;
  name: string;
  servingSize: number;
  servingUnit: ServingUnit;
  nutrition: Nutrition;
  isCustom: boolean;
}

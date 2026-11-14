import { Injectable, computed, inject, signal } from '@angular/core';
import { FoodCatalogStore } from './food-catalog.store';
import { FoodItem } from '../models/food-item.model';
import { MealType } from '../models/meal-type.model';
import { LogEntry } from '../models/log-entry.model';
import { Nutrition } from '../models/nutrition.model';
import { scaleNutrition, sumNutrition } from '../utils/nutrition-math';

export interface ResolvedEntry {
  entry: LogEntry;
  food: FoodItem;
  nutrition: Nutrition;
}

@Injectable({ providedIn: 'root' })
export class FoodLogStore {
  private readonly catalog = inject(FoodCatalogStore);
  private readonly _entries = signal<LogEntry[]>([]);
  readonly entries = this._entries.asReadonly();

  readonly entriesByMeal = computed<Record<MealType, ResolvedEntry[]>>(() => {
    const result: Record<MealType, ResolvedEntry[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
    };
    for (const entry of this._entries()) {
      const food = this.catalog.findById(entry.foodId);
      if (!food) {
        continue;
      }
      result[entry.meal].push({
        entry,
        food,
        nutrition: scaleNutrition(food.nutrition, entry.servings),
      });
    }
    return result;
  });

  readonly mealTotals = computed<Record<MealType, Nutrition>>(() => {
    const byMeal = this.entriesByMeal();
    return {
      breakfast: sumNutrition(byMeal.breakfast.map((e) => e.nutrition)),
      lunch: sumNutrition(byMeal.lunch.map((e) => e.nutrition)),
      dinner: sumNutrition(byMeal.dinner.map((e) => e.nutrition)),
    };
  });

  readonly dayTotals = computed<Nutrition>(() => {
    const totals = this.mealTotals();
    return sumNutrition([totals.breakfast, totals.lunch, totals.dinner]);
  });

  addEntry(foodId: string, meal: MealType, servings: number): void {
    if (servings <= 0) {
      throw new Error('Servings must be greater than 0.');
    }
    const food = this.catalog.findById(foodId);
    if (!food) {
      throw new Error(`Unknown food id "${foodId}".`);
    }
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      foodId,
      meal,
      servings,
    };
    this._entries.update((list) => [...list, entry]);
  }

  removeEntry(entryId: string): void {
    this._entries.update((list) => list.filter((entry) => entry.id !== entryId));
  }
}

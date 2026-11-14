import { Injectable, signal } from '@angular/core';
import { FoodItem } from '../models/food-item.model';
import { SEED_FOODS } from '../data/seed-foods';

export type AddFoodInput = Omit<FoodItem, 'id' | 'isCustom'>;

@Injectable({ providedIn: 'root' })
export class FoodCatalogStore {
  private readonly _foods = signal<FoodItem[]>([...SEED_FOODS]);
  readonly foods = this._foods.asReadonly();

  findById(id: string): FoodItem | undefined {
    return this._foods().find((food) => food.id === id);
  }

  nameExists(name: string): boolean {
    const trimmed = name.trim().toLowerCase();
    if (trimmed === '') {
      return false;
    }
    return this._foods().some((food) => food.name.toLowerCase() === trimmed);
  }

  addFood(input: AddFoodInput): FoodItem {
    const name = input.name.trim();
    if (name === '') {
      throw new Error('Food name must not be empty.');
    }
    if (this.nameExists(name)) {
      throw new Error(`A food named "${name}" already exists.`);
    }
    const food: FoodItem = {
      ...input,
      name,
      id: crypto.randomUUID(),
      isCustom: true,
    };
    this._foods.update((list) => [...list, food]);
    return food;
  }
}

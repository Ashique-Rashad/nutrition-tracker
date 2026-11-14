import { TestBed } from '@angular/core/testing';
import { FoodLogStore } from './food-log.store';
import { FoodCatalogStore } from './food-catalog.store';
import { MealType } from '../models/meal-type.model';
import { ZERO_NUTRITION } from '../utils/nutrition-math';

describe('FoodLogStore', () => {
  let store: FoodLogStore;
  let catalog: FoodCatalogStore;

  // Floating point artifacts are expected in intermediate values (no rounding in
  // logic); totals are compared approximately.
  function expectNutritionClose(
    actual: { calories: number; protein: number; carbs: number },
    expected: { calories: number; protein: number; carbs: number },
  ): void {
    expect(actual.calories).toBeCloseTo(expected.calories, 10);
    expect(actual.protein).toBeCloseTo(expected.protein, 10);
    expect(actual.carbs).toBeCloseTo(expected.carbs, 10);
  }

  beforeEach(() => {
    store = TestBed.inject(FoodLogStore);
    catalog = TestBed.inject(FoodCatalogStore);
  });

  describe('empty state', () => {
    it('starts with no entries', () => {
      expect(store.entries()).toEqual([]);
    });

    it('starts with empty lists for every meal', () => {
      const byMeal = store.entriesByMeal();
      expect(byMeal.breakfast).toEqual([]);
      expect(byMeal.lunch).toEqual([]);
      expect(byMeal.dinner).toEqual([]);
    });

    it('starts with zero meal totals', () => {
      const totals = store.mealTotals();
      expect(totals.breakfast).toEqual(ZERO_NUTRITION);
      expect(totals.lunch).toEqual(ZERO_NUTRITION);
      expect(totals.dinner).toEqual(ZERO_NUTRITION);
    });

    it('starts with zero day totals', () => {
      expect(store.dayTotals()).toEqual(ZERO_NUTRITION);
    });
  });

  describe('addEntry', () => {
    it('appends an entry to the chosen meal', () => {
      store.addEntry('banana', 'breakfast', 2);
      const entries = store.entries();
      expect(entries.length).toBe(1);
      expect(entries[0].foodId).toBe('banana');
      expect(entries[0].meal).toBe('breakfast');
      expect(entries[0].servings).toBe(2);
      expect(entries[0].id).toBeTruthy();
      expect(store.entriesByMeal().breakfast.length).toBe(1);
      expect(store.entriesByMeal().lunch).toEqual([]);
      expect(store.entriesByMeal().dinner).toEqual([]);
    });

    it('resolves the food and computes entry nutrition from servings', () => {
      store.addEntry('banana', 'breakfast', 2);
      const resolved = store.entriesByMeal().breakfast[0];
      expect(resolved.food.id).toBe('banana');
      expect(resolved.nutrition).toEqual({ calories: 210, protein: 2.6, carbs: 54 });
    });

    it('supports fractional servings without rounding', () => {
      store.addEntry('banana', 'lunch', 1.5);
      const resolved = store.entriesByMeal().lunch[0];
      expect(resolved.nutrition.calories).toBeCloseTo(157.5, 10);
      expect(resolved.nutrition.protein).toBeCloseTo(1.95, 10);
      expect(resolved.nutrition.carbs).toBeCloseTo(40.5, 10);
    });

    it('keeps separate entries when the same food is added twice (no merging)', () => {
      store.addEntry('banana', 'breakfast', 1);
      store.addEntry('banana', 'breakfast', 2);
      expect(store.entriesByMeal().breakfast.length).toBe(2);
      expectNutritionClose(store.mealTotals().breakfast, {
        calories: 315,
        protein: 3.9,
        carbs: 81,
      });
    });

    it('accumulates entries from different foods in the same meal', () => {
      store.addEntry('banana', 'breakfast', 1);
      store.addEntry('boiled-egg', 'breakfast', 2);
      expectNutritionClose(store.mealTotals().breakfast, {
        calories: 261,
        protein: 13.9,
        carbs: 28.2,
      });
    });

    it('adds to day totals across meals', () => {
      store.addEntry('banana', 'breakfast', 1);
      store.addEntry('banana', 'lunch', 1);
      store.addEntry('banana', 'dinner', 2);
      expectNutritionClose(store.dayTotals(), { calories: 420, protein: 5.2, carbs: 108 });
    });

    it('throws on servings <= 0', () => {
      expect(() => store.addEntry('banana', 'breakfast', 0)).toThrowError(/servings/i);
      expect(() => store.addEntry('banana', 'breakfast', -1)).toThrowError(/servings/i);
      expect(store.entries()).toEqual([]);
    });

    it('throws on an unknown food id', () => {
      expect(() => store.addEntry('no-such-food', 'breakfast', 1)).toThrowError(/unknown food/i);
      expect(store.entries()).toEqual([]);
    });
  });

  describe('mealTotals per meal', () => {
    it('keeps meal totals independent', () => {
      store.addEntry('banana', 'breakfast', 1);
      store.addEntry('banana', 'dinner', 3);
      const totals = store.mealTotals();
      expectNutritionClose(totals.breakfast, { calories: 105, protein: 1.3, carbs: 27 });
      expect(totals.lunch).toEqual(ZERO_NUTRITION);
      expectNutritionClose(totals.dinner, { calories: 315, protein: 3.9, carbs: 81 });
    });
  });

  describe('removeEntry', () => {
    it('removes the entry and updates totals', () => {
      store.addEntry('banana', 'breakfast', 2);
      const entryId = store.entries()[0].id;

      store.removeEntry(entryId);

      expect(store.entries()).toEqual([]);
      expect(store.dayTotals()).toEqual(ZERO_NUTRITION);
    });

    it('only removes the targeted entry', () => {
      store.addEntry('banana', 'breakfast', 1);
      store.addEntry('boiled-egg', 'breakfast', 1);
      const firstId = store.entries()[0].id;

      store.removeEntry(firstId);

      const remaining = store.entries();
      expect(remaining.length).toBe(1);
      expect(remaining[0].foodId).toBe('boiled-egg');
      expect(store.mealTotals().breakfast).toEqual({ calories: 78, protein: 6.3, carbs: 0.6 });
    });

    it('is a no-op for an unknown entry id', () => {
      store.addEntry('banana', 'lunch', 1);
      store.removeEntry('no-such-entry');
      expect(store.entries().length).toBe(1);
    });
  });

  describe('interaction with FoodCatalogStore', () => {
    it('supports entries for custom foods added to the catalog', () => {
      const custom = catalog.addFood({
        name: 'Dosa',
        servingSize: 1,
        servingUnit: 'piece',
        nutrition: { calories: 168, protein: 3.9, carbs: 29.4 },
      });
      store.addEntry(custom.id, 'dinner', 2);
      const resolved = store.entriesByMeal().dinner[0];
      expect(resolved.food.id).toBe(custom.id);
      expectNutritionClose(resolved.nutrition, { calories: 336, protein: 7.8, carbs: 58.8 });
    });
  });
});

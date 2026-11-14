import { TestBed } from '@angular/core/testing';
import { FoodCatalogStore } from './food-catalog.store';
import { SEED_FOODS } from '../data/seed-foods';

describe('FoodCatalogStore', () => {
  let store: FoodCatalogStore;

  beforeEach(() => {
    store = TestBed.inject(FoodCatalogStore);
  });

  describe('initial state', () => {
    it('starts with the seed foods', () => {
      expect(store.foods().length).toBeGreaterThanOrEqual(20);
      expect(store.foods()).toEqual([...SEED_FOODS]);
    });

    it('has no custom foods initially', () => {
      expect(store.foods().every((food) => !food.isCustom)).toBeTrue();
    });
  });

  describe('findById', () => {
    it('finds a seed food by id', () => {
      expect(store.findById('banana')?.name).toBe('Banana');
    });

    it('returns undefined for an unknown id', () => {
      expect(store.findById('does-not-exist')).toBeUndefined();
    });
  });

  describe('nameExists', () => {
    it('returns true for an existing name', () => {
      expect(store.nameExists('Banana')).toBeTrue();
    });

    it('is case-insensitive', () => {
      expect(store.nameExists('BANANA')).toBeTrue();
      expect(store.nameExists('bAnAnA')).toBeTrue();
    });

    it('trims surrounding whitespace', () => {
      expect(store.nameExists('  Banana  ')).toBeTrue();
    });

    it('returns false for an unknown name', () => {
      expect(store.nameExists('Dosa')).toBeFalse();
    });

    it('returns false for a whitespace-only name', () => {
      expect(store.nameExists('   ')).toBeFalse();
    });
  });

  describe('addFood', () => {
    const validInput = {
      name: 'Dosa',
      servingSize: 1,
      servingUnit: 'piece' as const,
      nutrition: { calories: 168, protein: 3.9, carbs: 29.4 },
    };

    it('appends the food and returns it', () => {
      const before = store.foods().length;
      const food = store.addFood(validInput);
      expect(store.foods().length).toBe(before + 1);
      expect(store.foods().at(-1)).toBe(food);
      expect(store.findById(food.id)).toBe(food);
    });

    it('trims the name', () => {
      const food = store.addFood({ ...validInput, name: '  Dosa  ' });
      expect(food.name).toBe('Dosa');
    });

    it('marks the food as custom with a generated id', () => {
      const food = store.addFood(validInput);
      expect(food.isCustom).toBeTrue();
      expect(food.id).toBeTruthy();
      expect(food.id).not.toBe(validInput.name);
    });

    it('keeps nutrition and serving values unchanged', () => {
      const food = store.addFood(validInput);
      expect(food.nutrition).toEqual(validInput.nutrition);
      expect(food.servingSize).toBe(1);
      expect(food.servingUnit).toBe('piece');
    });

    it('rejects a duplicate name (case-insensitive)', () => {
      expect(() => store.addFood({ ...validInput, name: 'banana' })).toThrowError(
        /already exists/i,
      );
    });

    it('rejects a name that duplicates after trimming', () => {
      expect(() => store.addFood({ ...validInput, name: '  Banana ' })).toThrowError(
        /already exists/i,
      );
    });

    it('rejects an empty name', () => {
      expect(() => store.addFood({ ...validInput, name: '   ' })).toThrowError(/empty/i);
    });

    it('does not add a food when validation fails', () => {
      const before = store.foods().length;
      try {
        store.addFood({ ...validInput, name: 'Apple' });
      } catch {
        // expected
      }
      expect(store.foods().length).toBe(before);
      expect(store.nameExists('Apple')).toBeTrue(); // unchanged, original only
    });
  });
});

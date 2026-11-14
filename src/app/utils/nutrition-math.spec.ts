import { ZERO_NUTRITION, scaleNutrition, sumNutrition } from './nutrition-math';

describe('nutrition-math', () => {
  describe('ZERO_NUTRITION', () => {
    it('has all values at zero', () => {
      expect(ZERO_NUTRITION).toEqual({ calories: 0, protein: 0, carbs: 0 });
    });
  });

  describe('scaleNutrition', () => {
    it('scales every value by the factor', () => {
      const result = scaleNutrition({ calories: 105, protein: 1.3, carbs: 27 }, 2);
      expect(result).toEqual({ calories: 210, protein: 2.6, carbs: 54 });
    });

    it('handles fractional factors without rounding', () => {
      const result = scaleNutrition({ calories: 100, protein: 1.5, carbs: 10 }, 0.3);
      expect(result.calories).toBe(30);
      expect(result.protein).toBeCloseTo(0.45, 10);
      expect(result.carbs).toBe(3);
    });

    it('returns zero nutrition when factor is 0', () => {
      const result = scaleNutrition({ calories: 105, protein: 1.3, carbs: 27 }, 0);
      expect(result).toEqual({ calories: 0, protein: 0, carbs: 0 });
    });

    it('does not mutate the input', () => {
      const input = { calories: 100, protein: 2, carbs: 3 };
      scaleNutrition(input, 5);
      expect(input).toEqual({ calories: 100, protein: 2, carbs: 3 });
    });
  });

  describe('sumNutrition', () => {
    it('returns zero nutrition for an empty list', () => {
      expect(sumNutrition([])).toEqual({ calories: 0, protein: 0, carbs: 0 });
    });

    it('sums each component across the list', () => {
      const result = sumNutrition([
        { calories: 105, protein: 1.3, carbs: 27 },
        { calories: 78, protein: 6.3, carbs: 0.6 },
        { calories: 165, protein: 31.0, carbs: 0.0 },
      ]);
      expect(result).toEqual({ calories: 348, protein: 38.6, carbs: 27.6 });
    });

    it('keeps unrounded intermediate values (no display rounding)', () => {
      const result = sumNutrition([
        { calories: 0, protein: 0.1, carbs: 0.2 },
        { calories: 0, protein: 0.2, carbs: 0.1 },
      ]);
      expect(result.protein).toBeCloseTo(0.3, 10);
      expect(result.carbs).toBeCloseTo(0.3, 10);
      expect(result.calories).toBe(0);
    });

    it('does not mutate the input items', () => {
      const a = { calories: 10, protein: 1, carbs: 2 };
      const b = { calories: 20, protein: 3, carbs: 4 };
      sumNutrition([a, b]);
      expect(a).toEqual({ calories: 10, protein: 1, carbs: 2 });
      expect(b).toEqual({ calories: 20, protein: 3, carbs: 4 });
    });
  });
});

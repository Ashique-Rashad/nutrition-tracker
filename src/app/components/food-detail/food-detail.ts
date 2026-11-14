import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FoodItem } from '../../models/food-item.model';
import { MEAL_TYPES, MealType } from '../../models/meal-type.model';
import { Nutrition } from '../../models/nutrition.model';
import { FoodLogStore } from '../../stores/food-log.store';
import { scaleNutrition, ZERO_NUTRITION } from '../../utils/nutrition-math';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
};

@Component({
  selector: 'app-food-detail',
  imports: [DecimalPipe],
  templateUrl: './food-detail.html',
  styleUrl: './food-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodDetail {
  private readonly log = inject(FoodLogStore);

  readonly food = input<FoodItem | null>(null);
  readonly meals: readonly MealType[] = MEAL_TYPES;

  readonly servingsInput = signal('1');
  readonly meal = signal<MealType>('breakfast');

  readonly servings = computed<number | null>(() => {
    const raw = this.servingsInput().trim();
    if (raw === '') {
      return null;
    }
    const value = Number(raw);
    return Number.isNaN(value) ? null : value;
  });

  readonly preview = computed<Nutrition>(() => {
    const food = this.food();
    const servings = this.servings();
    if (!food || servings === null || servings <= 0) {
      return ZERO_NUTRITION;
    }
    return scaleNutrition(food.nutrition, servings);
  });

  readonly canAdd = computed(() => {
    const servings = this.servings();
    return this.food() !== null && servings !== null && servings > 0;
  });

  mealLabel(meal: MealType): string {
    return MEAL_LABELS[meal];
  }

  onServingsInput(event: Event): void {
    this.servingsInput.set((event.target as HTMLInputElement).value);
  }

  onMealChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (MEAL_TYPES.includes(value as MealType)) {
      this.meal.set(value as MealType);
    }
  }

  addToMeal(): void {
    const food = this.food();
    const servings = this.servings();
    if (!food || servings === null || servings <= 0) {
      return;
    }
    this.log.addEntry(food.id, this.meal(), servings);
  }
}

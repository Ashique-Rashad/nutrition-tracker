import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MealType } from '../../models/meal-type.model';
import { FoodLogStore } from '../../stores/food-log.store';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
};

@Component({
  selector: 'app-meal-section',
  imports: [DecimalPipe],
  templateUrl: './meal-section.html',
  styleUrl: './meal-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealSection {
  private readonly log = inject(FoodLogStore);

  readonly meal = input.required<MealType>();
  readonly mealLabel = computed(() => MEAL_LABELS[this.meal()]);
  readonly entries = computed(() => this.log.entriesByMeal()[this.meal()]);
  readonly mealTotal = computed(() => this.log.mealTotals()[this.meal()]);

  removeEntry(entryId: string): void {
    this.log.removeEntry(entryId);
  }
}

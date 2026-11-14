import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DailySummary } from './components/daily-summary/daily-summary';
import { MealSection } from './components/meal-section/meal-section';
import { FoodBrowser } from './components/food-browser/food-browser';
import { FoodDetail } from './components/food-detail/food-detail';
import { AddFoodForm } from './components/add-food-form/add-food-form';
import { FoodCatalogStore } from './stores/food-catalog.store';
import { MEAL_TYPES, MealType } from './models/meal-type.model';
import { FoodItem } from './models/food-item.model';

@Component({
  selector: 'app-root',
  imports: [DailySummary, MealSection, FoodBrowser, FoodDetail, AddFoodForm],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly catalog = inject(FoodCatalogStore);

  private readonly browser = viewChild.required(FoodBrowser);

  readonly meals: readonly MealType[] = MEAL_TYPES;

  readonly selectedFoodId = signal<string | null>(null);
  readonly selectedFood = computed(() => {
    const id = this.selectedFoodId();
    return id === null ? null : (this.catalog.findById(id) ?? null);
  });

  readonly showAddForm = signal(false);
  readonly addFormPrefill = signal('');

  onFoodSelected(foodId: string): void {
    this.selectedFoodId.set(foodId);
  }

  onAddFoodRequested(prefillName: string): void {
    this.addFormPrefill.set(prefillName);
    this.showAddForm.set(true);
  }

  onFoodSaved(food: FoodItem): void {
    this.selectedFoodId.set(food.id);
    this.showAddForm.set(false);
    this.browser().focusAddButton();
  }

  onFormCancelled(): void {
    this.showAddForm.set(false);
    this.browser().focusAddButton();
  }
}

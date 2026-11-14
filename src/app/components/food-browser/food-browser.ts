import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FoodCatalogStore } from '../../stores/food-catalog.store';

@Component({
  selector: 'app-food-browser',
  imports: [DecimalPipe],
  templateUrl: './food-browser.html',
  styleUrl: './food-browser.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodBrowser {
  private readonly catalog = inject(FoodCatalogStore);

  private readonly addButton = viewChild.required<ElementRef<HTMLButtonElement>>('addButton');

  readonly selectedId = input<string | null>(null);
  readonly foodSelected = output<string>();
  readonly addFoodRequested = output<string>();

  readonly searchTerm = signal('');
  readonly foods = this.catalog.foods;
  readonly filteredFoods = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const foods = this.catalog.foods();
    if (term === '') {
      return foods;
    }
    return foods.filter((food) => food.name.toLowerCase().includes(term));
  });

  onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  selectFood(id: string): void {
    this.foodSelected.emit(id);
  }

  requestAddFood(): void {
    this.addFoodRequested.emit(this.searchTerm());
  }

  focusAddButton(): void {
    this.addButton().nativeElement.focus();
  }
}

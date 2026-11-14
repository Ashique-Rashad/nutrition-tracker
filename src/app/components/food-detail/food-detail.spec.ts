import { TestBed } from '@angular/core/testing';
import { FoodDetail } from './food-detail';
import { FoodCatalogStore } from '../../stores/food-catalog.store';
import { FoodLogStore } from '../../stores/food-log.store';
import { FoodItem } from '../../models/food-item.model';

const BANANA: FoodItem = {
  id: 'banana',
  name: 'Banana',
  servingSize: 1,
  servingUnit: 'piece',
  nutrition: { calories: 105, protein: 1.3, carbs: 27 },
  isCustom: false,
};

describe('FoodDetail', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodDetail],
    }).compileComponents();
  });

  function setup(food: FoodItem | null) {
    const fixture = TestBed.createComponent(FoodDetail);
    fixture.componentRef.setInput('food', food);
    const log = TestBed.inject(FoodLogStore);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, log, el };
  }

  function setServings(fixture: { detectChanges(): void }, el: HTMLElement, value: string): void {
    const input = el.querySelector('#servings-input') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  it('shows a placeholder when food is null', () => {
    const { el } = setup(null);
    expect(el.querySelector('.detail__placeholder')).toBeTruthy();
    expect(el.querySelector('.detail__title')).toBeNull();
  });

  it('shows name, serving and per-serving nutrition', () => {
    const { el } = setup(BANANA);
    expect(el.querySelector('.detail__title')?.textContent?.trim()).toBe('Banana');
    expect(el.querySelector('.detail__serving')?.textContent).toContain('1 piece');
    const values = Array.from(el.querySelectorAll('.detail__stat-value')).map((n) =>
      n.textContent?.trim(),
    );
    expect(values).toEqual(['105 kcal', '1.3 g', '27 g']);
  });

  it('defaults servings to 1 and meal to breakfast', () => {
    const { el } = setup(BANANA);
    const input = el.querySelector('#servings-input') as HTMLInputElement;
    const select = el.querySelector('#meal-select') as HTMLSelectElement;
    expect(input.value).toBe('1');
    expect(select.value).toBe('breakfast');
  });

  it('previews servings x nutrition live', () => {
    const { fixture, el } = setup(BANANA);
    setServings(fixture, el, '2');
    const values = Array.from(el.querySelectorAll('.detail__preview-value')).map((n) =>
      n.textContent?.trim(),
    );
    expect(values).toEqual(['210 kcal', '2.6 g protein', '54 g carbs']);
  });

  it('shows zero preview when servings are empty', () => {
    const { fixture, el } = setup(BANANA);
    setServings(fixture, el, '');
    const values = Array.from(el.querySelectorAll('.detail__preview-value')).map((n) =>
      n.textContent?.trim(),
    );
    expect(values).toEqual(['0 kcal', '0 g protein', '0 g carbs']);
  });

  it('enables the add button for valid servings and disables otherwise', () => {
    const { fixture, el } = setup(BANANA);
    const button = el.querySelector('.detail__add') as HTMLButtonElement;
    expect(button.disabled).toBeFalse();

    setServings(fixture, el, '0');
    expect(button.disabled).toBeTrue();

    setServings(fixture, el, '-1');
    expect(button.disabled).toBeTrue();

    setServings(fixture, el, '');
    expect(button.disabled).toBeTrue();

    setServings(fixture, el, '0.5');
    expect(button.disabled).toBeFalse();
  });

  it('adds a log entry with the selected food, meal and servings', () => {
    const { fixture, log, el } = setup(BANANA);
    setServings(fixture, el, '2');
    const select = el.querySelector('#meal-select') as HTMLSelectElement;
    select.value = 'lunch';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    (el.querySelector('.detail__add') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(log.entries().length).toBe(1);
    expect(log.entries()[0]).toEqual({
      id: jasmine.any(String),
      foodId: 'banana',
      meal: 'lunch',
      servings: 2,
    });
  });

  it('does not add an entry when the button is disabled', () => {
    const { fixture, log, el } = setup(BANANA);
    setServings(fixture, el, '0');
    const button = el.querySelector('.detail__add') as HTMLButtonElement;
    expect(button.disabled).toBeTrue();
    button.click();
    fixture.detectChanges();
    expect(log.entries().length).toBe(0);
  });
});

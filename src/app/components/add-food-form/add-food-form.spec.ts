import { TestBed } from '@angular/core/testing';
import { AddFoodForm } from './add-food-form';
import { FoodCatalogStore } from '../../stores/food-catalog.store';
import { FoodItem } from '../../models/food-item.model';
import { SEED_FOODS } from '../../data/seed-foods';

describe('AddFoodForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFoodForm],
    }).compileComponents();
  });

  function setup(initialName = '') {
    const fixture = TestBed.createComponent(AddFoodForm);
    fixture.componentRef.setInput('initialName', initialName);
    const catalog = TestBed.inject(FoodCatalogStore);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, catalog, el };
  }

  function setValue(el: HTMLElement, id: string, value: string): void {
    const input = el.querySelector(`#${id}`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function touch(el: HTMLElement, id: string): void {
    (el.querySelector(`#${id}`) as HTMLInputElement).dispatchEvent(new Event('blur'));
  }

  function submit(el: HTMLElement): void {
    (el.querySelector('button[type="submit"]') as HTMLButtonElement).click();
  }

  function errorText(el: HTMLElement, id: string): string | undefined {
    return el.querySelector(`#${id}`)?.textContent?.trim();
  }

  function fillValid(el: HTMLElement): void {
    setValue(el, 'add-name', 'Dosa');
    setValue(el, 'add-serving-size', '1');
    setValue(el, 'add-calories', '168');
    setValue(el, 'add-protein', '3.8');
    setValue(el, 'add-carbs', '28');
  }

  it('prefills the name from initialName', () => {
    const { el } = setup('Dosa');
    expect((el.querySelector('#add-name') as HTMLInputElement).value).toBe('Dosa');
  });

  it('shows required errors for empty fields after a submit attempt and does not save', () => {
    const { fixture, catalog, el } = setup();
    submit(el);
    fixture.detectChanges();
    expect(errorText(el, 'add-name-error')).toBe('Name is required.');
    expect(errorText(el, 'add-serving-size-error')).toBe('Serving size is required.');
    expect(errorText(el, 'add-calories-error')).toBe('Calories is required.');
    expect(errorText(el, 'add-protein-error')).toBe('Protein is required.');
    expect(errorText(el, 'add-carbs-error')).toBe('Carbohydrates is required.');
    expect(catalog.foods().length).toBe(SEED_FOODS.length);
  });

  it('links errors via aria-describedby and marks the field invalid', () => {
    const { fixture, el } = setup();
    submit(el);
    fixture.detectChanges();
    const name = el.querySelector('#add-name') as HTMLInputElement;
    expect(name.getAttribute('aria-describedby')).toBe('add-name-error');
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(el.querySelector('#add-name-error')?.getAttribute('role')).toBe('alert');
  });

  it('shows a required error when a field is touched without submitting', () => {
    const { fixture, el } = setup();
    touch(el, 'add-calories');
    fixture.detectChanges();
    expect(errorText(el, 'add-calories-error')).toBe('Calories is required.');
  });

  it('blocks negative numbers', () => {
    const { fixture, catalog, el } = setup();
    fillValid(el);
    setValue(el, 'add-calories', '-5');
    submit(el);
    fixture.detectChanges();
    expect(errorText(el, 'add-calories-error')).toBe('Calories must be at least 0.');
    expect(catalog.foods().length).toBe(SEED_FOODS.length);
  });

  it('blocks a serving size below 0.01', () => {
    const { fixture, catalog, el } = setup();
    fillValid(el);
    setValue(el, 'add-serving-size', '0');
    submit(el);
    fixture.detectChanges();
    expect(errorText(el, 'add-serving-size-error')).toBe('Serving size must be at least 0.01.');
    expect(catalog.foods().length).toBe(SEED_FOODS.length);
  });

  it('blocks a duplicate name, case-insensitively', () => {
    const { fixture, catalog, el } = setup();
    fillValid(el);
    setValue(el, 'add-name', 'BANANA');
    submit(el);
    fixture.detectChanges();
    expect(errorText(el, 'add-name-error')).toBe('A food with this name already exists.');
    expect(catalog.foods().length).toBe(SEED_FOODS.length);
  });

  it('blocks a whitespace-only name', () => {
    const { fixture, catalog, el } = setup();
    fillValid(el);
    setValue(el, 'add-name', '   ');
    submit(el);
    fixture.detectChanges();
    expect(errorText(el, 'add-name-error')).toBe('Name is required.');
    expect(catalog.foods().length).toBe(SEED_FOODS.length);
  });

  it('blocks names longer than 60 characters', () => {
    const { fixture, catalog, el } = setup();
    fillValid(el);
    setValue(el, 'add-name', 'x'.repeat(61));
    submit(el);
    fixture.detectChanges();
    expect(errorText(el, 'add-name-error')).toBe('Name must be at most 60 characters.');
    expect(catalog.foods().length).toBe(SEED_FOODS.length);
  });

  it('saves a valid food with Custom badge and emits it', () => {
    const { fixture, catalog, el } = setup();
    const savedSpy = jasmine.createSpy('saved');
    fixture.componentInstance.saved.subscribe(savedSpy);
    fillValid(el);
    submit(el);
    fixture.detectChanges();
    const food = savedSpy.calls.mostRecent().args[0] as FoodItem;
    expect(food.name).toBe('Dosa');
    expect(food.servingSize).toBe(1);
    expect(food.servingUnit).toBe('g');
    expect(food.nutrition).toEqual({ calories: 168, protein: 3.8, carbs: 28 });
    expect(food.isCustom).toBeTrue();
    expect(catalog.foods()[catalog.foods().length - 1]).toEqual(food);
  });

  it('supports choosing a serving unit other than g', () => {
    const { fixture, el } = setup();
    const savedSpy = jasmine.createSpy('saved');
    fixture.componentInstance.saved.subscribe(savedSpy);
    fillValid(el);
    const select = el.querySelector('#add-serving-unit') as HTMLSelectElement;
    select.value = 'piece';
    select.dispatchEvent(new Event('change'));
    submit(el);
    fixture.detectChanges();
    const food = savedSpy.calls.mostRecent().args[0] as FoodItem;
    expect(food.servingUnit).toBe('piece');
  });

  it('emits cancelled when the cancel button is clicked', () => {
    const { fixture, el } = setup();
    const cancelledSpy = jasmine.createSpy('cancelled');
    fixture.componentInstance.cancelled.subscribe(cancelledSpy);
    (el.querySelector('button[type="button"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(cancelledSpy).toHaveBeenCalled();
  });
});

import { TestBed } from '@angular/core/testing';
import { MealSection } from './meal-section';
import { FoodLogStore } from '../../stores/food-log.store';
import { MealType } from '../../models/meal-type.model';

describe('MealSection', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealSection],
    }).compileComponents();
  });

  function setup(meal: MealType) {
    const fixture = TestBed.createComponent(MealSection);
    fixture.componentRef.setInput('meal', meal);
    const log = TestBed.inject(FoodLogStore);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, log, el };
  }

  it('shows the meal heading', () => {
    const { el } = setup('breakfast');
    expect(el.querySelector('h2')?.textContent?.trim()).toBe('Breakfast');
  });

  it('shows the empty state when nothing is logged', () => {
    const { el } = setup('lunch');
    expect(el.textContent).toContain('Nothing logged yet');
    expect(el.querySelectorAll('.meal__entry').length).toBe(0);
  });

  it('lists entries with food name, servings and computed nutrition', () => {
    const { fixture, log, el } = setup('dinner');
    log.addEntry('banana', 'dinner', 2);
    fixture.detectChanges();
    const entry = el.querySelector('.meal__entry');
    expect(entry).toBeTruthy();
    expect(entry?.querySelector('.meal__name')?.textContent?.trim()).toBe('Banana');
    expect(entry?.querySelector('.meal__servings')?.textContent).toContain('2');
    const values = Array.from(entry?.querySelectorAll('.meal__value') ?? []).map((n) =>
      n.textContent?.trim(),
    );
    expect(values).toEqual(['210 kcal', '2.6 g', '54 g']);
  });

  it('shows the meal subtotal', () => {
    const { fixture, log, el } = setup('breakfast');
    log.addEntry('banana', 'breakfast', 1);
    log.addEntry('boiled-egg', 'breakfast', 1);
    fixture.detectChanges();
    const subtotal = Array.from(el.querySelectorAll('.meal__subtotal-value')).map((n) =>
      n.textContent?.trim(),
    );
    expect(subtotal).toEqual(['183 kcal', '7.6 g', '27.6 g']);
  });

  it('only shows entries for its own meal', () => {
    const { fixture, log, el } = setup('lunch');
    log.addEntry('banana', 'breakfast', 1);
    log.addEntry('banana', 'lunch', 1);
    fixture.detectChanges();
    expect(el.querySelectorAll('.meal__entry').length).toBe(1);
    expect(el.querySelector('.meal__name')?.textContent?.trim()).toBe('Banana');
  });

  it('remove button has an accessible name', () => {
    const { fixture, log, el } = setup('breakfast');
    log.addEntry('banana', 'breakfast', 1);
    fixture.detectChanges();
    const button = el.querySelector('.meal__remove');
    expect(button?.getAttribute('aria-label')).toBe('Remove Banana from Breakfast');
  });

  it('removes an entry when the remove button is clicked', () => {
    const { fixture, log, el } = setup('breakfast');
    log.addEntry('banana', 'breakfast', 1);
    fixture.detectChanges();
    (el.querySelector('.meal__remove') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(log.entries().length).toBe(0);
    expect(el.textContent).toContain('Nothing logged yet');
  });
});

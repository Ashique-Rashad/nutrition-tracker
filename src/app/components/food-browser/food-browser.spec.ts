import { TestBed } from '@angular/core/testing';
import { FoodBrowser } from './food-browser';
import { FoodCatalogStore } from '../../stores/food-catalog.store';

describe('FoodBrowser', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodBrowser],
    }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(FoodBrowser);
    const catalog = TestBed.inject(FoodCatalogStore);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, catalog, el };
  }

  function setSearch(fixture: { detectChanges(): void }, el: HTMLElement, value: string): void {
    const input = el.querySelector('#food-search') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function findItem(el: HTMLElement, name: string): HTMLButtonElement {
    const item = Array.from(el.querySelectorAll('.browser__item')).find((n) =>
      n.textContent?.includes(name),
    );
    if (!item) {
      throw new Error(`Item "${name}" not found`);
    }
    return item as HTMLButtonElement;
  }

  it('renders all seed foods by default', () => {
    const { catalog, el } = setup();
    expect(el.querySelectorAll('.browser__item').length).toBe(catalog.foods().length);
  });

  it('shows name, serving, kcal, protein and carbs per item', () => {
    const { el } = setup();
    const item = findItem(el, 'Banana');
    expect(item.textContent).toContain('1 piece');
    expect(item.textContent).toContain('105 kcal');
    expect(item.textContent).toContain('1.3 g');
    expect(item.textContent).toContain('27 g');
  });

  it('filters live and case-insensitively as the user types', () => {
    const { fixture, el } = setup();
    setSearch(fixture, el, 'CHI');
    const names = Array.from(el.querySelectorAll('.browser__item')).map((n) =>
      n.textContent?.trim(),
    );
    expect(names.length).toBe(2);
    expect(names[0]).toContain('Chicken breast (cooked)');
    expect(names[1]).toContain('Chickpeas (cooked)');
  });

  it('shows the empty state with an Add food button when nothing matches', () => {
    const { fixture, el } = setup();
    setSearch(fixture, el, 'zzzz');
    expect(el.textContent).toContain('No foods match your search');
    expect(el.querySelector('.browser__item')).toBeNull();
    expect(el.querySelector('.browser__empty button')?.textContent).toContain('Add food');
  });

  it('emits foodSelected with the food id when an item is clicked', () => {
    const { fixture, el } = setup();
    const selectedSpy = jasmine.createSpy('foodSelected');
    fixture.componentInstance.foodSelected.subscribe(selectedSpy);
    findItem(el, 'Banana').click();
    fixture.detectChanges();
    expect(selectedSpy).toHaveBeenCalledWith('banana');
  });

  it('visually highlights and marks the selected item with aria-current', () => {
    const { fixture, el } = setup();
    fixture.componentRef.setInput('selectedId', 'banana');
    fixture.detectChanges();
    const selected = findItem(el, 'Banana');
    expect(selected.classList).toContain('browser__item--selected');
    expect(selected.getAttribute('aria-current')).toBe('true');
    const others = Array.from(el.querySelectorAll('.browser__item')).filter((n) => n !== selected);
    expect(others.every((n) => !n.classList.contains('browser__item--selected'))).toBeTrue();
    expect(others.every((n) => n.getAttribute('aria-current') === null)).toBeTrue();
  });

  it('shows a Custom badge for custom foods only', () => {
    const { fixture, catalog, el } = setup();
    catalog.addFood({
      name: 'Dosa',
      servingSize: 1,
      servingUnit: 'piece',
      nutrition: { calories: 168, protein: 3.8, carbs: 28 },
    });
    fixture.detectChanges();
    const badges = Array.from(el.querySelectorAll('.browser__badge')).map((n) =>
      n.textContent?.trim(),
    );
    expect(badges).toEqual(['Custom']);
  });

  it('emits addFoodRequested with the current search text from the empty state', () => {
    const { fixture, el } = setup();
    const addSpy = jasmine.createSpy('addFoodRequested');
    fixture.componentInstance.addFoodRequested.subscribe(addSpy);
    setSearch(fixture, el, 'Dosa');
    (el.querySelector('.browser__empty button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(addSpy).toHaveBeenCalledWith('Dosa');
  });

  it('emits addFoodRequested from the button next to the search box', () => {
    const { fixture, el } = setup();
    const addSpy = jasmine.createSpy('addFoodRequested');
    fixture.componentInstance.addFoodRequested.subscribe(addSpy);
    (el.querySelector('.browser__add') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(addSpy).toHaveBeenCalledWith('');
  });
});

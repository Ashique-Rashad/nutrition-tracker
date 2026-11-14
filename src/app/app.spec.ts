import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { FoodLogStore } from './stores/food-log.store';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the title and the daily summary', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Nutrition Tracker');
    expect(compiled.querySelector('app-daily-summary')).toBeTruthy();
  });

  it('renders one section per meal (breakfast, lunch, dinner)', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const headings = Array.from(compiled.querySelectorAll('app-meal-section h2')).map((n) =>
      n.textContent?.trim(),
    );
    expect(headings).toEqual(['Breakfast', 'Lunch', 'Dinner']);
  });

  it('starts with an empty log and no selected food', () => {
    const fixture = TestBed.createComponent(App);
    const log = TestBed.inject(FoodLogStore);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(log.entries().length).toBe(0);
    expect(compiled.querySelector('app-food-detail .detail__placeholder')).toBeTruthy();
  });

  it('selecting a food in the browser shows it in the detail panel', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const item = Array.from(compiled.querySelectorAll('app-food-browser .browser__item')).find(
      (n) => n.textContent?.includes('Banana'),
    ) as HTMLButtonElement;
    item.click();
    fixture.detectChanges();
    const detail = compiled.querySelector('app-food-detail');
    expect(detail?.querySelector('.detail__title')?.textContent?.trim()).toBe('Banana');
    expect(compiled.querySelector('app-food-detail .detail__placeholder')).toBeNull();
  });

  it('opens the add-food form from the browser and closes it on cancel', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const addBtn = compiled.querySelector('app-food-browser .browser__add') as HTMLButtonElement;
    addBtn.click();
    fixture.detectChanges();
    expect(compiled.querySelector('app-add-food-form')).toBeTruthy();

    const cancel = compiled.querySelector(
      'app-add-food-form button[type="button"]',
    ) as HTMLButtonElement;
    cancel.click();
    fixture.detectChanges();
    expect(compiled.querySelector('app-add-food-form')).toBeNull();
  });

  it('shows the empty-state Add food prefill in the form name field', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const search = compiled.querySelector('#food-search') as HTMLInputElement;
    search.value = 'Dosa';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (
      compiled.querySelector('app-food-browser .browser__empty button') as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    const nameInput = compiled.querySelector('#add-name') as HTMLInputElement;
    expect(nameInput.value).toBe('Dosa');
  });

  it('adds a custom food via the form, selects it and hides the form', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    (compiled.querySelector('app-food-browser .browser__add') as HTMLButtonElement).click();
    fixture.detectChanges();

    const setField = (id: string, value: string) => {
      const input = compiled.querySelector(`#${id}`) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    setField('add-name', 'Dosa');
    setField('add-serving-size', '1');
    setField('add-calories', '168');
    setField('add-protein', '3.8');
    setField('add-carbs', '28');
    (
      compiled.querySelector('app-add-food-form button[type="submit"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(compiled.querySelector('app-add-food-form')).toBeNull();
    const detail = compiled.querySelector('app-food-detail');
    expect(detail?.querySelector('.detail__title')?.textContent?.trim()).toBe('Dosa');
    expect(compiled.querySelector('app-food-browser .browser__badge')?.textContent?.trim()).toBe(
      'Custom',
    );
  });

  it('logs Banana x2 to Breakfast: entry, subtotal and daily totals update', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const banana = Array.from(compiled.querySelectorAll('app-food-browser .browser__item')).find(
      (n) => n.textContent?.includes('Banana'),
    ) as HTMLButtonElement;
    banana.click();
    fixture.detectChanges();

    const servings = compiled.querySelector('#servings-input') as HTMLInputElement;
    servings.value = '2';
    servings.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (compiled.querySelector('app-food-detail .detail__add') as HTMLButtonElement).click();
    fixture.detectChanges();

    const breakfast = compiled.querySelectorAll('app-meal-section')[0];
    expect(breakfast.querySelector('.meal__name')?.textContent?.trim()).toBe('Banana');
    expect(breakfast.querySelector('.meal__servings')?.textContent).toContain('2');
    const subtotal = Array.from(breakfast.querySelectorAll('.meal__subtotal-value')).map((n) =>
      n.textContent?.trim(),
    );
    expect(subtotal).toEqual(['210 kcal', '2.6 g', '54 g']);
    const summary = Array.from(compiled.querySelectorAll('app-daily-summary .summary__value')).map(
      (n) => n.textContent?.trim(),
    );
    expect(summary).toEqual(['210', '2.6', '54']);
  });

  it('removing the entry empties the meal and resets the daily totals', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const banana = Array.from(compiled.querySelectorAll('app-food-browser .browser__item')).find(
      (n) => n.textContent?.includes('Banana'),
    ) as HTMLButtonElement;
    banana.click();
    fixture.detectChanges();
    (compiled.querySelector('app-food-detail .detail__add') as HTMLButtonElement).click();
    fixture.detectChanges();

    const breakfast = compiled.querySelectorAll('app-meal-section')[0];
    (breakfast.querySelector('.meal__remove') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(breakfast.textContent).toContain('Nothing logged yet');
    const summary = Array.from(compiled.querySelectorAll('app-daily-summary .summary__value')).map(
      (n) => n.textContent?.trim(),
    );
    expect(summary).toEqual(['0', '0', '0']);
  });
});

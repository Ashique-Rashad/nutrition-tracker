import { TestBed } from '@angular/core/testing';
import { DailySummary } from './daily-summary';
import { FoodLogStore } from '../../stores/food-log.store';

describe('DailySummary', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailySummary],
    }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(DailySummary);
    const log = TestBed.inject(FoodLogStore);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, log, el };
  }

  it('shows zeros when nothing is logged', () => {
    const { el } = setup();
    const values = Array.from(el.querySelectorAll('.summary__value')).map((n) =>
      n.textContent?.trim(),
    );
    // '1.0-0' / '1.0-1' omit trailing zeros, so 0 renders as "0".
    expect(values).toEqual(['0', '0', '0']);
  });

  it('shows rounded daily totals', () => {
    const { fixture, log, el } = setup();
    // Banana x 1.005: 105.525 kcal -> "106", 1.3065 g -> "1.3", 27.135 g -> "27.1"
    log.addEntry('banana', 'breakfast', 1.005);
    fixture.detectChanges();
    const values = Array.from(el.querySelectorAll('.summary__value')).map((n) =>
      n.textContent?.trim(),
    );
    expect(values).toEqual(['106', '1.3', '27.1']);
  });

  it('has an aria-live region so updates are announced', () => {
    const { el } = setup();
    const section = el.querySelector('section[aria-label="Daily totals"]');
    expect(section).toBeTruthy();
    expect(section?.getAttribute('aria-live')).toBe('polite');
  });

  it('updates reactively when entries change', () => {
    const { fixture, log, el } = setup();
    log.addEntry('banana', 'lunch', 2);
    fixture.detectChanges();
    expect(el.querySelector('.summary__value')?.textContent).toContain('210');
    log.removeEntry(log.entries()[0].id);
    fixture.detectChanges();
    const values = Array.from(el.querySelectorAll('.summary__value')).map((n) =>
      n.textContent?.trim(),
    );
    expect(values).toEqual(['0', '0', '0']);
  });
});

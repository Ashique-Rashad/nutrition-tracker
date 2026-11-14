import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FoodLogStore } from '../../stores/food-log.store';

@Component({
  selector: 'app-daily-summary',
  imports: [DecimalPipe],
  templateUrl: './daily-summary.html',
  styleUrl: './daily-summary.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailySummary {
  private readonly log = inject(FoodLogStore);
  readonly dayTotals = this.log.dayTotals;
}

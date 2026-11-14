import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { FoodCatalogStore } from '../../stores/food-catalog.store';
import { FoodItem, ServingUnit } from '../../models/food-item.model';

const SERVING_UNITS: readonly ServingUnit[] = ['g', 'ml', 'piece', 'cup', 'tbsp'];

// Whitespace-only values are treated as empty (food names are trimmed per domain rules).
const trimmedRequired: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  String(control.value ?? '').trim() === '' ? { required: true } : null;

function uniqueFoodName(nameExists: (name: string) => boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    if (value === '') {
      return null;
    }
    return nameExists(value) ? { uniqueFoodName: true } : null;
  };
}

@Component({
  selector: 'app-add-food-form',
  imports: [ReactiveFormsModule],
  templateUrl: './add-food-form.html',
  styleUrl: './add-food-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddFoodForm {
  private readonly catalog = inject(FoodCatalogStore);
  private readonly fb = inject(FormBuilder);
  private readonly nnfb = inject(NonNullableFormBuilder);

  private readonly nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');

  readonly initialName = input('');
  readonly saved = output<FoodItem>();
  readonly cancelled = output<void>();

  readonly servingUnits = SERVING_UNITS;
  readonly submitted = signal(false);

  // Numeric controls stay nullable so a cleared input yields null (required error);
  // text controls use the non-nullable builder.
  readonly form = this.fb.group({
    name: this.nnfb.control('', {
      validators: [
        trimmedRequired,
        Validators.maxLength(60),
        uniqueFoodName((n) => this.catalog.nameExists(n)),
      ],
    }),
    servingSize: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
    servingUnit: this.nnfb.control<ServingUnit>('g', {
      validators: [Validators.required],
    }),
    calories: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
    protein: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
    carbs: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
  });

  constructor() {
    // Move focus to the name field when the form opens.
    afterNextRender(() => {
      this.nameInput().nativeElement.focus();
    });

    // Prefill the name once the input binding is available (not in field initializers).
    effect(() => {
      const prefill = this.initialName().trim();
      if (prefill === '') {
        return;
      }
      this.form.controls.name.setValue(prefill);
      this.form.controls.name.markAsUntouched();
    });
  }

  showError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.submitted());
  }

  nameError(): string {
    const control = this.form.controls.name;
    if (control.hasError('required')) {
      return 'Name is required.';
    }
    if (control.hasError('maxlength')) {
      return 'Name must be at most 60 characters.';
    }
    if (control.hasError('uniqueFoodName')) {
      return 'A food with this name already exists.';
    }
    return '';
  }

  numberError(label: string, min: number, control: AbstractControl): string {
    if (control.hasError('required')) {
      return `${label} is required.`;
    }
    if (control.hasError('min')) {
      return `${label} must be at least ${min}.`;
    }
    return '';
  }

  onSubmit(): void {
    this.submitted.set(true);
    const value = this.form.getRawValue();
    if (
      this.form.invalid ||
      value.servingSize === null ||
      value.calories === null ||
      value.protein === null ||
      value.carbs === null
    ) {
      this.form.markAllAsTouched();
      return;
    }
    const food = this.catalog.addFood({
      name: value.name.trim(),
      servingSize: value.servingSize,
      servingUnit: value.servingUnit,
      nutrition: {
        calories: value.calories,
        protein: value.protein,
        carbs: value.carbs,
      },
    });
    this.saved.emit(food);
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}

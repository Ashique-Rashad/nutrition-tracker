# Architecture

## 1. High-Level Design
A single Angular 20 SPA. Two injectable signal-based stores hold all state. Presentational components read from the stores and call store methods. There is no router, no HTTP and no persistence.

```
                +-----------------------------+
                |            App              |  (shell / layout)
                +--------------+--------------+
                               |
     +-------------+-----------+------------+---------------+
     |             |                        |               |
+----v-----+  +----v-------+         +------v-----+   +-----v------+
| DailySum |  | FoodBrowser|         | MealSection|x3 | AddFoodForm|
| mary     |  | (list +    |         | (per meal) |   | (panel)    |
|          |  |  search)   |         +------+-----+   +-----+------+
+----+-----+  +----+-------+                |               |
     |             |                        |               |
     |        +----v-------+                |               |
     |        | FoodDetail |                |               |
     |        +----+-------+                |               |
     |             |                        |               |
+----v-------------v------------------------v---+     +-----v-----------+
|              FoodLogStore                     |     | FoodCatalogStore|
|  entries, totals (computed), add/remove       |<----+ foods, add, find|
+-----------------------------------------------+     +-----------------+
```

`FoodLogStore` depends on `FoodCatalogStore` to resolve a `foodId` into nutrition values.

## 2. Folder Structure
```
src/
  main.ts
  styles.css                      # CSS variables, base styles, utility classes
  app/
    app.ts / app.html / app.css   # shell and layout
    app.config.ts                 # provideBrowserGlobalErrorListeners(), provideZoneChangeDetection({eventCoalescing:true})
    models/
      food-item.model.ts
      log-entry.model.ts
      meal-type.model.ts
      nutrition.model.ts
    data/
      seed-foods.ts               # SEED_FOODS: FoodItem[]
    stores/
      food-catalog.store.ts
      food-catalog.store.spec.ts
      food-log.store.ts
      food-log.store.spec.ts
    utils/
      nutrition-math.ts           # pure functions: scale, sum, ZERO
      nutrition-math.spec.ts
    components/
      daily-summary/
      food-browser/               # search input + list
      food-detail/                # selected food + servings + meal + add button
      add-food-form/
      meal-section/
```
Each component folder contains `name.ts`, `name.html`, `name.css`, `name.spec.ts`.

## 3. Data Models
```ts
// meal-type.model.ts
export type MealType = 'breakfast' | 'lunch' | 'dinner';
export const MEAL_TYPES: readonly MealType[] = ['breakfast', 'lunch', 'dinner'];

// nutrition.model.ts
export interface Nutrition {
  calories: number; // kcal
  protein: number;  // g
  carbs: number;    // g
}

// food-item.model.ts
export type ServingUnit = 'g' | 'ml' | 'piece' | 'cup' | 'tbsp';

export interface FoodItem {
  id: string;
  name: string;
  servingSize: number;     // e.g. 100
  servingUnit: ServingUnit; // e.g. 'g'
  nutrition: Nutrition;    // values for ONE serving
  isCustom: boolean;
}

// log-entry.model.ts
export interface LogEntry {
  id: string;
  foodId: string;
  meal: MealType;
  servings: number; // > 0
}
```
Foods are immutable once created and cannot be deleted in v1, so log entries can safely reference `foodId`.

ID generation: `crypto.randomUUID()` for custom foods and log entries. Seed foods use stable slugs (e.g. `boiled-egg`).

## 4. State Management

### FoodCatalogStore (`providedIn: 'root'`)
| Member | Type | Description |
|---|---|---|
| `foods` | `Signal<FoodItem[]>` (readonly) | All foods, seed + custom. |
| `addFood(input)` | `FoodItem` | Validates uniqueness, trims name, creates id, appends, returns the new food. Throws or returns an error result if name duplicates. |
| `findById(id)` | `FoodItem \| undefined` | Lookup. |
| `nameExists(name)` | `boolean` | Case-insensitive, trimmed. Used by the form validator. |

Internals: `private readonly _foods = signal<FoodItem[]>(SEED_FOODS)`; expose `foods = this._foods.asReadonly()`. Update immutably (`update(list => [...list, food])`).

### FoodLogStore (`providedIn: 'root'`)
| Member | Type | Description |
|---|---|---|
| `entries` | `Signal<LogEntry[]>` (readonly) | All entries for today. |
| `entriesByMeal` | `Signal<Record<MealType, ResolvedEntry[]>>` | Computed. Each `ResolvedEntry` = entry + food + computed `nutrition`. |
| `mealTotals` | `Signal<Record<MealType, Nutrition>>` | Computed subtotals. |
| `dayTotals` | `Signal<Nutrition>` | Computed total of all meals. |
| `addEntry(foodId, meal, servings)` | `void` | Ignores or throws on servings <= 0 or unknown food. |
| `removeEntry(entryId)` | `void` | Removes by id. |

```ts
export interface ResolvedEntry {
  entry: LogEntry;
  food: FoodItem;
  nutrition: Nutrition; // food.nutrition * entry.servings
}
```

### Pure helpers (`utils/nutrition-math.ts`)
```ts
export const ZERO_NUTRITION: Nutrition = { calories: 0, protein: 0, carbs: 0 };
export function scaleNutrition(n: Nutrition, factor: number): Nutrition;
export function sumNutrition(list: readonly Nutrition[]): Nutrition;
```
All math lives here (no rounding). Stores and components call these helpers. Rounding is done only in templates via `number` pipe: calories `'1.0-0'`, protein/carbs `'1.0-1'`.

### UI-local state
- `selectedFoodId` (signal) lives in `App` and is passed down. `FoodBrowser` emits `foodSelected`. `FoodDetail` receives the selected food as an input. After `AddFoodForm` creates a food, `App` sets `selectedFoodId` to the new id.
- `searchTerm` lives inside `FoodBrowser` as a signal; `filteredFoods` is a `computed`.
- `showAddForm` signal lives in `App`; the optional prefill name comes from the search term via an output event.

## 5. Components

| Component | Inputs | Outputs | Responsibility |
|---|---|---|---|
| `App` | none | none | Layout, owns `selectedFoodId` and `showAddForm`. Composes children. |
| `DailySummary` | none (reads `FoodLogStore.dayTotals`) | none | Shows the three daily totals. |
| `FoodBrowser` | `selectedId: string \| null` | `foodSelected: string`, `addFoodRequested: string` (prefill name) | Search box, scrollable list, empty state, "Add food" button. |
| `FoodDetail` | `food: FoodItem \| null` | `added` (optional) | Shows nutrition per serving, servings input, meal select, live preview, Add button. Calls `FoodLogStore.addEntry`. |
| `AddFoodForm` | `initialName: string` | `saved: FoodItem`, `cancelled: void` | Typed reactive form, validation, calls `FoodCatalogStore.addFood`. |
| `MealSection` | `meal: MealType` | none | Shows entries for that meal, subtotal, remove buttons. |

Rules:
- Presentational logic only in components. Business logic in stores and utils.
- Components that need store data `inject()` the store. Leaf-like components get data via inputs when reasonable.
- All components are `OnPush`.

## 6. Layout (desktop >= 900px)
```
+--------------------------------------------------------------+
| Header: "Nutrition Tracker"           Daily totals (3 cards) |
+---------------------------+----------------------------------+
| Food browser              | Food detail (selected food)      |
|  [search..........][Add]  |   servings, meal, preview, [Add] |
|  - Boiled egg  78 6.3 0.6 +----------------------------------+
|  - Oats        150 5 27   | Breakfast  (subtotal)            |
|  - ...                    |  entries...                      |
|                           | Lunch      (subtotal)            |
|                           | Dinner     (subtotal)            |
+---------------------------+----------------------------------+
```
Mobile: single column in this order: Daily totals, Food browser, Food detail, Meals. The Add food form opens as a panel above the food list (or a `<dialog>` element).

## 7. Add Food Form
Typed `FormGroup` (via `FormBuilder.nonNullable`):
```
name: string       [required, maxLength(60), uniqueFoodName validator]
servingSize: number [required, min(0.01)]
servingUnit: ServingUnit [required]
calories: number   [required, min(0)]
protein: number    [required, min(0)]
carbs: number      [required, min(0)]
```
`uniqueFoodName` is a synchronous `ValidatorFn` created with `inject(FoodCatalogStore).nameExists`. Errors are shown when the control is touched or the form was submitted.

## 8. Data Flow Examples

**Add food to a meal**
1. User clicks a food in `FoodBrowser` then `foodSelected` emits then `App.selectedFoodId` is set.
2. `App` resolves the food via `FoodCatalogStore.findById` (a `computed`) and passes it to `FoodDetail`.
3. User sets servings and meal, then clicks Add, then `FoodLogStore.addEntry(...)`.
4. `entries` signal changes, then `entriesByMeal`, `mealTotals`, `dayTotals` recompute.
5. `MealSection` and `DailySummary` re-render via signals. No manual subscription.

**Add custom food**
1. User clicks Add food, then `App.showAddForm = true`.
2. Submit valid form, then `FoodCatalogStore.addFood` returns the new `FoodItem`.
3. `AddFoodForm.saved` emits, then `App` sets `selectedFoodId`, hides the form.
4. `foods` signal changes, then `FoodBrowser` list re-renders with the new item.

## 9. Error Handling
- Invalid input is prevented in the UI (disabled buttons, inline validation). Stores still defensively reject invalid input (servings <= 0, unknown food id, duplicate name).
- No global error UI is needed in v1.

## 10. Testing Strategy
- **Unit (required):** `nutrition-math`, `FoodCatalogStore` (add, duplicate name, case-insensitive), `FoodLogStore` (add, remove, totals per meal, day totals, empty state, fractional servings).
- **Component (recommended):** `AddFoodForm` validation states, `FoodBrowser` search filtering, `FoodDetail` preview math.
- Use `TestBed` with the real stores (they have no external dependencies).
- No e2e tests in v1.

## 11. Accessibility Notes
- Food list rendered as a `<ul>` with `<button>` elements per item (keyboard and screen-reader friendly); selected item has `aria-pressed="true"` or `aria-current`.
- Form controls have visible `<label>`s; errors use `role="alert"` or `aria-live="polite"` and `aria-describedby`.
- Remove buttons have an accessible name like `Remove Banana from Breakfast`.
- Totals region uses `aria-live="polite"` so updates are announced.

## 12. Implementation Order (suggested)
1. Scaffold project, set up global styles and CSS variables.
2. Models, seed data, `nutrition-math` + tests.
3. `FoodCatalogStore` + tests.
4. `FoodLogStore` + tests.
5. `DailySummary` and `MealSection`.
6. `FoodBrowser` (search + list).
7. `FoodDetail` (servings, meal, preview, add).
8. `AddFoodForm` with validation.
9. Wire everything in `App`, responsive layout, accessibility pass.
10. Final check: `ng build`, `ng test`, manual walkthrough of every acceptance criterion in `PRD.md`.

# PRD: Daily Nutrition Tracker

## 1. Overview
A single-page web app where a user logs the food they eat in a day, split into **Breakfast, Lunch and Dinner**, and instantly sees their total **Calories, Protein and Carbohydrates** for the day. All data lives in memory (no backend, no persistence). Refreshing the page resets the data.

## 2. Goals
- Let the user pick a food from a list and see its nutrition values and serving size.
- Let the user add a food that is not in the list.
- Automatically calculate nutrition totals per meal and for the whole day when food is added or removed.

## 3. Non-Goals (v1)
- No backend, API, authentication or user accounts.
- No persistence (localStorage, IndexedDB, cookies). Data resets on reload.
- No multi-day history or date navigation. The app tracks "today" only.
- No daily goals or targets, no charts, no other nutrients (fat, fiber, sugar...).
- No editing or deleting of foods in the catalog.
- No snacks category (only Breakfast, Lunch, Dinner).

## 4. Target User
A single individual who wants a quick, no-signup way to see how many calories, grams of protein and grams of carbs they have eaten today.

## 5. Terminology
| Term | Meaning |
|---|---|
| Food | A catalog item with nutrition values for ONE serving (e.g. "Boiled Egg, 1 piece"). |
| Serving | The reference amount the nutrition values apply to (`servingSize` + `servingUnit`). |
| Log entry | A food added to a meal with a number of servings. |
| Meal | One of `breakfast`, `lunch`, `dinner`. |

## 6. Functional Requirements

### FR-1: Food list
- App ships with a seed list of at least 20 common foods (see Section 9).
- The list displays, for each food: name, serving (e.g. `100 g`), calories (kcal), protein (g), carbs (g).
- A search box filters the list by name (case-insensitive, live as the user types).
- Empty state: "No foods match your search" with a button to add a new food (pre-filling the name from the search text).

### FR-2: Select a food and view details
- Clicking a food in the list selects it.
- A detail panel shows the food name, serving amount, and its calories, protein and carbs for one serving.
- The detail panel has:
  - **Servings** number input (default `1`, min `0.1`, step `0.1`).
  - **Meal** selector: Breakfast / Lunch / Dinner.
  - **Add to meal** button.
- The panel shows a live preview of the nutrition for the chosen number of servings (servings x per-serving values).

### FR-3: Add a custom food
- An **Add food** button opens a form (inline panel or modal).
- Fields (all required unless noted):
  - Name (text, max 60 chars, must be unique case-insensitively)
  - Serving size (number > 0)
  - Serving unit (select: `g`, `ml`, `piece`, `cup`, `tbsp`)
  - Calories in kcal (number >= 0)
  - Protein in g (number >= 0)
  - Carbohydrates in g (number >= 0)
- Validation errors appear inline under the field after it is touched or after a submit attempt.
- On successful submit: the food is added to the catalog, appears in the list, is auto-selected, and the form closes.
- Custom foods are marked with a small "Custom" badge.

### FR-4: Add to meal and automatic totals
- Clicking **Add to meal** creates a log entry in the chosen meal.
- If the same food is already in that meal, a new entry is still created (no merging) in v1.
- Totals update immediately without any "calculate" button.

### FR-5: Meal sections
- The page shows three sections: Breakfast, Lunch, Dinner.
- Each section lists its entries: food name, servings, calories, protein, carbs (computed for that entry).
- Each section shows a subtotal (calories, protein, carbs).
- Each entry has a **Remove** button; removing updates all totals.
- Empty state per meal: "Nothing logged yet".

### FR-6: Daily summary
- A summary (sticky at the top on desktop is nice to have) shows total **Calories (kcal)**, **Protein (g)**, **Carbs (g)** across all meals.
- Values are displayed rounded: calories to 0 decimals, protein and carbs to 1 decimal.

## 7. Calculation Rules
- `entryNutrition = food.perServingValue * entry.servings`
- `mealTotal = sum(entryNutrition)` for entries in that meal
- `dayTotal = breakfastTotal + lunchTotal + dinnerTotal`
- Rounding happens ONLY at display time, never in stored or intermediate values.

## 8. Non-Functional Requirements
- **Platform:** Angular 20 single-page application, no routing needed.
- **State:** in-memory only, using Angular signals.
- **Responsive:** usable from 360px wide mobile to desktop. On desktop, two columns (food browser | diary). On mobile, stacked.
- **Accessibility:** all controls keyboard-operable, form fields have labels, error messages linked via `aria-describedby`, sufficient colour contrast, visible focus states. List selection is reachable by keyboard.
- **Performance:** interactions feel instant (< 100 ms) with up to a few hundred foods.
- **Browser support:** latest evergreen Chrome, Edge, Firefox, Safari.

## 9. Seed Data (per serving)
Values are approximate and for demo purposes. Agents may adjust slightly but must keep at least 20 items across breakfast, lunch and dinner type foods.

| Food | Serving | kcal | Protein g | Carbs g |
|---|---|---|---|---|
| Boiled egg | 1 piece | 78 | 6.3 | 0.6 |
| Oats (dry) | 40 g | 150 | 5.0 | 27.0 |
| Whole milk | 240 ml | 150 | 8.0 | 12.0 |
| Banana | 1 piece | 105 | 1.3 | 27.0 |
| Apple | 1 piece | 95 | 0.5 | 25.0 |
| White bread | 1 piece | 79 | 2.7 | 15.0 |
| Peanut butter | 1 tbsp | 94 | 3.6 | 3.2 |
| Plain yogurt | 100 g | 61 | 3.5 | 4.7 |
| White rice (cooked) | 100 g | 130 | 2.7 | 28.0 |
| Brown rice (cooked) | 100 g | 123 | 2.7 | 25.6 |
| Chicken breast (cooked) | 100 g | 165 | 31.0 | 0.0 |
| Salmon (cooked) | 100 g | 206 | 22.0 | 0.0 |
| Lentils (cooked) | 100 g | 116 | 9.0 | 20.0 |
| Chickpeas (cooked) | 100 g | 164 | 8.9 | 27.4 |
| Potato (boiled) | 100 g | 87 | 1.9 | 20.1 |
| Broccoli (cooked) | 100 g | 35 | 2.4 | 7.2 |
| Paneer | 100 g | 265 | 18.0 | 1.2 |
| Tofu | 100 g | 76 | 8.0 | 1.9 |
| Pasta (cooked) | 100 g | 158 | 5.8 | 31.0 |
| Olive oil | 1 tbsp | 119 | 0.0 | 0.0 |
| Almonds | 28 g | 164 | 6.0 | 6.1 |
| Roti / chapati | 1 piece | 120 | 3.1 | 18.0 |

## 10. User Stories and Acceptance Criteria

**US-1 Browse and search foods**
- Given the app loads, then the seed foods are listed with nutrition per serving.
- When I type "chi", then only foods whose names contain "chi" are shown.

**US-2 View a food and its serving**
- When I click "Banana", then a detail panel shows `1 piece`, 105 kcal, 1.3 g protein, 27 g carbs.
- When I change servings to 2, then the preview shows 210 kcal, 2.6 g protein, 54 g carbs.

**US-3 Add food to a meal**
- Given Banana x 2 is selected and meal is Breakfast, when I click Add, then Breakfast lists "Banana, 2 servings" and the Breakfast subtotal and daily totals increase by the preview values.

**US-4 Add a custom food**
- Given I search for "Dosa" and nothing matches, when I click "Add food", fill all fields validly and submit, then "Dosa" appears in the list with a Custom badge and is selected.
- Given I enter a name that already exists, then submit is blocked and an inline error is shown.
- Given I enter a negative number or leave a field empty, then submit is blocked and the relevant error is shown.

**US-5 Remove an entry**
- When I remove an entry, then it disappears and the meal subtotal and daily totals decrease accordingly.

**US-6 Totals are always consistent**
- At any time, daily totals equal the sum of the three meal subtotals, which equal the sum of their entries.

## 11. Edge Cases
- Servings must be a positive number. Empty, 0 or negative disables the Add button.
- Very large servings values (e.g. 1000) should not break layout.
- Names are trimmed. Names with only whitespace are invalid.
- Floating point: 0.1 + 0.2 style artifacts must not appear in the UI because of display rounding.

## 12. Success Criteria for v1
- All acceptance criteria in Section 10 pass (verified by unit tests for logic and manual check for UI).
- `ng build` and `ng test` pass with no errors.
- No console errors at runtime.

## 13. Future Ideas (out of scope)
Daily goals with progress bars, localStorage persistence, date navigation, snacks, edit and delete custom foods, gram-based quantity input, charts.

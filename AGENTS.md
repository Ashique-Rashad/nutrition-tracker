# AGENTS.md

Instructions for AI coding agents (opencode) working in this repository.

## Project
**Nutrition Tracker**: a single-page Angular 20 app to log daily food intake (Breakfast, Lunch, Dinner) and auto-calculate total **calories, protein and carbohydrates**. In-memory data only. No backend, no API, no persistence.

## Read First
Before writing code, read these files in order:
1. `docs/PRD.md`: what to build, acceptance criteria, seed data.
2. `docs/Architecture.md`: folder structure, models, stores, components, data flow.
3. `docs/Tech-Stack.md`: allowed tools and Angular 20 conventions.

If these documents conflict with a user message, follow the user message and mention the conflict. If something is ambiguous or missing, ask the user instead of guessing on anything that changes behavior or adds dependencies.

## Commands
| Task | Command |
|---|---|
| Install | `npm install` |
| Dev server | `npm start` (http://localhost:4200) |
| Build | `npm run build` |
| Unit tests (CI mode) | `npx ng test --watch=false --browsers=ChromeHeadless` |
| Format | `npx prettier --write "src/**/*.{ts,html,css}"` |

Run build and tests before declaring a task done.

## Tech Rules (summary)
- Angular 20, standalone components only, TypeScript strict, npm.
- State: signals in injectable stores (`FoodCatalogStore`, `FoodLogStore`). No NgRx, no RxJS-based state.
- Forms: typed Reactive Forms.
- Styling: plain CSS with CSS variables. No UI libraries.
- Every component uses `ChangeDetectionStrategy.OnPush`.
- No routing, no `HttpClient`, no `localStorage`/`sessionStorage`/IndexedDB.

## Code Style
- Use `input()`, `output()`, `model()`, `computed()`, `signal()`, `inject()`.
- Use `@if`, `@for (... ; track item.id)`, `@switch`. Never `*ngIf` / `*ngFor`.
- Do not write `standalone: true` (default in Angular 20).
- File naming follows the Angular 20 CLI style: `food-browser.ts`, `food-browser.html`, `food-browser.css`, class `FoodBrowser`. Stores use `*.store.ts` and class names ending in `Store`. Models use `*.model.ts`.
- Selector prefix `app-`.
- No `any`. No non-null assertions (`!`) unless justified with a comment.
- Treat state as immutable: use `signal.update(list => [...list, item])`, never mutate arrays or objects in place.
- Keep business logic out of components: put calculations in `utils/nutrition-math.ts` and state changes in stores.
- Do not round numbers in logic. Round only in templates with the `number` pipe (calories `'1.0-0'`, protein and carbs `'1.0-1'`).
- Keep components small and focused. Prefer clarity over cleverness.
- Add short comments only where intent is non-obvious.

## Domain Rules
- Nutrition values on a `FoodItem` are for ONE serving (`servingSize` + `servingUnit`).
- Log entry nutrition = food nutrition x `servings`.
- Meals are exactly: `breakfast`, `lunch`, `dinner`.
- Food names are trimmed and unique (case-insensitive).
- Servings must be > 0. Nutrition numbers must be >= 0. Serving size must be > 0.
- Totals update automatically via `computed` signals. Never add a "Calculate" button.

## Testing
- Write unit tests for `nutrition-math`, `FoodCatalogStore`, `FoodLogStore` (required).
- Write component tests for `AddFoodForm` validation and `FoodBrowser` search (recommended).
- Tests live next to the source file as `*.spec.ts`.
- Do not delete or weaken a failing test to make it pass. Fix the cause.

## Workflow
1. Work in the order given in `docs/Architecture.md` section 12. Complete one step at a time.
2. After each step: build passes, tests pass, then summarize what changed.
3. Make small, focused changes. Do not refactor unrelated code.
4. Keep the app runnable at the end of every step.

## Boundaries

### Always
- Follow the docs in `docs/`.
- Keep accessibility requirements from the PRD (labels, keyboard use, focus styles, aria-live for totals).
- Keep the UI responsive (360px and up).

### Ask first
- Adding any new npm dependency.
- Changing the data model, folder structure or scope described in the docs.
- Adding features from the PRD "Non-Goals" or "Future Ideas".

### Never
- Add a backend, API calls, mock servers, or persistence.
- Use NgModules, `*ngIf`/`*ngFor`, or constructor injection.
- Commit secrets, or edit generated files such as `package-lock.json` by hand.
- Run destructive commands (`rm -rf` outside `dist/` or `node_modules/`, `git reset --hard`, force pushes) without being asked.

## Definition of Done
- [ ] Feature matches the relevant acceptance criteria in `docs/PRD.md`.
- [ ] `npm run build` succeeds with no errors or warnings.
- [ ] Unit tests pass.
- [ ] No console errors when running the app.
- [ ] Code follows the conventions above.

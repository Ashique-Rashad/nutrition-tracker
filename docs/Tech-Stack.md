# Tech Stack

## Summary
| Area | Choice | Notes |
|---|---|---|
| Framework | **Angular 20** | Standalone components only. No NgModules. |
| Language | **TypeScript** (strict mode) | Use the version bundled with Angular 20 (5.8+). |
| Runtime | **Node.js 20.19+** (or 22.12+ / 24) | Required by Angular 20 CLI. |
| Package manager | **npm** | Keep `package-lock.json` committed. |
| Build | Angular CLI with the **esbuild application builder** (default) | `ng serve`, `ng build`. |
| State | **Angular Signals** (`signal`, `computed`) in injectable stores | No NgRx, no RxJS state. |
| Forms | **Reactive Forms** (typed) | Used for the "Add food" form. |
| Change detection | `ChangeDetectionStrategy.OnPush` on every component | Default zone-based setup, no zoneless config needed. |
| Styling | **Plain CSS** (component styles + one global `styles.css` with CSS variables) | No UI library, no Tailwind. |
| Routing | **None** | Single page, no `provideRouter`. |
| HTTP / API | **None** | Do not add `HttpClient`. |
| Persistence | **None** | In-memory only. |
| Unit tests | **Karma + Jasmine** (Angular 20 default) | Focus on stores and calculation logic. |
| Lint / format | **Prettier** (and optionally `angular-eslint`) | Keep config minimal. |

## Angular 20 Conventions to Follow
- Standalone components (the default). Do NOT set `standalone: true` explicitly, it is the default since v19.
- Use **signal-based APIs**: `input()`, `input.required()`, `output()`, `model()`, `computed()`, `signal()`.
- Use **built-in control flow**: `@if`, `@for` (always with `track`), `@switch`. Do NOT use `*ngIf`, `*ngFor`, `NgIf`, `NgFor`.
- Use `inject()` instead of constructor injection.
- Use `@Injectable({ providedIn: 'root' })` for stores.
- Angular 20 CLI generates files **without** the `.component` / `.service` suffix (e.g. `food-list.ts`, class `FoodList`). Follow that for components. For stores use an explicit `.store.ts` suffix and `Store` class suffix (e.g. `food-catalog.store.ts`, `FoodCatalogStore`) to avoid name clashes with models.
- Component selector prefix: `app-`.
- Prefer `class` and `style` bindings over `ngClass` / `ngStyle`.
- Put templates and styles in separate files unless very small (< ~15 lines).

## Dependencies
Only what `ng new` gives you. Do not add runtime dependencies without explicit approval. In particular, do NOT add:
- Angular Material / CDK, Bootstrap, Tailwind, PrimeNG
- NgRx, Akita, or other state libraries
- lodash, moment, date-fns
- json-server or any mock API

## Scaffold Command
```bash
npm install -g @angular/cli@20
ng new nutrition-tracker --style=css --routing=false --ssr=false
```
Answer prompts: no SSR/SSG, no zoneless, AI tooling optional.

## Scripts (from package.json)
| Command | Purpose |
|---|---|
| `npm start` (`ng serve`) | Dev server at http://localhost:4200 |
| `npm run build` (`ng build`) | Production build into `dist/` |
| `npm test` (`ng test`) | Unit tests (Karma). For CI use `ng test --watch=false --browsers=ChromeHeadless` |

## TypeScript Settings
Keep Angular's defaults, which are already strict:
`strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `strictTemplates`.
No `any`. Use `unknown` and narrowing if the type is truly unknown.

## Why These Choices
- **Signals + stores** are the simplest fit for in-memory state with derived totals (`computed` recalculates automatically).
- **No UI library** keeps the project small and gives the agent less to get wrong.
- **Reactive Forms** give clean validators (required, min, unique-name custom validator).
- **No routing / HTTP** matches the single-page, no-API requirement.

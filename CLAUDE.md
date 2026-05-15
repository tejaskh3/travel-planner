# Frontend Project Conventions

A generic, drop-in CLAUDE.md for any React + TypeScript + Tailwind frontend repo. Adjust the formatter command, base branch name, and any tooling notes (`cn`/`clsx`, router, state lib) to match the project.

## Code Style

- When fixing bugs or implementing features, check the existing codebase for utility methods and patterns before creating new abstractions. Prefer the simplest approach that matches existing code.

## Workflow

- When the user points you to a specific file, go there immediately. Do not spend time exploring the codebase broadly when the user has already identified the location.

## CI / Formatting

- Run the project's formatter (e.g. `prettier --write`, `biome format --write`, or whatever the repo configures) **only on files you changed**, not the entire codebase. CI checks formatting — scope your changes carefully.

## Styling / Tailwind

- Use Tailwind utilities only. **No inline `style={{}}`** (exception: truly dynamic values like computed `transform` or `width: ${pct}%`).
- **No custom CSS files, no CSS modules, no `styled-components`.**
- Check the project's Tailwind version before using newer utilities (e.g. `size-*` requires Tailwind v3.4+). When in doubt, use `h-<n> w-<n>` for icon sizing.
- Use raw class strings for static cases; reach for the project's class-composition util (`cn`, `clsx`, `cs`, etc.) only when conditionally composing classes.

## Coding Standards

### Naming Conventions

- **camelCase everywhere for JS/TS identifiers**: variables, functions, object keys, route objects.
  - Avoid `snake_case` keys like `product_list` or `user_profile`.
  - Prefer `productList`, `productDetail`, `userProfile`.

### File and Directory Naming

- **Directories and files**: kebab-case.
- **File suffixes**:
  - Components: `.tsx` (e.g., `user-basic-info.tsx`)
  - Hooks: `.hook.tsx` (e.g., `use-user-query-params.hook.tsx`)
  - Utilities: `.util.ts` / `.utils.ts` (e.g., `user-basic-info.util.ts`)
  - Types: `.types.ts` (e.g., `user.types.ts`)
  - DTOs: `.dto.ts` (e.g., `update-user.dto.ts`)
  - Enums: `.enum.ts` (e.g., `user.enum.ts`)
  - Constants: `.constants.ts` (e.g., `user.constants.ts`)
  - Store: `.store.ts` (e.g., `user.store.ts`)
  - API: `.api.ts` (e.g., `user.api.ts`)

### Module/Feature Directory Structure

```markdown
module-name/
  components/
    component-name/
      component-name.tsx
      component-name.types.ts
      component-name.util.ts   # No index.ts — barrel files are banned
  hooks/
  constants/
  types/
  store/
  enums/
  module-name.tsx
```

### API Directory Structure

- All API-related files live under `src/api/`, organized by module:

```markdown
src/api/
  module-name/
    module-name.api.ts
    module-name.dto.ts
    module-name.enum.ts
    module-name.types.ts
```

- **Directory names**: kebab-case (e.g., `user/`, `user-profile/`, `variable-components/`).
- **File names**: `{module-name}.{purpose}.ts` (e.g., `user.api.ts`, `user.dto.ts`).
- Sub-features get subdirectories (e.g., `payments/logs/`, `billing/invoices/`).
- Avoid legacy patterns like `src/api/user.ts` or `userApi.ts`, or API files nested under `src/modules/...`.

### Component Naming

- **Function names**: PascalCase (e.g., `UserAdditionalOptions`, `DashboardHome`).
- **Exports**: Named exports (e.g., `export const UserOptions = () => { ... }`).
- **File names**: kebab-case matching the component (e.g., `user-additional-options.tsx`).

### Constants Naming

- **Constant variables**: UPPER_SNAKE_CASE (e.g., `USER_QUERY_PARAMS`, `VALID_ROLE_TYPES`).
- **Object keys inside constants**: camelCase.

```typescript
// ✅ GOOD
export const USER_QUERY_PARAMS = {
  date: "date",
  search: "search",
};
```

### Enum Naming

- **Enum name**: PascalCase suffixed with `Enum` (e.g., `PermissionTypeEnum`).
- **Enum members**: UPPER_SNAKE_CASE (e.g., `APPROVAL_PENDING`).
- `as const` objects follow the same naming convention.

```typescript
// ✅ GOOD
export enum ButtonStateEnum {
  DEFAULT = "DEFAULT",
  ACTIVE = "ACTIVE",
}

export const FeatureStatusEnum = {
  ENABLED: "ENABLED",
  DISABLED: "DISABLED",
} as const;
```

### Utility Naming

- **Utility classes**: PascalCase suffixed with `Util` (e.g., `DateUtil`, `StringUtil`).
- **Standalone utility functions**: camelCase (e.g., `getFormattedRoute`).
- **File names**: kebab-case with `.util.ts` suffix.

### Hook Naming

- **Hook functions**: camelCase with `use` prefix (e.g., `useUserQueryParams`).
- **File names**: `use-` prefix, `.hook.tsx` suffix (e.g., `use-user-query-params.hook.tsx`).

### Export Patterns

- Prefer **named exports** for components, hooks, utilities, constants, and enums.
- **Default exports** are reserved for framework-required files (e.g. Next.js `page.tsx`).
- **Barrel files (`index.ts`) are strictly banned.** Never create `index.ts` that re-exports from other files. Import directly from the source file.

### Types

- Types should be prefixed with **T** unless they end in **Dto** or **Props**.
  - Examples: `TUserFormValues`, `UserReqDto`, `UserResDto`, `AddEditUserModalProps`.
- **Interfaces are banned**; always use `type` aliases.


### Component Coding Structure

Within React function components, follow this order:

1. Localization and contexts – `useLocale`, etc.
2. Routing – `useRouter`, `useRouterQuery`, etc.
3. Derived variables from routing/query – e.g., `isEditFlow`, `id`
4. Store-specific hooks – e.g., `useConfigStore`, `useGlobalStore`
5. Context hooks – e.g., `useUserProfile`
6. Component-specific hooks – e.g., `useTemplateMapping`
7. State management – `useState` and similar
8. Data fetching – `useQuery`, `useMutation`
9. Form management – e.g., `useForm`
10. Memoization and callbacks – `useCallback`, `useMemo`
11. Utility functions (helpers used by effects or JSX)
12. Submit/CTA handlers
13. Lifecycle effects – `useEffect`
14. Derived variables to simplify JSX – e.g., `isLoading`, `isDisabled`, `title`, `description`
15. Return statement with JSX

### Page Components (`page.tsx`)

- `page.tsx` files should **only import and re-export** a module component.
- Do not implement full page JSX directly inside `page.tsx`.

```typescript
// ✅ GOOD
import { HelloWorldComponent } from "@/module/hello-world/hello-world";

export default HelloWorldComponent;
```

### Internationalization (locale files)

- **Strictly do not read from or write to** `message.json` (or any locale resource file). These are managed outside coding tasks — treat them as read-only and out of scope.

### Shared Components and Icons

- **Always prefer existing shared components** from `src/components` before creating new ones.
- **Always prefer existing icons** from `src/icons` before introducing new icon assets.
- Only create new components/icons when reuse is clearly not possible, and keep them consistent with existing patterns.

### Data Layer

- **API calls live only in `src/api/<module>/<module>.api.ts`.** Never call `fetch`/`axios` directly from a component, hook, or util.
- **All request and response shapes must be typed via DTOs** in `src/api/<module>/<module>.dto.ts`. No `any`, no inline shapes at the call site.
- **React Query is the only data-fetching layer.** Call `useQuery` / `useMutation` directly in the component when there's no extra logic. Wrap them in a module-scoped hook (`module-name/hooks/`) only when there's real logic to encapsulate (param shaping, response transforms, composed queries, shared invalidation). Do not create a wrapper hook just to alias a bare `useQuery` call.
- **Query keys** follow a stable shape, e.g. `['module', 'entity', id]`. Document the key in the same hook file.
- **After mutations**, invalidate the affected query keys via `queryClient.invalidateQueries(...)`. Do not refetch manually or mirror server state into `useState`.
- **No data fetching inside `page.tsx`** — `page.tsx` only re-exports a module component.

### State Management — Decision Tree

Pick the right layer before reaching for `useState`:

- **URL / query params** (e.g. `nuqs` — `useQueryState` with `parseAsString` / `parseAsStringEnum` / etc., or the project's `useRouterQuery`) → filters, pagination, tabs, selected row, anything that should survive refresh or be shareable. Do not parse `window.location.search` or hand-roll `URLSearchParams`.
- **Zustand store** (`*.store.ts`) → state shared across modules, pages, or sibling trees.
- **React Query cache** → all server state. Do not copy server data into `useState`.
- **`useState`** → ephemeral local UI only (open/closed, hover, input draft, transient form state not handled by the form library).

### useEffect Discipline

- **Avoid `useEffect` wherever possible.** Reach for library- or event-driven alternatives first:
  - **Data fetching** → `useQuery` / `useMutation`. Never fetch in `useEffect`.
  - **State updates from user actions** → `setState` directly in event handlers (`onClick`, `onChange`, `onSubmit`, etc.).
  - **Derived state** → compute inline during render, or use `useMemo`. **Never** `useEffect + setState` to mirror props/state.
  - **Subscriptions / listeners** → use the library or framework primitive (e.g. router events, store subscribers).
- Only use `useEffect` as an **absolute last resort** when no library or event-driven alternative exists (e.g. syncing with a non-React external system).

### Forms

- **`react-hook-form` is the only form pattern.** Do not manage form fields with raw `useState`.
- Use schema validation (the project's existing schema lib, e.g. zod) — no inline manual validation.
- Form value types use the `T` prefix, e.g. `TUserFormValues`.
- Standard handler naming: `onSubmit`, `handleSubmit`. Submit handlers go in section 12 of the component order above.

### UI States (loading / empty / error / success)

- Every data-driven view must **explicitly handle all four states**: loading, empty, error, success.
- Use the shared skeleton, empty-state, and error-state components from `src/components`. Never render `null` while loading.
- `useQuery` errors must surface to the user — do not swallow them.

### Error Handling

- Surface API errors via the shared toast utility. Do not `console.log` and continue.
- Do not wrap `useQuery` / `useMutation` calls in `try/catch` — use their `error` / `onError` handlers.
- Only use `try/catch` around genuinely throwing async code (file parsing, JSON, third-party SDKs).

### TypeScript Discipline

- **No `any`.** Use `unknown` and narrow, or import the proper DTO type.
- **No `as` casting** except at true boundaries (parsing `unknown`, third-party shims) — and add a one-line comment explaining why.
- Do not redeclare DTO shapes locally — import from `src/api/<module>/<module>.dto.ts`.

### Conditional Rendering

- Prefer **early returns / guard clauses** over deeply nested ternaries.
- Use `&&` only when the left side is strictly boolean. Avoid the classic `0 && <X />` and `"" && <X />` footguns — wrap with `Boolean(...)` or use a ternary.

### Performance

- Do not sprinkle `useMemo` / `useCallback` defensively. Reach for them only when there's a measured reason or a referential-equality dependency (memoized child, hook dependency array).
- Lists must use a **stable, unique `key`** prop. Never use the array index for dynamic lists.

### Imports

- **Always use the `@/` path alias** for project imports. No `../../../` chains.
- Import directly from source files (no barrel `index.ts`).
- Group order: external packages → `@/` project imports → relative imports.

### Routing & Navigation

- Use the project's router hooks (`useRouter`, `useRouterQuery`, etc.). **Never use `window.location`** for navigation.
- Route definitions live in `src/routes/routes.ts` (or the project's equivalent) with camelCase keys.
- Read query/search params via the project's hooks, not `window.location.search` or raw `URLSearchParams`.

### Modals, Dialogs, Toasts

- Use the shared modal, dialog, and toast primitives from `src/components`. Do not roll your own portal, overlay, or alert.
- Pick one open-state pattern per feature (parent-controlled `useState` **or** store-backed) and stay consistent within the module.


### Local Context

- If a `.claude.local/` directory is present at the project root, refer to it for additional local context (API contracts, plans, scratch notes). Treat its contents as supplementary reference material when relevant to the task.

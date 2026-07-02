- UI: MUI only — never use plain HTML equivalents (`<Button>` not `<button>`)
- State: Redux Toolkit with typed `useAppDispatch`/`useAppSelector` from `reduxComponents/hooks.ts`
- HTTP: axios via `@/services/axiosConfig.ts`; API responses follow `ApiResponse<T>` with optional `ApiError`
- Async operations: `async/await` with Redux thunks; errors via `apiErrorHandler` from `@/services/apiErrorHandler.ts`
- Component props: type as `Readonly<Props>`
- Route guards: `<PrivateRoute>` for auth-required pages, `<GuestRoute>` for unauthenticated-only pages
- Route constants and path helpers: `@/router/routes.ts`
- Import alias: `@/` resolves to `src/`
- No `any` type — use `unknown` and narrow explicitly
- No inline styles — use MUI `sx` prop only
- No `console.log` in committed code

- Validation: `touched` (per-field on blur) + `submitAttempted` (on submit attempt)
- Logic in custom hook (e.g., `hooks/useAddMemberForm.ts`); field components are stateless, receive only values and callbacks

- `components/fields/` — stateless reusable field components shared across features
- `components/{feature}/` — feature-scoped components (e.g., `components/familyTree/`)
- `hooks/` — custom hooks
- `services/api/` — static service classes (`class FamilyMembersService { static async ... }`)
- `types/` — TypeScript interfaces matching backend DTOs exactly

## Project Structure
**Frontend:**
- `components/fields/` — stateless reusable field components
- `components/{feature}/` — feature-scoped components
- `hooks/` — custom hooks
- `services/api/` — static service classes
- `types/` — TypeScript interfaces matching backend DTOs
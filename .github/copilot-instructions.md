# Copilot Instructions

## Backend (.NET)
- `User` extends `IdentityUser<int>`; `FamilyTreeContext` extends `IdentityDbContext<User, IdentityRole<int>, int>`
- Service methods return `(bool Success, T? Data, string? Error)` — never throw for business logic failures
- Controllers: extract `userId` via `User.FindFirstValue(ClaimTypes.NameIdentifier)`, return `Unauthorized()` if null
- All protected endpoints use `[Authorize(Policy = "ActiveUserOnly")]`
- Register services via interfaces (`IFamilyTreeService`, `IUserService`, etc.)
- `Gender` stored as string via EF Core value conversion; use `UserManager<User>` for all identity operations

## Testing (.NET)
- xUnit + Moq; naming convention: `MethodName_Condition_ExpectedResult`
- In-memory DB: `TestDbContextFactory.CreateInMemoryDbContext()`
- Test data: `TestDataSeeder` (User, FamilyTree, Person, TreeMember)
- Mocks: `MockServiceFactory` — `UserManager<User>`, `ILogger<T>`, `IPersonFactory`, `IHtmlSanitizerService`

## Frontend — Rules
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

## Frontend — Form Pattern
- Validation: `touched` (per-field on blur) + `submitAttempted` (on submit attempt)
- Logic in custom hook (e.g., `hooks/useAddMemberForm.ts`); field components are stateless, receive only values and callbacks

## Frontend — Structure
- `components/fields/` — stateless reusable field components shared across features
- `components/{feature}/` — feature-scoped components (e.g., `components/familyTree/`)
- `hooks/` — custom hooks
- `services/api/` — static service classes (`class FamilyMembersService { static async ... }`)
- `types/` — TypeScript interfaces matching backend DTOs exactly
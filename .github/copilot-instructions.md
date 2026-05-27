# Copilot Instructions

## Project Overview
FamilyTreeApp is a full-stack app with an ASP.NET Core 10 Web API backend and a React + TypeScript frontend (Vite).

## Backend (.NET)
- `User` model extends `IdentityUser<int>`; `FamilyTreeContext` extends `IdentityDbContext<User, IdentityRole<int>, int>`
- All service methods return `(bool Success, T? Data, string? Error)` tuples — never throw exceptions for business logic failures
- Controllers extract `userId` via `User.FindFirstValue(ClaimTypes.NameIdentifier)` and return `Unauthorized()` if null
- Controllers use `[Authorize(Policy = "ActiveUserOnly")]` for protected endpoints
- Services are registered via interfaces (e.g., `IFamilyTreeService`, `IUserService`)
- `Gender` enum is stored as a string in the database via EF Core value conversion
- `UserManager<User>` is used for all identity operations (creation, token generation, etc.)

## Testing (.NET)
- Use **xUnit** for tests and **Moq** for mocking
- Use `TestDbContextFactory.CreateInMemoryDbContext()` for EF Core in-memory DB
- Use `TestDataSeeder` for creating test entities (User, FamilyTree, Person, TreeMember)
- Use `MockServiceFactory` for creating mocks of `UserManager<User>`, `ILogger<T>`, `IPersonFactory`, `IHtmlSanitizerService`
- Test method naming: `MethodName_Condition_ExpectedResult`

## Frontend (React + TypeScript)
- Use **MUI (Material UI)** components — never plain HTML equivalents (e.g., use `<Button>` not `<button>`)
- State management via **Redux Toolkit** — use typed `useAppDispatch` and `useAppSelector` hooks from `reduxComponents/hooks.ts`
- API calls use **axios** via a configured instance in `axiosConfig.ts`
- API responses follow the `ApiResponse<T>` interface with an optional `ApiError`
- Use `async/await` with thunks for async Redux operations
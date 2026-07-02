# Adding a Backend Feature

Follow this when implementing a new endpoint, service, or database model.

## Service Pattern
- Service methods return `(bool Success, T? Data, string? Error)` — never throw for business logic failures
- Register via interfaces: `builder.Services.AddScoped<IFeatureService, FeatureService>()`
- `User` extends `IdentityUser<int>`; use `UserManager<User>` for identity operations

## Controller Pattern
- Extract `userId`: `User.FindFirstValue(ClaimTypes.NameIdentifier)` → return `Unauthorized()` if null
- All protected endpoints: `[Authorize(Policy = "ActiveUserOnly")]`
- Route: `[Route("api/...")]`
- Return status codes correctly: `CreatedAtAction()`, `NoContent()`, `Forbid()`, `NotFound()`

## Database Patterns
- `FamilyTreeContext` extends `IdentityDbContext<User, IdentityRole<int>, int>`
- `Gender` as string via EF Core value conversion: `HasConversion<string>()`

## DTOs
- Create separate `CreateFooDto`, `UpdateFooDto`, `FooDto` classes
- Validation via `[Required]`, `[StringLength]`, `[EmailAddress]` attributes

## Project Structure
**Backend:** `Services/`, `Controllers/`, `Models/`, `Dtos/`
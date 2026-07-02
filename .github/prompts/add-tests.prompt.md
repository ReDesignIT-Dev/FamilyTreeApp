# Adding Tests

Follow this when writing unit tests for services or controllers.

## Backend (.NET)
- Framework: xUnit + Moq
- Naming: `MethodName_Condition_ExpectedResult`
- In-memory DB: `TestDbContextFactory.CreateInMemoryDbContext()`
- Test data: `TestDataSeeder` (User, FamilyTree, Person, TreeMember)
- Mocks: `MockServiceFactory` provides `UserManager<User>`, `ILogger<T>`, `IPersonFactory`, `IHtmlSanitizerService`

## Test Structure
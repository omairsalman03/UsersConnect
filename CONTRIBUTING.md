# Contributing to UsersConnect

First off, thank you for considering contributing to UsersConnect! It's people like you that make open source such a great community.

## Code of Conduct

This project and everyone participating in it is governed by basic principles of respect and professionalism. By participating, you are expected to uphold these standards.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples**
* **Describe the behavior you observed and what you expected**
* **Include screenshots if relevant**
* **Include your environment details** (OS, Node version, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a detailed description of the suggested enhancement**
* **Explain why this enhancement would be useful**
* **List any similar features in other applications**

### Pull Requests

Before your first pull request can be merged, you'll need to sign the [Contributor License Agreement](CLA.md). A bot comments on your pull request with a link; signing takes a minute and covers your future contributions too.

1. Fork the repo and create your branch from the default branch
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Make sure `npm run build` succeeds and any tests pass
5. Match the style of the file you're editing
6. Issue that pull request!

## Development Setup

### Prerequisites

- Node.js 22 or later (the Docker image uses 26)
- MySQL 8.0+
- Redis 6.0+
- Git

### Setup Steps

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/usersconnect.git
   cd usersconnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```sql
   CREATE DATABASE usersconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── config/          # Configuration, database, Redis, logging
├── controllers/     # Request handlers
│   ├── api/         # REST API endpoints
│   └── web/         # Page rendering controllers
├── middlewares/     # Express middlewares
│   ├── auth/        # Authentication checks
│   └── validation/  # Input validation
├── entities/        # TypeORM entities
├── migrations/      # Database migrations
├── services/        # Business logic
├── routers/         # Route definitions
├── utils/           # Helper functions
├── views/           # Handlebars templates
│   ├── emails/      # Email templates
│   ├── layouts/     # Page layouts
│   ├── pages/       # Full pages
│   └── partials/    # Reusable components
└── public/          # Static files (CSS, JS, images)
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict type checking
- Avoid using `any` type when possible
- Use interfaces for object shapes
- Export types alongside implementations

### Code Style

The codebase isn't fully consistent yet: some files use 2-space indentation and others 4, and brace placement and quote style vary. So:

- **Match the style of the file you're editing.** A consistent file matters more than a consistent project
- Use semicolons
- Use meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for complex functions

### Example:

```typescript
/**
 * Updates a user's profile information
 * @param userId - The unique identifier of the user
 * @param userData - The updated user data
 * @returns The updated user object or an error message
 */
async updateUser(userId: string, userData: UpdateUserDto): Promise<PublicUser | string> {
  // Implementation
}
```

### Naming Conventions

- **Files**: camelCase for TypeScript files (e.g., `userService.ts`)
- **Classes**: PascalCase (e.g., `UserService`)
- **Functions/Methods**: camelCase (e.g., `getUserById`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_LOGIN_ATTEMPTS`)
- **Interfaces**: PascalCase with 'I' prefix optional (e.g., `UserPayload`)

## Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests after the first line

### Commit Message Format

```
type(scope): subject

body

footer
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add password reset functionality

- Add forgot password endpoint
- Implement email sending for reset links
- Add password reset token validation

Closes #123
```

```
fix(posts): resolve like count synchronization issue

The like count was not updating correctly when users
rapidly liked/unliked posts. This fix implements
optimistic locking to prevent race conditions.

Fixes #456
```

## Testing

> There are currently no automated tests. Jest is configured, so tests for new and existing code are very welcome.

### Writing Tests

- Write tests for all new features
- Update tests when modifying existing code
- Aim for good test coverage, especially for business logic
- Use descriptive test names that explain what is being tested

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

```typescript
describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('getUserById', () => {
    it('should return user data for valid ID', async () => {
      // Arrange
      const userId = '123';
      
      // Act
      const result = await userService.getUserById(userId);
      
      // Assert
      expect(result).toBeDefined();
      expect(result._id).toBe(userId);
    });

    it('should return null for non-existent user', async () => {
      const result = await userService.getUserById('invalid-id');
      expect(result).toBeNull();
    });
  });
});
```

## Database Migrations

When making changes to the database schema:

1. Create a migration file in TypeORM
2. Test the migration locally
3. Document any breaking changes
4. Update the relevant model entities

```bash
npm run migration:create -- src/migrations/YourMigrationName
```

## Documentation

* Keep README.md up to date
* Document all public APIs
* Add JSDoc comments to functions
* Update CHANGELOG.md for notable changes

## Questions?

Feel free to open an issue with your question, or email OmairSalman@outlook.com.

## License

UsersConnect is licensed under [AGPL-3.0-only](LICENSE); see [LICENSING.md](LICENSING.md) for which license applies to which version.

Contributions are accepted under the [Contributor License Agreement](CLA.md), which you sign once, on your first pull request. You keep the copyright in your contributions; the agreement grants the project a license to use them, including the ability to offer the project under other license terms in the future.
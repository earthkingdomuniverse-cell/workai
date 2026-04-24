# Contributing to WorkAI

Thank you for your interest in contributing to WorkAI! This document provides guidelines for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Security](#security)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code:

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Respect different viewpoints and experiences

## Getting Started

1. **Fork the repository**

   ```bash
   gh repo fork earthkingdomuniverse-cell/workai
   ```

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/workai.git
   cd workai
   ```

3. **Set up upstream remote**
   ```bash
   git remote add upstream https://github.com/earthkingdomuniverse-cell/workai.git
   ```

## Development Setup

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Git
- Docker (optional)

### Installation

```bash
# Install dependencies
npm ci

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Run database migrations (if applicable)
npm run db:migrate

# Start development server
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

## How to Contribute

### Reporting Bugs

Before creating a bug report:

1. Check if the issue already exists
2. Update to the latest version
3. Try to reproduce with minimal steps

**Bug Report Template:**

```markdown
**Description:**
Clear description of the bug

**Steps to Reproduce:**

1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**

- OS: [e.g., macOS, Linux]
- Node Version: [e.g., 20.11.0]
- Version: [e.g., 1.0.0]
```

### Suggesting Features

We welcome feature suggestions! Please:

1. Check if the feature has already been requested
2. Explain why this feature would be useful
3. Provide use cases and examples
4. Be open to discussion

### Pull Requests

1. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make your changes**
   - Write clear, concise code
   - Add tests for new functionality
   - Update documentation

3. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Avoid code duplication

### Style Guide

```typescript
// ✅ Good
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Bad
function calc(a) {
  var total = 0;
  for (var i = 0; i < a.length; i++) {
    total += a[i].price;
  }
  return total;
}
```

### Testing

- Write unit tests for new functionality
- Maintain test coverage > 80%
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

```typescript
// ✅ Good test
describe('calculateTotal', () => {
  it('should sum all item prices', () => {
    // Arrange
    const items = [{ price: 10 }, { price: 20 }];

    // Act
    const result = calculateTotal(items);

    // Assert
    expect(result).toBe(30);
  });
});
```

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/dependency changes

### Examples

```bash
feat(api): add user authentication
fix(db): resolve connection timeout issue
docs(readme): update installation instructions
refactor(utils): simplify error handling
test(auth): add tests for JWT validation
chore(deps): update dependencies
```

## Pull Request Process

1. **Update Documentation**
   - Update README if needed
   - Update CHANGELOG if applicable
   - Add inline documentation

2. **Ensure Quality**
   - All tests pass
   - Code coverage maintained
   - No linting errors
   - Type checking passes

3. **Review Process**
   - At least one review required
   - Address review comments
   - Keep PR focused and small

4. **Merge Strategy**
   - We use "Squash and Merge"
   - PR title becomes commit message
   - Clean up branch after merge

## Security

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities.

Instead:

- Email: security@skillvalue.ai
- Subject: "Security Issue - [Brief Description]"
- Include steps to reproduce
- Allow time for response before public disclosure

### Security Best Practices

- Never commit secrets or credentials
- Use environment variables for sensitive data
- Validate all user input
- Keep dependencies updated
- Follow the principle of least privilege

## Recognition

Contributors will be:

- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Credited in the application

## Questions?

- Open an issue for discussion
- Email: earthkingdomuniverse-cell@gmail.com
- Discord: [Join our server](https://discord.gg/your-invite)

## License

By contributing, you agree that your contributions will be licensed under the same license as this project.

---

Thank you for contributing to WorkAI! 🚀

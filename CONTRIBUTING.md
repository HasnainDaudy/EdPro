# Contributing to EdPro

Thank you for your interest in contributing to EdPro. We welcome contributions from educators, developers, designers, and accessibility advocates.

---

## Development Setup

1. Fork and clone the repository.
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Initialize the development database with seed data:
   ```bash
   npm run seed
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. In a separate terminal, launch the frontend development client:
   ```bash
   npm run dev:client
   ```

---

## Code Guidelines & Standards

- **TypeScript**: Strict type checking is enabled. Avoid using `any`.
- **Formatting**: Maintain clean, idiomatic formatting.
- **Commit Messages**: Follow conventional commit conventions:
  - `feat: add student focus slider presets`
  - `fix: resolve coordinate bounding box edge case`
  - `test: add integration test for COPPA consent verification`
  - `docs: update deployment instructions`
- **Testing**: Ensure all test suites pass before submitting a pull request:
  ```bash
  npm test
  ```

---

## Child Privacy (COPPA & FERPA) Requirements

When modifying backend schemas, APIs, or data models:
1. Never collect unnecessary personal identifiers (such as physical addresses or unhashed phone numbers) from learners under 13.
2. Ensure all student educational records are protected by appropriate role-based authorization checks.
3. Verify that any database mutations involving student records are logged to the immutable audit trail.

# NestJS Functional Programming Example

This is an example NestJS REST API that demonstrates functional programming patterns while maintaining the framework's object-oriented structure.

## Features

- **Result Pattern**: Type-safe error handling without exceptions
- **Functional Repository Layer**: Custom repositories wrapping Prisma ORM
- **Functional Service Layer**: Business logic using Result pattern
- **Functional Validation**: Custom validation pipe with functional approach
- **Functional Utilities**: Compose/pipe functions for function composition
- **CRUD Operations**: Full Create, Read, Update, Delete endpoints for Users

## Architecture

```
src/
├── common/
│   ├── filters/          # Global exception filters
│   ├── pipes/            # Validation pipes
│   └── utils/            # Result pattern, compose functions
├── users/
│   ├── controllers/      # REST endpoints
│   ├── dto/              # Data transfer objects
│   ├── entities/         # Domain entities
│   ├── repositories/     # Data access layer
│   └── services/         # Business logic layer
└── main.ts               # Application entry point
```

## Functional Programming Patterns

### 1. Result Pattern
Instead of throwing exceptions, functions return `Result<T, E>` types:

```typescript
const result = await userService.createUser(dto);
if (Result.isSuccess(result)) {
  return result.value;
} else {
  // Handle error
}
```

### 2. Function Composition
Use `compose` and `pipe` utilities for building complex operations:

```typescript
const processUser = pipe(
  validateUser,
  normalizeData,
  saveToDatabase
);
```

### 3. Immutable Data
Services and repositories work with immutable data structures, returning new objects rather than mutating existing ones.

## Installation

```bash
yarn install
```

## Running the Application

```bash
# Development
yarn start:dev

# Production
yarn build
yarn start:prod
```

## API Endpoints

- `POST /users` - Create a new user
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/search/count` - Get user count
- `POST /users/search/filter` - Filter users by criteria

## Database

Uses SQLite with Prisma ORM for simplicity. To use PostgreSQL or another database:

1. Update `prisma/schema.prisma`
2. Set `DATABASE_URL` in `.env`
3. Run `yarn prisma migrate dev`

## Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e
```
# Project: Academic OS

## Project Overview

This project is a Next.js web application called "Academic OS". It is a comprehensive system for managing academic activities, including weekly planning, strategic analytics, and module tracking. The application uses a PostgreSQL database with Prisma as the ORM. The frontend is built with React and TypeScript, and styled with Tailwind CSS. The project also includes a UI library in the `packages/ui` directory.

**Key Technologies:**

*   **Framework:** Next.js 14 (App Router)
*   **Language:** TypeScript
*   **Database:** PostgreSQL
*   **ORM:** Prisma
*   **Styling:** Tailwind CSS
*   **State Management:** Zustand
*   **Testing:** Jest, Playwright

**Architecture:**

The project follows a standard Next.js project structure. The main application code is in the `src` directory. The database schema is defined in `prisma/schema.prisma`. The application uses a local PostgreSQL database managed with Docker, as defined in `docker-compose.yml`. The project also includes a UI library in the `packages/ui` directory, which contains reusable React components.

## Building and Running

**Quick Start:**

1.  Start the database:
    ```bash
    docker compose up -d db
    ```
2.  Run migrations and seed the database:
    ```bash
    npx prisma migrate deploy
    npm run seed:bit
    ```
3.  Start the application with the UI library enabled:
    ```bash
    NEXT_PUBLIC_FEATURE_UI_LIBRARY=true npm run dev
    ```

**Development:**

To run the application in development mode, use the following command:

```bash
npm run dev
```

**Production Build:**

To create a production build, use the following command:

```bash
npm run build
```

**Running in Production:**

To start the application in production mode, use the following command:

```bash
npm run start
```

**Testing:**

To run the unit tests, use the following command:

```bash
npm run test
```

To run the end-to-end tests, use the following command:

```bash
NEXT_PUBLIC_FEATURE_UI_LIBRARY=true npx playwright test tests/e2e/week-first.spec.ts
```

To run Storybook, use the following command:

```bash
npm run storybook
```

## Development Conventions

*   **Linting:** The project uses ESLint for linting. To run the linter, use the `npm run lint` command.
*   **Formatting:** The project uses Prettier for code formatting. To format the code, use the `npm run format` command.
*   **Git Hooks:** The project uses Husky for Git hooks. There is a pre-commit hook that runs linting and formatting before each commit.
*   **UI Library:** The project has a UI library in the `packages/ui` directory. When creating new UI components, they should be added to this library.
*   **Feature Flags:** The project uses feature flags to enable or disable certain features. The `NEXT_PUBLIC_FEATURE_UI_LIBRARY` feature flag is used to enable the UI library.

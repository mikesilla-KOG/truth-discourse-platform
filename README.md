# DiscourseTruth (truth-discourse-platform)

Monorepo scaffold for DiscourseTruth — a truth-seeking social network.

This repository contains two main apps:

- `apps/web`: Next.js frontend (Tailwind)
- `apps/api`: NestJS backend (Prisma + Postgres)

Quick start (development):

1. Start Postgres: `docker-compose up -d`
2. Install dependencies: `pnpm install` (recommended) or `npm install`
3. Start Postgres: `docker-compose up -d`
4. Set up API env: `cp apps/api/.env.example apps/api/.env` and edit `DATABASE_URL` if needed
5. Generate Prisma client & apply migrations: `pnpm --filter @tdp/api prisma:generate && pnpm --filter @tdp/api prisma:migrate`
6. Seed the database: `pnpm --filter @tdp/api seed`
7. Start backend: `pnpm --filter @tdp/api dev`
8. Start frontend: `pnpm --filter @tdp/web dev`

See `apps/*` for application-specific README files.

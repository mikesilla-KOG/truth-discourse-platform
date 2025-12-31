# API (NestJS + Prisma)

Environment:
- Copy `apps/api/.env.example` to `.env` and set `DATABASE_URL`.

Local dev:
1. Start Postgres: `docker-compose up -d`
2. Install deps: `pnpm install --filter @tdp/api`
3. Generate Prisma client: `pnpm --filter @tdp/api prisma:generate`
4. Run migrations: `pnpm --filter @tdp/api prisma:migrate`
5. Start dev server: `pnpm --filter @tdp/api dev`

Seed data: `pnpm --filter @tdp/api seed`


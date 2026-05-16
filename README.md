# DSA Prep

A Next.js app for DSA preparation with **topic-wise LeetCode** and **rating-wise Codeforces** problems, account sync, streaks, curated sheets (Striver SDE, NeetCode 150), notes, contests, and a leaderboard.

Built with Next.js 16 App Router, Prisma + Postgres, Auth.js v5 (Google/GitHub OAuth), Tailwind v4, and shadcn-style UI components.

## Quick start

```bash
pnpm install
cp .env.example .env
# fill in DATABASE_URL, AUTH_SECRET, OAuth client ids
pnpm prisma migrate dev --name init
pnpm db:seed           # pulls CF + LC catalogs and seeds sheets (takes 1-3 min)
pnpm dev
```

Open <http://localhost:3000>.

## Environment

| Variable                                | Required | Purpose                                                                                                 |
| --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                          | yes      | Postgres connection string. Neon pooled: `postgresql://…-pooler.<region>.neon.tech/db?sslmode=require`. |
| `DIRECT_URL`                            | yes      | Non-pooled Postgres URL used by `prisma migrate` (Neon: same as `DATABASE_URL` minus `-pooler`).        |
| `AUTH_SECRET`                           | yes      | Auth.js JWT secret. Generate with `openssl rand -base64 32`.                                            |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | optional | Google OAuth client. Authorized redirect URI: `<APP_URL>/api/auth/callback/google`.                     |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | optional | GitHub OAuth client. Authorized callback: `<APP_URL>/api/auth/callback/github`.                         |
| `CRON_SECRET`                           | yes      | Shared secret for `/api/cron/*`. Cron jobs must send `Authorization: Bearer <CRON_SECRET>`.             |
| `LEETCODE_GRAPHQL_URL`                  | no       | Default: `https://leetcode.com/graphql/`.                                                               |
| `NEXT_PUBLIC_APP_URL`                   | no       | Public app URL, used in metadata.                                                                       |

> At least one OAuth provider must be configured for users to sign in.

## Postgres setup

This project is configured for **Neon Postgres**.

1. Create a Neon project at <https://neon.tech>.
2. Copy the **pooled** connection string into `DATABASE_URL`.
3. Make a copy with the `-pooler` segment removed from the host — that's `DIRECT_URL` (Prisma migrations need a non-pooled connection).
4. Run `pnpm prisma migrate dev --name init` to create tables.

If you'd rather run Postgres locally, install it any way you like (Homebrew, Postgres.app, etc.) and point both `DATABASE_URL` and `DIRECT_URL` at the same local URL.

## Account sync

Settings → add LeetCode/Codeforces username → we generate a one-time token →

- **Codeforces**: set the token as your CF _First Name_ under Settings → Social. We read it via `user.info`.
- **LeetCode**: paste the token into your LeetCode bio (_About me_). We read it via the public GraphQL `matchedUser.profile.aboutMe`.

Click Verify. We backfill submissions (CF: last 1000; LC: last 20 AC + totals). After that the cron keeps things fresh; use the Resync button on Settings for anything in between.

## Cron jobs

Scheduling lives in `.github/workflows/cron-sync.yml` (GitHub Actions) instead of Vercel Cron, because Vercel Hobby caps crons at one run per day. The Action just `curl`s the existing Next.js routes with an `Authorization: Bearer ${CRON_SECRET}` header.

| Endpoint                  | Schedule (UTC)                           | Purpose                                                |
| ------------------------- | ---------------------------------------- | ------------------------------------------------------ |
| `/api/cron/sync-problems` | every 6h: `00, 06, 12, 18`               | refresh CF + LC catalogs and CF + LC upcoming contests |
| `/api/cron/sync-users`    | every 2h on odd hours: `01, 03, ..., 23` | incremental submission sync + leaderboard snapshot     |

Required GitHub repository secrets (`Settings -> Secrets and variables -> Actions`):

| Secret        | Value                                                                           |
| ------------- | ------------------------------------------------------------------------------- |
| `APP_URL`     | Production base URL, e.g. `https://dailydsaprep.vercel.app` (no trailing slash) |
| `CRON_SECRET` | Same value as the `CRON_SECRET` env var in your Vercel project                  |

You can also fire either job on demand from the Actions tab via **Run workflow -> External cron** and pick the target endpoint.

## Scripts

| Command                      | What it does                                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                   | Next.js dev server                                                                                                            |
| `pnpm build` && `pnpm start` | production build + serve                                                                                                      |
| `pnpm db:migrate`            | `prisma migrate dev`                                                                                                          |
| `pnpm db:push`               | push schema without migration (handy for prototyping)                                                                         |
| `pnpm db:studio`             | Prisma Studio                                                                                                                 |
| `pnpm db:seed`               | full seed (CF + LC catalogs, contests, sheets). Uses batched `createMany` — finishes in ~30-60s even against remote Postgres. |
| `pnpm seed:cf`               | Codeforces problems + contests only (~10k rows)                                                                               |
| `pnpm seed:lc`               | LeetCode catalog only (~3k rows)                                                                                              |
| `pnpm seed:sheets`           | Striver + NeetCode sheets (run after `seed:lc`)                                                                               |

## Project layout

```
src/
  app/                Next App Router (groups: marketing /, app routes /(app)/…)
  components/         UI + page components
    ui/               shadcn-style primitives
  lib/                env, db, codeforces, leetcode, utils
  server/             services + sync + server actions (no client imports)
    sync/             {codeforces, leetcode}.ts
    services/         {problems, sheets, streak, leaderboard, recommendations}
    actions/          server actions (handles, notes)
  auth.ts             Auth.js v5 entry
  middleware.ts       protected route gate
prisma/schema.prisma  data model
scripts/              seed entry points + data/{striver,neetcode}
```

## Risks & notes

- **LeetCode has no official API.** We rely on their public GraphQL. If their schema changes, `src/lib/leetcode.ts` is the single place to update.
- We never store user passwords — auth is OAuth-only.
- **Solve** buttons always open the source platform in a new tab. We don't host problem statements or judge submissions.
- The catalog seed pulls ~3000 LC problems and ~9000 CF problems. First seed takes 1-3 minutes; subsequent re-runs are upserts.

## Deploying to Vercel

1. Push to a Git repo.
2. New Vercel project → import the repo → set env vars from `.env.example` (use a Neon Postgres URL).
3. Add OAuth callbacks: `https://<your-app>/api/auth/callback/google` and `/github`.
4. Add `CRON_SECRET` to Vercel env vars, then mirror it (plus `APP_URL`) into GitHub repo secrets so `.github/workflows/cron-sync.yml` can drive the cron endpoints.
5. After first deploy run `pnpm db:migrate deploy` (Vercel build hook) or run `prisma db push` from your machine pointed at the Neon URL.

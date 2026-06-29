# TennisWeb

Легкий civic/community сайт для проекта «Теннис на Пролетарской»: расписание,
электронная очередь на муниципальные корты, правила, история проекта,
обслуживание, сообщество и каталог документов.

Публичная терминология намеренно использует «запись» и «электронная очередь»,
а не «гарантированная бронь»: корты муниципальные и остаются общественно
доступными.

## Stack

- Next.js App Router + TypeScript
- Supabase Postgres, Storage и Auth
- shadcn/ui + Tailwind CSS
- Zod-style domain validation through TypeScript domain modules
- Cloudflare Turnstile for optional public form protection
- Telegram Bot API notifications

## Local Development

```bash
rtk pnpm install
rtk pnpm dev
```

Open `http://localhost:3000`.

Without Supabase service variables the app uses seed data and validates the
public form, but does not persist records. With Supabase configured, the site is
the booking source of truth.

## Environment

Copy `.env.example` to `.env.local` and fill the values needed for your current
stage.

Required for live Supabase reads/writes:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Optional production behavior:

```bash
NEXT_PUBLIC_SITE_URL=
ADMIN_EMAILS=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
TELEGRAM_MESSAGE_THREAD_ID=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

## Supabase

The initial schema is in
`supabase/migrations/202606280001_initial_schema.sql`.

Typical remote setup:

```bash
rtk supabase link --project-ref <project-ref>
rtk supabase db push
```

Admin access uses Supabase magic links plus the `admin_users` table and optional
`ADMIN_EMAILS` environment allowlist.

Before publishing, use [Production Readiness](docs/PRODUCTION_READINESS.md) as
the deployment gate.

## Verification

```bash
rtk pnpm test
rtk pnpm lint
rtk pnpm build
```

Playwright is configured through the `e2e` script for browser checks:

```bash
rtk pnpm dev
rtk pnpm e2e
```

## Official References

- Next.js: https://nextjs.org/docs
- Vercel Next.js: https://vercel.com/docs/frameworks/nextjs
- Supabase Next.js: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- shadcn/ui: https://ui.shadcn.com/docs
- Telegram Bot API: https://core.telegram.org/bots/api
- Cloudflare Turnstile: https://developers.cloudflare.com/turnstile/
- 21st.dev: https://21st.dev/

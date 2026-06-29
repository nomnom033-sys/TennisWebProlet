# Production Readiness

This checklist is the gate before publishing TennisWeb as the live booking
source of truth.

## Secrets

- Do not commit `.env.local` or filled env files.
- `.env.example` must stay empty except for placeholder names.
- If any server-side key, Telegram bot token, or Turnstile secret was pasted
  into a tracked file or chat, rotate it before production.

## Required Environment Variables

Set these in Vercel Project Settings and, for local production checks, in
`.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://your-production-domain
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=admin@example.com
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
TELEGRAM_MESSAGE_THREAD_ID=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

`NEXT_PUBLIC_SUPABASE_URL` should be the Supabase project URL, not the REST API
URL ending in `/rest/v1`.

## Supabase

1. Link the project:

```bash
rtk supabase link --project-ref <project-ref>
```

2. Apply the schema:

```bash
rtk supabase db push
```

3. Insert admin emails into `public.admin_users` or keep `ADMIN_EMAILS` set in
   Vercel. Using both is preferred.
4. Confirm RLS is enabled on all public tables.
5. Confirm the exclusion constraint `bookings_no_active_overlap` exists.
6. Configure Supabase Auth redirect URLs:
   - `https://your-production-domain/admin`
   - local dev URL if testing locally

## Telegram

1. Create or rotate the bot token via BotFather.
2. Add the bot to the community chat.
3. Give the bot permission to post in the target chat/topic.
4. Set `TELEGRAM_CHAT_ID`.
5. If using forum topics, set `TELEGRAM_MESSAGE_THREAD_ID`.
6. Test both booking-created and booking-cancelled notifications.

## Turnstile

1. Create a Turnstile widget for the production domain.
2. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
3. Set `TURNSTILE_SECRET_KEY`.
4. Confirm public booking creation fails without a valid Turnstile response in
   production.

## Documents

1. Redact personal data before publishing files.
2. Keep `needs_redaction=true` until the file is reviewed.
3. Use Supabase Storage or another stable public URL only for approved files.
4. Do not expose downloads for documents that still need redaction.

## Verification Commands

Run before every production deploy:

```bash
rtk pnpm test
rtk pnpm lint
rtk pnpm build
rtk pnpm e2e
```

After deploying to Vercel, run the Playwright suite against production:

```bash
PLAYWRIGHT_BASE_URL=https://your-production-domain rtk pnpm e2e
```

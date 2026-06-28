# TennisWeb V1 Plan

## Summary
Build a lightweight civic sports site for “Теннис на Пролетарской”: public information, live court schedule, self-service court записи, rules, community links, project history, maintenance log, and a document catalog/viewer.

The site should use “запись” / “электронная очередь” in public copy, not “guaranteed booking”, because the courts are municipal and publicly accessible. Internally the code can use `booking`.

V1 decisions already locked:
- Hosting: `Vercel + Supabase`.
- Stack: latest packages only, installed as `@latest`, after checking official docs.
- Booking source of truth: the site.
- Public booking auth: no account.
- Guardrails: soft public form protection, strict validation where technically reliable.
- Admin auth: Supabase Auth email magic link, allowlisted admins.
- Courts: Пролетарский is primary; schedule supports Пролетарский and Обухово.
- Public identity: required display name; optional Telegram nickname and phone. Telegram can be shown if supplied; phone should be hidden unless the user explicitly opts into public display.
- Documents: v1 supports catalog + viewer, but initial publishing can start as catalog-only until files are reviewed/redacted.
- Telegram: site sends notifications to the Telegram chat/topic; Telegram remains community/chat layer, not the booking source.

## Product And UX
- Main navigation: `Расписание`, `Записаться`, `Правила`, `Документы`, `История`, `Сообщество`.
- First screen: project title, short civic description, current court status, primary CTA `Записаться`, secondary CTA `Правила`, compact map/address.
- Schedule view:
  - Tabs: `Сейчас`, `Запланировано`, `Сыграно`.
  - Filters: court, date, day/week.
  - Each booking shows court, time, player name, optional Telegram nickname, status.
- Booking form:
  - Court, date, start/end time, player name, optional Telegram nickname, optional phone, consent checkbox for public display/contact rules.
  - Validate: no overlap on same court, not more than 7 days ahead, max 2 hours before 18:00, max 1.5 hours from 18:00 to 22:00.
  - Active-record limits apply strictly when Telegram/contact identity is present; otherwise show warning/admin flag because identity is not reliable.
  - Confirmation page shows the booking, cancel link, Telegram/community link, and the legal “электронная очередь” note.
- Cancellation:
  - Public user cancels via secret cancel token link.
  - Admin can cancel/edit any booking.
  - Cancelled records remain in audit history, not in played list.
- Documents:
  - Catalog fields: title, date, category, court, description, public/redaction status.
  - Viewer opens PDF/image/doc preview in a modal or separate viewer route.
  - Downloads disabled or hidden for documents marked `needsRedaction`.
- History and maintenance:
  - Timeline: resident requests, municipal response, repair, ongoing maintenance.
  - Maintenance items show date, court, status, summary, optional proof/source link.
- Visual direction:
  - Light civic/community sports UI, mobile-first from Telegram.
  - Use 21st.dev/shadcn-style application blocks for schedule/table/dialog/document UI, not a marketing landing template.
  - Before coding, generate/choose one approved visual concept for the primary screen, schedule, booking form, and document viewer.

## Technical Plan
- Use Next.js App Router + TypeScript on Vercel.
- Use Supabase for Postgres, Storage, and Auth.
- Use shadcn/ui + Tailwind, with current 21st.dev React/shadcn blocks where they fit.
- Use Zod for server-side validation and shared form schemas.
- Use date utilities with Russian locale for `ДД.ММ день-недели` display.
- Use Telegram Bot API for `sendMessage` notifications on booking create/cancel.
- Add Cloudflare Turnstile or equivalent CAPTCHA/rate-limit protection for public booking creation.

Core data model:
- `courts`: `id`, `slug`, `name`, `address`, `map_url`, `is_primary`.
- `bookings`: `id`, `court_id`, `start_at`, `end_at`, `status`, `player_name`, `telegram_username`, `phone`, `phone_public`, `cancel_token_hash`, `source`, `created_at`, `cancelled_at`.
- `booking_events`: audit trail for created/cancelled/admin-edited/no-show.
- `documents`: `id`, `title`, `date`, `category`, `court_id`, `description`, `file_path`, `preview_path`, `is_public`, `needs_redaction`.
- `maintenance_items`: `id`, `court_id`, `date`, `title`, `status`, `summary`, `source_url`.
- Admin access via Supabase Auth allowlist.

Important backend behavior:
- Enforce no overlapping active bookings per court at database level where possible.
- Server mutations only; no client-side direct writes.
- RLS enabled for Supabase tables.
- Telegram failures must not lose a valid booking; log notification status for admin retry.
- All user-facing “booking” copy should clarify that this is community scheduling for municipal courts.

## Test Plan
- Booking validation: valid slot, overlap, too long, outside 7-day window, invalid court, missing name.
- Current/planned/played classification around boundary times.
- Cancel token works once and cannot cancel another booking.
- Admin magic-link access gates admin pages.
- Telegram notification success/failure paths.
- Document catalog filters and viewer behavior for public vs redaction-needed documents.
- Mobile layout for Telegram in-app browser width.
- E2E path: create booking, see it in planned, cancel it, verify schedule updates.

## Assumptions
- Exact Telegram bot token, chat id, and topic id will be provided as environment variables.
- The local Markdown export remains the content source for rules and Telegram topic summaries; live Telegram scraping is not required for v1.
- Exact court address wording should be verified before publishing, because the context file contains multiple address formulations.
- Existing construction documents need a separate review/redaction pass before public file downloads are enabled.
- Official docs checked for the stack direction: [Next.js docs](https://nextjs.org/docs), [Supabase Next.js quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs), [Vercel Next.js docs](https://vercel.com/docs/frameworks/nextjs), [shadcn/ui docs](https://ui.shadcn.com/docs), [Telegram Bot API](https://core.telegram.org/bots/api), [21st.dev](https://21st.dev/).

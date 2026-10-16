# TennisWeb Konergy Booking Redesign

## Goal

Refresh the public TennisWeb site using the visual language of `konergy.ru`, with the lime accent replaced by dark green, while preserving production booking, Supabase, admin, validation, cancellation, and Telegram-notification behavior.

## Visual Direction

- Keep the site as a lightweight civic/community sports surface, not a marketing-heavy landing page.
- Use a white, clean, high-contrast system inspired by Konergy: large confident headings, soft light panels, thin borders, restrained shadows, and compact square-ish CTA buttons.
- Replace the current hero court image with the supplied Proletarsky court photo as the primary court visual.
- Keep the existing information architecture and content blocks: schedule, booking, rules, history, maintenance, documents, and Telegram community.
- Avoid invented feature copy. The first viewport should still signal public courts, electronic queue, schedule, and court access.

## Booking Form UX

- Replace the two raw `datetime-local` fields with a focused time block:
  - date calendar/date control;
  - a single-row `Начало` time control;
  - a duration control from 1 hour to 2 hours, including minutes;
  - an `Окончание` row that is calculated from duration but can be changed manually.
- Preserve the existing server action contract by submitting hidden `startAt` and `endAt` fields.
- Treat manual end-time editing as another way to set duration. The canonical client state is date + start time + duration minutes.
- Keep server validation authoritative for overlap, 7-day window, evening duration limits, active booking limits, and identity review.

## Constraints

- Do not require user accounts for public booking.
- Do not change Supabase table shape.
- Do not change admin magic-link behavior.
- Do not submit external forms during QA.
- Verify locally before commit and push.

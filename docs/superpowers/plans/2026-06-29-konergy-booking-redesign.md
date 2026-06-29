# Konergy Booking Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the public TennisWeb site around the Konergy-inspired dark-green visual system and replace raw datetime fields with a booking slot picker that still submits `startAt` and `endAt`.

**Architecture:** Keep the existing Next.js App Router, server actions, Supabase access, and shadcn/Base UI component layer. Add a focused client-side booking slot helper and picker inside the existing booking form so all time math stays local to the form and the server contract remains unchanged.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Vitest, existing UI primitives, lucide-react.

---

### Task 1: Booking Slot Time Math

**Files:**
- Create: `src/features/bookings/slot-picker.ts`
- Test: `src/features/bookings/slot-picker.test.ts`

- [ ] **Step 1: Write failing tests**

Cover:
- composing local date/time into `datetime-local` submission strings;
- deriving `endAt` from start and duration;
- deriving duration from a manually edited end time;
- clamping duration to `60..120` minutes.

- [ ] **Step 2: Run tests and confirm RED**

Run: `pnpm vitest run src/features/bookings/slot-picker.test.ts`
Expected: fails because `slot-picker.ts` does not exist.

- [ ] **Step 3: Implement helpers**

Implement pure helpers: `clampDurationMinutes`, `formatDuration`, `addMinutesToLocalDateTime`, `minutesBetweenLocalDateTimes`, `buildBookingSlot`.

- [ ] **Step 4: Run tests and confirm GREEN**

Run: `pnpm vitest run src/features/bookings/slot-picker.test.ts`
Expected: all tests in this file pass.

### Task 2: Booking Slot Picker UI

**Files:**
- Modify: `src/components/booking-form.tsx`
- Use: `src/features/bookings/slot-picker.ts`

- [ ] **Step 1: Add `BookingSlotPicker` inside the client form**

The component renders visible date/start/duration/end controls and hidden inputs named `startAt` and `endAt`.

- [ ] **Step 2: Preserve server action contract**

Leave `createBookingAction` and `parseBookingFormData` field names unchanged.

- [ ] **Step 3: Verify interaction manually in browser**

Changing duration updates the hidden end field. Changing end time updates the duration label and hidden fields.

### Task 3: Konergy-Inspired Visual Refresh

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx`
- Modify: existing component classes only where needed.
- Replace: `public/hero-courts.png`

- [ ] **Step 1: Update design tokens**

Use true white surfaces, dark ink text, muted gray copy, thin gray-green borders, dark-green primary, and smaller button radius.

- [ ] **Step 2: Restyle public page**

Adapt hero, nav, CTA buttons, metrics, schedule/booking panels, and downstream sections to the Konergy-inspired panel rhythm without changing the content model.

- [ ] **Step 3: Replace hero image**

Copy the supplied court photo into `public/hero-courts.png` or an equivalent public asset path used by `next/image`.

### Task 4: Verification, Commit, Push

**Files:**
- All touched files.

- [ ] **Step 1: Run unit tests**

Run: `pnpm test`

- [ ] **Step 2: Run lint**

Run: `pnpm lint`

- [ ] **Step 3: Run production build**

Run: `pnpm build`

- [ ] **Step 4: Browser QA**

Run the local app, verify `/` and `/admin`, inspect desktop and mobile widths, and exercise the slot picker without submitting a real booking.

- [ ] **Step 5: Commit and push**

Commit only after verification succeeds, then push `codex/tennisweb-konergy-booking` to origin.

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type RefreshBooking = {
  startAt: string;
  endAt: string;
};

const REFRESH_DELAY_AFTER_BOUNDARY_MS = 1000;

export function BookingStatusRefresh({
  bookings,
}: {
  bookings: RefreshBooking[];
}) {
  const router = useRouter();

  useEffect(() => {
    const now = Date.now();
    const nextBoundary = bookings
      .flatMap((booking) => [booking.startAt, booking.endAt])
      .map((value) => new Date(value).getTime())
      .filter((time) => Number.isFinite(time) && time > now)
      .sort((left, right) => left - right)[0];

    if (!nextBoundary) return;

    const timeout = window.setTimeout(
      () => router.refresh(),
      Math.max(nextBoundary - now + REFRESH_DELAY_AFTER_BOUNDARY_MS, 1000),
    );

    return () => window.clearTimeout(timeout);
  }, [bookings, router]);

  return null;
}

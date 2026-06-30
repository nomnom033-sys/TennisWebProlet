import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BookingStatusRefresh } from "./booking-status-refresh";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh,
  }),
}));

describe("BookingStatusRefresh", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-30T21:10:00+03:00"));
    refresh.mockClear();
  });

  it("refreshes the route just after the next booking status boundary", () => {
    render(
      <BookingStatusRefresh
        bookings={[
          {
            startAt: "2026-06-30T21:10:05+03:00",
            endAt: "2026-06-30T21:10:10+03:00",
          },
        ]}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(5_999);
    });
    expect(refresh).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BookingForm } from "./booking-form";

describe("BookingForm", () => {
  it("shows the stored cancellation link with the public cancellation title", () => {
    window.localStorage.setItem(
      "prolettennis:last-cancel-link",
      JSON.stringify({
        cancelUrl: "https://tennis-web-prolet.vercel.app/cancel/token",
      }),
    );

    render(
      <BookingForm
        courts={[
          {
            id: "proletarsky",
            name: "Пролетарский",
            address: "Адрес",
            mapUrl: "https://example.com",
            isPrimary: true,
          },
        ]}
      />,
    );

    expect(screen.getByText("Ссылка для отмены брони")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "https://tennis-web-prolet.vercel.app/cancel/token",
      }),
    ).toBeInTheDocument();
  });
});

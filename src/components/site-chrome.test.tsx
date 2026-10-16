import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "./site-chrome";

describe("SiteFooter", () => {
  it("shows support, court addresses, and personal data notice", () => {
    render(<SiteFooter />);

    expect(screen.getByText("Поддержка сайта:")).toBeInTheDocument();
    expect(screen.getByText("tennis-prolet@ya.ru")).toBeInTheDocument();
    expect(screen.getByText("Адреса кортов")).toBeInTheDocument();
    expect(screen.getByText("Обработка персональных данных")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Персональные данные игроков не сохраняются и не передаются третьим лицам/,
      ),
    ).toBeInTheDocument();
  });
});

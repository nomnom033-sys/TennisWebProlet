import { expect, test } from "@playwright/test";

function datetimeLocal(daysAhead: number, hour: number, minute = 0) {
  const date = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  date.setHours(hour, minute, 0, 0);
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

test("renders the public schedule and creates a seed-mode record", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Теннис на Пролетарской" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Запланировано" }).click();
  await expect(page.getByText("Кто играет сейчас")).toBeVisible();

  await page.locator('input[name="startAt"]').fill(datetimeLocal(1, 14));
  await page.locator('input[name="endAt"]').fill(datetimeLocal(1, 16));
  await page.locator('input[name="playerName"]').fill("Плейтест");
  await page.locator('input[name="telegramUsername"]').fill("@playtest");
  await page.getByRole("button", { name: "Создать запись" }).last().click();

  await expect(page.getByText("Форма прошла проверку")).toBeVisible();
});

test("mobile layout does not create horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );

  expect(hasHorizontalOverflow).toBe(false);
  await expect(page.getByRole("link", { name: /Записаться/ })).toBeVisible();
});

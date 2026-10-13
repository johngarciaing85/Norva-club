import { test, expect } from "@playwright/test";

test("catalogo shows friendly message when API is down", async ({ page }) => {
  await page.goto("/catalogo", { waitUntil: "networkidle" });

  const errorMessage = page.getByText("No pudimos cargar el catálogo");
  await expect(errorMessage).toBeVisible({ timeout: 10_000 });
});

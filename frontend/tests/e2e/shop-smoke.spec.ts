import { test, expect } from "@playwright/test";

test("home → product → select size → WhatsApp link", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "NÓRVA STYLE" })).toBeVisible();

  const productCard = page.locator("a[href^='/producto/']").first();
  await expect(productCard).toBeVisible({ timeout: 10_000 });
  await productCard.click();

  await expect(page).toHaveURL(/\/producto\//);

  const sizeButtons = page.locator("[data-testid='size-selector'] button, button").filter({
    hasNotText: /agotad|comprar|consultar|elige|whatsapp|configurado|medidas/i,
  });

  const availableSize = sizeButtons.filter({ hasText: /^(XS|S|M|L|XL|XXL|Única|\d{2,})$/ }).first();
  await expect(availableSize).toBeVisible({ timeout: 5_000 });
  const selectedSize = (await availableSize.textContent())!.trim();
  await availableSize.click();

  const whatsappLink = page.locator("a[href*='wa.me']").first();
  await expect(whatsappLink).toBeVisible({ timeout: 5_000 });
  const href = await whatsappLink.getAttribute("href");

  expect(href).toBeTruthy();
  expect(href).toContain("wa.me");
  expect(href!.toLowerCase()).toContain(selectedSize.toLowerCase());
});

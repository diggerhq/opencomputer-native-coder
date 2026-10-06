import { expect, test } from "@playwright/test";

test("the self-check reaches a browser-visible ready state", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Can an agent prove the change works?" }),
  ).toBeVisible();

  const status = page.getByRole("status");
  await expect(status).toHaveText("Waiting for verification");
  await page.getByRole("button", { name: "Run self-check" }).click();
  await expect(status).toHaveText("Ready for verification");
  await page.screenshot({
    path: "artifacts/verifier-demo-ready.png",
    fullPage: true,
  });
});

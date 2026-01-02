import { expect, type Page, test } from "@playwright/test";
import { type Server, serve } from "@t8/serve";

class Playground {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }
  async showsLoadingStatus() {
    await expect(
      this.page.locator("p", { hasText: "Loading..." }),
    ).toBeVisible();
  }
  async showsItemList() {
    await expect(this.page.locator("li", { hasText: "Item #1" })).toBeVisible();
  }
  async showsStatus(value: string) {
    await expect(
      this.page.locator("p", { hasText: `Status: ${value}` }),
    ).toBeVisible();
  }
}

let server: Server;

test.beforeAll(async () => {
  server = await serve({
    path: "tests/async_state",
    bundle: "src/index.tsx",
    spa: true,
  });
});

test.afterAll(() => {
  server.close();
});

test("async state", async ({ page }) => {
  let p = new Playground(page);

  await page.goto("/");
  await p.showsLoadingStatus();
  await p.showsStatus("⏳ Busy");
  await p.showsItemList();
  await p.showsStatus("✔️ OK");
});

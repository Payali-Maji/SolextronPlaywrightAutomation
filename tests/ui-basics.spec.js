const { test, expect } = require('@playwright/test');

test('First Playwright test', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://design-preprod.solextron.com/");
    console.log(await page.title());
});

test('Page Playwright test', async ({ page }) => {
    await page.goto("https://design-preprod.solextron.com/");
    console.log(await page.title());
});

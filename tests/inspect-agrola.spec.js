const { test, expect } = require('@playwright/test');

test('Inspect Agrola Dashboard', async ({ page }) => {
  console.log('Navigating to landing page...');
  await page.goto('https://agrola-preprod.solextron.com/', { waitUntil: 'networkidle', timeout: 60000 });

  // Click LOGIN
  console.log('Clicking LOGIN button...');
  await page.click('button:has-text("LOGIN")');
  await page.waitForTimeout(5000);

  // Fill credentials
  console.log('Filling credentials...');
  await page.fill('input[placeholder="Account ID"]', 'test_runner@agrola.ch');
  await page.fill('input[placeholder="Password"]', 'default123');

  // Click Login Submit
  console.log('Submitting login...');
  const loginDiv = page.locator("//div[text()=' LOGIN ']");
  if (await loginDiv.isVisible()) {
    await loginDiv.click();
  } else {
    await page.click('button:has-text("Login")');
  }

  await page.waitForTimeout(10000);
  console.log('Current URL after login:', page.url());

  // Dump DOM of sidebar/dashboard
  const body = await page.content();
  console.log('--- DOM DUMP START ---');
  console.log(body.substring(0, 10000)); // First 10k chars
  console.log('--- DOM DUMP END ---');

  // Take screenshot
  await page.screenshot({ path: 'agrola_inspection.png' });
  console.log('Screenshot saved to agrola_inspection.png');
});

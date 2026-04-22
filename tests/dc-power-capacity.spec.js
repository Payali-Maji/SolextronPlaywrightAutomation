const { test, expect } = require('@playwright/test');

class SlowActions {
  constructor(page, delay = 15000) {
    this.page = page;
    this.delay = delay;
  }

  async goto(url, description) {
    console.log(`[NAVIGATE] ${description} -> ${url}`);
    await this.page.goto(url);
    await this.page.waitForTimeout(this.delay);
  }

  async click(locator, description) {
    console.log(`[CLICK] ${description}`);
    await locator.click();
    await this.page.waitForTimeout(this.delay);
  }

  async fill(locator, value, description) {
    console.log(`[FILL] ${description} with "${value}"`);
    await locator.fill(value);
    await this.page.waitForTimeout(this.delay);
  }

  async press(locator, key, description) {
    console.log(`[PRESS] ${key} on ${description}`);
    await locator.press(key);
    await this.page.waitForTimeout(this.delay);
  }

  async wait(ms, description) {
    const desc = description ? ` (${description})` : '';
    console.log(`[WAIT] ${ms}ms${desc}`);
    await this.page.waitForTimeout(ms);
  }
}

test.use({ headless: false });

test('Solextron: Project and Component Management', async ({ page }) => {
  test.setTimeout(120000);

  const actions = new SlowActions(page, 3000);

  await actions.goto('https://design-preprod.solextron.com/login', 'Login Page');
  await actions.click(page.getByRole('button', { name: 'LOGIN' }), 'Initial LOGIN button');

  await actions.click(page.getByRole('textbox', { name: 'Account ID' }), 'Account ID field');
  await actions.fill(page.getByRole('textbox', { name: 'Account ID' }), 'test1@fhnw.ch', 'Account ID');
  await actions.press(page.getByRole('textbox', { name: 'Account ID' }), 'Tab', 'Account ID field');
  await actions.fill(page.getByRole('textbox', { name: 'Password' }), 'default123', 'Password');

  await actions.click(page.locator('#mat-dialog-0').getByText('LOGIN'), 'Dialog LOGIN button');

  try {
    const concurrentLogin = page.getByRole('button', { name: 'Login', exact: true }).first();
    await concurrentLogin.waitFor({ state: 'visible', timeout: 5000 });
    await actions.click(concurrentLogin, 'Concurrent Login Modal Button');
  } catch (e) {
    // No concurrent login
  }

  await actions.goto('https://design-preprod.solextron.com/home-premium', 'Home Premium Dashboard');
  await page.waitForLoadState('networkidle');

  const projectCell = page.getByRole('gridcell', { name: 'Rhäzuns Battery' }).first();
  await projectCell.waitFor({ state: 'visible', timeout: 15000 });
  await actions.click(projectCell, 'Project "Rhäzuns Battery"');

  const sidebar = page.locator('app-design-sidebar');
  await expect(sidebar).toMatchAriaSnapshot(`- text: DC Power Capacity`);
  await sidebar.getByText('DC Power Capacity').waitFor({ state: 'visible' });
  await actions.click(sidebar.getByText('DC Power Capacity'), 'DC Power Capacity tab in Sidebar');

  await page.locator('div').filter({ hasText: 'DC Power Capacity' }).nth(5).click();
  await page.locator('span').nth(4).click();
  await page.locator('span').nth(4).click();
  await page.getByRole('textbox', { name: '10829' }).click();
  await page.getByRole('textbox', { name: '10829' }).fill('10830');
  await page.getByRole('button', { name: 'Calculate Power Capacity' }).click();

  await page.locator('section').nth(1).click();
  await page.getByRole('main').locator('i').click();
  await page.getByText('CHE', { exact: true }).click();
  await page.locator('.col-12.select').click();
  await page.getByText(' Small business, max. power demand: 8 kW ').click();

  await page.getByText('Import Consumption from CSV').click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: '15 min data template' }).click();
  const download = await downloadPromise;
  await actions.click(page.locator('.button-image'), 'Upload Consumption Profile');
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.click('.button-image')
  ]);
  await fileChooser.setFiles('C:/Downloads/demandexample-kwh.csv');


});

const { test, expect } = require('@playwright/test');

class SlowActions {
    constructor(page, delay = 19000) {
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

    const actions = new SlowActions(page, 5000);

    await actions.goto('https://design-preprod.solextron.com/login', 'Login Page');
    await actions.click(page.getByRole('button', { name: 'LOGIN' }), 'Initial LOGIN button');

    await actions.click(page.getByRole('textbox', { name: 'Account ID' }), 'Account ID field');
    await actions.fill(page.getByRole('textbox', { name: 'Account ID' }), 'test1@fhnw.ch', 'Account ID');
    await actions.press(page.getByRole('textbox', { name: 'Account ID' }), 'Tab', 'Account ID field');
    await actions.fill(page.getByRole('textbox', { name: 'Password' }), 'default123', 'Password');

    await actions.click(page.locator('#mat-dialog-0').getByText('LOGIN'), 'Dialog LOGIN button');

    try {
        const concurrentLogin = page.getByRole('button', { name: 'Login', exact: true }).first();
        await concurrentLogin.waitFor({ state: 'visible', timeout: 9000 });
        await actions.click(concurrentLogin, 'Concurrent Login Modal Button');
    } catch (e) {
        // No concurrent login
    }

    await actions.goto('https://design-preprod.solextron.com/home-premium', 'Home Premium Dashboard');
    await page.waitForLoadState('networkidle');

    const projectCell = page.getByRole('gridcell', { name: 'Rhäzuns Battery' }).first();
    await projectCell.waitFor({ state: 'visible', timeout: 19000 });
    await actions.click(projectCell, 'Project "Rhäzuns Battery"');

    await page.locator('div').filter({ hasText: /^Checkout$/ }).nth(1).click();
    await page.getByRole('button', { name: 'Offer templates' }).click();
    await page.locator('div').filter({ hasText: /^Oferta comercial verde V1$/ }).first().click();
    await page.getByRole('button', { name: 'Save' }).click();
    //  await page.locator('//button[contains(@class,"btn create-button px-5 my-2")]').click();
    await page.locator('[class*="btn create-button px-5 my-2"]').click();
    /* await page.locator('#flexCheckDefault').first().uncheck();
     const downloadPromise = page.waitForEvent('download');
     await page.getByRole('button', { name: 'Download Selected' }).click();
     const download = await downloadPromise;
 
     /* await page.getByRole('button', { name: 'Offer templates' }).click();
      await page.locator('div').filter({ hasText: /^Offer Template Belenegy V2$/ }).first().click();
      await page.getByRole('button', { name: 'Save' }).click();
      await page.getByRole('button', { name: 'Save' }).click();
      await page.locator('#flexCheckDefault').first().uncheck();
      const download1Promise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download Selected' }).click();
      const download1 = await download1Promise;
      await page.getByRole('button', { name: 'Offer templates' }).click();
      await page.locator('div').filter({ hasText: /^Offer Template Belenegy V3$/ }).first().click();
      await page.getByRole('button', { name: 'Save' }).click();
      await page.getByRole('button', { name: 'Save' }).click();
      await page.locator('#flexCheckDefault').nth(1).uncheck();
      const download2Promise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download Selected' }).click();
      const download2 = await download2Promise;
      await page.getByRole('button', { name: 'Offer templates' }).click();
      await page.locator('div').filter({ hasText: /^Offer Template Belenegy V4$/ }).first().click();
      await page.getByRole('button', { name: 'Save' }).click();
      await page.getByRole('button', { name: 'Save' }).click();
      await page.locator('#flexCheckDefault').nth(2).uncheck();
      const download3Promise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download Selected' }).click();
      const download3 = await download3Promise;
      await page.getByRole('button', { name: 'Offer templates' }).click();
      await page.locator('div').filter({ hasText: /^Offer Template Belenegy V5$/ }).first().click();
      await page.getByRole('button', { name: 'Save' }).click();
      await page.getByRole('button', { name: 'Save' }).click();
      await page.locator('#flexCheckDefault').nth(3).uncheck();
      const download4Promise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download Selected' }).click();
      const download4 = await download4Promise; */
});
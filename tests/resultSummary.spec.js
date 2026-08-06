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

    await page.locator('div').filter({ hasText: /^Results Summary$/ }).nth(1).click();
    await page.getByRole('button', { name: 'Edit String Design For SLD' }).click();
    await page.getByRole('textbox').first().click();
    await page.getByRole('textbox').first().press('ArrowLeft');
    await page.getByRole('textbox').first().fill('[10,5]');
    // await page.getByRole('button', { name: 'Save', exact: true }
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.getByRole('button', { name: 'Tutorial' }).click();
    await page.getByRole('button', { name: '×' }).click();
    await page.getByRole('button', { name: 'Save and Proceed' }).click();
});


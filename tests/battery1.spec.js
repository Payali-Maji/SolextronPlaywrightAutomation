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

    await page.getByText('Battery Storage').click();
    /*   await page.locator('span').nth(4).click();
       await page.locator('span').nth(4).click();
       await page.locator('#mat-radio-10 label').click();
       await page.locator('#mat-radio-13 > .mat-radio-label').click();
       await page.getByRole('button', { name: 'Simulate', exact: true }).click();
       // await page.locator('#mat-radio-7 > .mat-radio-label').click();
       await page.locator('#mat-radio-15 > .mat-radio-label').click();
       await page.getByRole('textbox', { name: '2' }).click();
       await page.getByRole('textbox', { name: '2' }).fill('1');
       await page.getByRole('button', { name: 'Simulate', exact: true }).click();
   
       // await page.locator('#mat-radio-16 > .mat-radio-label').click();
       await document.querySelector('input[type="radio"][value="notallowed"]').click();
       await page.getByRole('button', { name: 'Simulate', exact: true }).click();
   
       await page.locator('#mat-radio-17 > .mat-radio-label').click();
       await page.getByText('4', { exact: true }).click();
       await page.getByText('5', { exact: true }).click();
       await page.getByText('6', { exact: true }).click();
       await page.getByRole('button', { name: 'Simulate', exact: true }).click();
   
       await page.getByRole('button', { name: 'Simulate Multiple Modules' }).click();
   
       await page.getByRole('region', { name: 'Simulate Multiple Modules' }).getByRole('textbox').click();
       await page.getByRole('region', { name: 'Simulate Multiple Modules' }).getByRole('textbox').fill('2');
       await page.getByRole('button', { name: 'Simulate', exact: true }).click(); */
    await page.locator('#simulate-radio-btn').click();
    await page.locator('#simulate-radio-btn > .mat-radio-label').click();
    await page.getByRole('button', { name: 'Simulate', exact: true }).click();
    await page.locator('#tariffbased-radio-btn > .mat-radio-label').click();
    await page.getByRole('button', { name: 'Simulate', exact: true }).click();



});
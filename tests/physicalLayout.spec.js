const { test, expect } = require('@playwright/test');

class SlowActions {
    constructor(page, delay = 20000) {
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

    await page.locator('div').filter({ hasText: 'Physical Layout' }).nth(5).click();
    /*  await page.locator('#panelTilt-up > svg > path').click();
      await page.getByRole('button', { name: 'Calculate without shadow' }).click();*/


    /*   await page.locator('.up > svg').first().click();
       await page.locator('div:nth-child(3) > app-map-input > div > .app-input-arrow-div > .up > svg').first().click();
       await page.locator('div:nth-child(5) > app-map-input > div > .app-input-arrow-div > .up > svg').click();
       await page.locator('div:nth-child(7) > .radio-div > div:nth-child(3)').click();
       await page.getByRole('checkbox', { name: 'Single Axis Tracker' }).check();
       await page.getByRole('button', { name: 'Calculate without shadow' }).click();*/


    await page.locator('#panelTilt-up').waitFor({ state: 'visible' });
    await page.locator('#panelTilt-up').click();
    await page.locator('#interrow-up').waitFor({ state: 'visible' });
    await page.locator('#interrow-up').click();
    await page.locator('#setback-up').waitFor({ state: 'visible' });
    await page.locator('#setback-up').click();
    await page.locator('#panelAzimut-up').waitFor({ state: 'visible' });
    await page.locator('#panelAzimut-up').click();
    await page.locator('#Hoffset-up').waitFor({ state: 'visible' });
    await page.locator('#Hoffset-up').click();
    /*   await page.locator('.radio-btn').first().click();
       await page.locator('div:nth-child(7) > .radio-div > div > svg').first().click();
       await page.getByRole('button', { name: 'Calculate without shadow' }).click();*/

    await page.locator('.radio-div > div:nth-child(3)').first().click();
    await page.locator('div:nth-child(7) > .radio-div > div:nth-child(3)').click();
    await page.getByRole('checkbox', { name: 'Single Axis Tracker' }).check();
    await page.getByRole('button', { name: 'Calculate without shadow' }).click();

    /*  await page.getByText('Shadow', { exact: true }).click();
      await page.getByRole('button', { name: 'Generate Shading' }).click();
      await page.getByRole('textbox', { name: '100' }).click();
      await page.getByRole('textbox', { name: '100' }).fill('50');
      await page.getByRole('button', { name: 'Generate Shading' }).click();
      await page.locator('input[type="range"]').fill('0.85');
      await page.getByRole('button', { name: 'Generate Shading' })*/

    await page.getByText('Electrical').click();
    await page.getByRole('button', { name: 'Change Inverter' }).click();
    await page.getByRole('combobox').selectOption('ABB_PVS-100-TL');
    await page.getByRole('textbox').click();
    await page.getByRole('textbox').fill('1');
    await page.locator('.ng-star-inserted > .container-fluid.input-container > .row > .col-12 > .container-fluid > .add-icon').click();
    await page.getByRole('button', { name: 'Calculate' }).click();

});
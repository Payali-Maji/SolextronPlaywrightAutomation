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

    const actions = new SlowActions(page, 2000);

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
    await expect(sidebar).toMatchAriaSnapshot(`- text: Components`);
    await sidebar.getByText('Components').waitFor({ state: 'visible' });
    await actions.click(sidebar.getByText('Components'), 'Components tab in Sidebar');

    await page.waitForLoadState('networkidle');
    await actions.wait(3000, 'Loading Components');

    await expect(page.getByRole('combobox').first()).toHaveValue('Produtos');

    await actions.click(page.locator('div:nth-child(2) > .row > .col-12 > .container-fluid > .add-icon > img').first(), 'PV Module Add Icon');
    await actions.click(page.locator('section:nth-child(3) > .container-fluid.input-container > .row > .col-12 > .container-fluid > .add-icon > img'), 'PV Sub-module Add Icon');
    await actions.click(page.getByText('JA Solar 385 Wp (JAM60S20-385'), 'Selecting PV Module');

    await actions.click(page.locator('div:nth-child(3) > .row > .col-12 > .container-fluid > .add-icon > img'), 'Inverter Add Icon');
    await actions.click(page.locator('div:nth-child(2) > div > div > section:nth-child(3) > .container-fluid.input-container > .row > .col-12 > .container-fluid > .add-icon'), 'Inverter Sub-unit Add Icon');
    await actions.click(page.getByText('FHNW April2023 Module SI 215KW'), 'Selecting Inverter');

    await actions.click(page.locator('div:nth-child(3) > div > div > section > .container-fluid.input-container > .row > .col-12 > .container-fluid > .add-icon'), 'Battery Add Icon');
    await actions.click(page.locator('.container-fluid.bg-white > .add-icon > img'), 'Battery Sub-unit Add Icon');
    await actions.click(page.getByText('STORAXE SRS0075 mit integriertem Wechselrichter und EMS'), 'Selecting Battery');

    const addComponent = page.getByText('+ Add Component').nth(4);
    const emsModule = page.getByText('ADSTec Energie Management Modul');

    if (await addComponent.count() > 0) {
        console.log('[FLOW] Add Component flow');

        await actions.click(addComponent, 'Click + Add Component');
        await actions.click(emsModule, 'Select EMS Module');

    } else {
        console.log('[FLOW] Support Component flow');

        const supportIcon = page.locator('.add-icon img').nth(4);
        //  const supportText = page.getByText('ADSTec Inbetriebnahme-Support');
        const supportText = page.getByText('Inbetriebnahme-Support ADSTec 336kWh / BAT280');

        await actions.click(supportIcon, 'Click Support Add Icon');
        await actions.click(supportText, 'Select Support Component');
    }

    await actions.wait(2000, 'Before final save');
    await actions.click(page.getByRole('button', { name: 'Save and Proceed' }), 'Save and Proceed button');

    await page.waitForLoadState('networkidle');
    await actions.wait(3000, 'Finalizing configuration');

    console.log("\x1b[36m[SUCCESS]\x1b0m Successfully completed configuration");
});
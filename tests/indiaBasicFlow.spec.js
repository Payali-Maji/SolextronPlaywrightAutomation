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
    test.setTimeout(350000);

    const actions = new SlowActions(page, 4000);

    await actions.goto('https://design-preprod.solextron.com/login', 'Login Page');
    await actions.click(page.getByRole('button', { name: 'LOGIN' }), 'Initial LOGIN button');

    await actions.click(page.getByRole('textbox', { name: 'Account ID' }), 'Account ID field');
    await actions.fill(page.getByRole('textbox', { name: 'Account ID' }), 'india@solextron.com', 'Account ID');
    await actions.press(page.getByRole('textbox', { name: 'Account ID' }), 'Tab', 'Account ID field');
    await actions.fill(page.getByRole('textbox', { name: 'Password' }), 'default123', 'Password');

    await actions.click(page.locator('#mat-dialog-0').getByText('LOGIN'), 'Dialog LOGIN button');

    try {
        const concurrentLogin = page.getByRole('button', { name: 'Login', exact: true }).first();
        await concurrentLogin.waitFor({ state: 'visible', timeout: 6000 });
        await actions.click(concurrentLogin, 'Concurrent Login Modal Button');
    } catch (e) {
        // No concurrent login
    }

    await actions.goto('https://design-preprod.solextron.com/home-premium', 'Home Premium Dashboard');
    await page.waitForLoadState('networkidle');

    const projectCell = page.getByRole('gridcell', { name: 'Automate Facade' }).first();
    await projectCell.waitFor({ state: 'visible', timeout: 16000 });
    // await actions.click(projectCell, 'Project "Automate Facade"');

    //  const sidebar = page.locator('app-design-sidebar');
    /* await expect(sidebar).toMatchAriaSnapshot(`- text: DC Power Capacity`);
     await sidebar.getByText('DC Power Capacity').waitFor({ state: 'visible' });
     await actions.click(sidebar.getByText('DC Power Capacity'), 'DC Power Capacity tab in Sidebar');
 
     await page.getByRole('button', { name: 'Save and Proceed' }).click();
     await page.getByRole('button', { name: 'Save and Proceed' }).click();
     await page.getByRole('button', { name: 'Continue' }).click();
     await page.getByRole('button', { name: 'Save and Proceed' }).click();
     await page.goto('https://design-preprod.solextron.com/design/tariff-details');
     await page.getByRole('button', { name: 'Save and Proceed' }).click();
     await page.getByRole('button', { name: 'Save and Proceed' }).click();
 
     await page.locator('.slider').first().click();
     await page.getByRole('textbox').first().click();
     await page.getByRole('textbox').first().fill('1');
     await page.getByRole('textbox').nth(1).click();
     await page.getByRole('textbox').nth(1).fill('1');
     await page.getByRole('textbox').nth(2).click();
     await page.getByRole('textbox').nth(2).fill('1');
     await page.getByRole('button', { name: 'Submit' }).click();
     await page.getByRole('alertdialog', { name: 'Inverter power is too high' }).click();
     await page.getByRole('alertdialog', { name: 'Not sufficient roof space to' }).click();
     await page.getByRole('alertdialog', { name: 'Too many panels for inverter' }).click();
     await page.getByRole('button', { name: 'Save and Proceed' }).click();
 
     await page.getByRole('button', { name: 'Save and Proceed' }).click();
     await page.goto('https://design-preprod.solextron.com/design/battery-storage');
 
     try {
         awaitpage.getByText('Warning String with panels in')
             .waitFor({ state: 'visible', timeout: 5000 });
         awaitpage.getByText('Warning String with panels in').click();
         awaitpage.getByText('Warning Number of strings on').click();
         awaitpage.getByText('Warning Inverter power is too').click();
     } catch (e) {
         console.log('Warnings not found after 5 seconds, proceeding...');
     }
 
     await page.getByRole('button', { name: 'Save and Proceed' }).click();
     await page.getByRole('button', { name: 'Save and Proceed' }).click();
     await page.goto('https://design-preprod.solextron.com/design/results-summary');
     await page.getByRole('button', { name: 'Save and Proceed' }).click();*/

    await page.getByRole('gridcell', { name: 'Automate Facade' }).click();
    await page.getByText('DC Power Capacity').click();
    await page.getByRole('button', { name: 'Save and Proceed' }).click();
    await page.getByRole('button', { name: 'Save and Proceed' }).click();
    //  await page.getByRole('textbox', { name: '0' }).nth(1).click();
    //  await page.getByRole('textbox', { name: '0' }).nth(1).fill('15.5');
    await page.getByRole('button', { name: 'Save and Proceed' }).click();
    await page.getByRole('button', { name: 'Save and Proceed' }).click();
    await page.getByRole('button', { name: 'Save and Proceed' }).click();
    await page.getByRole('button', { name: 'Save and Proceed' }).click();
    await page.goto('https://design-preprod.solextron.com/design/battery-storage');
    await page.getByRole('button', { name: 'Save and Proceed' }).click();
    //  await page.getByRole('alertdialog', { name: 'Number of strings on same' }).click();
    //   await page.getByText('Warning Inverter power is too').click();
    await page.getByRole('button', { name: 'Save and Proceed' }).click();
    await page.goto('https://design-preprod.solextron.com/design/results-summary');
    await page.getByRole('button', { name: 'Save and Proceed' }).click();
});

/*await page.getByRole('button', { name: 'Save and Proceed' }).click();
  await page.getByRole('button', { name: 'Save and Proceed' }).click();
  await page.getByRole('button', { name: 'Save and Proceed' }).click();
  await page.getByRole('button', { name: 'Save and Proceed' }).click();
  await page.getByRole('button', { name: 'Save and Proceed' }).click();
  await page.getByRole('button', { name: 'Save and Proceed' }).click();
  await page.goto('https://design-preprod.solextron.com/design/battery-storage');
  await page.getByLabel('Warning').first().click();
  await page.getByLabel('Warning').click();
  await page.getByRole('button', { name: 'Save and Proceed' }).click();
  await page.getByRole('button', { name: 'Save and Proceed' }).click();
  await page.goto('https://design-preprod.solextron.com/design/results-summary');
  await page.getByRole('button', { name: 'Save and Proceed' })*/
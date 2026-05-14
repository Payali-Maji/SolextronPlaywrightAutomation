const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login.page');
const { ProjectPage } = require('../pages/project.page');
const { ComponentsPage } = require('../pages/components.page');
const { DesignWizardPage } = require('../pages/design-wizard.page');

test.describe('Components Page Functional Verification', () => {
  let loginPage;
  let projectPage;
  let componentsPage;
  let designWizardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    projectPage = new ProjectPage(page);
    componentsPage = new ComponentsPage(page);
    designWizardPage = new DesignWizardPage(page);

    // Increase timeout for navigating the flow
    test.setTimeout(300000);
  });

  test('Should interact with components (Portfolio, Modules, Inverters, Battery) successfully', async ({ page }) => {
    // 1. Initial Setup: Login
    await loginPage.goto();
    await loginPage.login('test1@fhnw.ch', 'default123');

    // 2. Open specific project: Rhäzuns Battery
    console.log('Opening project "Rhäzuns Battery"...');
    await projectPage.searchAndOpenProject('Rhäzuns Battery');

    // 3. Skip to Components via left navigation
    console.log('Navigating directly to Components tab...');
    await componentsPage.componentsTab.click();
    await page.waitForURL(/.*design\/components.*/, { timeout: 30000 });
    await componentsPage.waitForLoading();

    // 6. Test the specific configuration flow
    console.log('Starting random component configuration from API responses...');
    
    // --- FULL MANUAL INTERACTION MODE ---
    // The script will PAUSE at each step. 
    // Please perform the action in the browser, then click "Resume" in the Playwright Inspector.

    // 1. Solarmodule
    console.log('>>> [PAUSE] Please MANUALLY Add Solarmodule. Click Resume in Inspector when done.');
    await page.pause();
    await componentsPage.waitForLoading();
    await page.waitForTimeout(15000); // 15s delay as requested

    // 2. Inverter
    console.log('>>> [PAUSE] Please MANUALLY Replace Inverter. Click Resume in Inspector when done.');
    await page.pause();
    await componentsPage.waitForLoading();
    await page.waitForTimeout(15000);

    // 3. Battery
    console.log('>>> [PAUSE] Please MANUALLY Add Battery. Click Resume in Inspector when done.');
    await page.pause();
    await componentsPage.waitForLoading();
    await page.waitForTimeout(15000);

    // 4. Accessory: Batterie
    console.log('>>> [PAUSE] Please MANUALLY Add Batterie Accessory. Click Resume in Inspector when done.');
    await page.pause();
    await componentsPage.waitForLoading();
    await page.waitForTimeout(15000);

    // 5. Final Save
    console.log('>>> [PAUSE] Please click Save and Proceed, then click Resume in Inspector.');
    await page.pause();
    
    // 7. Verification - go to Tariff Details page
    await expect(page).toHaveURL(/.*design\/tariff-details.*/, { timeout: 60000 });
    console.log('Successfully reached Tariff Details page.');
  });
});

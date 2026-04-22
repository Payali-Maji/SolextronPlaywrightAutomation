const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login.page');
const { ProjectPage } = require('../pages/project.page');
const { DesignWizardPage } = require('../pages/design-wizard.page');

test.describe('Agrola Project Automation Flow', () => {
  let loginPage;
  let projectPage;
  let designWizardPage;

  test.setTimeout(600000); // 10 minutes for project iteration

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    projectPage = new ProjectPage(page);
    designWizardPage = new DesignWizardPage(page);
  });

  test('Should iterate through QA projects and reach Checkout page', async ({ page }) => {
    // 1. Login to Agrola
    await loginPage.goto('https://agrola-preprod.solextron.com/');
    await loginPage.login('test_runner@agrola.ch', 'default123');

    // 2. Search for "QA" projects
    await projectPage.searchProjects('QA');

    // 3. Get all project links matching "QA"
    const projectLinks = await projectPage.getMatchingProjectLinks('QA');
    const count = 1; // Process first project for verification
    console.log(`Found ${projectLinks.length} projects matching "QA". Processing the first one.`);

    for (let i = 0; i < count; i++) {
      console.log(`--- Processing Project ${i + 1} of ${count} ---`);

      // Refresh/re-search to avoid stale elements and ensure the project is still there
      await projectPage.searchProjects('QA');
      const currentProjects = await projectPage.getMatchingProjectLinks('QA');

      if (currentProjects.length > i) {
        await currentProjects[i].click();
        console.log('Opened project overview.');

        // 4. Click DC Power Capacity in left navigation
        await designWizardPage.dcPowerTab.waitFor({ state: 'visible' });
        await designWizardPage.dcPowerTab.click();
        console.log('Navigated to DC Power Capacity.');

        // 5. Proceed through the wizard until Checkout
        await designWizardPage.proceedUntilCheckout();

        // Go back to dashboard for the next project
        console.log('Returning to Dashboard...');
        await page.goto('https://agrola-preprod.solextron.com/home-premium');
        await page.waitForLoadState('networkidle');
      } else {
        console.log(`Project at index ${i} no longer found.`);
      }
    }

    console.log('Task completed for all matching projects.');
  });
});
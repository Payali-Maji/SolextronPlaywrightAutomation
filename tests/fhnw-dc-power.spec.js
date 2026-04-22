const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./login.page');
const { ProjectPage } = require('../pages/project.page');
const { DesignWizardPage } = require('../pages/design-wizard.page');

test.describe('FHNW Rhäzuns Battery Automation', () => {
  let loginPage;
  let projectPage;
  let designWizardPage;

  test.setTimeout(900000); // 15 minutes for projects with heavy calculations

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    projectPage = new ProjectPage(page);
    designWizardPage = new DesignWizardPage(page);
  });

  test('Should configure DC Power Capacity and navigate till Checkout', async ({ page, request }) => {
    // 2. Login
    await loginPage.goto('https://design-preprod.solextron.com/');
    await loginPage.login('test1@fhnw.ch', 'default123');

    // 3. API Request to /demand (After login to use cookies)
    console.log('Performing API request to /demand...');
    const apiResponse = await page.context().request.post('https://design-preprod-5qkyhexk2q-ew.a.run.app/demand', {
      data: {
        Demand: {
          project_id: "464277fe-5d57-11f0-b69c-42004e494300",
          readstored: "True"
        }
      }
    });
    console.log(`API response status: ${apiResponse.status()}`);
    if (!apiResponse.ok()) {
      console.warn(`API response failed with status ${apiResponse.status()}. Body: ${await apiResponse.text()}`);
      console.warn('Continuing with UI automation as requested...');
    } else {
      console.log('API request successful.');
    }

    // 4. Open Existing Project
    await projectPage.searchAndOpenProject('Rhäzuns Battery');

    // 3. Navigate to DC Power Capacity (if not already there)
    // The previous step might land us on 'Location' or 'Overview'
    if (!page.url().includes('ac-power-capacity')) {
      await page.goto('https://design-preprod.solextron.com/design/ac-power-capacity');
    }

    // 4. Configure DC Power Capacity (including profile selection)
    // Yearly consumption: 43316.18, DC Power: 500, Profile: C2
    await page.screenshot({ path: 'debug-profile-selection.png' });
    await designWizardPage.configureDCPowerCapacity(43316.18, 500, 'C2');

    // 5. Navigate till Checkout page
    console.log('Starting traversal to Checkout page...');
    await designWizardPage.proceedUntilCheckout();

    // 7. Verification
    await expect(page).toHaveURL('https://design-preprod.solextron.com/design/final-proposal/');
    console.log('Successfully reached final proposal page.');
  });
});

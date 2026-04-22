const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./login.page');
const { ProjectPage } = require('../pages/project.page');
const { DesignWizardPage } = require('../pages/design-wizard.page');

test.describe('FHNW Design Flow Automation', () => {
  let loginPage;
  let projectPage;
  let designWizardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    projectPage = new ProjectPage(page);
    designWizardPage = new DesignWizardPage(page);

    // Increase timeout for long calculations
    test.setTimeout(900000);
  });

  test('Should configure Weather and Components for Rhäzuns Battery', async ({ page }) => {
    // 1. Login
    await loginPage.goto(); // Changed to goto() as seen in login.page.js or standard POM
    await loginPage.login('test1@fhnw.ch', 'default123');

    // 2. Open Project
    await projectPage.searchAndOpenProject('Rhäzuns Battery');

    // 3. Configure Weather
    await designWizardPage.configureWeather();

    // 4. Configure Components
    await designWizardPage.configureComponents('Produtos', 'ads-tec GSS2824 -1');

    // 5. Verification
    await expect(page).toHaveURL(/.*design\/tariff-details.*/);
    console.log('Successfully configured Weather and Components.');
  });
});

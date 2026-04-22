const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login.page');
const { ProjectPage } = require('../pages/project.page');
const { ComponentsPage } = require('../pages/components.page');
const { DesignWizardPage } = require('../pages/design-wizard.page');

test.describe('Solextron Solar Design Flow', () => {
  let loginPage;
  let projectPage;
  let componentsPage;
  let designWizardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    projectPage = new ProjectPage(page);
    componentsPage = new ComponentsPage(page);
    designWizardPage = new DesignWizardPage(page);
  });

  test('Should complete the end-to-end solar design flow', async ({ page }) => {
    // 1. Login
    await loginPage.goto();
    await loginPage.login('dev1@solarprime.com.br', 'default123');

    // 2. Project Creation
    const projectName = `Automated Project ${Date.now()}`;
    await projectPage.fillProjectDetails(
      projectName,
      'Test',
      'User',
      'testuser@example.com',
      '8320 Fehraltorf, Switzerland'
    );

    // 3. Follow the Wizard to get to Components
    // Wait for redirect to design flow (Location page)
    await page.waitForURL(/.*design\/location.*/, { timeout: 30000 });

    // Select roof areas (mandatory for new projects)
    await designWizardPage.selectRoof();

    // Proceed from Location to DC Power
    await designWizardPage.saveAndProceedButton.click();

    // Proceed from DC Power to Weather
    await designWizardPage.saveAndProceedButton.click();

    // Proceed from Weather to Components
    // Sometimes Weather has a 'Continue' button instead of 'Save and Proceed'
    try {
      await designWizardPage.continueButton.waitFor({ state: 'visible', timeout: 5000 });
      await designWizardPage.continueButton.click();
    } catch (e) {
      await designWizardPage.saveAndProceedButton.click();
    }

    // Now Select Components
    await componentsPage.selectComponents();

    // 4. Physical Layout
    await designWizardPage.configurePhysicalLayout();

    // 5. Weather
    await designWizardPage.configureWeather();

    // 6. Tariff
    await designWizardPage.configureTariff('MA', 'Afonso Cunha');

    // 7. Final Steps (Save and Proceed through remaining tabs)
    await designWizardPage.saveAndProceedRepeatedly(3);

    // Verification - Example: verify the components tab is active or a success message
    await expect(page.locator("//div[@class='step-label' and text()='Components']")).toBeVisible();
  });
});

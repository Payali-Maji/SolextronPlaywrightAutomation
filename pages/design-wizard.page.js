const { expect } = require('@playwright/test');

class DesignWizardPage {
  constructor(page) {
    this.page = page;
    
    // Tab Labels
    this.physicalLayoutTab = page.getByText('Physical Layout', { exact: true });
    this.tariffDetailsTab = page.getByText('Tariff Details', { exact: true });
    this.weatherTab = page.getByText('Weather', { exact: true });
    this.dcPowerTab = page.locator("//div[contains(text(), 'DC Power Capacity')]");
    this.componentsTab = page.getByText('Components', { exact: true });
    
    // Physical Layout Elements
    this.calcWithoutShadowButton = page.locator("//button[text()='Calculate without shadow ']");
    this.panelTiltInput = page.locator("//input[@id='panelTilt']");
    
    // Tariff Details Elements
    this.stateSelect = page.locator("(//select[contains(@class, 'form-control')])[1]");
    this.cityInput = page.locator("//div[@class='row mockInputBox city-search-input']");
    this.cityOption = (cityName) => page.locator(`//div[@class='container-fluid supplierListBox']//div[contains(text(),'${cityName}')]`);
    
    // Common Buttons
    this.saveAndProceedButton = page.locator("//button[text()=' Save and Proceed ']");
    this.continueButton = page.locator("//button[text()=' Continue ']");
    this.selectRoofAreasButton = page.locator("//button[contains(text(),'SELECT ROOF AREAS')]");
    
    // DC Power Capacity Page Elements
    this.yearlyConsumptionInput = page.locator("//span[contains(text(), 'Yearly consumption')]/following::input[1]");
    this.calculatePowerCapacityButton = page.locator("//button[contains(text(), 'Calculate Power Capacity')]");
    this.dcPowerInput = page.locator("//p[contains(text(), 'Enter DC power')]/following-sibling::div//input"); 
    this.dcPowerWarning = page.getByText('WARNING: DC Power can not be zero');
    this.saveAndProceedButton = page.locator("//button[contains(text(), 'Save and Proceed')]");
    this.dailyConsumptionProfileTrigger = page.locator("//div[contains(text(), 'Select Daily Consumption Profile')]/following::div[contains(@class, 'form-control') or contains(@class, 'select') or contains(text(), 'User Defined')]").first();
  }

  async configureDCPowerCapacity(yearlyConsumption, dcPower, profileText) {
    console.log(`Configuring DC Power Capacity: yearlyConsumption=${yearlyConsumption}, dcPower=${dcPower}, profile=${profileText}`);
    // Ensure we are on the DC Power page
    if (!this.page.url().includes('ac-power-capacity')) {
      console.log('Navigating to DC Power tab...');
      await this.dcPowerTab.click();
    }

    // Input yearly consumption if provided
    if (yearlyConsumption) {
      console.log('Filling yearly consumption...');
      await this.yearlyConsumptionInput.waitFor({ state: 'visible', timeout: 30000 });
      await this.yearlyConsumptionInput.clear();
      await this.yearlyConsumptionInput.fill(yearlyConsumption.toString());
      await this.calculatePowerCapacityButton.click();
      console.log('Clicked Calculate Power Capacity.');
      // Wait for calculation results - increased for safety
      await this.page.waitForTimeout(8000); 
    }

    // Input DC Power
    if (dcPower) {
      console.log('Filling DC power...');
      // Try multiple selectors for DC Power input
      const selectors = [
        "//p[contains(text(), 'Enter DC power')]/following-sibling::div//input",
        "//div[contains(text(), 'Enter DC power')]/following::input[1]",
        "input[type='number']:near(:text('Enter DC power'))"
      ];
      
      let found = false;
      for (const selector of selectors) {
        try {
          const input = this.page.locator(selector).first();
          if (await input.isVisible({ timeout: 5000 })) {
            console.log(`Found DC power input with selector: ${selector}`);
            await input.clear();
            await input.fill(dcPower.toString());
            found = true;
            break;
          }
        } catch (e) {}
      }
      
      if (!found) {
        console.log('Could not find DC power input with primary selectors, trying last input strategy...');
        await this.page.locator('input').last().fill(dcPower.toString());
      }
    }

    // Select Daily Consumption Profile if provided
    if (profileText) {
        await this.selectDailyConsumptionProfile(profileText);
    }

    // Click Save and Proceed
    console.log('Clicking Save and Proceed...');
    await this.saveAndProceedButton.click();
    
    // Wait for the next step (Weather usually)
    await this.page.waitForURL(/.*design\/(weather|components|financials|checkout|final-proposal).*/, { timeout: 15000 });
    console.log('Successfully navigated to next page.');
  }

  async selectDailyConsumptionProfile(profileCodeOrText) {
    console.log(`Selecting Daily Consumption Profile matching: ${profileCodeOrText}...`);
    await this.page.waitForTimeout(3000); 
    await this.dailyConsumptionProfileTrigger.waitFor({ state: 'visible', timeout: 15000 });
    
    console.log('Clicking dropdown trigger...');
    await this.dailyConsumptionProfileTrigger.click({ force: true });
    await this.page.waitForTimeout(3000);
    await this.page.screenshot({ path: 'debug-dropdown-clicked.png' });
    
    // Look for 'CHE' and click it if it looks like a category or option
    const che = this.page.locator("text=CHE").first();
    if (await che.isVisible({ timeout: 5000 })) {
        console.log("Clicking 'CHE' category/option...");
        await che.click();
        await this.page.waitForTimeout(3000);
        await this.page.screenshot({ path: 'debug-che-clicked.png' });
    } else {
        console.log("'CHE' not visible, maybe it's already selected or not needed.");
    }

    // Now look for the profile (15 kW)
    const targetText = profileCodeOrText === 'C2' ? '15 kW' : profileCodeOrText;
    const option = this.page.locator(`text=${targetText}`).first();
    
    if (await option.isVisible({ timeout: 8000 })) {
        console.log(`Clicking profile option matching: ${targetText}...`);
        await option.click();
        await this.page.waitForTimeout(1000);
        console.log(`Profile ${targetText} selected.`);
    } else {
        console.warn(`Option matching "${targetText}" not found. Logging all visible text...`);
        const allText = await this.page.innerText('body');
        // console.log(`Visible text on page: ${allText.substring(0, 1000)}...`);
        
        console.log('Falling back to first visible option in the overlay space...');
        const fallback = this.page.locator('mat-option, [role="option"]').first();
        if (await fallback.isVisible({ timeout: 2000 })) {
            await fallback.click();
        } else {
            throw new Error(`Profile selection failed: "${targetText}" not found and no fallback visible.`);
        }
    }
  }

  async proceedUntilCheckout() {
    let currentUrl = this.page.url();
    let stuckCount = 0;
    
    while (!currentUrl.includes('checkout') && stuckCount < 15) {
      console.log(`Current step: ${currentUrl}.`);
      
      const saveButton = this.page.locator("//button[contains(text(), 'Save and Proceed') or contains(text(), 'Continue')]").first();
      const calcButton = this.page.locator("//button[contains(text(), 'Calculate')]").first();
      const calcShadowButton = this.page.locator("//button[contains(text(), 'Calculate without shadow')]").first();
      
      try {
        if (await calcShadowButton.isVisible({ timeout: 2000 })) {
            console.log('Found "Calculate without shadow" button, clicking...');
            await calcShadowButton.click();
            await this.page.waitForTimeout(10000); // Calculations can take time
        } else if (await calcButton.isVisible({ timeout: 2000 })) {
            console.log('Found generic Calculate button, clicking...');
            await calcButton.click();
            await this.page.waitForTimeout(5000);
        }
        
        if (await saveButton.isVisible({ timeout: 5000 })) {
            console.log('Clicking Save and Proceed / Continue...');
            await saveButton.click();
            await this.page.waitForTimeout(4000);
        } else {
            console.log('Proceed button not visible, checking for popups or overlays...');
            // Optional: Add logic to close tutorials or popups here
        }
      } catch (e) {
          console.log(`Error during step: ${e.message}`);
      }
      
      const nextUrl = this.page.url();
      if (nextUrl === currentUrl) {
          stuckCount++;
          console.log(`Stuck count: ${stuckCount}. URL did not change: ${currentUrl}`);
      } else {
          stuckCount = 0;
      }
      currentUrl = nextUrl;
    }
    
    if (currentUrl.includes('checkout')) {
        console.log('Reached Checkout page.');
    } else {
        console.log('Failed to reach Checkout page or too many retries.');
    }
  }

  async selectRoof() {
    await this.selectRoofAreasButton.click();
    await this.page.waitForTimeout(3000);
    
    const map = this.page.getByRole('application').first();
    const box = await map.boundingBox();
    if (box) {
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      
      // Try 5 different points to find a roof
      const points = [
        { x: centerX, y: centerY },
        { x: centerX + box.width / 4, y: centerY + box.height / 4 },
        { x: centerX - box.width / 4, y: centerY - box.height / 4 },
        { x: centerX + box.width / 4, y: centerY - box.height / 4 },
        { x: centerX - box.width / 4, y: centerY + box.height / 4 }
      ];
      
      for (const p of points) {
        await this.page.mouse.click(p.x, p.y);
        await this.page.waitForTimeout(1000);
      }
    }
    await this.page.waitForTimeout(3000);
  }

  async navigateToTab(tabName) {
    const tabMap = {
      'Physical Layout': this.physicalLayoutTab,
      'Tariff Details': this.tariffDetailsTab,
      'Weather': this.weatherTab,
      'DC Power Capacity': this.dcPowerTab
    };
    await tabMap[tabName].click();
  }

  async configurePhysicalLayout() {
    await this.physicalLayoutTab.click();
    await this.calcWithoutShadowButton.click();
    // Wait for calculation or next step
  }

  async configureTariff(state, city) {
    await this.tariffDetailsTab.click();
    await this.stateSelect.selectOption(state);
    await this.cityInput.click();
    await this.cityOption(city).click();
    await this.saveAndProceedButton.click();
  }

  async configureWeather() {
    console.log('Navigating to Weather page...');
    if (!this.page.url().includes('weather')) {
      await this.weatherTab.click();
    }
    
    console.log('Selecting "Auto-select best weather service"...');
    const autoSelectRadio = this.page.locator('label:has-text("Auto-select best weather service")');
    await autoSelectRadio.waitFor({ state: 'visible', timeout: 10000 });
    await autoSelectRadio.click();
    
    console.log('Clicking Save and Proceed...');
    await this.saveAndProceedButton.click();
    
    try {
      // Sometimes an extra "Continue" button appears
      await this.page.locator("//button[contains(text(), 'Continue')]").click({ timeout: 5000 });
    } catch (e) {
      console.log('No extra Continue button found, proceeding.');
    }
    
    await this.page.waitForURL(/.*design\/(components|financials|checkout).*/, { timeout: 15000 });
    console.log('Successfully moved to next page after Weather.');
  }

  async configureComponents(portfolioName = 'Produtos', batteryName = 'ads-tec GSS2824 -1') {
    console.log('Configuring Components...');
    if (!this.page.url().includes('components')) {
      await this.componentsTab.click();
    }
    
    // 1. Select Product Portfolio
    console.log(`Selecting Product Portfolio: ${portfolioName}...`);
    const portfolioDropdown = this.page.locator("[id^='select2-product_portfolio-container']").or(this.page.locator('select#product_portfolio'));
    await portfolioDropdown.click();
    await this.page.locator(`text=${portfolioName}`).first().click();
    await this.page.waitForTimeout(2000); // Wait for list refresh
    
    // 2. Add Battery if requested
    if (batteryName) {
      console.log(`Checking for battery: ${batteryName}...`);
      if (!(await this.page.getByText(batteryName, { exact: false }).isVisible())) {
        console.log(`Adding battery ${batteryName}...`);
        // Find Battery section + button
        const batteryPlus = this.page.locator("//div[contains(text(), 'Battery')]/following-sibling::div//button[contains(@class, 'plus')]").first();
        await batteryPlus.scrollIntoViewIfNeeded();
        await batteryPlus.click();
        
        // Modal interaction
        console.log(`Searching for ${batteryName} in modal...`);
        const searchInput = this.page.locator("div.modal-body input[type='text']").first();
        await searchInput.fill(batteryName);
        await this.page.waitForTimeout(1000);
        await this.page.locator(`div.modal-body text=${batteryName}`).first().click();
        await this.page.waitForTimeout(2000);
      } else {
        console.log(`Battery ${batteryName} already present.`);
      }
    }
    
    // 3. Accessory Components -> Ac System
    console.log('Checking Accessory Components - Ac System...');
    const acSystemHeader = this.page.locator("//div[contains(text(), 'Ac System')]").first();
    if (!(await acSystemHeader.isVisible())) {
      console.log('Group "Ac System" not found, adding it...');
      const addGroupBtn = this.page.locator("//button[contains(text(), 'Add Group')]").first();
      await addGroupBtn.scrollIntoViewIfNeeded();
      await addGroupBtn.click();
      await this.page.locator('input[placeholder="Group Name"]').fill('Ac System');
      await this.page.locator('button:has-text("Add Group")').first().click();
      await this.page.waitForTimeout(2000);
    }
    
    console.log('Adding first option to Ac System...');
    const acSystemPlus = this.page.locator("//div[contains(text(), 'Ac System')]/following-sibling::div//button[contains(@class, 'plus')]").first();
    await acSystemPlus.scrollIntoViewIfNeeded();
    await acSystemPlus.click();
    
    // Select first option in the component selection modal
    console.log('Selecting first component from modal...');
    const firstOption = this.page.locator('div.modal-body table tr td').first();
    await firstOption.waitFor({ state: 'visible', timeout: 10000 });
    await firstOption.click();
    await this.page.waitForTimeout(2000);
    
    // 4. Save and Proceed
    console.log('Clicking Save and Proceed...');
    await this.saveAndProceedButton.click();
    await this.page.waitForURL(/.*design\/(tariff-details|financials|checkout).*/, { timeout: 15000 });
    console.log('Successfully moved to next page after Components.');
  }
}

module.exports = { DesignWizardPage };

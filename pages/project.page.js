const { expect } = require('@playwright/test');

class ProjectPage {
  constructor(page) {
    this.page = page;
    this.newDesignButton = page.getByText('New design');
    this.projectNameInput = page.locator("//input[@placeholder='Project Name*']");
    this.firstNameInput = page.locator("//input[@placeholder='Customer First Name*']");
    this.lastNameInput = page.locator("//input[@placeholder='Customer Last Name*']");
    this.emailInput = page.locator("//input[@placeholder='Customer Email Address*']");
    this.addressInput = page.locator("//input[@placeholder='Project Address*']");
    this.createButton = page.locator("//button[text()=' Create ']");
    this.addressSuggestion = page.locator(".pac-item"); // Google Map address suggestions usually have this class
  }

  async fillProjectDetails(projectName, firstName, lastName, email, address) {
    // Wait for the button to be stable and visible
    await this.newDesignButton.first().waitFor({ state: 'visible', timeout: 15000 });
    await this.newDesignButton.first().click();
    await this.projectNameInput.fill(projectName);
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.addressInput.pressSequentially(address, { delay: 100 });
    // Wait for the address suggestion and click the first one
    await this.addressSuggestion.first().waitFor({ state: 'visible', timeout: 30000 });
    await this.addressSuggestion.first().click();
    await this.createButton.click();
  }

  async searchAndOpenProject(projectName) {
    console.log(`Searching for project: ${projectName}...`);
    await this.searchProjects(projectName);
    
    // Target the Name column in the ag-grid using the title attribute
    const projectLink = this.page.locator(`//div[contains(@class, 'ag-cell') and (text()='${projectName}' or contains(@title, "${projectName}"))]`).first();
    
    await projectLink.waitFor({ state: 'visible', timeout: 30000 });
    await projectLink.click();
    
    // Wait for the design flow to load
    await this.page.waitForURL(/.*design\/.*/, { timeout: 30000 });
    console.log(`Project ${projectName} opened.`);
  }

  async searchProjects(query) {
    const searchInput = this.page.locator('input').filter({ has: this.page.locator('..').locator('select') }).or(this.page.locator('input[placeholder*="Search Project"]'));
    await searchInput.first().waitFor({ state: 'visible' });
    await searchInput.first().clear();
    await searchInput.first().fill(query);
    await this.page.waitForTimeout(3000); // Wait for ag-grid to filter
  }

  async getMatchingProjectLinks(query) {
    // Target the Name column in the ag-grid using the title attribute
    return this.page.locator(`//div[contains(@class, 'ag-cell') and contains(@title, "${query}")]`).all();
  }
}

module.exports = { ProjectPage };

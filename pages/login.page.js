const { expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;
    this.url = 'https://design-preprod.solextron.com/';
    this.loginNavButton = page.getByRole('button', { name: 'LOGIN' });
    this.accountIdInput = page.locator("//input[@placeholder='Account ID']");
    this.passwordInput = page.locator("//input[@placeholder='Password']");
    this.loginSubmitDiv = page.locator("//div[text()=' LOGIN ']");
    this.loginPopupButton = page.getByRole('button', { name: 'Login', exact: true });
    this.cancelPopupButton = page.getByRole('button', { name: 'Cancel', exact: true });
  }

  async navigateToLogin() {
    console.log('Navigating to login page...');
    await this.page.goto('https://design-preprod.solextron.com/login');
  }

  async login(email, password) {
    // 1. Initial click on LOGIN button (from the landing/main page)
    console.log('Action: Clicking the initial "LOGIN" button to open the form...');
    const initialLoginButton = this.page.locator('button:has-text("LOGIN")').or(this.loginNavButton).first();
    await initialLoginButton.waitFor({ state: 'visible', timeout: 30000 });
    await this.page.waitForTimeout(2000); 
    await initialLoginButton.click({ force: true });
    
    // 2. Now wait for the login inputs
    console.log('Action: Waiting for Account ID / Password fields to appear...');
    await this.accountIdInput.waitFor({ state: 'visible', timeout: 30000 });
    await this.page.waitForTimeout(1000); 

    // 3. Enter credentials
    console.log(`Action: Typing email: ${email}`);
    await this.accountIdInput.fill(email);
    await this.passwordInput.fill(password);
    
    // 4. Submit the form
    console.log('Action: Clicking the form " LOGIN " submit button...');
    await this.loginSubmitDiv.waitFor({ state: 'visible', timeout: 15000 });
    await this.loginSubmitDiv.click({ force: true });

    // 5. SECONDARY LOGIN MODULE: Click "Login" in the Login/Cancel popup that appears after submission
    console.log('Action: Waiting for secondary Login/Cancel confirmation popup...');
    try {
        await this.loginPopupButton.waitFor({ state: 'visible', timeout: 10000 });
        console.log('Secondary Login button detected. Clicking to confirm...');
        await this.loginPopupButton.click({ force: true });
    } catch (e) {
        console.log('Secondary Login/Cancel popup did not appear, proceeding...');
    }

    // 6. FINAL SESSION CONFLICT: Race between redirection to Dashboard OR the "Already logged in elsewhere" popup
    console.log('Monitoring for final Dashboard redirection or session conflict popup...');
    const dashboardURLPattern = /.*(home-premium|dashboard|location|overview|projects|design).*/;
    
    const result = await Promise.race([
        this.page.waitForURL(dashboardURLPattern, { timeout: 30000 }).then(() => 'success'),
        this.page.locator('div, p, span').filter({ hasText: 'You are already logged in elsewhere' }).waitFor({ state: 'visible', timeout: 10000 }).then(() => 'session_conflict')
    ]).catch(() => 'timeout');

    if (result === 'session_conflict') {
        process.stdout.write('Action: Concurrent session detected. Clicking final "login" button...\n');
        const sessionLoginButton = this.page.locator('.col-6 button.btn-success, button:has-text("login")').first();
        await sessionLoginButton.click({ force: true });
        await this.page.waitForURL(dashboardURLPattern, { timeout: 30000 });
    }

    console.log('Successfully reached dashboard.');
  }

  // Deprecated handleSessionPopup since it's now handled in the race condition
  async handleSessionPopup() {
     // No-op - replaced by race logic in login()
  }
}

module.exports = { LoginPage };

const { expect } = require('@playwright/test');

class ComponentsPage {
  constructor(page) {
    this.page = page;

    // ─────────────────────────────────────────────
    // Tabs & Portfolio
    // ─────────────────────────────────────────────
    this.componentsTab = page.getByText('Components', { exact: true });
    this.portfolioDropdown = page
      .locator("select.form-control")
      .filter({ has: page.locator("option[value='Produtos']") });

    // ─────────────────────────────────────────────
    // Section helpers (evaluated lazily via methods)
    // Using page.evaluate-based locators so we are
    // never fooled by broken template-literal CSS
    // ─────────────────────────────────────────────

    // Solarmodule card: any ancestor div that contains the heading "Solarmodule"
    this._solarCard   = () => page.locator('div').filter({ has: page.locator(':text-is("Solarmodule")') }).last();
    this._inverterCard = () => page.locator('div').filter({ has: page.locator(':text-is("Inverter")') }).last();
    this._batteryCard  = () => page.locator('div').filter({ has: page.locator(':text("Battery"), :text("Batterie")') }).last();

    // Add / remove icons – resolved inside the card at call-time
    this.solarmodulePlusButton  = page.locator('div').filter({ has: page.locator(':text-is("Solarmodule")') }).locator("img[src*='add']").last();
    this.inverterPlusButton     = page.locator('div').filter({ has: page.locator(':text-is("Inverter")') }).locator("img[src*='add']").last();
    this.inverterMinusButton    = page.locator('div').filter({ has: page.locator(':text-is("Inverter")') }).locator("img[src*='remove']").first();
    this.batteryPlusIcon        = page.locator('div').filter({ has: page.locator(':text("Battery"), :text("Batterie")') }).locator("img[src*='add']").last();
    this.batteryMinusButton     = page.locator('div').filter({ has: page.locator(':text("Battery"), :text("Batterie")') }).locator("img[src*='remove']").first();

    // Accessories "+ Add Component" button
    this.batterieAddButton = page.locator("span.add-cost").filter({ hasText: '+ Add Component' });

    // Spinners
    this.loadingSpinner = page.locator("ngx-spinner, .loading-backdrop, .spinner-container").first();

    // Modal
    this.modalContent      = page.locator('mat-dialog-container, app-component-selection-modal').first();
    this.modalSearchInput  = page.locator("input[placeholder='Search by name']").first();
    this.modalFirstOption  = page.locator('.component-row').first();
    this.modalComponentRows = page.locator('.component-row');
    this.modalCloseButton  = page.locator('button.close_btn, .close-button, [aria-label="Close"], .close_btn').first();

    // Save and Proceed
    this.saveAndProceedButton = page.locator("button.create-button").filter({ hasText: 'Save and Proceed' });
  }

  // ───────────────────────────────────────────────────────────────
  // DEBUG: Print current page status (crash-safe)
  // ───────────────────────────────────────────────────────────────
  async debugPageStatus(label = '') {
    try {
      console.log(`\n════════════ DEBUG PAGE STATUS ${label} ════════════`);
      console.log(`URL : ${this.page.url()}`);

      // Check each section
      for (const section of ['Solarmodule', 'Inverter', 'Battery', 'Accessories']) {
        try {
          const el = this.page.locator('div').filter({ hasText: new RegExp(`^${section}`, 'i') }).first();
          const visible = await el.isVisible({ timeout: 2000 }).catch(() => false);
          console.log(`  Section "${section}" visible: ${visible}`);
        } catch (_) {
          console.log(`  Section "${section}" visible: CHECK FAILED`);
        }
      }

      // Check spinner
      try {
        const spinner = await this.page.locator("ngx-spinner, .loading-backdrop, .fa-spinner").isVisible({ timeout: 1000 });
        console.log(`  Spinner active: ${spinner}`);
      } catch (_) {
        console.log(`  Spinner active: CHECK FAILED`);
      }

      // Any visible error toasts
      try {
        const errors = await this.page.locator(".error, .alert-danger, .toast-error").allTextContents();
        if (errors.length > 0) console.log(`  ⚠ Error messages: ${errors.join(' | ')}`);
      } catch (_) { /* ignore */ }

      // Dump all img src attributes on page (helps identify icon filenames)
      try {
        const imgSrcs = await this.page.evaluate(() =>
          [...document.querySelectorAll('img')].map(i => i.src).filter(Boolean)
        );
        const addRemoveImgs = imgSrcs.filter(s => /add|remove|plus|minus/i.test(s));
        if (addRemoveImgs.length > 0) {
          console.log(`  Icon images found: ${addRemoveImgs.join(', ')}`);
        } else {
          console.log(`  ⚠ No add/remove icon images found on page!`);
        }
      } catch (_) { /* ignore */ }

      console.log(`════════════ END DEBUG STATUS ════════════\n`);
    } catch (err) {
      console.log(`[DEBUG] debugPageStatus failed (page may be closed): ${err.message}`);
    }
  }

  // ───────────────────────────────────────────────────────────────
  // Click helper with full debug output
  // ───────────────────────────────────────────────────────────────
  async clickWithDebug(locator, description) {
    console.log(`\n[STEP] ▶ ${description}`);

    // Scroll into view first
    await locator.scrollIntoViewIfNeeded().catch(() => null);

    // Wait with timeout — on fail, print debug then rethrow
    try {
      await locator.waitFor({ state: 'visible', timeout: 30000 });
    } catch (e) {
      console.log(`[STEP] ✖ "${description}" NOT visible after 30s`);
      await this.debugPageStatus(`after failing to find: ${description}`);
      throw e;
    }

    await this.page.waitForTimeout(800); // DOM settle

    // Print rich info about what we found
    try {
      const count = await locator.count();
      const meta  = await locator.first().evaluate(el => ({
        tag:     el.tagName,
        classes: el.className,
        src:     el.src || el.querySelector('img')?.src || '',
        text:    el.innerText?.trim().substring(0, 60),
        rect:    JSON.stringify(el.getBoundingClientRect()),
      })).catch(() => ({}));
      console.log(`[STEP] ✔ Found ${count}x "${description}": ${JSON.stringify(meta)}`);
    } catch (_) { /* non-fatal */ }

    await locator.click({ force: true });
    console.log(`[STEP] ✔ Clicked "${description}"`);
  }

  // ───────────────────────────────────────────────────────────────
  // Wait for spinners AND cards to be present (fixes vanishing bug)
  // ───────────────────────────────────────────────────────────────
  async waitForLoading() {
    console.log('[WAIT] Waiting for any loading spinners to clear...');
    const spinnerSelector = "ngx-spinner, .loading-backdrop, .spinner-container, i.fa-spinner, .fa-spin, mat-progress-bar, mat-spinner";
    try {
      const spinner = this.page.locator(spinnerSelector).first();
      await spinner.waitFor({ state: 'attached', timeout: 5000 });
      await spinner.waitFor({ state: 'hidden', timeout: 120000 });
      console.log('[WAIT] ✔ Spinner cleared.');
    } catch (_) {
      console.log('[WAIT] ✔ No spinner detected.');
    }

    // ── FIX FOR VANISHING ISSUE ──
    // After portfolio change Angular destroys and recreates cards.
    // We must wait for at least one card heading to re-appear.
    console.log('[WAIT] Waiting for component section headings to appear...');
    try {
      await this.page
        .locator(':text-is("Solarmodule")')
        .waitFor({ state: 'visible', timeout: 30000 });
      console.log('[WAIT] ✔ "Solarmodule" heading visible — cards repopulated.');
    } catch (e) {
      console.log('[WAIT] ⚠ "Solarmodule" heading not found. Running debug...');
      await this.debugPageStatus('after waitForLoading timeout');
    }

    await this.page.waitForTimeout(2000); // final DOM settle
  }

  // ───────────────────────────────────────────────────────────────
  // Portfolio selection with explicit API-response wait
  // ───────────────────────────────────────────────────────────────
  async selectPortfolio(portfolioValue) {
    console.log(`[PORTFOLIO] Selecting portfolio: "${portfolioValue}"...`);
    await this.portfolioDropdown.waitFor({ state: 'visible', timeout: 30000 });

    // Attach API listener BEFORE changing the dropdown
    const apiResponsePromise = this.page.waitForResponse(
      res => res.url().includes('/bom') || res.url().includes('/portfolio') || res.url().includes('/component'),
      { timeout: 30000 }
    ).catch(() => {
      console.log('[PORTFOLIO] No BOM/portfolio API response intercepted — continuing on UI.');
    });

    await this.portfolioDropdown.selectOption(portfolioValue);
    console.log(`[PORTFOLIO] Dropdown changed. Waiting for API re-population...`);
    await apiResponsePromise;

    // Now wait for spinners + Solarmodule heading
    await this.waitForLoading();
    console.log(`[PORTFOLIO] ✔ Portfolio "${portfolioValue}" fully loaded.`);
  }

  // ───────────────────────────────────────────────────────────────
  // Select the first item from a selection modal
  // ───────────────────────────────────────────────────────────────
  async selectFirstOptionFromModal() {
    console.log('[MODAL] Waiting for selection modal to appear...');

    try {
      await this.modalContent.waitFor({ state: 'visible', timeout: 30000 });
    } catch (e) {
      console.log('[MODAL] ✖ Modal did not appear. Debug:');
      await this.debugPageStatus('modal not appearing');
      throw e;
    }

    // Wait for BOM API response
    console.log('[MODAL] Waiting for BOM API data...');
    await this.page.waitForResponse(
      res => res.url().includes('/bom') && res.request().method() === 'POST' && res.status() === 200,
      { timeout: 45000 }
    ).catch(() => console.log('[MODAL] BOM response timed out — relying on UI.'));

    // Wait for rows to appear
    try {
      await this.modalFirstOption.waitFor({ state: 'visible', timeout: 30000 });
    } catch (e) {
      console.log('[MODAL] ✖ No component rows appeared:');
      await this.debugPageStatus('modal rows missing');
      throw e;
    }

    // Extra settle
    await this.page.waitForLoadState('networkidle').catch(() => null);
    await this.page.waitForTimeout(2000);

    const rowCount = await this.modalComponentRows.count();
    console.log(`[MODAL] Found ${rowCount} row(s). Clicking first...`);

    if (rowCount === 0) {
      await this.debugPageStatus('modal has 0 rows');
      throw new Error('Modal opened but contains 0 component rows.');
    }

    await this.modalFirstOption.click({ force: true });

    // Wait for modal to close
    await this.modalContent.waitFor({ state: 'hidden', timeout: 60000 }).catch(() =>
      console.log('[MODAL] Modal did not close — may still be processing...')
    );

    await this.waitForLoading();
    console.log('[MODAL] ✔ Modal closed and page settled.');
  }

  // ───────────────────────────────────────────────────────────────
  // Search and select a specific component by name
  // ───────────────────────────────────────────────────────────────
  async searchAndSelectFromModal(itemName) {
    console.log(`[MODAL] Searching for: "${itemName}"...`);
    await this.modalSearchInput.waitFor({ state: 'visible', timeout: 30000 });
    await this.modalSearchInput.fill(itemName);
    await this.page.waitForTimeout(3000);

    const targetRow = this.page.locator('.component-row').filter({ hasText: itemName }).first();
    await targetRow.waitFor({ state: 'visible', timeout: 15000 });
    await targetRow.click({ force: true });

    await this.modalContent.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => null);
    await this.page.waitForTimeout(2000);
    console.log(`[MODAL] ✔ "${itemName}" selected.`);
  }
}

module.exports = { ComponentsPage };

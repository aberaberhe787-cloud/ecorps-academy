import { chromium } from 'playwright';

const run = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    // Open profile
    await page.click('button[aria-label="Open profile"]', { timeout: 5000 });
    await page.waitForSelector('text=Ecorp Scholar', { timeout: 5000 });

    // Click Log out
    await page.click('button:has-text("Log out")', { timeout: 5000 });

    // Verify profile panel is removed
    await page.waitForSelector('text=Ecorp Scholar', { state: 'detached', timeout: 7000 });

    console.log('SUCCESS: Logout flow verified — profile panel closed after logout');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('ERROR: Logout flow verification failed:', err);
    await browser.close();
    process.exit(2);
  }
};

run();
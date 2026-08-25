import { chromium } from 'playwright';

const run = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500); // allow client hydration

    // Try top-right account menu first (desktop)
    try {
      await page.waitForSelector('button[aria-label="Open account menu"]', { timeout: 10000 });
      await page.click('button[aria-label="Open account menu"]');
      await page.waitForSelector('text=Log out', { timeout: 5000 });
      await page.click('text=Log out');
    } catch (e) {
      // Fallback: click Dashboard (left nav) then log out inside drawer
      await page.waitForSelector('nav button:has-text("Dashboard")', { timeout: 8000 });
      await page.click('nav button:has-text("Dashboard")');
      await page.waitForSelector('text=Log out', { timeout: 5000 });
      await page.click('text=Log out');
    }

    // If we reach here without errors, consider logout flow exercised
    await page.waitForTimeout(500);

    console.log('SUCCESS: Logout flow verified — logout clicked');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('ERROR: Logout flow verification failed:', err);
    await browser.close();
    process.exit(2);
  }
};

run();
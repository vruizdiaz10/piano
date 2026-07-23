const { chromium } = require('playwright');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  try {
    console.log('Navigating to https://note-dojo.vercel.app...');
    await page.goto('https://note-dojo.vercel.app', { waitUntil: 'networkidle' });

    // Wait a bit for any redirects or initial loading
    await page.waitForTimeout(3000);

    // Check if we're on login screen
    const loginText = await page.locator('text=Entrar, text=Google, text=Sign in').count();
    const guestText = await page.locator('text=Invitado, text=Guest').count();

    if (loginText > 0 && guestText > 0) {
      console.log('On login screen, trying guest access...');
      await page.locator('text=Invitado, text=Guest').first().click();
      await page.waitForTimeout(3000);
    } else if (loginText > 0) {
      console.log('On login screen with Google button');
      // Try to see if we can proceed without login for now
    }

    // Wait for main content to load
    await page.waitForTimeout(5000);

    // Get the page title and content
    const title = await page.title();
    console.log('Page title:', title);

    // Get all text content from body
    const bodyText = await page.textContent('body');
    console.log('Body text length:', bodyText.length);

    // Log first 1000 chars to see what's there
    console.log('First 1000 chars of body:');
    console.log(bodyText.substring(0, 1000));

    // Check for our target strings
    const checks = [
      'Lección Rápida',
      'Generador Rápido',
      'Clave',
      'Notas',
      'Cronómetro',
      'Líneas',
      'Espacios',
      'Sostenidos'
    ];

    console.log('\n=== CHECK RESULTS ===');
    for (const check of checks) {
      const found = bodyText.includes(check);
      console.log(`${check.padEnd(20)}: ${found ? '✓ FOUND' : '✗ NOT FOUND'}`);
    }

    // Take a screenshot
    await page.screenshot({ path: 'vercel-screenshot.png', fullPage: true });
    console.log('\nScreenshot saved as vercel-screenshot.png');

    // Try to find specific elements
    console.log('\n=== ELEMENT SEARCH ===');
    try {
      // Look for heading elements that might contain our title
      const headings = await page.$$eval('h1, h2, h3, h4, h5, h6, .title, .heading', elements =>
        elements.map(el => el.textContent.trim())
      );
      console.log('Headings found:', headings.filter(h => h.length > 0));
    } catch (e) {
      console.log('Error searching headings:', e.message);
    }

    try {
      // Look for buttons with specific text
      const buttons = await page.$$eval('button, .btn, [role="button"]', elements =>
        elements.map(el => el.textContent.trim())
      );
      console.log('Button texts found:', buttons.filter(b => b.length > 0).slice(0, 10));
    } catch (e) {
      console.log('Error searching buttons:', e.message);
    }

  } catch (error) {
    console.error('Error during execution:', error);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
})();
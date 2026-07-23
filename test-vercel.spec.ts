import { test, expect } from '@playwright/test';

test.describe('Vercel Production Check', () => {
  test('should show Lección Rápida title and visible controls', async ({ page }) => {
    // Go to the live site
    await page.goto('https://note-dojo.vercel.app');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if we need to login as guest first
    const loginButton = page.locator('button:has-text("Entrar"), button:has-text("Google")');
    const guestButton = page.locator('button:has-text("Invitado"), button:has-text("Guest")');

    if (await loginButton.count() > 0) {
      console.log('Login screen detected');
      if (await guestButton.count() > 0) {
        console.log('Clicking guest button');
        await guestButton.first().click();
        await page.waitForLoadState('networkidle');
      }
    }

    // Wait for dashboard to load
    await page.waitForSelector('nav.fixed.top-0, .main-content, .clay-card', { timeout: 10000 });

    // Get page content
    const pageContent = await page.textContent('body');
    console.log('PAGE CONTENT LENGTH:', pageContent.length);
    console.log('FIRST 500 CHARS:', pageContent.substring(0, 500));

    // Check for title
    const hasLeccionRapida = pageContent.includes('Lección Rápida');
    const hasGeneradorRapido = pageContent.includes('Generador Rápido');
    console.log('Lección Rápida found:', hasLeccionRapida);
    console.log('Generador Rápido found:', hasGeneradorRapido);

    // Check for controls that should always be visible
    const controls = ['Clave', 'Notas', 'Cronómetro', 'Líneas', 'Espacios', 'Sostenidos'];
    for (const control of controls) {
      const found = pageContent.includes(control);
      console.log(`${control} found:`, found);
    }

    // Take screenshot
    await page.screenshot({ path: 'vercel-check.png', fullPage: true });
    console.log('Screenshot saved as vercel-check.png');

    // Assertions
    expect(hasLeccionRapida || hasGeneradorRapido).toBe(true);
    expect(hasLeccionRapida).toBe(true); // We specifically want Lección Rápida

    // At least some controls should be visible
    const visibleControls = controls.filter(c => pageContent.includes(c));
    expect(visibleControls.length).toBeGreaterThan(0);
  });
});
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

try {
  console.log('Navigating to https://note-dojo.vercel.app...');
  await page.goto('https://note-dojo.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Try guest login if needed
  const guestBtn = page.locator('button:has-text("Invitado"), button:has-text("Entrar como invitado")');
  if (await guestBtn.count() > 0) {
    console.log('Clicking guest button...');
    await guestBtn.first().click();
    await page.waitForTimeout(4000);
  }

  const body = await page.textContent('body');
  console.log('\n=== VERIFICATION ===');

  const checks = [
    ['Lección Rápida', 'Title change check'],
    ['Clave', 'Clef selector visible'],
    ['Notas', 'Notes selector visible'],
    ['Cronómetro', 'Timer toggle visible'],
    ['Líneas', 'Lines toggle visible'],
    ['Espacios', 'Spaces toggle visible'],
    ['Sostenidos', 'Sharps toggle visible'],
    ['Practicar', 'Practice button visible'],
  ];

  let allPassed = true;
  for (const [text, label] of checks) {
    const found = body.includes(text);
    console.log(`${found ? '✅' : '❌'} ${label}: "${text}" ${found ? 'FOUND' : 'NOT FOUND'}`);
    if (!found) allPassed = false;
  }

  await page.screenshot({ path: 'vercel-verified.png', fullPage: true });
  console.log('\n📸 Screenshot saved: vercel-verified.png');
  console.log(allPassed ? '\n✅ ALL CHANGES VERIFIED!' : '\n⚠️ Some changes missing');
} finally {
  await browser.close();
}

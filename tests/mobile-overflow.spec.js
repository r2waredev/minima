const { test, expect } = require('@playwright/test');

test('no horizontal overflow on mobile', async ({ page }) => {
  await page.goto('http://localhost:4000/zodiac.html');
  await page.setViewportSize({ width: 375, height: 812 }); // iPhone size

  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  const clientWidth = await page.evaluate(() => document.body.clientWidth);

  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});

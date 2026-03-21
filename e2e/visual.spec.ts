import { expect, test } from '@playwright/test';

test.describe('비주얼 리그레션', () => {
  test('홈페이지 스냅샷', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('home.png', {
      maxDiffPixelRatio: 0.01,
      fullPage: false,
    });
  });

  test('블로그 목록 스냅샷', async ({ page }) => {
    await page.goto('/ko/blog');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('blog-list.png', {
      maxDiffPixelRatio: 0.01,
      fullPage: false,
    });
  });

  test('로그인 페이지 스냅샷', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('login.png', {
      maxDiffPixelRatio: 0.01,
      fullPage: false,
    });
  });
});

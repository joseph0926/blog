import { expect, test } from '@playwright/test';

test.describe('다국어 전환', () => {
  test('한국어 홈페이지에서 한국어 텍스트가 표시된다', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByText('React와 TypeScript로 문제를 해결하며'),
    ).toBeVisible();
  });

  test('영어로 전환하면 /en/ URL과 영어 텍스트가 표시된다', async ({
    page,
  }) => {
    await page.goto('/');
    const switcher = page
      .locator('[role="group"]')
      .filter({ hasText: /English|한국어/ })
      .first();
    await switcher.getByRole('button', { name: 'English' }).click();
    await page.waitForURL(/\/en/);
    await expect(page).toHaveURL(/\/en/);
    await expect(
      page.getByText('I solve product problems with React and TypeScript'),
    ).toBeVisible();
  });

  test('/en/blog에서 한국어로 전환하면 /ko/blog로 이동한다', async ({
    page,
  }) => {
    await page.goto('/en/blog');
    const switcher = page
      .locator('[role="group"]')
      .filter({ hasText: /English|Korean/ })
      .first();
    await switcher.getByRole('button', { name: 'Korean' }).click();
    await page.waitForURL(/\/ko\/blog|\/blog/);
    await expect(page.locator('article').first()).toBeVisible();
  });
});

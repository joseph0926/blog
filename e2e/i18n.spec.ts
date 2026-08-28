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
    const switcher = page.getByRole('group', { name: '언어' });
    await switcher.getByRole('button', { name: 'English' }).click();
    await page.waitForURL(/\/en/);
    await expect(page).toHaveURL(/\/en/);
    await expect(
      page.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'English', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('/en/blog에서 한국어로 전환하면 기본 locale 블로그로 이동한다', async ({
    page,
  }) => {
    await page.goto('/en/blog');
    const switcher = page.getByRole('group', { name: 'Language' });
    await switcher.getByRole('button', { name: 'Korean' }).click();
    await page.waitForURL(/\/(?:ko\/)?blog(?:\?.*)?$/);
    await expect(
      page.getByRole('heading', {
        name: 'React와 웹 학습 기록',
        level: 1,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '한국어', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});

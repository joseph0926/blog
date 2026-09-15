import { expect, test } from '@playwright/test';

test.describe('소개 페이지', () => {
  test('표지 제목과 장 색인이 렌더링된다', async ({ page }) => {
    await page.goto('/ko/about');
    await expect(
      page.getByRole('heading', { name: '김영훈', level: 1 }),
    ).toBeVisible();
    const index = page.getByRole('navigation', { name: '차례' });
    await expect(index.getByRole('link', { name: /경력/ })).toBeVisible();
    await expect(index.getByRole('link', { name: /연락/ })).toBeVisible();
  });

  test('저감 모드에서 측정과 경력 내용이 정적으로 읽힌다', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ko/about');
    await expect(
      page.getByRole('heading', { name: '작업 기록', level: 2 }),
    ).toBeVisible();
    const reel = page.getByRole('region', { name: '작업 기록' });
    for (const value of ['약 2,000', '12', '결과 재조회', '초안 검토']) {
      await expect(reel.getByText(value, { exact: true })).toBeVisible();
    }
    for (const company of ['EA Korea', 'NHN 인재아이엔씨', '판도라티비']) {
      await expect(
        page.getByRole('heading', { name: new RegExp(company), level: 3 }),
      ).toBeVisible();
    }
    await expect(
      page.getByRole('heading', { name: /React Router와 TanStack Query/ }),
    ).toHaveCount(0);
  });

  test('영어 소개 페이지에 영어 표지와 색인이 표시된다', async ({ page }) => {
    await page.goto('/en/about');
    await expect(
      page.getByRole('heading', { name: 'Younghoon Kim', level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Contents' }),
    ).toBeVisible();
  });
});

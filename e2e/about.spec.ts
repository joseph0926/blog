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

  for (const locale of ['ko', 'en']) {
    test(`${locale} 모바일 소개 페이지를 스크롤해도 가로 여백이 생기지 않는다`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.goto(`/${locale}/about`);
      await expect(page.locator('#about-cover-title')).toBeVisible();

      const coverEnd = await page
        .locator('section[aria-labelledby="about-cover-title"]')
        .evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return window.scrollY + bounds.bottom;
        });
      const bottom = await page.evaluate(
        () => document.documentElement.scrollHeight - window.innerHeight,
      );

      for (const top of [0, coverEnd / 2, coverEnd + 100, bottom]) {
        await page.evaluate(async (top) => {
          window.scrollTo({ left: 0, top, behavior: 'instant' });
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          });
        }, top);
        await expect
          .poll(() =>
            page.evaluate(
              () =>
                document.documentElement.scrollWidth -
                document.documentElement.clientWidth,
            ),
          )
          .toBeLessThanOrEqual(1);
      }
      await expect
        .poll(() => page.evaluate(() => window.scrollY))
        .toBeGreaterThan(0);
    });
  }
});

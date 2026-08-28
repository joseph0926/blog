import { expect, test } from '@playwright/test';

test.describe('블로그 목록', () => {
  test('블로그 목록 페이지가 렌더링된다', async ({ page }) => {
    await page.goto('/ko/blog');
    await expect(
      page.getByRole('heading', {
        name: 'React와 웹 학습 기록',
        level: 1,
      }),
    ).toBeVisible();
  });

  test('블로그 링크에 제목이 표시된다', async ({ page }) => {
    await page.goto('/ko/blog');
    const firstPostLink = page.locator('a[href*="/post/"]').first();
    await expect(firstPostLink).toBeVisible();
    await expect(
      firstPostLink.getByRole('heading', { level: 3 }),
    ).toBeVisible();
  });

  test('태그 필터를 클릭하면 URL에 category 파라미터가 반영된다', async ({
    page,
  }) => {
    await page.goto('/ko/blog');
    const tagButton = page.getByRole('button', {
      name: 'React',
      exact: true,
    });
    await tagButton.click();
    await expect(page).toHaveURL(/[?&]category=react(?:&|$)/);
    await expect(tagButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('검색 필터에 텍스트를 입력하면 URL에 q 파라미터가 반영된다', async ({
    page,
  }) => {
    await page.goto('/ko/blog');
    const searchInput = page.locator('input[placeholder]').first();
    await searchInput.fill('React');
    await page.waitForURL(/q=React/);
    await expect(page).toHaveURL(/q=React/);
  });
});

test.describe('블로그 글 상세', () => {
  test('글 상세 페이지에서 MDX 콘텐츠가 렌더링된다', async ({ page }) => {
    await page.goto('/ko/blog');
    const firstLink = page.locator('a[href*="/post/"]').first();
    const href = await firstLink.getAttribute('href');
    expect(href).toBeTruthy();
    await firstLink.click();
    await page.waitForURL(/\/post\//);
    await expect(page.locator('article')).toBeVisible();
  });

  test('글 상세 페이지에 JSON-LD 구조화 데이터가 포함된다', async ({
    page,
  }) => {
    await page.goto('/ko/blog');
    const firstLink = page.locator('a[href*="/post/"]').first();
    await firstLink.click();
    await page.waitForURL(/\/post\//);
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toBeAttached();
  });
});

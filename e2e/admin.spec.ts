import { expect, test } from '@playwright/test';

test.describe('Admin 로그인', () => {
  test('로그인 페이지가 렌더링된다', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Admin 로그인')).toBeVisible();
    await expect(page.getByLabel('비밀번호')).toBeVisible();
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
  });

  test('비밀번호 입력 후 로그인할 수 있다', async ({ page }) => {
    await page.goto('/login');
    await page
      .getByLabel('비밀번호')
      .fill(process.env.ADMIN_PASSWORD ?? 'test');
    await page.getByRole('button', { name: '로그인' }).click();
    await page.waitForURL('/admin');
    await expect(page.getByText('게시글 관리')).toBeVisible();
  });
});

test.describe('Admin 게시글 관리', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page
      .getByLabel('비밀번호')
      .fill(process.env.ADMIN_PASSWORD ?? 'test');
    await page.getByRole('button', { name: '로그인' }).click();
    await page.waitForURL('/admin');
  });

  test('게시글 목록이 표시된다', async ({ page }) => {
    await expect(page.getByText('게시글 관리')).toBeVisible();
    await expect(page.getByPlaceholder('게시글 검색...')).toBeVisible();
    await expect(page.getByRole('button', { name: /새 게시글/ })).toBeVisible();
  });

  test('새 게시글 다이얼로그를 열 수 있다', async ({ page }) => {
    await page.getByRole('button', { name: /새 게시글/ }).click();
    await expect(page.getByText('새 게시글 작성')).toBeVisible();
    await expect(page.getByLabel('제목')).toBeVisible();
    await expect(page.getByLabel('설명')).toBeVisible();
  });
});

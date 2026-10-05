import { expect, test } from '@playwright/test';

test.describe('홈 탐색', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('질문 이동, 키보드 양 끝 이동과 현재 글 열기가 연결된다', async ({
    page,
  }) => {
    await page.goto('/');
    const links = page.locator('ol a[href*="/post/"]');
    const firstTitle = await links.nth(0).innerText();
    const secondTitle = await links.nth(1).innerText();
    const secondHref = await links.nth(1).getAttribute('href');
    const current = page.locator('a[aria-current="true"]');
    const next = page.getByRole('button', { name: '다음 질문', exact: true });
    const read = page.getByRole('link', { name: '글 읽기', exact: true });
    await expect(current).toHaveText(firstTitle);
    await expect(
      page.getByRole('button', { name: '이전 질문' }),
    ).toHaveAttribute('aria-disabled', 'true');
    await next.click();
    await expect(current).toHaveText(secondTitle);
    expect(secondHref).toBeTruthy();
    await expect(read).toHaveAttribute('href', secondHref!);
    await expect(next).toBeFocused();

    await next.press('End');
    await expect(page.getByRole('status')).toHaveText(/6편 중 6번째/);
    await expect(next).toHaveAttribute('aria-disabled', 'true');
    await next.press('Home');
    await expect(current).toHaveText(firstTitle);
    await next.press('ArrowDown');
    await expect(current).toHaveText(secondTitle);

    await read.focus();
    await read.press('Enter');
    await expect(page).toHaveURL(new URL(secondHref!, page.url()).href);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      secondTitle,
    );
    await expect(page.locator('article')).toBeVisible();
  });

  test('스크롤을 되감으면 질문과 읽기 링크도 되돌아간다', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('ol a[href*="/post/"]');
    const firstTitle = await links.nth(0).innerText();
    const secondTitle = await links.nth(1).innerText();
    const firstHref = await links.nth(0).getAttribute('href');
    await expect(page.locator('a[aria-current="true"]')).toHaveText(firstTitle);
    await page.mouse.wheel(0, 450);
    await expect(page.locator('a[aria-current="true"]')).toHaveText(
      secondTitle,
    );
    await page.mouse.wheel(0, -450);
    await expect(page.locator('a[aria-current="true"]')).toHaveText(firstTitle);
    await expect(
      page.getByRole('link', { name: '글 읽기', exact: true }),
    ).toHaveAttribute('href', firstHref!);
  });

  for (const locale of ['ko', 'en'] as const) {
    test(`${locale} 검색은 특수문자와 언어를 유지한다`, async ({ page }) => {
      await page.goto(`/${locale}`);
      const label = locale === 'ko' ? '전체 글 검색' : 'Search all posts';
      const input = page.getByRole('searchbox', { name: label });
      await page.locator('body').press('/');
      await expect(input).toBeFocused();
      await input.fill('React & URL');
      await input.press('/');
      await expect(input).toHaveValue('React & URL/');
      await input.press('Enter');
      await expect(page).toHaveURL(/\/blog\?q=React\+%26\+URL%2F$/);
      expect(new URL(page.url()).pathname).toBe(
        locale === 'en' ? '/en/blog' : '/blog',
      );
      await expect(page.locator('#blog-search')).toHaveValue('React & URL/');
    });
  }

  test('빈 검색은 전체 글로 이동한다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('searchbox', { name: '전체 글 검색' }).fill('   ');
    await page.getByRole('button', { name: '검색하기' }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'React와 웹 학습 기록',
    );
  });

  test('조작부가 브라우저의 수정 키 조합을 가로채지 않는다', async ({
    page,
  }) => {
    await page.goto('/');
    const next = page.getByRole('button', { name: '다음 질문', exact: true });
    await expect(page.locator('a[aria-current="true"]')).toBeVisible();
    await next.focus();
    const prevented = await next.evaluate((button) => {
      return ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'].map((modifier) => {
        const event = new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          cancelable: true,
          [modifier]: true,
        });
        button.dispatchEvent(event);
        return event.defaultPrevented;
      });
    });
    expect(prevented).toEqual([false, false, false, false]);
  });
});

test.describe('홈 화면 크기와 접근성', () => {
  for (const theme of ['light', 'dark'] as const) {
    for (const width of [320, 390, 1280]) {
      test(`${theme} ${width}px에서 제목, 설명과 조작부가 겹치지 않는다`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.emulateMedia({ colorScheme: theme });
        await page.goto('/');
        const current = page.locator('a[aria-current="true"]');
        const links = page.locator('ol a[href*="/post/"]');
        const firstTitle = await links.nth(0).innerText();
        const secondTitle = await links.nth(1).innerText();
        await expect(current).toHaveText(firstTitle);
        await expect(page.getByRole('searchbox')).toBeInViewport();
        await expect(
          page.getByRole('link', { name: /^전체 \d+편$/ }),
        ).toBeInViewport();
        await expect(
          page.getByRole('link', { name: '글 읽기', exact: true }),
        ).toBeInViewport();
        await expect(
          page.getByRole('button', { name: '다음 질문' }),
        ).toBeInViewport();

        const titleBox = await current.boundingBox();
        const summaryBox = await page.locator('aside').boundingBox();
        expect(titleBox).not.toBeNull();
        expect(summaryBox).not.toBeNull();
        if (width < 1024)
          expect(titleBox!.y + titleBox!.height).toBeLessThanOrEqual(
            summaryBox!.y,
          );
        else
          expect(titleBox!.x + titleBox!.width).toBeLessThanOrEqual(
            summaryBox!.x,
          );
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        );
        expect(overflow).toBe(false);

        await page.getByRole('button', { name: '다음 질문' }).click();
        await expect(current).toHaveText(secondTitle);
        await expect(page.getByRole('status')).toHaveText(/6편 중 2번째/);
      });
    }
  }

  for (const locale of ['ko', 'en'] as const) {
    test(`${locale} 저감 모드에서는 모든 질문을 일반 링크로 읽을 수 있다`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/${locale}`);
      const region = page.getByRole('region', {
        name: locale === 'ko' ? '최근 질문' : 'Recent questions',
      });
      await expect(region.locator('ol a')).toHaveCount(6);
      await expect(region.locator('ol a').first()).toBeVisible();
      await expect(region.locator('ol li p').first()).toBeVisible();
      await expect(
        region.getByRole('button', {
          name: locale === 'ko' ? '다음 질문' : 'Next question',
        }),
      ).toHaveCount(0);
      await region.locator('ol a').first().click();
      await expect(page.locator('article')).toBeVisible();
    });
  }

  test('낮은 화면과 화면 크기 변경은 정적 목록으로 안전하게 전환한다', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: '다음 질문' }).click();
    await expect(page.getByRole('status')).toHaveText(/6편 중 2번째/);
    await page.setViewportSize({ width: 568, height: 320 });
    await expect(page.getByRole('button', { name: '다음 질문' })).toHaveCount(
      0,
    );
    await expect(page.locator('ol a[href*="/post/"]')).toHaveCount(6);
    await expect(page.locator('ol a[href*="/post/"]').last()).toHaveAttribute(
      'style',
      '',
    );
    expect(
      await page.evaluate(() =>
        document.documentElement.classList.contains('dial-snap'),
      ),
    ).toBe(false);
  });

  test('JavaScript 없이도 검색과 글 링크를 사용할 수 있다', async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/en');
    await expect(page.locator('ol a[href*="/post/"]')).toHaveCount(6);
    await page
      .getByRole('searchbox', { name: 'Search all posts' })
      .fill('React');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page).toHaveURL(/\/en\/blog\?q=React$/);
    await context.close();
  });
});

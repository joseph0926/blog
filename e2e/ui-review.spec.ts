import { expect, test } from '@playwright/test';

const postPath =
  '/ko/post/2026-08-15-does-global-agents-md-eat-project-doc-budget';

test('마지막 질문을 지나 푸터로 내려가면 다이얼로 되돌아가지 않는다', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/ko');
  const next = page.getByRole('button', { name: '다음 질문', exact: true });
  for (let attempt = 0; attempt < 3; attempt++) {
    await next.press('End');
    await expect(page.getByRole('status')).toHaveText(/6편 중 6번째/);
    // 버튼의 smooth scroll이 끝난 뒤 별도의 휠 입력으로 무대를 벗어난다.
    await page.waitForTimeout(1000);
    const lastPosition = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 240);
    await page.waitForTimeout(2400);
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(
      lastPosition + 200,
    );
    await expect(page.locator('footer')).toBeInViewport();
  }
});

for (const locale of ['ko', 'en']) {
  for (const width of [390, 1440]) {
    test(`${locale} ${width}px: 글 상세의 모든 글 버튼을 직접 클릭할 수 있다`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(postPath.replace('/ko/', `/${locale}/`));
      const back = page
        .getByRole('link', {
          name: locale === 'ko' ? '모든 글' : 'All posts',
          exact: true,
        })
        .filter({ visible: true });
      await expect(back).toBeInViewport();
      const bounds = await back.boundingBox();
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
      await back.click();
      await expect(page).toHaveURL(/\/blog$/);
      await expect(page.locator('#blog-search')).toBeVisible();
    });
  }
}

test('스크롤한 글 목록에서 상세로 이동해도 블로그 밑줄은 제자리에 있다', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/ko/blog');
  await expect(page.locator('a[href*="/post/"]').first()).toBeVisible();
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(400);
  const samples = page.evaluate(async () => {
    const positions: number[] = [];
    const start = performance.now();
    let arrived = 0;
    while (performance.now() - start < 10000) {
      const underline = document.querySelector(
        'nav ul a[aria-current="page"] span',
      );
      if (underline) positions.push(underline.getBoundingClientRect().y);
      if (location.pathname.includes('/post/') && !arrived) {
        arrived = performance.now();
      }
      if (arrived && performance.now() - arrived > 500) break;
      await new Promise(requestAnimationFrame);
    }
    return positions;
  });
  await page.locator('a[href*="/post/"]').nth(4).click();
  await expect(page).toHaveURL(/\/post\//);
  const positions = await samples;
  expect(positions.length).toBeGreaterThan(2);
  expect(Math.max(...positions) - Math.min(...positions)).toBeLessThan(1);
});

for (const locale of ['ko', 'en']) {
  test(`${locale}: 낮은 화면의 작업 기록은 설명과 함께 정적으로 읽힌다`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 568, height: 320 });
    await page.goto(`/${locale}/about`);
    const region = page.locator('#measurements [role="region"]');
    await expect(region.locator('ol li')).toHaveCount(4);
    await expect(region.locator('ol li').first()).toContainText(
      'TanStack Query',
    );
    for (const item of await region.locator('ol li').all()) {
      const heading = await item.locator(':scope > p').boundingBox();
      const caption = await item.locator(':scope > div').boundingBox();
      expect(heading).not.toBeNull();
      expect(caption!.y).toBeGreaterThanOrEqual(heading!.y + heading!.height);
    }
    await page.setViewportSize({ width: 320, height: 640 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      )
      .toBeLessThanOrEqual(1);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(region.locator('[aria-live]')).toBeAttached();
    await page.setViewportSize({ width: 568, height: 320 });
    await expect(region.locator('ol li').first()).toContainText(
      'TanStack Query',
    );
  });
}

test('키보드로 목차를 탐색하면 모든 초점 항목이 보인다', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(postPath);
  const toc = page.getByRole('navigation', { name: '이 글의 흐름' });
  const links = toc.locator('ol a');
  await links.first().focus();
  for (let index = 0; index < (await links.count()); index++) {
    const link = links.nth(index);
    await expect(link).toBeFocused();
    await expect(link).toHaveCSS('opacity', '1');
    await expect(link).toBeInViewport();
    if (index < (await links.count()) - 1) await page.keyboard.press('Tab');
  }
  await links.getByText('실험 설계', { exact: true }).press('Enter');
  await expect(page).toHaveURL(/#.+/);
});

test('언어를 바꿔도 검색어, 주제, 연도를 유지한다', async ({ page }) => {
  await page.goto('/ko/blog?q=React&category=react&year=2025');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page).toHaveURL(/\/en\/blog\?q=React&category=react&year=2025$/);
  await expect(page.locator('#blog-search')).toHaveValue('React');
  await page.locator('summary').filter({ hasText: 'Topics and year' }).click();
  await expect(
    page.getByRole('button', { name: 'React', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#blog-year')).toContainText('2025');
  await page.getByRole('button', { name: 'Korean', exact: true }).click();
  await expect(page).toHaveURL(/\/blog\?q=React&category=react&year=2025$/);
  await expect(page.locator('#blog-search')).toHaveValue('React');
});

test('모션 감소 설정에서는 현재 절을 바꿔도 보조 띠의 글자가 움직이지 않는다', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(postPath);
  await expect(page.locator('article h2').first()).toBeVisible();
  const moved = await page.evaluate(async () => {
    const headings = document.querySelectorAll('article h2');
    const target = headings[1].getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: target - innerHeight * 0.4 + 10,
      behavior: 'instant',
    });
    const start = performance.now();
    while (performance.now() - start < 350) {
      const label = document.querySelector('div.fixed.top-14 span');
      if (label && getComputedStyle(label).transform !== 'none') return true;
      await new Promise(requestAnimationFrame);
    }
    return false;
  });
  expect(moved).toBe(false);
  await expect(page.locator('div.fixed.top-14')).toHaveText(
    '프롬프트를 직접 열어보는 명령',
  );
});

test('작업 기록의 설명을 바꿔도 설명 영역 높이가 유지된다', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ko/about');
  const region = page.locator('#measurements [role="region"]');
  const caption = region.locator('[aria-live]');
  await expect(caption).toBeAttached();
  const top = await region.evaluate(
    (element) => element.getBoundingClientRect().top + scrollY,
  );
  await page.evaluate((top) => scrollTo({ top, behavior: 'instant' }), top);
  await expect(caption.locator('[aria-hidden="false"]')).toContainText(
    'TanStack Query useQueries',
  );
  const before = await caption.boundingBox();
  await page.evaluate(
    (top) => scrollTo({ top: top + innerHeight / 2, behavior: 'instant' }),
    top,
  );
  await expect(caption.locator('[aria-hidden="false"]')).toContainText(
    'React Router와 TanStack Query',
  );
  const after = await caption.boundingBox();
  expect(Math.abs(before!.height - after!.height)).toBeLessThan(1);
});

test('모바일 목록은 첫 화면에서 글을 고르고 빈 검색에서 복구할 수 있다', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ko/blog');
  await expect(
    page.locator('a[href*="/post/"]').first().getByRole('heading'),
  ).toBeInViewport();
  await expect(page.locator('details')).not.toHaveAttribute('open');
  await page.locator('#blog-search').fill('zzzznothing');
  await expect(
    page.getByRole('heading', { name: '조건에 맞는 글이 없습니다' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: '검색어 삭제', exact: true })
    .last()
    .click();
  await expect(page.locator('#blog-search')).toHaveValue('');
  await expect(page.locator('a[href*="/post/"]').first()).toBeVisible();
});

test('글 상세의 메뉴는 현재 영역을 표시하고 닫은 뒤 초점을 돌려준다', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(postPath);
  const trigger = page.getByRole('button', { name: '메뉴 열기' });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(
    dialog.getByRole('link', { name: '블로그', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  const close = dialog.getByRole('button', { name: '메뉴 닫기' });
  const bounds = await close.boundingBox();
  expect(bounds!.width).toBeGreaterThanOrEqual(44);
  expect(bounds!.height).toBeGreaterThanOrEqual(44);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('소개 첫 화면에서 경력으로 이동하고 PR 원문을 열 수 있다', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ko/about');
  const navigation = page.getByRole('navigation', { name: '소개 바로가기' });
  await expect(navigation).toBeInViewport();
  await navigation.getByRole('link', { name: '경력', exact: true }).click();
  await expect(page).toHaveURL(/#about-career$/);
  await expect(page.locator('#about-career-heading')).toBeInViewport();
  await expect(page.locator('#about-open-source a')).toHaveCount(3);
  await expect(page.locator('#about-open-source a').first()).toHaveAttribute(
    'href',
    'https://github.com/TanStack/query/pull/8641',
  );
});

test('검색에 남는 글은 같은 링크를 유지하고 더 많은 글도 불러온다', async ({
  page,
}) => {
  await page.goto('/ko/blog');
  const links = page.locator('a[href*="/post/"]');
  await expect(links.first()).toBeVisible();
  const firstLink = await links.first().elementHandle();
  const count = await links.count();
  await page.evaluate(() =>
    scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'instant',
    }),
  );
  await expect.poll(() => links.count()).toBeGreaterThan(count);
  await page.locator('#blog-search').fill('AI');
  await expect(page).toHaveURL(/q=AI/);
  await expect(
    page.getByRole('status').filter({ hasText: /글 \d+개/ }),
  ).toBeVisible();
  expect(
    await links
      .first()
      .evaluate((element, previous) => element === previous, firstLink),
  ).toBe(true);
});

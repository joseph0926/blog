import { expect, test } from '@playwright/test';

const cases = [
  {
    locale: 'ko',
    receive: '메시지 도착시키기',
    toDark: '어두운 테마로 바꾸기',
    toLight: '밝은 테마로 바꾸기',
    resubscribe: '2. theme 추가: [roomId, theme]',
    stale: '1. theme 없음: [roomId]',
    readTheme: '메시지 처리 때 읽은 테마',
    reconnects: '테마 변경 후 room 재연결 횟수',
    room: '현재 room',
    light: '밝음',
    dark: '어두움',
  },
  {
    locale: 'en',
    receive: 'Deliver a message',
    toDark: 'Switch to dark theme',
    toLight: 'Switch to light theme',
    resubscribe: '2. With theme: [roomId, theme]',
    stale: '1. Without theme: [roomId]',
    readTheme: 'Theme read when handling the message',
    reconnects: 'Room reconnections after changing the theme',
    room: 'Current room',
    light: 'Light',
    dark: 'Dark',
  },
];

for (const copy of cases) {
  test(`${copy.locale}: theme를 추가하면 새 테마를 읽지만 같은 room에 재연결한다`, async ({
    page,
  }) => {
    await page.goto(
      `/${copy.locale}/post/2026-10-27-when-is-use-effect-event-latest`,
    );

    const demo = page.getByTestId('effect-chatroom-demo');
    const resubscribing = demo.getByRole('region', { name: copy.resubscribe });
    const stale = demo.getByRole('region', { name: copy.stale });

    await expect(demo).toBeVisible();
    await expect(demo.getByLabel(copy.room)).toHaveText('general');
    await expect(stale.getByLabel(copy.reconnects)).toHaveText('0');
    await expect(resubscribing.getByLabel(copy.reconnects)).toHaveText('0');
    await demo.getByRole('button', { name: copy.receive }).click();
    await expect(resubscribing.getByLabel(copy.readTheme)).toHaveText(
      copy.light,
    );
    await expect(stale.getByLabel(copy.readTheme)).toHaveText(copy.light);

    await demo.getByRole('button', { name: copy.toDark }).click();
    await expect(stale.getByLabel(copy.reconnects)).toHaveText('0');
    await expect(resubscribing.getByLabel(copy.reconnects)).toHaveText('1');
    await expect(demo.getByLabel(copy.room)).toHaveText('general');
    await demo.getByRole('button', { name: copy.receive }).click();
    await expect(resubscribing.getByLabel(copy.readTheme)).toHaveText(
      copy.dark,
    );
    await expect(stale.getByLabel(copy.readTheme)).toHaveText(copy.light);
    await expect(resubscribing.getByLabel(copy.reconnects)).toHaveText('1');

    await demo.getByRole('button', { name: copy.toLight }).click();
    await expect(resubscribing.getByLabel(copy.reconnects)).toHaveText('2');
    await demo.getByRole('button', { name: copy.receive }).click();
    await expect(resubscribing.getByLabel(copy.readTheme)).toHaveText(
      copy.light,
    );
    await expect(stale.getByLabel(copy.readTheme)).toHaveText(copy.light);
    await expect(stale.getByLabel(copy.reconnects)).toHaveText('0');
    await expect(demo.getByLabel(copy.room)).toHaveText('general');
  });
}

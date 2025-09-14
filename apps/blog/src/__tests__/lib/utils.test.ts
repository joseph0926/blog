import { cn } from '@joseph0926/ui/lib/utils';
import { delay } from '@/lib/utils';

describe('lib/utils를 테스트합니다.', () => {
  describe('cn 함수를 테스트합니다.', () => {
    it('여러 클래스를 통합해야합니다.', () => {
      const result = cn('text-red-500', 'bg-blue-500');
      expect(result).toBe('text-red-500 bg-blue-500');
    });

    it('조건부 클래스를 처리해야합니다.', () => {
      const isActive = false;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toBe('base-class');
    });

    it('Tailwind 클래스 충돌을 해결해야 합니다.', () => {
      const result = cn('p-4', 'p-8');
      expect(result).toBe('p-8');
    });
  });

  describe('delay 함수를 테스트합니다.', () => {
    it('파라미터로 전달되는 시간(ms)만큼 지연되어야합니다.', async () => {
      let isResolved = false;

      vi.useFakeTimers();

      const delayPromise = delay(1000).then(() => {
        isResolved = true;
      });

      vi.advanceTimersByTime(500);
      expect(isResolved).toBe(false);

      vi.advanceTimersByTime(500);
      await delayPromise;
      expect(isResolved).toBe(true);
    });
  });
});

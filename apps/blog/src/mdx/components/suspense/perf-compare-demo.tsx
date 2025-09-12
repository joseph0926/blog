'use client';

import { Button } from '@joseph0926/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@joseph0926/ui/components/card';
import { AlertCircle, BarChart, Loader2, Zap } from 'lucide-react';
import { Suspense, use, useCallback, useEffect, useRef, useState } from 'react';

const fetchSlowData = (id: number): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`데이터 아이템 ${id}`);
    }, 500);
  });
};

const promiseCache = new Map<number, Promise<string>>();
const getCachedPromise = (id: number) => {
  if (!promiseCache.has(id)) {
    promiseCache.set(id, fetchSlowData(id));
  }
  return promiseCache.get(id)!;
};

function TraditionalItem({
  id,
  index,
  onMetricsUpdate,
}: {
  id: number;
  index: number;
  onMetricsUpdate: (
    index: number,
    metrics: { renderCount: number; totalTime: number },
  ) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<string>('');
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  renderCount.current++;

  useEffect(() => {
    let isMounted = true;

    fetchSlowData(id).then((result) => {
      if (isMounted) {
        setData(result);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!loading) {
      const totalTime = performance.now() - startTime.current;
      onMetricsUpdate(index, {
        renderCount: renderCount.current,
        totalTime,
      });
    }
  }, [loading, index, onMetricsUpdate]);

  if (loading) {
    return (
      <div className="flex h-12 items-center justify-center rounded border bg-orange-50 p-2">
        <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
        <span className="ml-2 text-xs text-orange-600">로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="rounded border bg-orange-50 p-2 text-black">
      <span className="text-sm">{data}</span>
      <span className="text-muted-foreground ml-2 text-xs">
        (렌더: {renderCount.current}회)
      </span>
    </div>
  );
}

function SuspenseItem({ id }: { id: number }) {
  const data = use(getCachedPromise(id));
  const renderCount = useRef(0);
  renderCount.current++;

  return (
    <div className="rounded border bg-blue-50 p-2 text-black">
      <span className="text-sm">{data}</span>
      <span className="text-muted-foreground ml-2 text-xs">
        (렌더: {renderCount.current}회)
      </span>
    </div>
  );
}

export function PerformanceComparisonDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [traditionalStats, setTraditionalStats] = useState<{
    [key: number]: { renderCount: number; totalTime: number };
  }>({});

  const handleStart = () => {
    setIsRunning(true);
    setItemCount(0);
    setTraditionalStats({});
    promiseCache.clear();

    let count = 0;
    const interval = setInterval(() => {
      if (count >= 5) {
        clearInterval(interval);
        setTimeout(() => setIsRunning(false), 1000);
        return;
      }
      count++;
      setItemCount(count);
    }, 200);
  };

  const handleTraditionalMetrics = useCallback(
    (index: number, metrics: { renderCount: number; totalTime: number }) => {
      setTraditionalStats((prev) => ({
        ...prev,
        [index]: metrics,
      }));
    },
    [],
  );

  const traditionalStatsArray = Object.values(traditionalStats);
  const totalTraditionalRenders = traditionalStatsArray.reduce(
    (sum, stat) => sum + stat.renderCount,
    0,
  );
  const avgTraditionalTime =
    traditionalStatsArray.length > 0
      ? traditionalStatsArray.reduce((sum, stat) => sum + stat.totalTime, 0) /
        traditionalStatsArray.length
      : 0;

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          성능 비교: 전통적 방법 vs Suspense
        </CardTitle>
        <CardDescription>
          동일한 데이터를 로드할 때 두 방식의 렌더링 차이를 비교합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <Button onClick={handleStart} disabled={isRunning} size="lg">
            <Zap className="mr-2 h-4 w-4" />
            성능 테스트 시작
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <span className="text-orange-600">전통적 방법</span>
              <span className="text-muted-foreground text-sm font-normal">
                (useState)
              </span>
            </h3>
            <div className="space-y-2">
              {Array.from({ length: itemCount }, (_, i) => (
                <TraditionalItem
                  key={i}
                  id={i + 1}
                  index={i}
                  onMetricsUpdate={handleTraditionalMetrics}
                />
              ))}
            </div>
            {itemCount > 0 && (
              <div className="space-y-2 rounded-lg bg-orange-100 p-4 text-black">
                <p className="text-sm">
                  <strong className="text-black">총 렌더링 횟수:</strong>{' '}
                  {totalTraditionalRenders}회
                </p>
                <p className="text-sm">
                  <strong className="text-black">평균 로딩 시간:</strong>{' '}
                  {avgTraditionalTime.toFixed(0)}ms
                </p>
                <p className="text-muted-foreground mt-2 text-xs">
                  각 아이템: 로딩 상태 → 데이터 표시
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <span className="text-blue-600">Suspense 방법</span>
            </h3>
            <div className="space-y-2">
              {Array.from({ length: itemCount }, (_, i) => (
                <Suspense
                  key={i}
                  fallback={
                    <div className="flex h-12 items-center justify-center rounded border bg-blue-50 p-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="ml-2 text-xs text-blue-600">
                        로딩 중...
                      </span>
                    </div>
                  }
                >
                  <SuspenseItem id={i + 1} />
                </Suspense>
              ))}
            </div>
            {itemCount > 0 && (
              <div className="space-y-2 rounded-lg bg-blue-100 p-4 text-black">
                <p className="text-sm">
                  <strong className="text-black">특징:</strong> Promise 해결까지
                  렌더링 중단
                </p>
                <p className="text-sm">
                  <strong className="text-black">장점:</strong> 불필요한 중간
                  렌더링 방지
                </p>
                <p className="text-muted-foreground mt-2 text-xs">
                  각 아이템: Suspend → 최종 렌더
                </p>
              </div>
            )}
          </div>
        </div>

        {itemCount >= 5 && !isRunning && (
          <div className="mt-6 space-y-4">
            <div className="bg-primary/5 rounded-lg p-4">
              <h4 className="mb-3 flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4" />
                핵심 차이점 분석
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <div>
                    <strong>전통적 방법:</strong> 상태 변경에 따른 다중 렌더링
                    <div className="text-muted-foreground text-xs">
                      초기 렌더 → 로딩 상태 → 완료 상태 (평균 2-3회)
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <div>
                    <strong>Suspense:</strong> 데이터 준비 후 단일 렌더링
                    <div className="text-muted-foreground text-xs">
                      컴포넌트 마운트를 지연시켜 최적화
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-muted-foreground mt-4 text-xs">
          이 데모는 단순화된 예시입니다. 실제 애플리케이션에서는 React의
          Concurrent 기능, 메모이제이션, 서버 컴포넌트 등이 성능에 더 큰 영향을
          미칩니다.
        </div>
      </CardContent>
    </Card>
  );
}

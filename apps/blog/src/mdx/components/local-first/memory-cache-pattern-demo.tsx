'use client';

import { Button } from '@joseph0926/ui/components/button';
import { Card } from '@joseph0926/ui/components/card';
import { AlertCircle, CheckCircle2, Loader2, Play } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

type CacheStatus = 'idle' | 'loading' | 'success' | 'error';

interface TimelineStep {
  time: string;
  status: CacheStatus;
  description: string;
}

export function MemoryCachePatternDemo() {
  const [status, setStatus] = useState<CacheStatus>('idle');
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const addTimelineStep = (step: Omit<TimelineStep, 'time'>) => {
    const now = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
    setTimeline((prev) => [...prev, { ...step, time: now }]);
  };

  const simulateSuccess = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setStatus('loading');
    setData(null);
    setError(null);
    addTimelineStep({ status: 'loading', description: 'IndexedDB 읽기 시작' });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setStatus('success');
    setData('{ items: [1, 2, 3], count: 3 }');
    addTimelineStep({ status: 'success', description: '데이터 로드 완료' });
    setIsAnimating(false);
  };

  const simulateError = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setStatus('loading');
    setData(null);
    setError(null);
    addTimelineStep({ status: 'loading', description: 'IndexedDB 읽기 시작' });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setStatus('error');
    setError('QuotaExceededError: 디스크 공간 부족');
    addTimelineStep({ status: 'error', description: 'IndexedDB 에러 발생' });
    setIsAnimating(false);
  };

  const reset = () => {
    setStatus('idle');
    setData(null);
    setError(null);
    setTimeline([]);
    setIsAnimating(false);
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          border: 'border-gray-400',
          icon: <Loader2 className="h-8 w-8 animate-spin text-gray-600" />,
          text: 'Loading',
          textColor: 'text-gray-600',
        };
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-950',
          border: 'border-green-500',
          icon: <CheckCircle2 className="h-8 w-8 text-green-600" />,
          text: 'Success',
          textColor: 'text-green-600',
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-950',
          border: 'border-red-500',
          icon: <AlertCircle className="h-8 w-8 text-red-600" />,
          text: 'Error',
          textColor: 'text-red-600',
        };
      default:
        return {
          bg: 'bg-muted/50',
          border: 'border-border',
          icon: <Play className="text-muted-foreground h-8 w-8" />,
          text: 'Idle',
          textColor: 'text-muted-foreground',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card className="space-y-6 p-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          메모리 캐시 패턴: 3단계 상태 전환
        </h3>
        <p className="text-muted-foreground text-sm">
          CacheState가 loading → success/error로 전환되는 과정을 시각화합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div layout className="space-y-4">
          <Card
            className={`border-2 p-8 ${config.border} ${config.bg} transition-all duration-300`}
          >
            <div className="space-y-6">
              <motion.div
                key={status}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                {config.icon}
                <div className={`text-lg font-semibold ${config.textColor}`}>
                  {config.text}
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {status === 'success' && data && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2"
                  >
                    <div className="text-sm font-medium text-green-600">
                      캐시된 데이터
                    </div>
                    <div className="bg-background rounded-lg border p-3 font-mono text-xs">
                      {data}
                    </div>
                  </motion.div>
                )}

                {status === 'error' && error && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2"
                  >
                    <div className="text-sm font-medium text-red-600">
                      에러 메시지
                    </div>
                    <div className="bg-background rounded-lg border p-3 text-xs text-red-600">
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={simulateSuccess}
              disabled={isAnimating}
              className="flex-1"
              variant="outline"
            >
              성공 시나리오
            </Button>
            <Button
              onClick={simulateError}
              disabled={isAnimating}
              className="flex-1"
              variant="outline"
            >
              에러 시나리오
            </Button>
            <Button onClick={reset} variant="ghost">
              초기화
            </Button>
          </div>
        </motion.div>

        <div className="space-y-3">
          <div className="text-sm font-medium">타임라인</div>
          <Card className="max-h-[300px] space-y-2 overflow-y-auto p-4">
            <AnimatePresence>
              {timeline.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center text-sm">
                  시나리오를 실행하면 타임라인이 표시됩니다
                </div>
              ) : (
                timeline.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-muted/50 flex items-start gap-3 rounded-lg p-2 transition-colors"
                  >
                    <div className="mt-1 flex-shrink-0">
                      {step.status === 'loading' && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                      )}
                      {step.status === 'success' && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      {step.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="text-muted-foreground font-mono text-xs">
                        {step.time}
                      </div>
                      <div className="text-sm">{step.description}</div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <div className="mb-2 text-sm font-medium">TypeScript 타입 정의</div>
        <pre className="overflow-x-auto font-mono text-xs">
          {`type CacheState<T> = 
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }`}
        </pre>
      </div>
    </Card>
  );
}

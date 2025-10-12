'use client';

import { Button } from '@joseph0926/ui/components/button';
import { Card } from '@joseph0926/ui/components/card';
import { Bell, CheckCircle2, Database, Loader2, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

type Step = 'idle' | 'writing' | 'subscribing' | 'cached' | 'complete';

export function SyncExternalStoreDemo() {
  const [step, setStep] = useState<Step>('idle');
  const [cache, setCache] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState(0);
  const [renderCount, setRenderCount] = useState(0);

  const handleWriteIndexedDB = async () => {
    setStep('writing');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setStep('idle');
  };

  const handleSubscribe = async () => {
    setStep('subscribing');
    setSubscribers(1);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setCache('{ items: [1, 2, 3] }');
    setStep('cached');
    await new Promise((resolve) => setTimeout(resolve, 300));
    setRenderCount((prev) => prev + 1);
    setStep('complete');
  };

  const handleGetSnapshot = () => {
    if (cache) {
      setRenderCount((prev) => prev + 1);
    }
  };

  const reset = () => {
    setStep('idle');
    setCache(null);
    setSubscribers(0);
    setRenderCount(0);
  };

  return (
    <Card className="space-y-6 p-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          useSyncExternalStore 동작 원리
        </h3>
        <p className="text-muted-foreground text-sm">
          IndexedDB(비동기)와 React(동기)를 메모리 캐시로 연결하는 과정입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Card
            className={`space-y-3 border-2 p-4 transition-colors ${
              step === 'writing'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-border'
            }`}
          >
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              <span className="font-medium">IndexedDB</span>
            </div>
            <div className="text-muted-foreground text-xs">비동기 저장소</div>
            <AnimatePresence>
              {step === 'writing' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center gap-2 text-sm text-blue-600"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  쓰는 중...
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Card
            className={`space-y-3 border-2 p-4 transition-colors ${
              step === 'subscribing' || step === 'cached'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-950'
                : 'border-border'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <span className="font-medium">메모리 캐시</span>
            </div>
            <div className="text-muted-foreground text-xs">동기 브릿지</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">구독자</span>
                <span className="font-mono font-semibold">{subscribers}</span>
              </div>
              <AnimatePresence>
                {cache && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-background overflow-hidden rounded border p-2 font-mono text-xs"
                  >
                    {cache}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <Card
            className={`space-y-3 border-2 p-4 transition-colors ${
              step === 'complete'
                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                : 'border-border'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-green-600" />
              <span className="font-medium">React</span>
            </div>
            <div className="text-muted-foreground text-xs">동기 렌더</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">리렌더 횟수</span>
                <motion.span
                  key={renderCount}
                  initial={{ scale: 1.5, color: '#22c55e' }}
                  animate={{ scale: 1, color: 'inherit' }}
                  className="font-mono font-semibold"
                >
                  {renderCount}
                </motion.span>
              </div>
              <AnimatePresence>
                {step === 'complete' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2 text-sm text-green-600"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    렌더 완료
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleWriteIndexedDB}
          disabled={step !== 'idle' && step !== 'complete'}
          variant="outline"
          size="sm"
        >
          <Database className="mr-2 h-4 w-4" />
          1. IndexedDB에 쓰기
        </Button>
        <Button
          onClick={handleSubscribe}
          disabled={step !== 'idle' && step !== 'complete'}
          variant="outline"
          size="sm"
        >
          <Zap className="mr-2 h-4 w-4" />
          2. 구독 시작
        </Button>
        <Button
          onClick={handleGetSnapshot}
          disabled={!cache}
          variant="outline"
          size="sm"
        >
          <Bell className="mr-2 h-4 w-4" />
          3. 캐시 읽기 (동기!)
        </Button>
        <Button onClick={reset} variant="ghost" size="sm">
          초기화
        </Button>
      </div>

      <div className="bg-muted/50 space-y-2 rounded-lg p-4">
        <div className="text-sm font-medium">핵심 포인트</div>
        <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
          <li>IndexedDB는 비동기지만 메모리 캐시는 동기로 읽을 수 있습니다</li>
          <li>subscribe 시점에 캐시를 초기화하고 React에게 알립니다</li>
          <li>
            getCachedSnapshot은 즉시 반환하여 React 렌더링을 차단하지 않습니다
          </li>
        </ul>
      </div>
    </Card>
  );
}

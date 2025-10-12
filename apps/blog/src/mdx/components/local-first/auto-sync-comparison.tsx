'use client';

import { Badge } from '@joseph0926/ui/components/badge';
import { Button } from '@joseph0926/ui/components/button';
import { Card } from '@joseph0926/ui/components/card';
import { Clock, RefreshCw, Server, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

interface ModelState {
  data: string;
  updatedAt: number;
  isStale: boolean;
  apiCalls: number;
}

export function AutoSyncComparison() {
  const [autoSyncModel, setAutoSyncModel] = useState<ModelState>({
    data: 'Initial data',
    updatedAt: Date.now(),
    isStale: false,
    apiCalls: 0,
  });

  const [manualSyncModel, setManualSyncModel] = useState<ModelState>({
    data: 'Initial data',
    updatedAt: Date.now(),
    isStale: false,
    apiCalls: 0,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const TTL = 5000;

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);

      setAutoSyncModel((prev) => {
        const age = Date.now() - prev.updatedAt;
        const newIsStale = age > TTL;

        if (newIsStale && !prev.isStale) {
          return {
            ...prev,
            data: `서버 데이터 (자동 동기화 ${prev.apiCalls + 1}회)`,
            updatedAt: Date.now(),
            isStale: false,
            apiCalls: prev.apiCalls + 1,
          };
        }

        return { ...prev, isStale: newIsStale };
      });

      setManualSyncModel((prev) => {
        const age = Date.now() - prev.updatedAt;
        return { ...prev, isStale: age > TTL };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleManualSync = () => {
    setManualSyncModel((prev) => ({
      ...prev,
      data: `서버 데이터 (수동 동기화 ${prev.apiCalls + 1}회)`,
      updatedAt: Date.now(),
      isStale: false,
      apiCalls: prev.apiCalls + 1,
    }));
  };

  const handleReset = () => {
    handleStop();
    setElapsed(0);
    setAutoSyncModel({
      data: 'Initial data',
      updatedAt: Date.now(),
      isStale: false,
      apiCalls: 0,
    });
    setManualSyncModel({
      data: 'Initial data',
      updatedAt: Date.now(),
      isStale: false,
      apiCalls: 0,
    });
  };

  const getStaleAge = (model: ModelState) => {
    const age = Math.floor((Date.now() - model.updatedAt) / 1000);
    return age;
  };

  return (
    <Card className="space-y-6 p-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">autoSync: true vs false 비교</h3>
        <p className="text-muted-foreground text-sm">
          TTL 5초 기준으로 자동 동기화와 수동 동기화의 차이를 비교합니다.
        </p>
      </div>

      <div className="bg-muted/50 flex items-center gap-4 rounded-lg p-4">
        <Clock className="text-muted-foreground h-5 w-5" />
        <div className="flex-1">
          <div className="text-sm font-medium">경과 시간</div>
          <div className="font-mono text-2xl font-bold">{elapsed}초</div>
        </div>
        <div className="flex gap-2">
          {!isRunning ? (
            <Button onClick={handleStart} size="sm">
              시작
            </Button>
          ) : (
            <Button onClick={handleStop} size="sm" variant="outline">
              일시정지
            </Button>
          )}
          <Button onClick={handleReset} size="sm" variant="ghost">
            초기화
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <motion.div layout className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <span className="font-semibold">autoSync: true</span>
          </div>

          <Card
            className={`space-y-4 border-2 p-4 transition-colors ${
              autoSyncModel.isStale
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                : 'border-green-500 bg-green-50 dark:bg-green-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <Badge
                variant={autoSyncModel.isStale ? 'destructive' : 'default'}
              >
                {autoSyncModel.isStale ? 'Stale' : 'Fresh'}
              </Badge>
              <div className="text-muted-foreground text-xs">
                {getStaleAge(autoSyncModel)}초 전 업데이트
              </div>
            </div>

            <motion.div
              key={autoSyncModel.updatedAt}
              initial={{ scale: 0.95, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-background rounded-lg border p-3"
            >
              <div className="font-mono text-sm">{autoSyncModel.data}</div>
            </motion.div>

            <div className="flex items-center justify-between border-t pt-2">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Server className="h-4 w-4" />
                API 호출 횟수
              </div>
              <motion.div
                key={autoSyncModel.apiCalls}
                initial={{ scale: 1.5, color: '#8b5cf6' }}
                animate={{ scale: 1, color: 'inherit' }}
                className="font-mono text-lg font-bold"
              >
                {autoSyncModel.apiCalls}회
              </motion.div>
            </div>

            <AnimatePresence>
              {autoSyncModel.isStale && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex items-center gap-2 overflow-hidden text-xs text-orange-600"
                >
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  자동 동기화 진행 중...
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        <motion.div layout className="space-y-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">autoSync: false</span>
          </div>

          <Card
            className={`space-y-4 border-2 p-4 transition-colors ${
              manualSyncModel.isStale
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                : 'border-green-500 bg-green-50 dark:bg-green-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <Badge
                variant={manualSyncModel.isStale ? 'destructive' : 'default'}
              >
                {manualSyncModel.isStale ? 'Stale' : 'Fresh'}
              </Badge>
              <div className="text-muted-foreground text-xs">
                {getStaleAge(manualSyncModel)}초 전 업데이트
              </div>
            </div>

            <motion.div
              key={manualSyncModel.updatedAt}
              initial={{ scale: 0.95, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-background rounded-lg border p-3"
            >
              <div className="font-mono text-sm">{manualSyncModel.data}</div>
            </motion.div>

            <div className="flex items-center justify-between border-t pt-2">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Server className="h-4 w-4" />
                API 호출 횟수
              </div>
              <motion.div
                key={manualSyncModel.apiCalls}
                initial={{ scale: 1.5, color: '#3b82f6' }}
                animate={{ scale: 1, color: 'inherit' }}
                className="font-mono text-lg font-bold"
              >
                {manualSyncModel.apiCalls}회
              </motion.div>
            </div>

            <Button
              onClick={handleManualSync}
              disabled={!isRunning}
              className="w-full"
              size="sm"
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              수동 동기화
            </Button>
          </Card>
        </motion.div>
      </div>

      <div className="bg-muted/50 space-y-2 rounded-lg p-4">
        <div className="text-sm font-medium">
          설계 결정: autoSync 기본값은 false
        </div>
        <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
          <li>
            <strong>Local-First 철학:</strong> 로컬 데이터가 진실의 원천입니다
          </li>
          <li>
            <strong>예측 가능성:</strong> 사용자가 명시적으로 제어합니다
          </li>
          <li>
            <strong>네트워크 비용:</strong> 불필요한 API 호출을 방지합니다
          </li>
          <li>
            <strong>유연성:</strong> 필요한 경우 true로 변경 가능합니다
          </li>
        </ul>
      </div>
    </Card>
  );
}

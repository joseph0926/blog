'use client';

import { Button } from '@joseph0926/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@joseph0926/ui/components/card';
import { Play, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

interface LogEntry {
  id: string;
  phase: 'mount' | 'update';
  actualDuration: string;
  action: string;
}

const MOCK_LOGS: LogEntry[] = [
  {
    id: 'UrlSection',
    phase: 'mount',
    actualDuration: '2.60ms',
    action: '초기 렌더링',
  },
  {
    id: 'UrlSection',
    phase: 'update',
    actualDuration: '1.80ms',
    action: 'startDate 변경: 2025-10-08',
  },
  {
    id: 'UrlSection',
    phase: 'update',
    actualDuration: '1.60ms',
    action: 'endDate 변경: 2025-10-10',
  },
  {
    id: 'UrlSection',
    phase: 'update',
    actualDuration: '1.70ms',
    action: 'search 변경: 골드',
  },
  {
    id: 'UrlSection',
    phase: 'update',
    actualDuration: '1.65ms',
    action: 'search 변경: 골드 아이템',
  },
];

export function ProfilerResult() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (currentStep >= MOCK_LOGS.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= MOCK_LOGS.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const visibleLogs = MOCK_LOGS.slice(0, currentStep + 1);
  const currentLog = MOCK_LOGS[currentStep];

  return (
    <Card className="my-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>React Profiler 측정 결과</CardTitle>
            <CardDescription className="mt-1">
              필터 변경에 따른 실시간 성능 측정
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePlay} disabled={isPlaying} size="sm">
              <Play className="mr-2 h-4 w-4" />
              {currentStep >= MOCK_LOGS.length - 1 ? '다시 재생' : '재생'}
            </Button>
            <Button
              onClick={handleReset}
              disabled={isPlaying}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted rounded-lg p-4"
        >
          <div className="text-muted-foreground mb-2 text-sm">
            현재 실행: {currentLog.action}
          </div>
          <div className="flex items-baseline gap-6">
            <div>
              <div className="text-muted-foreground mb-1 text-xs">
                렌더링 시간
              </div>
              <motion.div
                key={currentLog.actualDuration}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-primary text-3xl font-bold"
              >
                {currentLog.actualDuration}
              </motion.div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1 text-xs">단계</div>
              <div className="text-xl font-semibold">
                {currentStep + 1} / {MOCK_LOGS.length}
              </div>
            </div>
          </div>
        </motion.div>
        <div className="max-h-80 overflow-x-auto overflow-y-auto rounded-lg bg-slate-950 p-4 font-mono text-sm text-green-400">
          <AnimatePresence mode="popLayout">
            {visibleLogs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: index === currentStep ? 1 : 0.6, x: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-3"
              >
                <div className="mb-1 text-yellow-400">{log.action}</div>
                <div className="ml-4 text-xs">
                  Profiler: {'{'}
                  <span className="text-blue-400"> id</span>: &quot;{log.id}
                  &quot;,
                  <span className="text-blue-400"> phase</span>: &quot;
                  {log.phase}&quot;,
                  <span className="text-blue-400"> actualDuration</span>: &quot;
                  {log.actualDuration}&quot;{'}'}
                </div>
                {index < visibleLogs.length - 1 && (
                  <div className="my-2 border-t border-slate-800" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="bg-muted rounded-lg p-4">
          <div className="mb-2 text-sm font-semibold">측정 결과 요약</div>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>평균 렌더링 시간: 1.6~1.8ms</li>
            <li>pushState 실행 시간: 0.4~0.6ms</li>
            <li>전체 프로세스: 약 2ms</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

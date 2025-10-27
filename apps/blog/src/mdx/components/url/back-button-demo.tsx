'use client';

import { Badge } from '@joseph0926/ui/components/badge';
import { Button } from '@joseph0926/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@joseph0926/ui/components/card';
import { Input } from '@joseph0926/ui/components/input';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

type HistoryMode = 'pushState' | 'replaceState';

interface HistoryEntry {
  url: string;
  action: string;
}

export function BackButtonDemo() {
  const [mode, setMode] = useState<HistoryMode>('pushState');
  const [searchValue, setSearchValue] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([
    { url: '/logs', action: '초기 상태' },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleType = (char: string) => {
    const newValue = searchValue + char;
    setSearchValue(newValue);

    if (mode === 'pushState') {
      setHistory((prev) => [
        ...prev,
        {
          url: `/logs?search=${newValue}`,
          action: `${newValue}" 입력`,
        },
      ]);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setHistory((prev) => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          url: `/logs?search=${newValue}`,
          action: `"${newValue}" 입력`,
        };
        return newHistory;
      });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      const previousEntry = history[currentIndex - 1];
      const searchParam = previousEntry.url.split('search=')[1] || '';
      setSearchValue(searchParam);
    }
  };

  const handleReset = () => {
    setSearchValue('');
    setHistory([{ url: '/logs', action: '초기 상태' }]);
    setCurrentIndex(0);
  };

  const canGoBack = currentIndex > 0;
  const testWord = '골드아이템';

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle>pushState vs replaceState 비교</CardTitle>
        <CardDescription>
          검색어 입력 시 브라우저 히스토리 동작 차이
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Button
            variant={mode === 'pushState' ? 'default' : 'outline'}
            onClick={() => {
              setMode('pushState');
              handleReset();
            }}
            className="flex-1"
          >
            pushState
          </Button>
          <Button
            variant={mode === 'replaceState' ? 'default' : 'outline'}
            onClick={() => {
              setMode('replaceState');
              handleReset();
            }}
            className="flex-1"
          >
            replaceState
          </Button>
        </div>
        <div className="bg-muted rounded-lg border p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm font-medium">검색창</span>
            <Badge variant="secondary">{mode}</Badge>
          </div>
          <Input
            value={searchValue}
            readOnly
            placeholder="아래 버튼으로 타이핑하세요"
            className="mb-3"
          />
          <div className="flex flex-wrap gap-2">
            {testWord.split('').map((char, index) => (
              <Button
                key={index}
                onClick={() => handleType(char)}
                variant="outline"
                size="sm"
                disabled={searchValue.length >= testWord.length}
              >
                {char}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">브라우저 히스토리</span>
            <div className="flex gap-2">
              <Button
                onClick={handleBack}
                disabled={!canGoBack}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                뒤로가기 {canGoBack && `(${currentIndex})`}
              </Button>
              <Button onClick={handleReset} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <div className="max-h-64 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {history.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: index === currentIndex ? 1 : 0.5,
                      x: 0,
                      backgroundColor:
                        index === currentIndex
                          ? 'hsl(var(--primary) / 0.1)'
                          : 'transparent',
                    }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="border-b p-3 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-muted-foreground mb-1 text-xs">
                          {entry.action}
                        </div>
                        <code className="rounded bg-slate-950 px-2 py-1 text-xs text-green-400">
                          {entry.url}
                        </code>
                      </div>
                      {index === currentIndex && (
                        <Badge variant="default" className="ml-2">
                          현재
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30"
        >
          <div className="mb-2 text-sm font-semibold">
            {mode === 'pushState' ? 'pushState 특징' : 'replaceState 특징'}
          </div>
          <ul className="text-muted-foreground space-y-1 text-sm">
            {mode === 'pushState' ? (
              <>
                <li>입력한 글자 수만큼 히스토리가 쌓입니다</li>
                <li>
                  &quot;{testWord}&quot; 입력 시 뒤로가기를 {testWord.length}번
                  눌러야 합니다
                </li>
                <li>타이핑 과정을 모두 기록합니다</li>
              </>
            ) : (
              <>
                <li>현재 히스토리 항목을 교체합니다</li>
                <li>
                  &quot;{testWord}&quot; 입력해도 뒤로가기 1번이면 충분합니다
                </li>
                <li>최종 상태만 기록합니다</li>
              </>
            )}
          </ul>
        </motion.div>
      </CardContent>
    </Card>
  );
}

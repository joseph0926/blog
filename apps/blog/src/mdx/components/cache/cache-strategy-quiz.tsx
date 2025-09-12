'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import { CheckCircle, ChevronRight, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

const scenarios = [
  {
    id: 'product',
    title: '상품 정보',
    description: '상품명, 가격, 설명 등',
    options: [
      { value: 'no-store', label: '캐싱 안 함' },
      { value: 'short', label: '10초 캐싱' },
      { value: 'medium', label: '1시간 캐싱' },
      { value: 'long', label: '24시간 캐싱' },
    ],
    correct: 'medium',
    explanation:
      '상품 정보는 자주 바뀌지 않으므로 1시간 정도 캐싱이 적절합니다.',
    code: `await fetch('/api/products', {
  next: { revalidate: 3600 }
})`,
  },
  {
    id: 'stock',
    title: '재고 수량',
    description: '실시간 재고 현황',
    options: [
      { value: 'no-store', label: '캐싱 안 함' },
      { value: 'short', label: '10초 캐싱' },
      { value: 'medium', label: '1시간 캐싱' },
      { value: 'long', label: '24시간 캐싱' },
    ],
    correct: 'short',
    explanation:
      '재고는 빠르게 변하지만, 매 요청마다 확인하면 부하가 큽니다. 10초 정도가 적절합니다.',
    code: `await fetch('/api/stock', {
  next: { revalidate: 10 }
})`,
  },
];

export function CacheStrategyQuiz() {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});

  const handleSelect = (scenarioId: string, value: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [scenarioId]: value }));
  };

  const checkAnswer = (scenarioId: string) => {
    setShowResults((prev) => ({ ...prev, [scenarioId]: true }));
  };

  return (
    <div className="my-8 space-y-6">
      {scenarios.map((scenario) => {
        const isCorrect = selectedAnswers[scenario.id] === scenario.correct;
        const showResult = showResults[scenario.id];

        return (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-lg border p-6"
          >
            <div className="mb-4">
              <h4 className="text-lg font-semibold">{scenario.title}</h4>
              <p className="text-muted-foreground text-sm">
                {scenario.description}
              </p>
            </div>

            <div className="space-y-2">
              {scenario.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(scenario.id, option.value)}
                  disabled={showResult}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md border px-4 py-3 text-left transition-all',
                    selectedAnswers[scenario.id] === option.value
                      ? 'border-primary bg-primary/10'
                      : 'hover:bg-muted/50',
                    showResult && 'cursor-not-allowed opacity-75',
                  )}
                >
                  <span className="text-sm">{option.label}</span>
                  {showResult && option.value === scenario.correct && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {showResult &&
                    selectedAnswers[scenario.id] === option.value &&
                    option.value !== scenario.correct && (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                </button>
              ))}
            </div>
            {!showResult && selectedAnswers[scenario.id] && (
              <button
                onClick={() => checkAnswer(scenario.id)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium"
              >
                답 확인하기
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <div
                    className={cn(
                      'rounded-md p-4',
                      isCorrect ? 'bg-green-500/10' : 'bg-red-500/10',
                    )}
                  >
                    <p className="mb-2 text-sm font-medium">
                      {isCorrect ? '✅ 정답입니다!' : '❌ 다시 생각해보세요'}
                    </p>
                    <p className="text-muted-foreground mb-3 text-sm">
                      {scenario.explanation}
                    </p>
                    <pre className="bg-muted rounded p-3 text-xs">
                      <code>{scenario.code}</code>
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

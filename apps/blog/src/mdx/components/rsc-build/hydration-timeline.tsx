'use client';

import { Button } from '@joseph0926/ui/components/button';
import { Card } from '@joseph0926/ui/components/card';
import { Play, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

const phases = [
  {
    name: 'HTML 렌더링',
    duration: 0,
    color: 'bg-green-500',
    description: '서버에서 생성된 HTML이 즉시 표시됨',
  },
  {
    name: 'RSC Payload 파싱',
    duration: 10,
    color: 'bg-blue-500',
    description: 'self.__next_f 배열에서 데이터 읽기',
  },
  {
    name: '청크 로드 시작',
    duration: 50,
    color: 'bg-purple-500',
    description: 'client-123.js 다운로드 요청',
  },
  {
    name: '청크 로드 완료',
    duration: 150,
    color: 'bg-purple-500',
    description: '실제 컴포넌트 코드 준비됨',
  },
  {
    name: '하이드레이션 완료',
    duration: 200,
    color: 'bg-orange-500',
    description: '@1 위치에 실제 컴포넌트 연결',
  },
];

export function HydrationTimeline() {
  const [currentPhase, setCurrentPhase] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentPhase < phases.length - 1) {
        setCurrentPhase((prev) => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [currentPhase, isPlaying]);

  const handlePlay = () => {
    setCurrentPhase(-1);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setCurrentPhase(-1);
    setIsPlaying(false);
  };

  return (
    <Card className="my-8 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">하이드레이션 타임라인</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePlay}
            disabled={isPlaying}
          >
            <Play className="mr-1 h-4 w-4" />
            재생
          </Button>
          <Button size="sm" variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="relative">
        <div className="absolute top-6 left-0 h-0.5 w-full" />
        <div className="relative flex justify-between">
          {phases.map((phase, i) => (
            <div key={i} className="flex flex-1 flex-col items-center">
              <motion.div
                className={`z-10 flex h-12 w-12 items-center justify-center rounded-full ${
                  i <= currentPhase ? phase.color : ''
                }`}
                initial={{ scale: 0 }}
                animate={{
                  scale: i <= currentPhase ? 1 : 0.8,
                  transition: { duration: 0.3 },
                }}
              >
                {i <= currentPhase && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="font-semibold"
                  >
                    {i === currentPhase ? '●' : '✓'}
                  </motion.div>
                )}
              </motion.div>
              <div className="mt-2 font-mono text-xs">{phase.duration}ms</div>
              <div className="mt-1 text-center text-sm font-medium">
                {phase.name}
              </div>
              {i === currentPhase && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 max-w-32 text-center text-xs"
                >
                  {phase.description}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 h-2 overflow-hidden rounded-full">
        <motion.div
          className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-orange-500"
          initial={{ width: '0%' }}
          animate={{
            width:
              currentPhase >= 0
                ? `${((currentPhase + 1) / phases.length) * 100}%`
                : '0%',
          }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </Card>
  );
}

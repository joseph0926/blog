'use client';

import { Button } from '@joseph0926/ui/components/button';
import { Card } from '@joseph0926/ui/components/card';
import { Play, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

const steps = [
  {
    title: '개발자가 작성한 코드',
    code: `'use client'

export default function Button() {
  return (
    <button onClick={() => alert('clicked')}>
      Click me
    </button>
  )
}`,
    highlight: [0],
    description: "'use client' 지시어로 시작",
  },
  {
    title: 'SWC 변환 후',
    code: `/* __next_internal_client_entry_do_not_use__ default auto */

export default function Button() {
  return (
    <button onClick={() => alert('clicked')}>
      Click me
    </button>
  )
}`,
    highlight: [0],
    description: '주석으로 변환되어 마커 역할',
  },
  {
    title: '서버 번들용 변환',
    code: `import { registerClientReference } from "react-server-dom-webpack/server";

export default registerClientReference(
  function() { 
    throw new Error(\`Cannot call from server\`);
  },
  "/path/to/Button.tsx",
  "default",
);`,
    highlight: [2, 3, 4, 5, 6, 7],
    description: '실제 코드가 참조로 대체됨',
  },
  {
    title: '클라이언트 번들용',
    code: `export default function Button() {
  return (
    <button onClick={() => alert('clicked')}>
      Click me
    </button>
  )
}`,
    highlight: [],
    description: '원본 코드 그대로 유지',
  },
];

export function CodeTransformAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    setCurrentStep(0);

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const step = steps[currentStep];

  return (
    <Card className="my-8 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">{step.title}</h3>
          {currentStep === 2 && (
            <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-700">
              서버 번들
            </span>
          )}
          {currentStep === 3 && (
            <span className="rounded bg-green-100 px-2 py-1 text-sm text-green-700">
              클라이언트 번들
            </span>
          )}
        </div>
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
      <div className="relative overflow-hidden rounded-lg p-4">
        <AnimatePresence mode="wait">
          <motion.pre
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="overflow-x-auto text-sm"
          >
            {step.code.split('\n').map((line, i) => (
              <motion.div
                key={i}
                className="leading-6"
                animate={{
                  backgroundColor: step.highlight.includes(i)
                    ? 'rgba(59, 130, 246, 0.2)'
                    : 'transparent',
                }}
                transition={{ duration: 0.3 }}
              >
                {line || ' '}
              </motion.div>
            ))}
          </motion.pre>
        </AnimatePresence>
      </div>
      <motion.p
        key={currentStep}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 text-sm"
      >
        {step.description}
      </motion.p>
      <div className="mt-4 flex gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => !isPlaying && setCurrentStep(i)}
            disabled={isPlaying}
            className={`h-2 flex-1 rounded transition-colors ${
              i === currentStep
                ? 'bg-blue-600'
                : i < currentStep
                  ? 'bg-blue-300'
                  : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
    </Card>
  );
}

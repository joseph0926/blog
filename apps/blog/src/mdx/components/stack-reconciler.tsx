'use client';

import { Button } from '@joseph0926/ui/components/button';
import { useEffect, useRef, useState } from 'react';
import { Card, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export const StackReconciler = () => {
  const [text, setText] = useState('');
  const [tick, setTick] = useState(0);
  const [, setList] = useState<number[]>([]);

  const tickRef = useRef(0);
  useEffect(() => {
    const loop = () => {
      tickRef.current += 1;
      setTick(tickRef.current);
      requestAnimationFrame(loop);
    };
    const id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);

  const handleHeavyUpdate = () => {
    const huge = Array.from({ length: 50000000 }, (_, i) => i);
    setList(huge);
  };

  return (
    <Card className="max-w-2xl space-y-3 p-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-spin rounded-full bg-blue-500" />
        <span>rAF ticker: {tick}</span>
      </div>

      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="타이핑 → 아래 버튼 클릭 후 다시 타이핑해 보세요"
      />

      <Button onClick={handleHeavyUpdate}>대규모 렌더 시작</Button>

      <CardDescription className="text-xs">
        버튼을 누르는 순간 애니메이션·타이핑·ticker가 <b>3초간 멈추는</b> 현상을
        확인하세요.
      </CardDescription>
    </Card>
  );
};

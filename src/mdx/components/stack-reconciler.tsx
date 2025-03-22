'use client';

import { Button } from '@/components/ui/button';
import { Card, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export const StackReconciler = () => {
  const [text, setText] = useState<string>('');

  const handleHeavyUpdate = () => {
    const start = Date.now();
    while (Date.now() - start < 3000) {}
  };

  return (
    <Card className="max-w-2xl p-4">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="아래 버튼을 누른 후 입력을 시도해주세요."
      />
      <Button className="cursor-pointer" onClick={handleHeavyUpdate}>
        대규모 DOM 업데이트 시작
      </Button>
      <CardDescription>과장된 예시입니다,,,</CardDescription>
    </Card>
  );
};

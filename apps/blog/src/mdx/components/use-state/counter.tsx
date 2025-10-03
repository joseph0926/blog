'use client';

import { Button } from '@joseph0926/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@joseph0926/ui/components/card';
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  const incrementThree = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Count: {count}</CardTitle>
        <CardDescription>
          아래 버튼은 setCount(count + 1)를 연속 세번 수행하는 버튼입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={incrementThree}>+3 연속 업데이트</Button>
      </CardContent>
    </Card>
  );
}

export function CounterFn() {
  const [count, setCount] = useState(0);

  const incrementThree = () => {
    setCount((count) => count + 1);
    setCount((count) => count + 1);
    setCount((count) => count + 1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Count: {count}</CardTitle>
        <CardDescription>
          아래 버튼은 setCount(count + 1)를 연속 세번 수행하는 버튼입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={incrementThree}>+3 연속 업데이트</Button>
      </CardContent>
    </Card>
  );
}

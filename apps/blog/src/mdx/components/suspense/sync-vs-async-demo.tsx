'use client';

import { Button } from '@joseph0926/ui/components/button';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function SyncVsAsyncDemo() {
  const [syncCounter, setSyncCounter] = useState(0);
  const [asyncCounter, setAsyncCounter] = useState(0);
  const [syncLoading, setSyncLoading] = useState(false);
  const [asyncLoading, setAsyncLoading] = useState(false);

  const handleSyncClick = () => {
    setSyncLoading(true);
    const start = Date.now();
    while (Date.now() - start < 3000) {
      // 극단적 예시를 위해 3초간 블로킹을 시킵니다 - 2025.07.13 joseph0926
    }
    setSyncCounter((prev) => prev + 1);
    setSyncLoading(false);
  };

  const handleAsyncClick = async () => {
    setAsyncLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setAsyncCounter((prev) => prev + 1);
    setAsyncLoading(false);
  };

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle>동기 vs 비동기 처리 비교</CardTitle>
        <CardDescription>
          버튼을 클릭하여 동기와 비동기 처리의 차이를 체험해보세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">동기적 처리 (나쁜 예)</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              3초간 UI가 완전히 멈춥니다
            </p>
            <Button
              onClick={handleSyncClick}
              disabled={syncLoading}
              className="w-full"
              variant="destructive"
            >
              {syncLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              클릭 (카운터: {syncCounter})
            </Button>
            <p className="text-muted-foreground mt-2 text-xs">
              버튼이 멈추고 다른 상호작용 불가
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">비동기적 처리 (좋은 예)</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              3초간 로딩 표시만 보여집니다
            </p>
            <Button
              onClick={handleAsyncClick}
              disabled={asyncLoading}
              className="w-full"
            >
              {asyncLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              클릭 (카운터: {asyncCounter})
            </Button>
            <p className="text-muted-foreground mt-2 text-xs">
              UI는 반응하며 다른 상호작용 가능
            </p>
          </div>
        </div>

        <div className="bg-muted mt-4 rounded-lg p-4">
          <p className="text-sm">
            <strong>테스트 카운터:</strong> {syncCounter + asyncCounter}
          </p>
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-sm">
              동기 처리와 비동기 처리시 아래 toast 버튼 클릭시 다른점을
              확인해보세요
            </p>
            <Button
              variant="outline"
              onClick={() => toast.success('toast 노출')}
              className="w-full cursor-pointer"
            >
              Toast
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

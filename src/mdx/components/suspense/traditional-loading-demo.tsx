'use client';

import { Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const fetchUserData = async (): Promise<{
  name: string;
  email: string;
  role: string;
}> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return {
    name: '테스트',
    email: 'test@example.com',
    role: '프론트엔드 개발자',
  };
};

export function TraditionalLoadingDemo() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await fetchUserData();
      setData(userData);
    } catch (err) {
      console.error(err);
      setError('데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle>전통적인 로딩 상태 관리</CardTitle>
        <CardDescription>useState를 사용한 로딩 상태 관리 예시</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <pre className="overflow-x-auto text-sm">
              {`const [loading, setLoading] = useState(false)
const [data, setData] = useState(null)

// 데이터 로드
setLoading(true)
fetchData()
  .then(setData)
  .finally(() => setLoading(false))`}
            </pre>
          </div>

          <div className="rounded-lg border p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                <span className="text-muted-foreground ml-2">
                  데이터 로딩 중...
                </span>
              </div>
            ) : error ? (
              <div className="text-destructive py-8 text-center">{error}</div>
            ) : data ? (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{data.name}</h3>
                <p className="text-muted-foreground">{data.email}</p>
                <p className="text-sm">{data.role}</p>
              </div>
            ) : null}
          </div>

          <Button
            onClick={loadData}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            데이터 다시 불러오기
          </Button>

          <div className="text-destructive space-y-1 text-sm">
            <p>매번 로딩 상태를 수동으로 관리해야 함</p>
            <p>에러 처리도 별도로 구현 필요</p>
            <p>복잡한 UI에서는 여러 로딩 상태가 얽힘</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

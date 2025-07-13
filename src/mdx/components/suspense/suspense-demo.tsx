'use client';

import { Loader2, RefreshCw } from 'lucide-react';
import { Suspense, use,useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

let userDataPromise: Promise<{
  name: string;
  email: string;
  role: string;
}> | null = null;

const fetchUserData = (): Promise<{
  name: string;
  email: string;
  role: string;
}> => {
  if (!userDataPromise) {
    userDataPromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          name: '테스트2',
          email: 'test2@example.com',
          role: '프론트엔드 개발자',
        });
      }, 2000);
    });
  }
  return userDataPromise;
};

function UserProfile() {
  const userData = use(fetchUserData());

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{userData.name}</h3>
      <p className="text-muted-foreground">{userData.email}</p>
      <p className="text-sm">{userData.role}</p>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      <span className="text-muted-foreground ml-2">데이터 로딩 중...</span>
    </div>
  );
}

export function SuspenseDemo() {
  const [key, setKey] = useState(0);

  const handleRefresh = () => {
    userDataPromise = null;
    setKey((prev) => prev + 1);
  };

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle>Suspense를 사용한 로딩 상태 관리</CardTitle>
        <CardDescription>
          선언적인 방식으로 로딩 상태를 처리하는 예시
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <pre className="overflow-x-auto text-sm">
              {`<Suspense fallback={<LoadingFallback />}>
  <UserProfile />
</Suspense>

// UserProfile 컴포넌트 내부
const userData = use(fetchUserData())`}
            </pre>
          </div>

          <div className="rounded-lg border p-4">
            <Suspense key={key} fallback={<LoadingFallback />}>
              <UserProfile />
            </Suspense>
          </div>

          <Button onClick={handleRefresh} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            데이터 다시 불러오기
          </Button>

          <div className="space-y-1 text-sm text-green-500">
            <p>로딩 상태를 선언적으로 처리</p>
            <p>컴포넌트가 데이터에만 집중 가능</p>
            <p>에러 바운더리와 함께 사용하여 에러 처리도 선언적으로</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

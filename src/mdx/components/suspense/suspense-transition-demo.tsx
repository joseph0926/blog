'use client';

import { Loader2 } from 'lucide-react';
import { Suspense, use, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const promiseCache = new Map<
  string,
  Promise<{ title: string; content: string }>
>();

const fetchTabData = (
  tab: string,
): Promise<{ title: string; content: string }> => {
  if (promiseCache.has(tab)) {
    return promiseCache.get(tab)!;
  }

  const promise = new Promise<{ title: string; content: string }>((resolve) => {
    setTimeout(() => {
      const data = {
        overview: {
          title: '프로젝트 개요',
          content:
            '이 프로젝트는 React 19의 새로운 기능들을 활용한 모던 웹 애플리케이션입니다. Suspense와 startTransition을 통해 더 나은 사용자 경험을 제공합니다.',
        },
        details: {
          title: '상세 정보',
          content:
            '프로젝트는 Next.js 15, React 19, Tailwind CSS 4를 사용하여 구축되었습니다. 서버 컴포넌트와 클라이언트 컴포넌트를 적절히 조합하여 최적의 성능을 달성했습니다.',
        },
        team: {
          title: '팀 소개',
          content:
            '우리 팀은 5명의 개발자로 구성되어 있으며, 각자 프론트엔드, 백엔드, 디자인, QA 분야에서 전문성을 보유하고 있습니다.',
        },
      };
      resolve(data[tab as keyof typeof data]);
    }, 1500);
  });

  promiseCache.set(tab, promise);
  return promise;
};

function TabContent({ tab }: { tab: string }) {
  const data = use(fetchTabData(tab));

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{data.title}</h3>
      <p className="text-muted-foreground">{data.content}</p>
    </div>
  );
}

export function SuspenseTransitionDemo() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (value: string) => {
    startTransition(() => {
      setActiveTab(value);
    });
  };

  const handleClearCache = () => {
    promiseCache.clear();

    setActiveTab('overview');
  };

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle>Suspense + startTransition 조합</CardTitle>
        <CardDescription>
          탭을 전환할 때 이전 컨텐츠를 유지하면서 새 컨텐츠를 로드합니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" disabled={isPending}>
              개요 {isPending && activeTab !== 'overview' && '...'}
            </TabsTrigger>
            <TabsTrigger value="details" disabled={isPending}>
              상세 {isPending && activeTab !== 'details' && '...'}
            </TabsTrigger>
            <TabsTrigger value="team" disabled={isPending}>
              팀 {isPending && activeTab !== 'team' && '...'}
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <div className={isPending ? 'opacity-50' : ''}>
              <Suspense
                key={activeTab}
                fallback={
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                    <span className="text-muted-foreground ml-2">
                      로딩 중...
                    </span>
                  </div>
                }
              >
                <TabContent tab={activeTab} />
              </Suspense>
            </div>
          </div>
        </Tabs>

        <div className="mt-4">
          <Button
            onClick={handleClearCache}
            variant="outline"
            size="sm"
            className="w-full"
          >
            캐시 초기화 (다시 로딩 테스트)
          </Button>
        </div>

        <div className="bg-muted mt-6 space-y-2 rounded-lg p-4">
          <p className="text-sm font-semibold">startTransition의 장점:</p>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>• 탭 전환 시 이전 컨텐츠가 즉시 사라지지 않음</li>
            <li>• 로딩 중에도 UI가 반응성을 유지</li>
            <li>• 사용자가 빠르게 탭을 전환해도 안정적</li>
            <li>• {isPending ? '현재 전환 중입니다!' : '대기 중...'}</li>
          </ul>
          <div className="text-muted-foreground mt-2 text-xs">
            팁: 처음 방문하는 탭은 로딩이 표시되고, 이미 방문한 탭은 캐시된
            데이터가 즉시 표시됩니다.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

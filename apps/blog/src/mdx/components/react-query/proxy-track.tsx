'use client';

import { Button } from '@joseph0926/ui/components/button';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { Activity, Eye, RefreshCw } from 'lucide-react';
import { memo, useCallback, useEffect, useRef } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type UserData = {
  name: string;
  age: number;
  email: string;
  status: 'active' | 'inactive';
};

const globalUserData: UserData = {
  name: 'Kim',
  age: 25,
  email: 'kim@example.com',
  status: 'active',
};

const fetchUserData = async (): Promise<UserData> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { ...globalUserData };
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

const DataOnlyComponent = memo(() => {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current = renderCount.current + 1;
  });

  const result = useQuery({
    queryKey: ['user'],
    queryFn: fetchUserData,
  });

  return (
    <Card className="border-2 border-blue-500/20 dark:border-blue-400/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Component A: data만 사용
          </span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            렌더: {renderCount.current}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="bg-muted rounded-lg p-3 font-mono text-sm">
            <span className="text-blue-500">const</span> {`result`} =
            <span className="text-green-500"> useQuery</span>(...);
            <br />
            <span className="text-gray-500">
              하지만 result.data.name만 실제로 사용
            </span>
            <br />
            <span className="text-purple-500">return</span> {`<div>`}
            {result.data?.name || 'Loading...'}
            {`</div>`};
          </div>
          <div className="text-sm font-medium">
            현재 이름: {result.data?.name || 'Loading...'}
          </div>
          <Alert className="border-blue-500/20">
            <AlertDescription className="text-xs">
              컴포넌트에서 실제로는 data만 사용하기때문에, React Query는 Proxy를
              통해 이를 감지하고 data가 변경될 때만 리렌더링합니다.
              <br />
              <strong>즉, isFetching이 변경되어도 리렌더링되지 않습니다</strong>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
});
DataOnlyComponent.displayName = 'DataOnlyComponent';

const MultiPropsComponent = memo(() => {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current = renderCount.current + 1;
  });

  const { data, isFetching } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUserData,
  });

  return (
    <Card className="border-2 border-purple-500/20 dark:border-purple-400/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Component B: data, isFetching 사용
          </span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            렌더: {renderCount.current}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="bg-muted rounded-lg p-3 font-mono text-sm">
            <span className="text-blue-500">const</span>{' '}
            {`{ data, isLoading, error }`} =
            <span className="text-green-500"> useQuery</span>(...);
            <br />
            <span className="text-gray-500">isFetching도 사용</span>
            <br />
            <span className="text-purple-500">if</span> (isFetching){' '}
            <span className="text-purple-500">return</span> {'"Fetching..."'};
            <br />
            <span className="text-purple-500">return</span>{' '}
            {data?.name || 'No data'};
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <div>Fetching: {String(isFetching)}</div>
            <div>Data: {data?.name}</div>
          </div>
          <Alert className="border-purple-500/20">
            <AlertDescription className="text-xs">
              isFetching, data를 모두 체크하므로 이 중 하나라도 변경되면
              리렌더링됩니다.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
});
MultiPropsComponent.displayName = 'MultiPropsComponent';

const ExplicitTrackingComponent = memo(() => {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current = renderCount.current + 1;
  });

  const { data, isFetching } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUserData,
    notifyOnChangeProps: ['data'],
  });

  return (
    <Card className="border-2 border-green-500/20 dark:border-green-400/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Component C: 명시적 추적 (data만 추적)
          </span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            렌더: {renderCount.current}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="bg-muted rounded-lg p-3 font-mono text-sm">
            <span className="text-blue-500">const</span> result =
            <span className="text-green-500"> useQuery</span>
            {`{`}
            <br />
            <span className="ml-4">{`queryKey: ['user'],`}</span>
            <br />
            <span className="ml-4 text-orange-500">
              {`notifyOnChangeProps: ['data']`}
            </span>
            <br />
            {`});`}
          </div>
          <div className="text-sm">
            data: {data ? data.name : 'fetching,,,'}
          </div>
          <div className="text-sm">
            isFetching: {isFetching ? 'fetching,,,' : 'done'}
          </div>
          <Alert className="border-green-500/20">
            <AlertDescription className="text-xs">
              notifyOnChangeProps로 명시적으로 data만 추적하도록 설정했습니다.
              <br />이 경우 data와 isFetching 모두 사용하지만 data 변경시에만
              리렌더링됩니다.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
});
ExplicitTrackingComponent.displayName = 'ExplicitTrackingComponent';

const Test = () => {
  const updateData = useCallback((type: 'name' | 'refetch') => {
    switch (type) {
      case 'name':
        globalUserData.name = `User_${Math.random().toString(36).substr(2, 5)}`;
        queryClient.invalidateQueries({ queryKey: ['user'] });
        break;
      case 'refetch':
        queryClient.refetchQueries({ queryKey: ['user'] });
        break;
    }
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            React Query Proxy 속성 추적 데모
          </CardTitle>
          <CardDescription>
            컴포넌트가 실제로 사용하는 속성만 추적하여 불필요한 리렌더링을
            방지하는 메커니즘을 시각화합니다
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">데이터 업데이트 컨트롤</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => updateData('name')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Name 변경
            </Button>
            <Button
              onClick={() => updateData('refetch')}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-3 w-3" />
              Refetch (isFetching 변경)
            </Button>
          </div>
          <Alert className="mt-4">
            <AlertDescription>
              <strong>실험해보세요</strong>
              <br />
              1. {'"Name 변경"'}을 클릭하면 A, B, C 모두 리렌더링됩니다 (모두
              data를 사용 + data 변화 추적함)
              <br />
              2. {'"Refetch (isFetching 변경)"'}을 클릭하면 B만 리렌더링됩니다
              (B만 isFetching 추적)
              <br />
              <span className="text-destructive font-semibold">
                A의 경우 result.data로 data만 사용중이므로 data만 추적합니다.
                즉, isFetching이 변경되어도 리렌더링을 하지 않습니다.
              </span>
              <span className="text-destructive font-semibold">
                C의 경우 isFetching도 사용중이지만 명시적으로 data만 추적하므로
                isFetching이 변경되어도 리렌더링을 하지 않습니다.
              </span>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        <DataOnlyComponent />
        <MultiPropsComponent />
        <ExplicitTrackingComponent />
      </div>
      <Tabs defaultValue="how" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="how">동작 원리</TabsTrigger>
          <TabsTrigger value="proxy">Proxy 코드</TabsTrigger>
          <TabsTrigger value="tracking">추적 로직</TabsTrigger>
        </TabsList>
        <TabsContent value="how">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold">핵심 원리</h4>
                  <p className="text-muted-foreground text-sm">
                    React Query는 <code>useQuery</code>의 반환값을 Proxy로
                    감싸서, 컴포넌트가 실제로 어떤 속성에 접근하는지 추적합니다.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">추적 방식</h4>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    <li>
                      • <strong>자동 추적:</strong> notifyOnChangeProps 미설정
                      시 Proxy가 자동으로 사용된 속성 추적
                    </li>
                    <li>
                      • <strong>명시적 추적:</strong> notifyOnChangeProps 설정
                      시 지정된 속성만 추적
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="proxy">
          <Card>
            <CardContent className="pt-6">
              <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs">
                <code>{`// React Query 내부의 trackResult 메서드
trackResult(result) {
  return new Proxy(result, {
    get: (target, key) => {
      // 속성 접근 시 추적
      this.trackProp(key)
      return target[key]
    }
  })
}

// useBaseQuery에서 사용
return !options.notifyOnChangeProps
  ? observer.trackResult(result)  // Proxy로 감싸기
  : result                         // 그대로 반환`}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tracking">
          <Card>
            <CardContent className="pt-6">
              <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs">
                <code>{`// 리렌더링 결정 로직
shouldNotifyListeners() {
  // 추적 대상 속성 결정
  const includedProps = 
    options.notifyOnChangeProps ||  // 명시적 설정
    this.trackedProps               // 자동 추적
  
  // 변경 확인
  return Object.keys(result).some(key => {
    const changed = 
      currentResult[key] !== prevResult[key]
    
    // 변경되었고 + 추적 대상인 경우만
    return changed && includedProps.has(key)
  })
}`}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export function ProxyTrack() {
  return (
    <QueryClientProvider client={queryClient}>
      <Test />
    </QueryClientProvider>
  );
}

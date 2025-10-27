'use client';

import { Badge } from '@joseph0926/ui/components/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@joseph0926/ui/components/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@joseph0926/ui/components/tabs';
import { motion } from 'motion/react';
import { useState } from 'react';

interface ServicePattern {
  name: string;
  url: string;
  searchLocation: 'navbar' | 'top';
  filterLocation: 'sidebar' | 'inline';
  searchBehavior: string;
  filterBehavior: string;
}

const SERVICES: ServicePattern[] = [
  {
    name: '당근마켓',
    url: '?in=물금읍-3662&price=100__100000&search=노트북',
    searchLocation: 'navbar',
    filterLocation: 'sidebar',
    searchBehavior: 'Enter 또는 검색 버튼',
    filterBehavior: '즉시 적용',
  },
  {
    name: '쿠팡',
    url: '?filterType=&rating=0&minPrice=680000&maxPrice=1360000&brand=257&q=노트북',
    searchLocation: 'navbar',
    filterLocation: 'sidebar',
    searchBehavior: 'Enter 또는 검색 버튼',
    filterBehavior: '즉시 적용',
  },
  {
    name: '구글',
    url: '?q=₩300,000부터+₩800,000까지+노트북',
    searchLocation: 'top',
    filterLocation: 'inline',
    searchBehavior: 'Enter 또는 검색 버튼',
    filterBehavior: '즉시 적용',
  },
];

export function ServiceComparison() {
  const [selectedService, setSelectedService] = useState(SERVICES[0].name);

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle>실제 서비스 분석</CardTitle>
        <CardDescription>주요 서비스들의 필터 구현 패턴 비교</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedService} onValueChange={setSelectedService}>
          <TabsList className="grid w-full grid-cols-3">
            {SERVICES.map((service) => (
              <TabsTrigger key={service.name} value={service.name}>
                {service.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {SERVICES.map((service) => (
            <TabsContent
              key={service.name}
              value={service.name}
              className="space-y-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-muted-foreground mb-2 text-xs">
                    URL 구조
                  </div>
                  <code className="block overflow-x-auto rounded bg-slate-950 p-3 text-xs text-green-400">
                    {service.url}
                  </code>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <div className="text-sm font-semibold">검색</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">위치</span>
                        <Badge variant="secondary">
                          {service.searchLocation === 'navbar'
                            ? '네비게이션 바'
                            : '상단'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">동작</span>
                        <span className="font-medium">
                          {service.searchBehavior}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <div className="text-sm font-semibold">필터</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">위치</span>
                        <Badge variant="secondary">
                          {service.filterLocation === 'sidebar'
                            ? '사이드바'
                            : '인라인'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">동작</span>
                        <span className="font-medium">
                          {service.filterBehavior}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30"
        >
          <div className="mb-2 text-sm font-semibold">공통 패턴</div>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>모든 서비스가 URL로 필터 상태를 관리합니다</li>
            <li>검색과 필터의 UI 위치를 명확히 분리합니다</li>
            <li>검색은 명시적 완료가 필요하고, 필터는 즉시 적용됩니다</li>
            <li>검색 시 필터가 초기화됩니다 (검색이 더 큰 범위)</li>
          </ul>
        </motion.div>
      </CardContent>
    </Card>
  );
}

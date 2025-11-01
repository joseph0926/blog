'use client';

import { Button } from '@joseph0926/ui/components/button';
import { Card } from '@joseph0926/ui/components/card';
import { motion } from 'motion/react';
import { useState } from 'react';

const data = {
  withoutRSC: {
    label: 'RSC 미사용',
    items: [
      { name: 'React', size: 100 },
      { name: 'Page 컴포넌트', size: 50 },
      { name: 'lodash', size: 200 },
      { name: 'DB 코드', size: 30 },
      { name: 'UserList 컴포넌트', size: 40 },
    ],
  },
  withRSC: {
    label: 'RSC 사용',
    items: [
      { name: 'React', size: 100 },
      { name: 'UserList 컴포넌트', size: 40 },
    ],
  },
};

export function BundleSizeComparison() {
  const [mode, setMode] = useState<'without' | 'with'>('without');

  const currentData = mode === 'without' ? data.withoutRSC : data.withRSC;
  const totalSize = currentData.items.reduce((sum, item) => sum + item.size, 0);
  const savedSize =
    data.withoutRSC.items.reduce((sum, item) => sum + item.size, 0) - totalSize;

  return (
    <Card className="my-8 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">클라이언트 번들 크기 비교</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === 'without' ? 'default' : 'outline'}
            onClick={() => setMode('without')}
          >
            RSC 미사용
          </Button>
          <Button
            size="sm"
            variant={mode === 'with' ? 'default' : 'outline'}
            onClick={() => setMode('with')}
          >
            RSC 사용
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        {currentData.items.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="w-32 text-sm font-medium">{item.name}</div>
            <div className="h-8 flex-1 overflow-hidden rounded-full">
              <motion.div
                className="flex h-full items-center justify-end bg-gradient-to-r from-blue-500 to-blue-600 pr-2"
                initial={{ width: 0 }}
                animate={{ width: `${(item.size / 200) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <span className="text-xs font-semibold text-white">
                  {item.size}KB
                </span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between rounded-lg p-4">
        <div>
          <div className="text-sm">총 번들 크기</div>
          <div className="text-2xl font-bold">{totalSize}KB</div>
        </div>
        {mode === 'with' && savedSize > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-right"
          >
            <div className="text-sm font-semibold text-green-600">절약됨</div>
            <div className="text-2xl font-bold text-green-600">
              -{savedSize}KB
            </div>
            <div className="text-xs">
              ({Math.round((savedSize / (totalSize + savedSize)) * 100)}% 감소)
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
}

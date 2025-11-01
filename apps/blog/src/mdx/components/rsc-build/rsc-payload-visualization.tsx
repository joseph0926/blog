'use client';

import { Badge } from '@joseph0926/ui/components/badge';
import { Card } from '@joseph0926/ui/components/card';
import { motion } from 'motion/react';
import { useState } from 'react';

const payloadData = {
  modules: [
    {
      id: 'M1',
      data: {
        id: './src/components/Button.tsx',
        name: 'default',
        chunks: ['client-123'],
      },
    },
  ],
  tree: `["$","div",null,{"children":[
  ["$","h1",null,{"children":"Welcome"}],
  ["$","@1"]
]}]`,
};

export function RSCPayloadVisualization() {
  const [hoveredRef, setHoveredRef] = useState<string | null>(null);

  return (
    <Card className="my-8 p-6">
      <h3 className="mb-4 text-lg font-semibold">RSC Payload 구조</h3>
      <div className="space-y-4">
        <div
          className="rounded-lg border-2 p-4 transition-colors"
          style={{
            borderColor:
              hoveredRef === 'M1' ? 'rgb(59, 130, 246)' : 'transparent',
          }}
          onMouseEnter={() => setHoveredRef('M1')}
          onMouseLeave={() => setHoveredRef(null)}
        >
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              M1
            </Badge>
            <span className="text-sm">모듈 정의</span>
          </div>
          <pre className="overflow-x-auto rounded p-3 text-sm">
            {JSON.stringify(payloadData.modules[0].data, null, 2)}
          </pre>
          <div className="mt-2 space-y-1 text-xs">
            <div>
              <span className="font-semibold">id:</span> 파일 경로
            </div>
            <div>
              <span className="font-semibold">name:</span> export 이름
            </div>
            <div>
              <span className="font-semibold">chunks:</span> 클라이언트에서
              로드할 번들 ID
            </div>
          </div>
        </div>
        <div className="rounded-lg p-4">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              0
            </Badge>
            <span className="text-sm">렌더 트리</span>
          </div>
          <pre className="overflow-x-auto rounded p-3 text-sm">
            {payloadData.tree.split('\n').map((line, i) => {
              const hasRef = line.includes('@1');
              return (
                <motion.div
                  key={i}
                  className="leading-6"
                  animate={{
                    backgroundColor:
                      hasRef && hoveredRef === 'M1'
                        ? 'rgba(59, 130, 246, 0.2)'
                        : 'transparent',
                  }}
                  onMouseEnter={() => hasRef && setHoveredRef('M1')}
                  onMouseLeave={() => setHoveredRef(null)}
                >
                  {line}
                </motion.div>
              );
            })}
          </pre>
          <div className="mt-2 text-xs">
            <span className="font-semibold">@1:</span> M1 모듈을 이 위치에
            렌더링
          </div>
        </div>
      </div>
      <div className="mt-4 rounded bg-blue-50 p-3 text-sm text-blue-800">
        M1 또는 @1에 마우스를 올려보세요
      </div>
    </Card>
  );
}

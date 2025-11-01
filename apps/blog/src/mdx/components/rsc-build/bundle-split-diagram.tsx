'use client';

import { Card } from '@joseph0926/ui/components/card';
import { ArrowRight, FileCode, Package } from 'lucide-react';
import { motion } from 'motion/react';

export function BundleSplitDiagram() {
  return (
    <Card className="my-8 p-6">
      <h3 className="mb-6 text-lg font-semibold">번들 분리 과정</h3>
      <div className="flex items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          <div className="rounded-lg border-2 border-slate-300 p-4">
            <div className="mb-2 flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              <span className="font-semibold">Button.tsx</span>
            </div>
            <pre className="mt-2 rounded p-2 text-xs">
              {`'use client'

export default function Button() {
  return <button>Click</button>
}`}
            </pre>
          </div>
        </motion.div>
        <div className="flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ArrowRight className="h-6 w-6 text-blue-500" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ArrowRight className="h-6 w-6 text-green-500" />
          </motion.div>
        </div>
        <div className="flex-1 space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">서버 번들</span>
            </div>
            <pre className="mt-2 rounded p-2 text-xs">
              {`registerClientReference(
  function() { throw Error() },
  "/Button.tsx",
  "default"
)`}
            </pre>
            <div className="mt-2 text-xs text-blue-700">
              ✓ 참조만 포함 (용량 절약)
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-lg border-2 border-green-300 bg-green-50 p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-900">
                클라이언트 번들
              </span>
            </div>
            <pre className="mt-2 rounded p-2 text-xs">
              {`export default function Button() {
  return <button>Click</button>
}`}
            </pre>
            <div className="mt-2 text-xs text-green-700">
              ✓ 실제 코드 포함 (실행 가능)
            </div>
          </motion.div>
        </div>
      </div>
    </Card>
  );
}

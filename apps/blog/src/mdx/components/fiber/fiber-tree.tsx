import { FiberNodeType } from '@/types/fiber.type';
import { FiberNode } from './fiber-node';

interface FiberTreeProps {
  nodes: FiberNodeType;
  currentNodeId: number | null;
}

export default function FiberTree({ nodes, currentNodeId }: FiberTreeProps) {
  return (
    <div className="rounded-lg bg-gray-50 p-4 shadow dark:bg-gray-950">
      {currentNodeId && (currentNodeId === 999 || currentNodeId >= 100000) ? (
        <div className="my-2 animate-pulse rounded border border-red-500 bg-red-100 p-2 font-semibold text-red-700">
          🚨 긴급 업데이트 처리 중!
        </div>
      ) : (
        <div className="h-14 w-full" />
      )}
      <FiberNode node={nodes} currentNodeId={currentNodeId} />
    </div>
  );
}

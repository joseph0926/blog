'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { fiberNodes } from '@/constants/fiber';
import { FiberNodeType } from '@/types/fiber.type';
import FiberTree from './fiber-tree';

const priorityMap = {
  Immediate: 1,
  UserBlocking: 2,
  Normal: 3,
  Low: 4,
};

interface Task {
  node: FiberNodeType;
  priority: number;
}

const generatePriorityTasks = (node: FiberNodeType): Task[] => {
  const tasks: Task[] = [];

  const traverse = (n: FiberNodeType) => {
    tasks.push({ node: n, priority: priorityMap[n.priority] });
    n.children?.forEach(traverse);
  };

  traverse(node);
  return tasks.sort((a, b) => a.priority - b.priority);
};

export const FiberWrapper = () => {
  const [currentNodeId, setCurrentNodeId] = useState<number | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const taskQueue = useRef<Task[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const runNextTask = useCallback(() => {
    if (!taskQueue.current.length) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const nextTask = taskQueue.current.shift();
    setCurrentNodeId(nextTask?.node.id || null);
  }, []);

  const startAnimation = useCallback(() => {
    taskQueue.current = generatePriorityTasks(fiberNodes);
    setAnimationKey((prev) => prev + 1);
    setCurrentNodeId(null);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(runNextTask, 1000);
  }, [runNextTask]);

  const addUrgentUpdate = useCallback(() => {
    const urgentTask: Task = {
      node: { id: 999, name: '🔥 긴급 업데이트', priority: 'Immediate' },
      priority: priorityMap.Immediate,
    };

    taskQueue.current.unshift(urgentTask);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="my-10 max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">Fiber 시각화</h1>
      <FiberTree
        key={animationKey}
        nodes={fiberNodes}
        currentNodeId={currentNodeId}
      />
      <div className="mt-4 flex gap-2">
        <Button className="cursor-pointer" onClick={startAnimation}>
          애니메이션 실행
        </Button>
        <Button
          className="cursor-pointer"
          variant="destructive"
          onClick={addUrgentUpdate}
        >
          긴급 업데이트 추가
        </Button>
      </div>
    </div>
  );
};

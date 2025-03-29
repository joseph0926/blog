import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { FiberNodeType } from '@/types/fiber.type';

interface FiberNodeProps {
  node: FiberNodeType;
  currentNodeId: number | null;
}

const priorityColors = {
  Immediate: 'bg-red-400',
  UserBlocking: 'bg-orange-400',
  Normal: 'bg-blue-400',
  Low: 'bg-gray-300',
};

export const FiberNode = ({ node, currentNodeId }: FiberNodeProps) => {
  const isActive = node.id === currentNodeId;

  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={{ scale: isActive ? 1.1 : 1 }}
      transition={{ duration: 0.3 }}
      className={`my-2 ml-4 border-l-4 p-2 ${
        isActive ? 'border-green-500' : 'border-gray-200 dark:border-gray-800'
      }`}
    >
      <div className="flex items-center gap-2">
        <Badge className={`${priorityColors[node.priority]} text-white`}>
          {node.priority}
        </Badge>
        <span className={`${isActive ? 'font-bold text-green-600' : ''}`}>
          {node.name}
        </span>
      </div>

      {node.children && node.children.length > 0 && (
        <div className="ml-4">
          {node.children.map((child) => (
            <FiberNode
              key={child.id}
              node={child}
              currentNodeId={currentNodeId}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

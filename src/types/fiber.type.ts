export type PriorityLevel = 'Immediate' | 'UserBlocking' | 'Normal' | 'Low';

export type FiberNodeType = {
  id: number;
  name: string;
  priority: PriorityLevel;
  children?: FiberNodeType[];
};

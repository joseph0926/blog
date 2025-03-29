import { FiberNodeType } from '@/types/fiber.type';

export const fiberNodes: FiberNodeType = {
  id: 1,
  name: 'App',
  priority: 'Immediate',
  children: [
    {
      id: 2,
      name: 'Layout',
      priority: 'UserBlocking',
      children: [
        { id: 3, name: 'Navbar', priority: 'Immediate' },
        { id: 4, name: 'Sidebar', priority: 'Normal' },
        { id: 5, name: 'Footer', priority: 'Low' },
      ],
    },
    {
      id: 6,
      name: 'Content',
      priority: 'Normal',
      children: [
        { id: 7, name: 'Widget', priority: 'UserBlocking' },
        { id: 8, name: 'Reports', priority: 'Normal' },
      ],
    },
  ],
};

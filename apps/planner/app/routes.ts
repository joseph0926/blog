import {
  index,
  // route,
  layout,
  type RouteConfig,
} from '@react-router/dev/routes';

export default [
  layout('routes/root.tsx', [
    index('routes/home.tsx'),
    // route('queue', 'routes/queue.tsx'),
    // route('review', 'routes/review.tsx'),

    // route('api/capture', 'routes/api/capture.tsx'),
    // route('api/captures', 'routes/api/captures.tsx'),
  ]),
] satisfies RouteConfig;

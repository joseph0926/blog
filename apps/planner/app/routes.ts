import {
  index,
  layout,
  route,
  type RouteConfig,
} from '@react-router/dev/routes';

export default [
  layout('routes/root.tsx', [
    index('routes/home.tsx'),
    route('queue', 'routes/queue.tsx'),
    route('queue/:captureId/notes', 'routes/queue.$captureId.notes.tsx'),
    route(
      'queue/:captureId/notes/:noteId',
      'routes/queue.$captureId.notes.$noteId.tsx',
    ),
    // route('review', 'routes/review.tsx'),

    route('api/capture', 'routes/api/capture.tsx'),
    route('api/learning-note', 'routes/api/learning-note.tsx'),
  ]),
] satisfies RouteConfig;

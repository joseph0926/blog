import { authRouter } from './routers/auth';
import { postRouter } from './routers/post';
import { router } from './trpc';

export const appRouter = router({
  post: postRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;

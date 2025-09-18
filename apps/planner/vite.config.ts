import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    {
      name: 'ignore-chrome-devtools',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const ignorePaths = [
            '/.well-known/appspecific/com.chrome.devtools.json',
            '/favicon.ico',
          ];

          if (ignorePaths.some((path) => req.url?.includes(path))) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end('{}');
            return;
          }
          next();
        });
      },
    },
  ],
  ssr: {
    noExternal: ['@joseph0926/ui'],
    external: ['@prisma/client'],
  },
  optimizeDeps: {
    exclude: ['@prisma/client', '@/generated/prisma'],
  },
});

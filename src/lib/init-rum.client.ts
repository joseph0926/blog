import { initRUM } from './rum';

const deviceMemory: number | undefined =
  typeof navigator !== 'undefined' && 'deviceMemory' in navigator
    ? (navigator.deviceMemory as number)
    : undefined;

type NavigatorConnection = Navigator & {
  connection?: {
    readonly effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  };
};

if (typeof window !== 'undefined' && !window.__RUM_INITIALIZED) {
  window.__RUM_INITIALIZED = true;

  const nav = navigator as NavigatorConnection;

  initRUM({
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? 'local',
    route: window.location.pathname,
    formFactor: /Mobi|Android/i.test(nav.userAgent) ? 'mobile' : 'desktop',
    deviceMemory,
    connType: nav.connection?.effectiveType,
  });
}

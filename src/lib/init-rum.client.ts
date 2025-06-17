import { initRUM } from './rum';

const deviceMemory: number | undefined =
  typeof navigator !== 'undefined' && 'deviceMemory' in navigator
    ? (navigator.deviceMemory as number)
    : undefined;

if (typeof window !== 'undefined' && !window.__RUM_INITIALIZED) {
  window.__RUM_INITIALIZED = true;

  initRUM({
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? 'local',
    route: window.location.pathname,
    formFactor: /Mobi|Android/i.test(navigator.userAgent)
      ? 'mobile'
      : 'desktop',
    deviceMemory,
    connType: (navigator as any).connection?.effectiveType,
  });
}

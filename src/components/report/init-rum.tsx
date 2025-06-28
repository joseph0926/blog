'use client';

import { useEffect } from 'react';
import { ENV } from '@/lib/env';
import { initRUM } from '@/lib/rum';

type NavigatorConn = Navigator & {
  connection?: { effectiveType: 'slow-2g' | '2g' | '3g' | '4g' };
};

const deviceMemory: number | undefined =
  typeof navigator !== 'undefined' && 'deviceMemory' in navigator
    ? (navigator.deviceMemory as number)
    : undefined;

export default function InitRUM() {
  useEffect(() => {
    if (typeof window === 'undefined' || window.__RUM_INITIALIZED) return;
    if (window.location.pathname.startsWith('/report')) return;
    if (ENV === 'dev') return;
    window.__RUM_INITIALIZED = true;

    const nav = navigator as NavigatorConn;
    initRUM({
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? 'local',
      route: window.location.pathname,
      formFactor: /Mobi|Android/i.test(nav.userAgent) ? 'mobile' : 'desktop',
      deviceMemory,
      connType: nav.connection?.effectiveType,
    });
  }, []);

  return null;
}

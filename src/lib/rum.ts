import { onLCP, onCLS, onINP, onFCP, onTTFB, type Metric } from 'web-vitals';

type Extra = {
  appVersion: string;
  route: string;
  formFactor: 'desktop' | 'mobile';
  deviceMemory?: number;
  connType?: string;
};

export function initRUM(extra: Extra) {
  if (typeof window === 'undefined') return;
  if (window.__RUM_INITIALIZED) return;
  window.__RUM_INITIALIZED = true;

  const send = (metric: Metric) => {
    const payload = {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      rating: metric.rating,
      navType: metric.navigationType,
      ...extra,
    };

    const blob = new Blob([JSON.stringify(payload)], {
      type: 'application/json',
    });

    const beaconOK = navigator.sendBeacon?.('/api/rum', blob);
    if (beaconOK) return;

    fetch('/api/rum', { method: 'POST', body: blob, keepalive: true }).catch(
      handleRumError,
    );
  };

  onLCP(send);
  onCLS(send);
  onINP(send);
  onFCP(send);
  onTTFB(send);
}

function handleRumError(err: unknown) {
  if (!navigator.onLine) {
    try {
      const q = JSON.parse(localStorage.getItem('rumQueue') ?? '[]');
      q.push(err);
      localStorage.setItem('rumQueue', JSON.stringify(q));
    } catch (err) {
      console.error(err);
    }
    return;
  }

  console.error('[RUM] 전송 실패', err);
}

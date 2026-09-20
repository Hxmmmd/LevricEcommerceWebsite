'use client';

import { useEffect } from 'react';

export default function AnalyticsTracker() {
  useEffect(() => {
    const visitorId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    void fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'visit', path: window.location.pathname, visitorId }) }).catch(() => undefined);
  }, []);
  return null;
}

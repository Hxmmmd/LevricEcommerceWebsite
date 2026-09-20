'use client';

import { useEffect } from 'react';

export default function ProductAnalyticsTracker({ productId }: { productId: string }) {
  useEffect(() => {
    void fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'product_view', productId, path: window.location.pathname }) }).catch(() => undefined);
  }, [productId]);
  return null;
}

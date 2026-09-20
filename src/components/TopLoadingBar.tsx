'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function TopLoadingBar() {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setLoading(false);
        if (finishTimer.current) clearTimeout(finishTimer.current);
    }, [pathname]);

    useEffect(() => {
        const handleNavigationStart = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            const link = target?.closest('a');

            if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            if (link.origin !== window.location.origin || link.pathname === window.location.pathname) return;

            setLoading(true);
            if (finishTimer.current) clearTimeout(finishTimer.current);
            finishTimer.current = setTimeout(() => setLoading(false), 8000);
        };

        document.addEventListener('click', handleNavigationStart, true);
        return () => {
            document.removeEventListener('click', handleNavigationStart, true);
            if (finishTimer.current) clearTimeout(finishTimer.current);
        };
    }, []);

    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 origin-left overflow-hidden bg-transparent transition-opacity duration-200 ${loading ? 'opacity-100' : 'opacity-0'}`}
        >
            <div className="h-full w-1/3 animate-[top-loading_1s_ease-in-out_infinite] rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.8)]" />
        </div>
    );
}

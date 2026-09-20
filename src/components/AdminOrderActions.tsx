'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { updateOrderStatus, rejectOrder, updateTrackingStatus } from '@/lib/actions/admin';
import { Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminOrderActionsProps {
    orderId: string;
    status: string;
}

export default function AdminOrderActions({
    orderId,
    status
}: AdminOrderActionsProps) {
    const router = useRouter();
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const trackingStates = ['Processing', 'Packing', 'Shipped', 'Out for Delivery', 'Delivered'];
    const isTerminal = status === 'Cancelled' || status === 'Rejected' || status === 'Delivered';

    const handleAction = async (actionFn: () => Promise<any>, actionName: string) => {
        setLoadingAction(actionName);
        setError(null);
        try {
            const result = await actionFn();
            if (result.success) {
                // Force a hard refresh of the data
                router.refresh();
                // Optional: window.location.reload() if router.refresh is not enough in some dev environments
            } else {
                setError(result.error);
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoadingAction(null);
        }
    };

    if (status === 'Cancelled' || status === 'Rejected') return null;

    return (
        <div className="space-y-5">
            {/* Tracking Status Updates */}
            <div className="space-y-2">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">Update Status to:</p>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    {trackingStates.map((state) => (
                        <button
                            key={state}
                            onClick={() => handleAction(() => updateTrackingStatus(orderId, state), `tracking-${state}`)}
                            disabled={status === state || !!loadingAction || isTerminal}
                            className={`min-h-9 rounded-xl border px-3 py-2 text-[9px] font-black uppercase tracking-tight transition-all ${status === state
                                ? 'bg-blue-600 border-blue-500 text-white'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30'
                                }`}
                        >
                            {loadingAction === `tracking-${state}` ? (
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            ) : (
                                state
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Actions Buttons */}
            <div className="flex flex-row md:flex-col gap-2">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAction(() => rejectOrder(orderId), 'reject')}
                    disabled={!!loadingAction || isTerminal}
                    className="flex-1 h-9 rounded-xl text-red-500 hover:bg-red-500/10 text-[10px] font-bold"
                >
                    {loadingAction === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject Order'}
                </Button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-500/5 p-3 rounded-xl border border-red-500/10 mt-2">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <p className="text-[9px] font-bold leading-tight uppercase tracking-tight">{error}</p>
                </div>
            )}
        </div>
    );
}

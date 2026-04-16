export default function OrderTrackingLoading() {
    return (
        <main className="min-h-screen bg-[#050505] text-white flex flex-col">
            {/* Header placeholder */}
            <div className="h-16 border-b border-white/5 bg-black/60 backdrop-blur-md" />

            <div className="grow max-w-4xl mx-auto w-full px-6 py-12">
                <div className="h-10 bg-white/10 rounded w-48 mb-8 animate-pulse" />

                <div className="space-y-8">
                    {/* Header Skeleton */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-md animate-pulse">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-3 flex-1">
                                <div className="h-4 bg-white/10 rounded w-32" />
                                <div className="h-10 bg-white/10 rounded w-64" />
                                <div className="h-4 bg-white/10 rounded w-80" />
                            </div>
                            <div className="h-20 bg-white/10 rounded-2xl w-32" />
                        </div>
                    </div>

                    {/* Progress Map Skeleton */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-md">
                        <div className="flex justify-between gap-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex flex-col items-center gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 animate-pulse" />
                                    <div className="space-y-2 text-center w-full">
                                        <div className="h-3 bg-white/10 rounded w-16 mx-auto animate-pulse" />
                                        <div className="h-4 bg-white/10 rounded w-20 mx-auto animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline & Details Skeleton */}
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <div className="h-6 bg-white/10 rounded w-48 animate-pulse" />
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 animate-pulse">
                                        <div className="flex gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-white/10" />
                                            <div className="space-y-3 flex-1">
                                                <div className="h-4 bg-white/10 rounded w-32" />
                                                <div className="h-4 bg-white/10 rounded w-full" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar Skeleton */}
                        <div className="space-y-6">
                            <div className="h-6 bg-white/10 rounded w-32 animate-pulse" />
                            <div className="bg-white/5 border border-white/10 rounded-4xl p-6 space-y-6 animate-pulse">
                                <div className="space-y-4">
                                    <div className="h-16 bg-white/10 rounded" />
                                    <div className="h-16 bg-white/10 rounded" />
                                </div>
                                <div className="h-20 bg-white/10 rounded-2xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

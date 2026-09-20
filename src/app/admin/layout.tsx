import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Access Control: Redirect if not admin
    if (!session?.user || !session.user.isAdmin) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="container mx-auto min-w-0 flex-1 px-3 py-5 sm:px-5 sm:py-8 lg:px-8">
                {children}
            </main>
        </div>
    );
}

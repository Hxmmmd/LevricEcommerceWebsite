import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import { Providers } from "@/components/Providers";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL('https://levric.vercel.app'),
    title: {
        default: "levric | Premium Tech & High-Performance Laptops",
        template: "%s | levric"
    },
    description: "Experience the future of computing with our premium selection of laptops. Best deals on New & Used high-performance MacBooks, Gaming Laptops, and Business Workstations.",
    keywords: ["premium laptops", "macbook deals", "gaming laptops", "used laptops pakistan", "best tech store", "levric tech"],
    authors: [{ name: "levric Team" }],
    creator: "levric",
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://levric.vercel.app',
        siteName: 'levric',
        title: 'levric | Premium Tech Store',
        description: 'Upgrade your tech with premium laptops and accessories. Best performance at unbeatable prices.',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'levric Tech Store',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'levric | Premium Tech Store',
        description: 'Upgrade your tech with premium laptops and accessories.',
        images: ['/og-image.jpg'],
    },
    robots: {
        index: true,
        follow: true,
    },
    verification: {
        google: "eKXyZhIkvOOfdcjjIWF6tEj_HMJVYRulkMLzGquKxs0",
    },

};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={clsx(inter.className, "min-h-screen flex flex-col")}>
                <ThemeProvider>
                    <Providers>
                        <div className="flex-grow">
                            {children}
                        </div>
                    </Providers>
                </ThemeProvider>
            </body>
        </html>
    );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import AuthBootstrap from '@/components/auth/auth-bootstrap';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Chat App',
    description: 'Real-time chat application',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <AuthBootstrap />
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}

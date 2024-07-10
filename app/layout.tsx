import type { Metadata } from 'next';
import { Nunito_Sans } from 'next/font/google';
import './globals.css';
import { ClerkProvider, GoogleOneTap } from '@clerk/nextjs';

const nunitoSans = Nunito_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Map Chat',
    description: 'Proof of concept for wiring LLMs up to map visualizations',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={nunitoSans.className}>
                    <GoogleOneTap />
                    {children}
                </body>
            </html>
        </ClerkProvider>
    );
}

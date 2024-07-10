'use client';

import type { Metadata } from 'next';
import { Nunito_Sans } from 'next/font/google';
import './globals.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useEffect } from 'react';
import Hotjar from '@hotjar/browser';
import { MapStatsProvider } from './state/context';
import { ChatProvider } from './state/chat-context';

const siteId = process.env.NEXT_PUBLIC_HOTJAR_SITE_ID;
const hotjarVersion = 6;

const queryClient = new QueryClient();

export default function SharedProviders({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    useEffect(() => {
        Hotjar.init(siteId as any, hotjarVersion);
    }, []);
    return (
        <QueryClientProvider client={queryClient}>
            <MapStatsProvider>
                <ChatProvider>{children}</ChatProvider>
            </MapStatsProvider>
        </QueryClientProvider>
    );
}

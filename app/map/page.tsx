'use client';

import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

import Hotjar from '@hotjar/browser';
import { useEffect } from 'react';
import { ChatProvider } from '../state/chat-context';
import { MapStatsProvider } from '../state/context';
import Chat from '../components/Chat';
import { Map } from '../components/Map';

const siteId = process.env.NEXT_PUBLIC_HOTJAR_SITE_ID;
const hotjarVersion = 6;

export default function Home() {
    useEffect(() => {
        Hotjar.init(siteId as any, hotjarVersion);
    }, []);
    return (
        <main className="flex h-screen items-center justify-between">
            <QueryClientProvider client={queryClient}>
                <MapStatsProvider>
                    <ChatProvider>
                        <Chat />
                        <Map />
                    </ChatProvider>
                </MapStatsProvider>
            </QueryClientProvider>
        </main>
    );
}

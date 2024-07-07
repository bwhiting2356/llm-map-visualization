'use client';

import { QueryClient, QueryClientProvider } from 'react-query';
import Chat from './components/Chat';
import { MapStatsProvider } from './state/context';
import { Map } from './components/Map';
import { ChatProvider } from './state/chat-context';

const queryClient = new QueryClient();

export default function Home() {
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

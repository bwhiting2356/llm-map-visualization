'use client';

import { QueryClient, QueryClientProvider } from 'react-query';
import Chat from './components/Chat';
import { MapStatsProvider } from './state/context';
import { Map } from './components/Map';

const queryClient = new QueryClient();

export default function Home() {
    return (
        <main className="flex h-screen items-center justify-between">
            <QueryClientProvider client={queryClient}>
                <MapStatsProvider>
                    <Chat />
                    <Map />
                </MapStatsProvider>
            </QueryClientProvider>
        </main>
    );
}

'use client';

import Chat from './components/Chat';
import { MapStatsProvider } from './state/context';
import { Map } from './components/Map';

export default function Home() {
    return (
        <main className="flex h-screen flex items-center justify-between">
            <MapStatsProvider>
                <Chat />
                <Map />
            </MapStatsProvider>
        </main>
    );
}

'use client';

import Chat from './components/Chat';
import { Map } from './components/Map';

import SharedProviders from './sharedProviders';

export default function Home() {
    return (
        <main className="flex h-screen items-center justify-between">
            <SharedProviders>
                <Chat />
                <Map />
            </SharedProviders>
        </main>
    );
}

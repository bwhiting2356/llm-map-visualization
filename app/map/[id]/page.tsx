'use client';

import Chat from '../../components/Chat';
import SharedProviders from '../../sharedProviders';
import { Map } from '../../components/Map';

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

'use client';
import React from 'react';
import SharedProviders from '../sharedProviders';
import { SavedMapList } from './saved-map-list';

const SavedMapPage = () => {
    return (
        <SharedProviders>
            <div className="px-4">
                <h1 className="mb-4">Saved Maps</h1>
                <SavedMapList />

            </div>
        </SharedProviders>
    );
};

export default SavedMapPage;

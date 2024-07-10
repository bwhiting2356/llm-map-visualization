'use client';
import React from 'react';
import SharedProviders from '../sharedProviders';
import { SavedMapList } from './saved-map-list';
import { PageContainer } from '../components/PageContainer';

const SavedMapPage = () => {
    return (
        <SharedProviders>
            <PageContainer title="Your Saved Maps">
                <SavedMapList />
            </PageContainer>
        </SharedProviders>
    );
};

export default SavedMapPage;

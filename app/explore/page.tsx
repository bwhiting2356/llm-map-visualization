'use client';
import React from 'react';
import SharedProviders from '../sharedProviders';
import { ExploredMapList } from './explored-map-list';
import { PageContainer } from '../components/PageContainer';

const ExplorePage = () => {
    return (
        <SharedProviders>
            <PageContainer title="Explore Maps">
                <ExploredMapList />
            </PageContainer>
        </SharedProviders>
    );
};

export default ExplorePage;

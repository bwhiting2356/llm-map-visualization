const fetchSavedMapById = async (id: string): Promise<any> => {
    const response = await fetch(`/api/saved-maps/${id}`);

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    return response.json();
};

import { useQuery } from 'react-query';

export const useSavedMap = (id: string) => {
    return useQuery<any, Error>(
        ['saved-map', id],
        () => fetchSavedMapById(id),
        {
            enabled: !!id, 
        }
    );
};
import { useQuery } from "react-query";

const fetchSavedMaps = async (page: number = 1): Promise<any> => {
    const response = await fetch(`/api/saved-maps?page=${page}`);

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    return response.json();
};

export const useSavedMaps = (page: number = 1) => {
    return useQuery<any, Error>(['saved-maps', page], () => fetchSavedMaps(page), {
        enabled: true // This ensures the query is always enabled
    });
}
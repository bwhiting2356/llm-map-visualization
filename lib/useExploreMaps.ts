import { useQuery } from "react-query";

const fetchExploreMaps = async (page: number = 1): Promise<any> => {
    const response = await fetch(`/api/explore?page=${page}`);

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    return response.json();
};

export const useExploreMaps = (page: number = 1) => {
    return useQuery<any, Error>(['explore-maps', page], () => fetchExploreMaps(page), {
        enabled: true // This ensures the query is always enabled
    });
}
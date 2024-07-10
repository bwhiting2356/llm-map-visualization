import { useQuery } from 'react-query';

type GeoJsonData = {
    type: string;
    features: any[];
};

const fetchGeoJson = async (region: string): Promise<GeoJsonData> => {
    const response = await fetch(`/api/geojson/${region}`);

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    return response.json();
};

const useGeoJson = (region: string) => {
    return useQuery<GeoJsonData, Error>(['geoJson', region], () => fetchGeoJson(region), {
        enabled: !!region, // Only run the query if the region is not empty
    });
};

export default useGeoJson;

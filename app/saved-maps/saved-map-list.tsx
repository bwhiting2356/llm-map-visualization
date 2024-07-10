import { useSavedMaps } from '@/lib/useSavedMaps';
import { MapCard } from '../components/MapCard';

export const SavedMapList = () => {
    const { data: maps, isLoading } = useSavedMaps();
    if (isLoading) return <p>Loading...</p>;
    return (
        <div className="flex gap-8 w-full flex-wrap">
            {maps?.length > 0 ? (
                maps?.map((map: any) => <MapCard key={map.id} map={map} />)
            ) : (
                <p className="text-gray-500">No maps saved</p>
            )}
        </div>
    );
};

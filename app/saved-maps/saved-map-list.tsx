import { useSavedMaps } from '@/lib/useSavedMaps';
import { MapCard } from '../components/MapCard';

export const SavedMapList = () => {
    const { data: maps } = useSavedMaps();
    return (
        <div className="flex gap-8 w-full flex-wrap">
            {maps?.map((map: any) => (
                <MapCard key={map.id} map={map} />
            ))}
        </div>
    );
};

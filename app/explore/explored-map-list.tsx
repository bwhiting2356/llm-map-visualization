import { useExploreMaps } from '@/lib/useExploreMaps';
import { MapCard } from '../components/MapCard';

export const ExploredMapList = () => {
    const { data: maps, isLoading } = useExploreMaps();
    console.log(maps);

    if (isLoading) return <p>Loading...</p>;
    return (
        <div className="flex gap-8 w-full flex-wrap">
            {maps?.length > 0 ? (
                maps?.map((map: any) => <MapCard key={map.id} map={map} />)
            ) : (
                <p className="text-gray-500">No maps to explore</p>
            )}
        </div>
    );
};

const MapListContainer = ({ children }: { children: React.ReactNode }) => {
    return <div className="flex gap-8 w-full flex-wrap">{children}</div>;
};

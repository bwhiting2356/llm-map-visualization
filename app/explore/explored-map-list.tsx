import { useExploreMaps } from '@/lib/useExploreMaps';
import { MapCard } from '../components/MapCard';

export const ExploredMapList = () => {
    const { data: maps } = useExploreMaps();
    return (
        <div className="flex gap-8 w-full flex-wrap">
            {maps?.map((map: any) => (
                <MapCard key={map.id} map={map} />
            ))}
        </div>
    );
};

const MapListContainer = ({ children }: { children: React.ReactNode }) => {
    return <div className="flex gap-8 w-full flex-wrap">{children}</div>;
};



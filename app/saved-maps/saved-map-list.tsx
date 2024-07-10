import { useSavedMaps } from '@/lib/useSavedMaps';
import { MiniMap } from '../components/MiniMap';
import { useRouter } from 'next/navigation';

export const SavedMapList = () => {
    const { data: maps } = useSavedMaps();
    const router = useRouter();
    const onNavigateToMap = (mapId: string) => {
        router.push(`/${mapId}`);
    }
    return (
        <div className="flex space-x-4">
            {maps?.map((map: any) => (
                <div key={map.id} className="w-[200px] flex flex-col justify-start cursor-pointer" onClick={() => onNavigateToMap(map.uuid)}>
                    <h2 className="text-sm text-gray-500">{map.title}</h2>
                    <MiniMap data={map.data} height={200} width={200} />
                </div>
            ))}
        </div>
    );
};

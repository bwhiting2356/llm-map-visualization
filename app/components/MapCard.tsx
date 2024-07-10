import Link from 'next/link';
import { MiniMap } from './MiniMap';
import { ArrowRight } from '@phosphor-icons/react';

export const MapCard = ({ map }: { map: any }) => {
    const innerWidth = window.innerWidth;
    const isSmallScreen = innerWidth < 1120;
    return (
        <Link
            href={`/map/${map.uuid}`}
            key={map.id}
            className={` ${isSmallScreen ? 'w-[400px]' : 'w-[500px]'} flex flex-col justify-start cursor-pointer `}
        >
            <MiniMap
                data={map.data}
                height={isSmallScreen ? 250 : 300}
                width={isSmallScreen ? 400 : 500}
            />
            <div className="flex hover:bg-gray-800 justify-between items-center bg-black p-4 px-8 rounded-b-lg">
                <div className="flex flex-col gap-2">
                    <h2 className="text-sm text-gray-100  ">{map.title}</h2>
                    {map?.summary && <p className="text-sm text-gray-100  ">{map?.summary}</p>}
                </div>
                <ArrowRight size={16} weight="bold" className="text-gray-100" />
            </div>
        </Link>
    );
};

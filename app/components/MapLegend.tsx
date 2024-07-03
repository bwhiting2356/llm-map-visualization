import React, { useContext } from 'react';
import { MapStateContext } from '../state/context';

const MapLegend = () => {
    const {
        data: { color1, color2, legendSide1, legendSide2, categoryColors },
    } = useContext(MapStateContext);

    if (!Object.keys(categoryColors || {}).length && (!color1 || !color2)) return null;

    return (
        <div className="absolute bottom-4 left-4 text-center bg-white px-2 py-2 rounded min-w-48">
            {categoryColors ? (
                <div>
                    {Object.entries(categoryColors).map(([category, color]) => (
                        <div key={category} className="flex items-center mt-1 text-xs">
                            <span
                                className="inline-block w-3 h-3 mr-2 rounded"
                                style={{ backgroundColor: color }}
                            ></span>
                            <span>{category}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <div
                        className="w-full rounded h-2 bg-gradient-to-r"
                        style={{
                            backgroundImage: `linear-gradient(to right, ${color1}, ${color2})`,
                        }}
                    ></div>
                    <div className="flex justify-between mt-1 text-xs space-x-2">
                        <span>{legendSide1}</span>
                        <span>{legendSide2}</span>
                    </div>
                </>
            )}
        </div>
    );
};

export default MapLegend;

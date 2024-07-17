import useGeoJson from '@/lib/useGeoJson';
import { getBoundingBox, interpolateColor } from '@/lib/utils';
import { MapViewState, WebMercatorViewport } from '@deck.gl/core';
import { useEffect, useMemo, useState } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers';
import Color from 'color';
import DeckGL from '@deck.gl/react';
import { Map as MapGL } from 'react-map-gl';

interface MiniMapProps {
    data: any;
    height?: number;
    width?: number;
}

export const MiniMap = ({ data, height = 200, width = 200 }: MiniMapProps) => {
    const [mergedMapData, setMergedMapData] = useState<any>(null);
    const [minValue, setMinValue] = useState<number>(0);
    const [maxValue, setMaxValue] = useState<number>(0);
    const [viewState, setViewState] = useState<MapViewState>({
        longitude: -98.5795,
        latitude: 39.8283,
        zoom: 2,
    });
    const { data: geojson, error, isLoading } = useGeoJson(data.regionKey);

    useEffect(() => {
        const estimatesArray = Object.entries(data.estimates || {}).map(([key, value]) => ({
            state: key,
            value,
        }));
        const mergedData = {
            ...geojson,
            features: (geojson as any)?.features?.map((feature: any) => {
                const stateName = feature.properties.NAME;
                const stateData = estimatesArray.find(item => item.state === stateName);
                return {
                    ...feature,
                    properties: {
                        ...feature.properties,
                        ...stateData,
                    },
                };
            }),
        };
        setMergedMapData(mergedData);

        const bbox = getBoundingBox(mergedData, data.regionKey);
        if (bbox.length > 0) {
            const viewport = new WebMercatorViewport({
                width,
                height,
            })?.fitBounds(
                [
                    [bbox[0], bbox[1]],
                    [bbox[2], bbox[3]],
                ],
                { padding: 2 },
            );
            setViewState({
                longitude: viewport.longitude,
                latitude: viewport.latitude,
                zoom: viewport.zoom,
            });
        }

        const values: number[] = estimatesArray.map(item => item.value) as number[];
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        setMaxValue(maxValue);
        setMinValue(minValue);
    }, [data, geojson]);

    const geoJsonLayer = useMemo(
        () =>
            new GeoJsonLayer({
                id: `geojson-layer-${data.regionKey}`,
                data: mergedMapData,
                pickable: true,
                getFillColor: (d: any) => {
                    if (data.categoryColors) {
                        const category = d.properties.value;
                        const color = data.categoryColors[category];
                        if (color) {
                            return Color(color).rgb().array().concat(200) as [
                                number,
                                number,
                                number,
                                number,
                            ];
                        }
                        return [255, 255, 255, 200] as [number, number, number, number];
                    }

                    const value = d.properties.value;
                    if (value === undefined)
                        return [255, 255, 255, 200] as [number, number, number, number];
                    return [
                        ...interpolateColor(value, minValue, maxValue, data.color1, data.color2),
                        200,
                    ] as [number, number, number, number];
                },
                stroked: true,
                filled: true,
                lineWidthMinPixels: 1,
                getLineColor: [255, 255, 255, 200],
                getLineWidth: 1,
            }),
        [mergedMapData],
    );

    return (
        <div
            className="relative rounded-t-lg overflow-hidden bg-gray-100"
            style={{
                width,
                height,
            }}
        >
            <DeckGL
                viewState={viewState}
                onViewStateChange={({ viewState }: { viewState: any }) => setViewState(viewState)}
                layers={[geoJsonLayer]}
            >
                <MapGL
                    mapStyle="mapbox://styles/mapbox/light-v10"
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                    projection={{ name: 'mercator' }}
                />
            </DeckGL>
        </div>
    );
};

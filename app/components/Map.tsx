'use client';

import DeckGL from '@deck.gl/react';
import { Map as MapGL } from 'react-map-gl';
import { GeoJsonLayer } from '@deck.gl/layers';
import { useState, useEffect, useContext, useMemo, useTransition } from 'react';
import { FlyToInterpolator, MapViewState, WebMercatorViewport } from '@deck.gl/core';
import { MapStateContext } from '../state/context';
import Color from 'color';
import MapLegend from './MapLegend';
import useGeoJson from '../../lib/useGeoJson';
import { Check, DownloadSimple, FloppyDisk, Spinner } from '@phosphor-icons/react';
import { neon } from '@neondatabase/serverless';
import { formatValue, getBoundingBox, interpolateColor } from '@/lib/utils';

type Tooltip = {
    name: string;
    value: string;
    x: number;
    y: number;
};

export const Map = () => {
    const { data: mapEstimatesData } = useContext(MapStateContext);
    const {
        estimates,
        title,
        color1 = '',
        color2 = '',
        categoryColors,
        confidence,
        regionKey,
        summary,
    } = mapEstimatesData;
    const { data: geojson, error, isLoading } = useGeoJson(regionKey);

    const chatWidth = 384;
    const [minValue, setMinValue] = useState<number>(0);
    const [maxValue, setMaxValue] = useState<number>(0);
    const [mergedMapData, setMergedMapData] = useState<any>(null);
    const [viewState, setViewState] = useState<MapViewState>({
        longitude: -98.5795,
        latitude: 39.8283,
        zoom: 2,
        position: [-chatWidth / 2, 0, 0],
    });
    const [tooltip, setTooltip] = useState<Tooltip | null>(null);

    useEffect(() => {
        if (!estimates) return;
        if (!geojson || isLoading) return;
        const estimatesArray = Object.entries(estimates || {}).map(([key, value]) => ({
            state: key,
            value,
        }));


        const values: number[] = estimatesArray.map(item => item.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        setMinValue(minValue);
        setMaxValue(maxValue);

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

        const bbox = getBoundingBox(mergedData, regionKey);
        if (bbox) {
            const viewport = new WebMercatorViewport({
                width: window.innerWidth,
                height: window.innerHeight,
            }).fitBounds(
                [
                    [bbox[0], bbox[1]],
                    [bbox[2], bbox[3]],
                ],
                { padding: 100 },
            );

            // Calculate a small offset to shift the map slightly to the left
            const offsetRatio = -0.5; // Adjust this value to control the offset
            const offsetLongitude = (viewport.longitude - bbox[0]) * offsetRatio;

            setViewState({
                longitude: viewport.longitude - offsetLongitude,
                latitude: viewport.latitude,
                zoom: viewport.zoom,
                // Add a transition for smooth movement
                transitionDuration: 1000,
                transitionInterpolator: new FlyToInterpolator(),
            });
        }
    }, [estimates, geojson]);

    const geoJsonLayer = useMemo(
        () =>
            new GeoJsonLayer({
                id: 'geojson-layer',
                data: mergedMapData,
                pickable: true,
                onHover: ({ object, x, y }) => {
                    setTooltip(
                        object
                            ? { name: object.properties.NAME, value: formatValue(object.properties.value), x, y }
                            : null,
                    );
                },
                getFillColor: (d: any) => {
                    if (categoryColors) {
                        const category = d.properties.value;
                        const color = categoryColors[category];
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
                        ...interpolateColor(value, minValue, maxValue, color1, color2),
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

    const confidenceBadge = {
        Medium: 'bg-yellow-200 text-yellow-800 ring-yellow-600',
        High: 'bg-green-200 text-green-800 ring-green-600',
        Low: 'bg-red-200 text-red-800 ring-red-600',
    };

    const [isPending, startTransition] = useTransition();
    const [isSaved, setIsSaved] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const handleSaveMap = () => {
        startTransition(() => {
            saveMap();
            setIsSaved(true);
            setHasChanges(false);
        });
    };

    useEffect(() => {
        if (isSaved) {
            setHasChanges(true);
        }
    }, [mapEstimatesData]);

    async function saveMap() {
        if (!title || !mapEstimatesData) return;
        ('use server');
        const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL!);
        //create the table if it does not exist
        await sql`CREATE TABLE IF NOT EXISTS maps (id SERIAL PRIMARY KEY, title TEXT, data JSONB , uuid UUID DEFAULT gen_random_uuid())`;
        const result =
            await sql`INSERT INTO maps (title, data) VALUES (${title}, ${mapEstimatesData})`;
    }

    return (
        <div className="relative h-full w-full overflow-hidden">
            <DeckGL
                viewState={viewState}
                onViewStateChange={({ viewState }: { viewState: any }) => setViewState(viewState)}
                controller={{ dragPan: true }}
                layers={[geoJsonLayer]}
            >
                <MapGL
                    mapStyle="mapbox://styles/mapbox/light-v10"
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                    projection={{ name: 'mercator' }}
                />
            </DeckGL>
            {title && confidence && (
                <div className="bg-black w-96 fixed top-4 right-4 rounded-lg p-4 flex flex-col gap-2">
                    <div className="flex gap-3">
                        <div className="text-white text-sm font-bold">{title}</div>
                        <div
                            className={`p-2 text-xs uppercase ring-2 rounded-sm font-extrabold min-w-fit h-fit ${confidenceBadge[confidence as keyof typeof confidenceBadge]}`}
                        >
                            <p className="">Confidence: {confidence}</p>
                        </div>
                    </div>
                    {summary && <div className="text-gray-300 text-sm">{summary}</div>}
                    {isSaved && !hasChanges ? (
                        <div className="text-sm bg-gray-700 p-2 rounded-sm flex items-center gap-2 justify-center text-white">
                            Map saved successfully <Check size={16} className="text-green-500" />
                        </div>
                    ) : (
                        <button
                            onClick={handleSaveMap}
                            disabled={isPending}
                            className="bg-white text-black p-2 rounded-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-100"
                        >
                            {isPending ? 'Saving...' : 'Save map'}{' '}
                            {isPending ? (
                                <Spinner size={24} className="animate-spin" />
                            ) : (
                                <DownloadSimple size={24} />
                            )}
                        </button>
                    )}
                </div>
            )}
            <MapLegend />
            {tooltip?.value && (
                <div
                    className="absolute bg-white p-2 rounded shadow text-sm"
                    style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}
                >
                    <div className="text-gray">{tooltip.name}</div>
                    <div className="text-gray-500">Value: {tooltip.value}</div>
                </div>
            )}
        </div>
    );
};

'use client';

import DeckGL from '@deck.gl/react';
import { Map as MapGL } from 'react-map-gl';
import { GeoJsonLayer } from '@deck.gl/layers';
import { useState, useEffect, useContext, useMemo } from 'react';
import * as turf from '@turf/turf';

import { MapViewState, WebMercatorViewport } from '@deck.gl/core';
import { MapStateContext } from '../state/context';
import Color from 'color';
import MapLegend from './MapLegend';
import useGeoJson from './useGeoJson';

const interpolateColor = (
    value: number,
    min: number,
    max: number,
    startColor: string,
    endColor: string,
) => {
    const ratio = (value - min) / (max - min);
    return Color(startColor).mix(Color(endColor), ratio).rgb().array();
};

type Tooltip = {
    name: string;
    value: number;
    x: number;
    y: number;
};

export const Map = () => {
    const {
        data: { estimates, title, color1 = '', color2 = '', categoryColors, confidence, regionKey },
    } = useContext(MapStateContext);
    const { data: geojson, error, isLoading } = useGeoJson(regionKey);

    const [minValue, setMinValue] = useState<number>(0);
    const [maxValue, setMaxValue] = useState<number>(0);
    const [data, setData] = useState<any>(null);
    const [viewState, setViewState] = useState<MapViewState>({
        longitude: -98.5795,
        latitude: 39.8283,
        zoom: 2,
    });
    const [tooltip, setTooltip] = useState<Tooltip | null>(null);

    useEffect(() => {
        if (!estimates) return;
        if (!geojson || isLoading) return;

        // Convert estimates object to an array of key-value pairs
        const estimatesArray = Object.entries(estimates || {}).map(([key, value]) => ({
            state: key,
            value,
        }));

        // Find min and max values
        const values: number[] = estimatesArray.map(item => item.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        setMinValue(minValue);
        setMaxValue(maxValue);

        // Merge state data into GeoJSON
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

        // Load the merged GeoJSON data
        setData(mergedData);

        // Calculate the bounding box of the GeoJSON data using Turf.js
        const bbox = turf.bbox(mergedData as any);
        if (bbox) {
            const viewport = new WebMercatorViewport({
                width: window.innerWidth,
                height: window.innerHeight,
            }).fitBounds(
                [
                    [bbox[0], bbox[1]],
                    [bbox[2], bbox[3]],
                ],
                { padding: 20 },
            );

            setViewState({
                longitude: viewport.longitude,
                latitude: viewport.latitude,
                zoom: viewport.zoom,
            });
        }
    }, [estimates, geojson]);

    const geoJsonLayer = useMemo(
        () =>
            new GeoJsonLayer({
                id: 'geojson-layer',
                data,
                pickable: true,
                onHover: ({ object, x, y }) => {
                    setTooltip(
                        object
                            ? { name: object.properties.NAME, value: object.properties.value, x, y }
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
        [data],
    );

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
            {confidence && (
                <div className="absolute top-4 right-4 bg-white border-gray-100 rounded px-2 py-1 text-gray-700 text-sm text-right">
                    <div className="text-gray-700">Confidence</div>
                    <div className="text-gray-500">{confidence}</div>
                </div>
            )}
            {title && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white border-gray-100 rounded px-2 py-1 text-gray-700">
                    {title}
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

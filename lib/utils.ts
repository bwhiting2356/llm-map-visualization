import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as turf from '@turf/turf';
import Color from 'color';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
};

export const getBoundingBox = (geojson: any, region: string) => {
    if (!geojson || !geojson.features) return [];
    if (region === 'united-states')  return [-179.148, 17.925, -65.243, 71.539];
    return turf.bbox(geojson);
}

export const interpolateColor = (
    value: number,
    min: number,
    max: number,
    startColor: string,
    endColor: string,
) => {
    const ratio = (value - min) / (max - min);
    return Color(startColor).mix(Color(endColor), ratio).rgb().array();
};

export const formatValue = (value: number | string) => {
    if (typeof value === 'string') return value;
    return value.toLocaleString();
}

export const rehydrateMessages = (data: any) => {
    const firstUserMessage = {
        id: "msg_0174sQdSLmfnpDs3ZyhLq1R1",
        "role":"user",
        content: [
            {
                "type":"text",
                "text":"[Automated] Restore previous map state"
            }
        ]
    }
    const toolUseMessage = {
        id: "msg_0174sQdSLmfnpDs3ZyhLq1Rm",
        "role":"assistant",
        content: [
            {
                "type":"text",
                "text": `Restoring map state for map: ${data.title}`

            },
            {
                "type":"tool_use",
                "id":"toolu_0174sQdSLmfnpDs3ZyhLq1Rm",
                "name":"continuous_stats_estimates",
                "input": data.data
            }
        ]
    }
    const renderedMessage = {
        id: "msg_0174sQdSLmfnpDs3ZyhLq1R2",
        "role": "user",
        content: [
            {
                "type":"tool_result",
                "tool_use_id":"toolu_0174sQdSLmfnpDs3ZyhLq1Rm",
                "content":"rendered"
            }
        ]
    }
    return [firstUserMessage, toolUseMessage, renderedMessage]

}